package service

import (
	"encoding/json"
	"strings"

	"github.com/Antiaastu/distributed-event-ticketing/event-service/internal/models"
	"github.com/Antiaastu/distributed-event-ticketing/event-service/internal/repository"
)

type EventService interface {
	CreateEvent(event *models.Event) error
	LockSeats(eventID uint, count int, ticketClass string) (bool, error)
	GetAllEvents() ([]models.Event, error)
	GetEventsByOrganizer(organizerID uint) ([]models.Event, error)
	GetEventByID(eventID uint) (*models.Event, error)
	UpdateEvent(eventID uint, organizerID uint, updates map[string]interface{}) (*models.Event, error)
	UpdateEventSeats(eventID uint, seatsBooked int, seatsJSON string) error
}

type eventService struct {
	repo repository.EventRepository
}

func NewEventService(repo repository.EventRepository) EventService {
	return &eventService{repo: repo}
}

func (s *eventService) UpdateEventSeats(eventID uint, seatsBooked int, seatsJSON string) error {
	event, err := s.repo.GetEventByID(eventID)
	if err != nil {
		return err
	}

	// Update total available seats
	event.AvailableSeats -= seatsBooked
	if event.AvailableSeats < 0 {
		event.AvailableSeats = 0
	}

	// Parse seats to update specific ticket class availability
	var seats []struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal([]byte(seatsJSON), &seats); err == nil {
		for _, seat := range seats {
			if strings.HasPrefix(seat.ID, "vvip") {
				event.AvailableVVIP--
				if event.AvailableVVIP < 0 {
					event.AvailableVVIP = 0
				}
			} else if strings.HasPrefix(seat.ID, "vip") {
				event.AvailableVIP--
				if event.AvailableVIP < 0 {
					event.AvailableVIP = 0
				}
			} else {
				// Default to normal if not vip/vvip or explicitly normal
				event.AvailableNormal--
				if event.AvailableNormal < 0 {
					event.AvailableNormal = 0
				}
			}
		}
	}

	return s.repo.UpdateEvent(event)
}

func (s *eventService) GetEventByID(eventID uint) (*models.Event, error) {
	return s.repo.GetEventByID(eventID)
}

func (s *eventService) CreateEvent(event *models.Event) error {
	// Set available seats to total seats initially
	event.AvailableSeats = event.TotalSeats

	if err := s.repo.CreateEvent(event); err != nil {
		return err
	}

	// Initialize seats in Redis
	return s.repo.InitializeSeats(event)
}

func (s *eventService) GetAllEvents() ([]models.Event, error) {
	return s.repo.GetAllEvents()
}

func (s *eventService) GetEventsByOrganizer(organizerID uint) ([]models.Event, error) {
	return s.repo.GetEventsByOrganizerID(organizerID)
}

func (s *eventService) UpdateEvent(eventID uint, organizerID uint, updates map[string]interface{}) (*models.Event, error) {
	event, err := s.repo.GetEventByID(eventID)
	if err != nil {
		return nil, err
	}

	if event.OrganizerID != organizerID {
		return nil, models.ErrUnauthorized
	}

	// Handle seat updates
	if newTotalSeats, ok := updates["total_seats"].(float64); ok {
		newTotal := int(newTotalSeats)
		bookedSeats := event.TotalSeats - event.AvailableSeats

		if newTotal < bookedSeats {
			return nil, models.ErrInvalidSeatCount
		}

		// Update available seats
		diff := newTotal - event.TotalSeats
		event.TotalSeats = newTotal
		event.AvailableSeats += diff

		// Update Redis
		if err := s.repo.UpdateRedisSeats(event.ID, event.AvailableSeats); err != nil {
			return nil, err
		}
	}

	// Update other fields
	if title, ok := updates["title"].(string); ok {
		event.Title = title
	}
	if desc, ok := updates["description"].(string); ok {
		event.Description = desc
	}
	if loc, ok := updates["location"].(string); ok {
		event.Location = loc
	}
	// Add date update if needed

	if err := s.repo.UpdateEvent(event); err != nil {
		return nil, err
	}

	return event, nil
}

func (s *eventService) LockSeats(eventID uint, count int, ticketClass string) (bool, error) {
	return s.repo.LockSeats(eventID, count, ticketClass)
}
