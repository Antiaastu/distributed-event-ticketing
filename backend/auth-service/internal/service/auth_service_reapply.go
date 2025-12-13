package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/Antiaastu/distributed-event-ticketing/auth-service/internal/models"
)

func (s *authService) ReapplyOrganizer(email string) error {
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return errors.New("user not found")
	}

	if user.Role != models.RoleOrganizer {
		return errors.New("not an organizer")
	}

	if user.ApprovalStatus == models.ApprovalStatusApproved {
		return errors.New("already approved")
	}

	user.ApprovalStatus = models.ApprovalStatusPending
	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}

	fmt.Printf("User %s re-applied. Status updated to pending.\n", user.Email)

	// Log audit
	s.repo.CreateAuditLog(&models.AuditLog{
		UserID:    user.ID,
		Action:    "REAPPLY_ORGANIZER",
		Details:   fmt.Sprintf("Organizer %s re-applied for approval", user.Email),
		CreatedAt: time.Now(),
	})

	return nil
}
