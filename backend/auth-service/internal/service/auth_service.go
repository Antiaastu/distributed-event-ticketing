package service

import (
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"os"
	"time"

	"github.com/Antiaastu/distributed-event-ticketing/auth-service/internal/messaging"
	"github.com/Antiaastu/distributed-event-ticketing/auth-service/internal/models"
	"github.com/Antiaastu/distributed-event-ticketing/auth-service/internal/repository"
	"github.com/Antiaastu/distributed-event-ticketing/auth-service/internal/utils"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(email, password, role, documentPath string) (*models.User, error)
	Login(email, password string) (*utils.TokenDetails, error)
	VerifyEmail(email, code string) (*utils.TokenDetails, bool, error)
	ForgotPassword(email string) error
	ResetPassword(email, code, newPassword string) error
	ChangePassword(userID uint, oldPassword, newPassword string) error
	RefreshToken(refreshToken string) (*utils.TokenDetails, error)
	GetProfile(userID uint) (*models.User, error)
	ApproveOrganizer(userID uint) error
	PromoteToOrganizer(userID uint) error
	GetPendingOrganizers() ([]models.User, error)
	GetAllUsers() ([]models.User, error)
	RejectOrganizer(userID uint) error
	GetAuditLogs() ([]models.AuditLog, error)
	ReapplyOrganizer(email string) error
}

type authService struct {
	repo repository.UserRepository
}

func NewAuthService(repo repository.UserRepository) AuthService {
	return &authService{repo: repo}
}

func (s *authService) GetPendingOrganizers() ([]models.User, error) {
	return s.repo.GetPendingOrganizers()
}

func (s *authService) GetAllUsers() ([]models.User, error) {
	return s.repo.GetAllUsers()
}

func (s *authService) RejectOrganizer(userID uint) error {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return err
	}

	user.ApprovalStatus = models.ApprovalStatusRejected
	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}

	// Log audit
	s.repo.CreateAuditLog(&models.AuditLog{
		UserID:    userID,
		Action:    "REJECT_ORGANIZER",
		Details:   fmt.Sprintf("Organizer %s rejected", user.Email),
		CreatedAt: time.Now(),
	})

	return nil
}

func (s *authService) GetAuditLogs() ([]models.AuditLog, error) {
	return s.repo.GetAuditLogs()
}

func (s *authService) Register(email, password, role, documentPath string) (*models.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	userRole := models.RoleUser
	approvalStatus := models.ApprovalStatusApproved

	if role == "organizer" {
		userRole = models.RoleOrganizer
		approvalStatus = models.ApprovalStatusPending
	}

	// Generate Verification Token (Secure Hex String)
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return nil, err
	}
	code := fmt.Sprintf("%x", tokenBytes)

	user := &models.User{
		Email:                 email,
		Password:              string(hashedPassword),
		Role:                  userRole,
		ApprovalStatus:        approvalStatus,
		DocumentPath:          documentPath,
		IsVerified:            false,
		VerificationCode:      code,
		VerificationExpiresAt: time.Now().Add(15 * time.Minute),
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, err
	}

	// Send Verification Email
	messaging.PublishEmailVerification(user.Email, user.VerificationCode)

	return user, nil
}

func (s *authService) Login(email, password string) (*utils.TokenDetails, error) {
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	if !user.IsVerified {
		return nil, errors.New("email not verified")
	}

	if user.Role == models.RoleOrganizer {
		if user.ApprovalStatus == models.ApprovalStatusRejected {
			return nil, errors.New("account rejected")
		}
		if user.ApprovalStatus != models.ApprovalStatusApproved {
			return nil, errors.New("account pending approval")
		}
	}

	return utils.GenerateToken(user.ID, string(user.Role))
}

func (s *authService) VerifyEmail(email, code string) (*utils.TokenDetails, bool, error) {
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return nil, false, errors.New("user not found")
	}

	if user.IsVerified {
		// Already verified, return tokens directly
		tokens, err := utils.GenerateToken(user.ID, string(user.Role))
		return tokens, true, err
	}

	if user.VerificationCode != code || time.Now().After(user.VerificationExpiresAt) {
		return nil, false, errors.New("invalid or expired code")
	}

	user.IsVerified = true
	user.VerificationCode = ""
	if err := s.repo.UpdateUser(user); err != nil {
		return nil, false, err
	}

	// Auto-login: Generate tokens
	if user.Role == models.RoleOrganizer && user.ApprovalStatus != models.ApprovalStatusApproved {
		return nil, false, nil
	}

	tokens, err := utils.GenerateToken(user.ID, string(user.Role))
	return tokens, false, err
}

func (s *authService) ForgotPassword(email string) error {
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return errors.New("user not found")
	}

	// Generate 6-digit OTP
	max := big.NewInt(1000000)
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return err
	}
	code := fmt.Sprintf("%06d", n.Int64())

	user.ResetCode = code
	user.ResetExpiresAt = time.Now().Add(1 * time.Minute)

	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}

	messaging.PublishPasswordReset(user.Email, user.ResetCode)
	return nil
}

func (s *authService) ResetPassword(email, code, newPassword string) error {
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return errors.New("user not found")
	}

	if user.ResetCode != code || time.Now().After(user.ResetExpiresAt) {
		return errors.New("invalid or expired code")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.Password = string(hashedPassword)
	user.ResetCode = ""
	return s.repo.UpdateUser(user)
}

func (s *authService) ChangePassword(userID uint, oldPassword, newPassword string) error {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(oldPassword)); err != nil {
		return errors.New("invalid old password")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.Password = string(hashedPassword)
	return s.repo.UpdateUser(user)
}

func (s *authService) RefreshToken(refreshToken string) (*utils.TokenDetails, error) {
	token, err := utils.ValidateToken(refreshToken, os.Getenv("JWT_REFRESH_SECRET"))
	if err != nil || !token.Valid {
		return nil, errors.New("invalid refresh token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	userID := uint(claims["user_id"].(float64))
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	return utils.GenerateToken(user.ID, string(user.Role))
}

func (s *authService) GetProfile(userID uint) (*models.User, error) {
	return s.repo.FindByID(userID)
}

func (s *authService) ApproveOrganizer(userID uint) error {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return err
	}

	if user.Role != models.RoleOrganizer {
		return errors.New("user is not an organizer")
	}

	user.ApprovalStatus = models.ApprovalStatusApproved
	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}

	// Log audit
	s.repo.CreateAuditLog(&models.AuditLog{
		UserID:    userID,
		Action:    "APPROVE_ORGANIZER",
		Details:   fmt.Sprintf("Organizer %s approved", user.Email),
		CreatedAt: time.Now(),
	})

	return nil
}

func (s *authService) PromoteToOrganizer(userID uint) error {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return err
	}

	user.Role = models.RoleOrganizer
	return s.repo.UpdateUser(user)
}
