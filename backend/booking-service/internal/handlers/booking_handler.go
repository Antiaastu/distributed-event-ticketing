package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Antiaastu/distributed-event-ticketing/booking-service/internal/service"
	"github.com/gin-gonic/gin"
)

type BookingHandler struct {
	service service.BookingService
}

func NewBookingHandler(service service.BookingService) *BookingHandler {
	return &BookingHandler{service: service}
}

type CreateBookingRequest struct {
	EventID   uint        `json:"event_id" binding:"required"`
	SeatCount int         `json:"seat_count" binding:"required,min=1"`
	Amount    float64     `json:"amount" binding:"required,gt=0"`
	Seats     interface{} `json:"seats"`
}

// @Summary Create a booking
// @Description Book tickets for an event
// @Tags bookings
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param input body CreateBookingRequest true "Booking Input"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /bookings [post]
func (h *BookingHandler) CreateBooking(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req CreateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	seatsBytes, _ := json.Marshal(req.Seats)
	seatsStr := string(seatsBytes)

	booking, err := h.service.CreateBooking(uint(userID.(float64)), req.EventID, req.SeatCount, req.Amount, seatsStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Booking successful", "booking": booking})
}

func (h *BookingHandler) GetSales(c *gin.Context) {
	// Check for Organizer role
	role, exists := c.Get("role")
	if !exists || role != "organizer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Requires Organizer role"})
		return
	}

	eventIDStr := c.Param("eventId")
	eventID, err := strconv.ParseUint(eventIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	bookings, err := h.service.GetSales(uint(eventID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sales"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"sales": bookings})
}

func (h *BookingHandler) GetOrganizerSales(c *gin.Context) {
	// Check for Organizer role
	role, exists := c.Get("role")
	if !exists || role != "organizer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Requires Organizer role"})
		return
	}

	token := c.GetHeader("Authorization")
	bookings, err := h.service.GetOrganizerSales(token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sales"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"sales": bookings})
}

func (h *BookingHandler) GetUserBookings(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	bookings, err := h.service.GetUserBookings(uint(userID.(float64)))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"bookings": bookings})
}

func (h *BookingHandler) GetBooking(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	booking, err := h.service.GetBookingByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"booking": booking})
}

func (h *BookingHandler) GetEventBookedSeats(c *gin.Context) {
	eventIDStr := c.Param("eventId")
	eventID, err := strconv.ParseUint(eventIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	bookings, err := h.service.GetSales(uint(eventID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings"})
		return
	}

	var bookedSeats []interface{}
	for _, b := range bookings {
		// Skip failed or cancelled bookings
		if b.Status == "failed" || b.Status == "cancelled" {
			continue
		}

		var seats []map[string]interface{}
		if err := json.Unmarshal([]byte(b.Seats), &seats); err == nil {
			for _, seat := range seats {
				// Override status based on booking status
				if b.Status == "confirmed" {
					seat["status"] = "sold"
				} else {
					seat["status"] = "locked"
				}
				bookedSeats = append(bookedSeats, seat)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"seats": bookedSeats})
}

func (h *BookingHandler) GetAllBookings(c *gin.Context) {
	// Check for Admin role
	role, exists := c.Get("role")
	if !exists || role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Requires Admin role"})
		return
	}

	bookings, err := h.service.GetAllBookings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"bookings": bookings})
}
