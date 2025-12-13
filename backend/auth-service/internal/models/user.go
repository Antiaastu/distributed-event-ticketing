package models

import (
	"time"

	"gorm.io/gorm"
)

type Role string

const (
	RoleAdmin     Role = "admin"
	RoleOrganizer Role = "organizer"
	RoleUser      Role = "user"
)

type ApprovalStatus string

const (
	ApprovalStatusPending  ApprovalStatus = "pending"
	ApprovalStatusApproved ApprovalStatus = "approved"
	ApprovalStatusRejected ApprovalStatus = "rejected"
)

type User struct {
	ID                    uint           `gorm:"primarykey" json:"id"`
	CreatedAt             time.Time      `json:"created_at"`
	UpdatedAt             time.Time      `json:"updated_at"`
	DeletedAt             gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty" swaggertype:"string"`
	Email                 string         `gorm:"uniqueIndex;not null" json:"email"`
	Password              string         `gorm:"not null" json:"-"` // Don't return password in JSON
	Role                  Role           `gorm:"default:'user'" json:"role"`
	IsVerified            bool           `gorm:"default:false" json:"is_verified"`
	VerificationCode      string         `json:"-"`
	VerificationExpiresAt time.Time      `json:"-"`
	ResetCode             string         `json:"-"`
	ResetExpiresAt        time.Time      `json:"-"`
	ApprovalStatus        ApprovalStatus `gorm:"default:'approved'" json:"approval_status"` // Default approved for users
	DocumentPath          string         `json:"document_path,omitempty"`                   // For organizers
}
