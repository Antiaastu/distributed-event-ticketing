package service

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/Antiaastu/distributed-event-ticketing/booking-service/internal/messaging"
	"github.com/Antiaastu/distributed-event-ticketing/booking-service/internal/models"
	"github.com/Antiaastu/distributed-event-ticketing/booking-service/internal/repository"
)

type BookingService interface {
	CreateBooking(userID, eventID uint, seatCount int, amount float64, seats string) (*models.Booking, error)
	ConfirmBooking(bookingID uint) error
	GetSales(eventID uint) ([]models.Booking, error)
	GetOrganizerSales(token string) ([]models.Booking, error)
	GetUserBookings(userID uint) ([]models.Booking, error)
	GetBookingByID(bookingID uint) (*models.Booking, error)
	GetAllBookings() ([]models.Booking, error)
	CancelStaleBookings() error
}

type bookingService struct {
	repo repository.BookingRepository
}

func NewBookingService(repo repository.BookingRepository) BookingService {
	return &bookingService{repo: repo}
}

func (s *bookingService) CancelStaleBookings() error {
	// Find bookings pending for > 15 minutes
	olderThan := time.Now().Add(-15 * time.Minute)
	bookings, err := s.repo.GetStalePendingBookings(olderThan)
	if err != nil {
		return err
	}

	eventServiceURL := os.Getenv("EVENT_SERVICE_URL")
	if eventServiceURL == "" {
		eventServiceURL = "http://localhost:3003"
	}

	for _, booking := range bookings {
		fmt.Printf("Cancelling stale booking: %d\n", booking.ID)

		// Unlock seats in Event Service
		var seatList []struct {
			ID string `json:"id"`
		}
		var seatIDs []string
		if err := json.Unmarshal([]byte(booking.Seats), &seatList); err == nil {
			for _, seat := range seatList {
				seatIDs = append(seatIDs, seat.ID)
			}
		}

		unlockReq := map[string]interface{}{
			"count":    booking.SeatCount,
			"seat_ids": seatIDs,
		}
		unlockBody, _ := json.Marshal(unlockReq)

		// We don't strictly check error here, just log it, as we want to proceed with cancellation
		resp, err := http.Post(fmt.Sprintf("%s/api/events/%d/unlock", eventServiceURL, booking.EventID), "application/json", bytes.NewBuffer(unlockBody))
		if err != nil {
			fmt.Printf("Failed to unlock seats for booking %d: %v\n", booking.ID, err)
		} else {
			resp.Body.Close()
		}

		// Update status to Cancelled
		if err := s.repo.UpdateBookingStatus(booking.ID, models.BookingStatusCancelled); err != nil {
			fmt.Printf("Failed to update booking status %d: %v\n", booking.ID, err)
		} else {
			// Audit Log
			messaging.PublishAuditLog(booking.UserID, "CANCEL_BOOKING", fmt.Sprintf("Cancelled stale booking %d", booking.ID))
		}
	}
	return nil
}

func (s *bookingService) GetBookingByID(bookingID uint) (*models.Booking, error) {
	return s.repo.GetBookingByID(bookingID)
}

func (s *bookingService) GetAllBookings() ([]models.Booking, error) {
	return s.repo.GetAllBookings()
}

func (s *bookingService) GetOrganizerSales(token string) ([]models.Booking, error) {
	eventServiceURL := os.Getenv("EVENT_SERVICE_URL")
	if eventServiceURL == "" {
		eventServiceURL = "http://localhost:3003"
	}

	// Call Event Service to get organizer's events
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/events/my", eventServiceURL), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("failed to fetch organizer events")
	}

	var events []struct {
		ID uint `json:"ID"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&events); err != nil {
		return nil, err
	}

	if len(events) == 0 {
		return []models.Booking{}, nil
	}

	var eventIDs []uint
	for _, e := range events {
		eventIDs = append(eventIDs, e.ID)
	}

	return s.repo.GetBookingsByEventIDs(eventIDs)
}

func (s *bookingService) CreateBooking(userID, eventID uint, seatCount int, amount float64, seats string) (*models.Booking, error) {
	// 1. Validate Token (Already done by middleware)

	// Determine ticket class from seats
	ticketClass := "normal"
	var seatList []struct {
		ID string `json:"id"`
	}
	var seatIDs []string
	if err := json.Unmarshal([]byte(seats), &seatList); err == nil && len(seatList) > 0 {
		if strings.HasPrefix(seatList[0].ID, "vvip") {
			ticketClass = "vvip"
		} else if strings.HasPrefix(seatList[0].ID, "vip") {
			ticketClass = "vip"
		}
		for _, seat := range seatList {
			seatIDs = append(seatIDs, seat.ID)
		}
	}

	// 2. Check Inventory & Lock Seats (Call Event Service)
	eventServiceURL := os.Getenv("EVENT_SERVICE_URL")
	if eventServiceURL == "" {
		eventServiceURL = "http://localhost:3003"
	}

	lockReq := map[string]interface{}{
		"count":        seatCount,
		"ticket_class": ticketClass,
		"seat_ids":     seatIDs,
	}
	lockBody, _ := json.Marshal(lockReq)

	lockResp, err := http.Post(fmt.Sprintf("%s/api/events/%d/lock", eventServiceURL, eventID), "application/json", bytes.NewBuffer(lockBody))
	if err != nil || lockResp.StatusCode != http.StatusOK {
		return nil, errors.New("failed to lock seats or not enough seats")
	}

	// 3. Create Booking Record
	booking := &models.Booking{
		UserID:      userID,
		EventID:     eventID,
		SeatCount:   seatCount,
		TotalAmount: amount,
		Seats:       seats,
		Status:      models.BookingStatusPending,
	}

	fmt.Printf("Creating booking: %+v\n", booking)
	if err := s.repo.CreateBooking(booking); err != nil {
		fmt.Printf("Error creating booking: %v\n", err)
		return nil, err
	}
	fmt.Println("Booking created successfully in DB")

	// Audit Log
	messaging.PublishAuditLog(userID, "CREATE_BOOKING", fmt.Sprintf("Created booking %d for event %d", booking.ID, eventID))

	return booking, nil
}

func (s *bookingService) ConfirmBooking(bookingID uint) error {
	if err := s.repo.UpdateBookingStatus(bookingID, models.BookingStatusConfirmed); err != nil {
		return err
	}

	// Fetch booking details
	booking, err := s.repo.GetBookingByID(bookingID)
	if err != nil {
		fmt.Printf("Failed to fetch booking for event publishing: %v\n", err)
		return nil
	}

	// Publish event
	event := messaging.BookingConfirmedEvent{
		BookingID: booking.ID,
		UserID:    booking.UserID,
		EventID:   booking.EventID,
		Amount:    booking.TotalAmount,
		SeatCount: booking.SeatCount,
		Seats:     booking.Seats,
	}

	if err := messaging.PublishBookingConfirmed(event); err != nil {
		fmt.Printf("Failed to publish booking confirmed event: %v\n", err)
	}

	// Audit Log
	messaging.PublishAuditLog(booking.UserID, "CONFIRM_BOOKING", fmt.Sprintf("Confirmed booking %d", booking.ID))

	return nil
}

func (s *bookingService) GetSales(eventID uint) ([]models.Booking, error) {
	return s.repo.GetBookingsByEventID(eventID)
}

func (s *bookingService) GetUserBookings(userID uint) ([]models.Booking, error) {
	return s.repo.GetBookingsByUserID(userID)
}
