package repository

import (
	"fmt"

	"github.com/Antiaastu/distributed-event-ticketing/auth-service/internal/database"
	"github.com/Antiaastu/distributed-event-ticketing/auth-service/internal/models"
)

type UserRepository interface {
	CreateUser(user *models.User) error
	FindByEmail(email string) (*models.User, error)
	FindByID(id uint) (*models.User, error)
	UpdateUser(user *models.User) error
	GetPendingOrganizers() ([]models.User, error)
	GetAllUsers() ([]models.User, error)
	CreateAuditLog(log *models.AuditLog) error
	GetAuditLogs() ([]models.AuditLog, error)
}

type userRepository struct{}

func NewUserRepository() UserRepository {
	return &userRepository{}
}

func (r *userRepository) CreateUser(user *models.User) error {
	return database.DB.Create(user).Error
}

func (r *userRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := database.DB.Where("email = ?", email).First(&user).Error
	return &user, err
}

func (r *userRepository) FindByID(id uint) (*models.User, error) {
	var user models.User
	err := database.DB.First(&user, id).Error
	return &user, err
}

func (r *userRepository) UpdateUser(user *models.User) error {
	return database.DB.Save(user).Error
}

func (r *userRepository) GetPendingOrganizers() ([]models.User, error) {
	var users []models.User
	err := database.DB.Where("role = ? AND approval_status = ?", models.RoleOrganizer, models.ApprovalStatusPending).Find(&users).Error
	if err == nil {
		fmt.Printf("Found %d pending organizers\n", len(users))
	}
	return users, err
}

func (r *userRepository) GetAllUsers() ([]models.User, error) {
	var users []models.User
	err := database.DB.Find(&users).Error
	return users, err
}

func (r *userRepository) CreateAuditLog(log *models.AuditLog) error {
	return database.DB.Create(log).Error
}

func (r *userRepository) GetAuditLogs() ([]models.AuditLog, error) {
	var logs []models.AuditLog
	err := database.DB.Order("created_at desc").Find(&logs).Error
	return logs, err
}
