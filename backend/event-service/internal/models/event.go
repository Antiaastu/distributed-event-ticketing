package models

import (
	"time"

	"gorm.io/gorm"
)

type Event struct {
	gorm.Model
	Title          string    `gorm:"not null" json:"title"`
	Description    string    `json:"description"`
	Date           time.Time `gorm:"not null" json:"date"`
	Location       string    `gorm:"not null" json:"location"`
	TotalSeats     int       `gorm:"not null" json:"total_seats"`
	AvailableSeats int       `gorm:"not null" json:"available_seats"`
	OrganizerID    uint      `gorm:"not null" json:"organizer_id"`

	// Ticket Classes
	PriceNormal     float64 `gorm:"default:0" json:"price_normal"`
	PriceVIP        float64 `gorm:"default:0" json:"price_vip"`
	PriceVVIP       float64 `gorm:"default:0" json:"price_vvip"`
	SeatsNormal     int     `gorm:"default:0" json:"seats_normal"`
	SeatsVIP        int     `gorm:"default:0" json:"seats_vip"`
	SeatsVVIP       int     `gorm:"default:0" json:"seats_vvip"`
	AvailableNormal int     `gorm:"default:0" json:"available_normal"`
	AvailableVIP    int     `gorm:"default:0" json:"available_vip"`
	AvailableVVIP   int     `gorm:"default:0" json:"available_vvip"`
}

var (
	ErrUnauthorized     = &Error{Message: "Unauthorized access to event"}
	ErrInvalidSeatCount = &Error{Message: "Cannot decrease total seats below booked count"}
)

type Error struct {
	Message string
}

func (e *Error) Error() string {
	return e.Message
}
