package models

import (
	"gorm.io/gorm"
)

type PaymentStatus string

const (
	PaymentStatusPending PaymentStatus = "pending"
	PaymentStatusSuccess PaymentStatus = "success"
	PaymentStatusFailed  PaymentStatus = "failed"
)

type Payment struct {
	gorm.Model
	BookingID uint          `gorm:"not null" json:"booking_id"`
	UserID    uint          `gorm:"not null" json:"user_id"`
	Amount    float64       `gorm:"not null" json:"amount"`
	Currency  string        `gorm:"default:'ETB'" json:"currency"`
	TxRef     string        `gorm:"uniqueIndex;not null" json:"tx_ref"`
	Status    PaymentStatus `gorm:"default:'pending'" json:"status"`
}
