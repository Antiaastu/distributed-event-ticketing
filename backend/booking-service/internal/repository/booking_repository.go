package repository

import (
	"github.com/Antiaastu/distributed-event-ticketing/booking-service/internal/database"
	"github.com/Antiaastu/distributed-event-ticketing/booking-service/internal/models"
)

type BookingRepository interface {
	CreateBooking(booking *models.Booking) error
	UpdateBookingStatus(id uint, status models.BookingStatus) error
	GetBookingsByEventID(eventID uint) ([]models.Booking, error)
	GetBookingsByEventIDs(eventIDs []uint) ([]models.Booking, error)
	GetBookingsByUserID(userID uint) ([]models.Booking, error)
	GetBookingByID(id uint) (*models.Booking, error)
	GetAllBookings() ([]models.Booking, error)
}

type bookingRepository struct{}

func NewBookingRepository() BookingRepository {
	return &bookingRepository{}
}

func (r *bookingRepository) CreateBooking(booking *models.Booking) error {
	return database.DB.Create(booking).Error
}

func (r *bookingRepository) UpdateBookingStatus(id uint, status models.BookingStatus) error {
	return database.DB.Model(&models.Booking{}).Where("id = ?", id).Update("status", status).Error
}

func (r *bookingRepository) GetBookingByID(id uint) (*models.Booking, error) {
	var booking models.Booking
	err := database.DB.First(&booking, id).Error
	return &booking, err
}

func (r *bookingRepository) GetBookingsByEventID(eventID uint) ([]models.Booking, error) {
	var bookings []models.Booking
	err := database.DB.Where("event_id = ?", eventID).Find(&bookings).Error
	return bookings, err
}
func (r *bookingRepository) GetAllBookings() ([]models.Booking, error) {
	var bookings []models.Booking
	err := database.DB.Find(&bookings).Error
	return bookings, err
}
func (r *bookingRepository) GetBookingsByEventIDs(eventIDs []uint) ([]models.Booking, error) {
	var bookings []models.Booking
	err := database.DB.Where("event_id IN ?", eventIDs).Find(&bookings).Error
	return bookings, err
}

func (r *bookingRepository) GetBookingsByUserID(userID uint) ([]models.Booking, error) {
	var bookings []models.Booking
	err := database.DB.Where("user_id = ? AND status = ?", userID, models.BookingStatusConfirmed).Find(&bookings).Error
	return bookings, err
}
