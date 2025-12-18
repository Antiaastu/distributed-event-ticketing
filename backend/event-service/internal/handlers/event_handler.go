package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/Antiaastu/distributed-event-ticketing/event-service/internal/models"
	"github.com/Antiaastu/distributed-event-ticketing/event-service/internal/service"
	"github.com/gin-gonic/gin"
)

type EventHandler struct {
	service service.EventService
}

func NewEventHandler(service service.EventService) *EventHandler {
	return &EventHandler{service: service}
}

type CreateEventRequest struct {
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	Date        time.Time `json:"date" binding:"required"`
	Location    string    `json:"location" binding:"required"`

	PriceNormal float64 `json:"price_normal"`
	PriceVIP    float64 `json:"price_vip"`
	PriceVVIP   float64 `json:"price_vvip"`

	SeatsNormal int `json:"seats_normal"`
	SeatsVIP    int `json:"seats_vip"`
	SeatsVVIP   int `json:"seats_vvip"`
}

// @Summary Create a new event
// @Description Create a new event (Organizer only)
// @Tags events
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param input body CreateEventRequest true "Event Input"
// @Success 201 {object} models.Event
// @Failure 400 {object} map[string]interface{}
// @Router /events [post]
func (h *EventHandler) CreateEvent(c *gin.Context) {
	// Check for Organizer role
	role, exists := c.Get("role")
	if !exists || role != "organizer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Requires Organizer role"})
		return
	}

	organizerID, _ := c.Get("user_id")

	var req CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	totalSeats := req.SeatsNormal + req.SeatsVIP + req.SeatsVVIP
	if totalSeats == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Total seats must be greater than 0"})
		return
	}

	event := &models.Event{
		Title:           req.Title,
		Description:     req.Description,
		Date:            req.Date,
		Location:        req.Location,
		TotalSeats:      totalSeats,
		AvailableSeats:  totalSeats,
		OrganizerID:     uint(organizerID.(float64)), // JWT claims are often float64
		PriceNormal:     req.PriceNormal,
		PriceVIP:        req.PriceVIP,
		PriceVVIP:       req.PriceVVIP,
		SeatsNormal:     req.SeatsNormal,
		SeatsVIP:        req.SeatsVIP,
		SeatsVVIP:       req.SeatsVVIP,
		AvailableNormal: req.SeatsNormal,
		AvailableVIP:    req.SeatsVIP,
		AvailableVVIP:   req.SeatsVVIP,
	}

	if err := h.service.CreateEvent(event); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Event created successfully", "event": event})
}

// @Summary Get all events
// @Description Get list of all events
// @Tags events
// @Produce json
// @Success 200 {array} models.Event
// @Failure 500 {object} map[string]interface{}
// @Router /events [get]
func (h *EventHandler) GetEvents(c *gin.Context) {
	events, err := h.service.GetAllEvents()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events"})
		return
	}

	c.JSON(http.StatusOK, events)
}

// @Summary Get event by ID
// @Description Get details of a specific event
// @Tags events
// @Produce json
// @Param id path int true "Event ID"
// @Success 200 {object} models.Event
// @Failure 404 {object} map[string]interface{}
// @Router /events/{id} [get]
func (h *EventHandler) GetEvent(c *gin.Context) {
	eventIDStr := c.Param("id")
	eventID, err := strconv.ParseUint(eventIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	event, err := h.service.GetEventByID(uint(eventID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	c.JSON(http.StatusOK, event)
}

// @Summary Get events for the logged-in organizer
// @Description Get list of events created by the organizer
// @Tags events
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.Event
// @Failure 403 {object} map[string]interface{}
// @Router /events/my [get]
func (h *EventHandler) GetMyEvents(c *gin.Context) {
	role, exists := c.Get("role")
	if !exists || role != "organizer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Requires Organizer role"})
		return
	}

	organizerID, _ := c.Get("user_id")
	// Ensure organizerID is uint. JWT claims are often float64.
	uid := uint(organizerID.(float64))

	events, err := h.service.GetEventsByOrganizer(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events"})
		return
	}

	c.JSON(http.StatusOK, events)
}

// @Summary Update an event
// @Description Update event details (Organizer only)
// @Tags events
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Event ID"
// @Param input body map[string]interface{} true "Update Input"
// @Success 200 {object} models.Event
// @Failure 400 {object} map[string]interface{}
// @Router /events/{id} [put]
func (h *EventHandler) UpdateEvent(c *gin.Context) {
	role, exists := c.Get("role")
	if !exists || role != "organizer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Requires Organizer role"})
		return
	}

	eventIDStr := c.Param("id")
	eventID, err := strconv.ParseUint(eventIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	organizerID, _ := c.Get("user_id")
	uid := uint(organizerID.(float64))

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	event, err := h.service.UpdateEvent(uint(eventID), uid, updates)
	if err != nil {
		if err == models.ErrUnauthorized {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		} else if err == models.ErrInvalidSeatCount {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event updated successfully", "event": event})
}

type LockSeatsRequest struct {
	Count       int      `json:"count" binding:"required,min=1"`
	TicketClass string   `json:"ticket_class"` // "normal", "vip", "vvip"
	SeatIDs     []string `json:"seat_ids"`
}

func (h *EventHandler) LockSeats(c *gin.Context) {
	eventIDStr := c.Param("id")
	eventID, err := strconv.ParseUint(eventIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	var req LockSeatsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Default to normal if not specified
	if req.TicketClass == "" {
		req.TicketClass = "normal"
	}

	success, err := h.service.LockSeats(uint(eventID), req.Count, req.TicketClass, req.SeatIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to lock seats"})
		return
	}

	if !success {
		c.JSON(http.StatusConflict, gin.H{"error": "Seats not available or already locked"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Seats locked successfully"})
}

type UnlockSeatsRequest struct {
	Count       int      `json:"count" binding:"required,min=1"`
	TicketClass string   `json:"ticket_class"`
	SeatIDs     []string `json:"seat_ids"`
}

func (h *EventHandler) UnlockSeats(c *gin.Context) {
	eventIDStr := c.Param("id")
	eventID, err := strconv.ParseUint(eventIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	var req UnlockSeatsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.TicketClass == "" {
		req.TicketClass = "normal"
	}

	err = h.service.UnlockSeats(uint(eventID), req.Count, req.TicketClass, req.SeatIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlock seats"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Seats unlocked successfully"})
}
