package models

import (
	"gorm.io/gorm"
)

type BookingStatus string

const (
	BookingStatusPending   BookingStatus = "pending"
	BookingStatusConfirmed BookingStatus = "confirmed"
	BookingStatusFailed    BookingStatus = "failed"
)

type Booking struct {
	gorm.Model
	UserID      uint          `gorm:"not null" json:"user_id"`
	EventID     uint          `gorm:"not null" json:"event_id"`
	SeatCount   int           `gorm:"not null" json:"seat_count"`
	Seats       string        `json:"seats"` // JSON string of selected seats
	Status      BookingStatus `gorm:"default:'pending'" json:"status"`
	TotalAmount float64       `gorm:"not null" json:"total_amount"`
}
