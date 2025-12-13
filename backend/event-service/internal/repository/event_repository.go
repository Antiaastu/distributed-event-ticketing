package repository

import (
	"context"
	"fmt"

	"github.com/Antiaastu/distributed-event-ticketing/event-service/internal/database"
	"github.com/Antiaastu/distributed-event-ticketing/event-service/internal/models"
)

type EventRepository interface {
	CreateEvent(event *models.Event) error
	InitializeSeats(event *models.Event) error
	LockSeats(eventID uint, count int, ticketClass string) (bool, error)
	GetAllEvents() ([]models.Event, error)
	GetEventsByOrganizerID(organizerID uint) ([]models.Event, error)
	GetEventByID(eventID uint) (*models.Event, error)
	UpdateEvent(event *models.Event) error
	UpdateRedisSeats(eventID uint, newAvailableSeats int) error
}

type eventRepository struct{}

func NewEventRepository() EventRepository {
	return &eventRepository{}
}

func (r *eventRepository) CreateEvent(event *models.Event) error {
	return database.DB.Create(event).Error
}

func (r *eventRepository) GetAllEvents() ([]models.Event, error) {
	var events []models.Event
	err := database.DB.Find(&events).Error
	return events, err
}

func (r *eventRepository) GetEventsByOrganizerID(organizerID uint) ([]models.Event, error) {
	var events []models.Event
	err := database.DB.Where("organizer_id = ?", organizerID).Find(&events).Error
	return events, err
}

func (r *eventRepository) GetEventByID(eventID uint) (*models.Event, error) {
	var event models.Event
	err := database.DB.First(&event, eventID).Error
	return &event, err
}

func (r *eventRepository) UpdateEvent(event *models.Event) error {
	return database.DB.Save(event).Error
}

func (r *eventRepository) UpdateRedisSeats(eventID uint, newAvailableSeats int) error {
	ctx := context.Background()
	key := fmt.Sprintf("event:%d:seats", eventID)
	return database.RedisClient.Set(ctx, key, newAvailableSeats, 0).Err()
}

func (r *eventRepository) InitializeSeats(event *models.Event) error {
	ctx := context.Background()
	pipe := database.RedisClient.Pipeline()

	// Total
	keyTotal := fmt.Sprintf("event:%d:seats", event.ID)
	pipe.Set(ctx, keyTotal, event.TotalSeats, 0)

	// Classes
	pipe.Set(ctx, fmt.Sprintf("event:%d:seats:normal", event.ID), event.SeatsNormal, 0)
	pipe.Set(ctx, fmt.Sprintf("event:%d:seats:vip", event.ID), event.SeatsVIP, 0)
	pipe.Set(ctx, fmt.Sprintf("event:%d:seats:vvip", event.ID), event.SeatsVVIP, 0)

	_, err := pipe.Exec(ctx)
	return err
}

func (r *eventRepository) LockSeats(eventID uint, count int, ticketClass string) (bool, error) {
	ctx := context.Background()
	key := fmt.Sprintf("event:%d:seats", eventID)
	if ticketClass != "" {
		key = fmt.Sprintf("event:%d:seats:%s", eventID, ticketClass)
	}

	// Use a Lua script to ensure atomicity: check if enough seats, then decr
	script := `
		local current = tonumber(redis.call("get", KEYS[1]))
		if current == nil then return 0 end
		if current >= tonumber(ARGV[1]) then
			redis.call("decrby", KEYS[1], ARGV[1])
			return 1
		else
			return 0
		end
	`

	result, err := database.RedisClient.Eval(ctx, script, []string{key}, count).Int()
	if err != nil {
		return false, err
	}

	return result == 1, nil
}
