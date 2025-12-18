package messaging

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/streadway/amqp"
)

type BookingConfirmedEvent struct {
	BookingID uint    `json:"booking_id"`
	UserID    uint    `json:"user_id"`
	EventID   uint    `json:"event_id"`
	Amount    float64 `json:"amount"`
	SeatCount int     `json:"seat_count"`
	Seats     string  `json:"seats"`
}

func PublishBookingConfirmed(event BookingConfirmedEvent) error {
	connStr := fmt.Sprintf("amqp://%s:%s@%s:%s/",
		os.Getenv("RABBITMQ_USER"),
		os.Getenv("RABBITMQ_PASS"),
		os.Getenv("RABBITMQ_HOST"),
		os.Getenv("RABBITMQ_PORT"),
	)

	conn, err := amqp.Dial(connStr)
	if err != nil {
		return fmt.Errorf("failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		return fmt.Errorf("failed to open a channel: %v", err)
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"booking_confirmed", // name
		true,                // durable
		false,               // delete when unused
		false,               // exclusive
		false,               // no-wait
		nil,                 // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to declare a queue: %v", err)
	}

	body, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %v", err)
	}

	err = ch.Publish(
		"",     // exchange
		q.Name, // routing key
		false,  // mandatory
		false,  // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})
	if err != nil {
		return fmt.Errorf("failed to publish a message: %v", err)
	}

	log.Printf("Published booking_confirmed event for booking %d", event.BookingID)
	return nil
}

type AuditLogMessage struct {
	UserID    uint   `json:"user_id"`
	Action    string `json:"action"`
	Details   string `json:"details"`
	IPAddress string `json:"ip_address"`
	CreatedAt string `json:"created_at"`
}

func PublishAuditLog(userID uint, action, details string) {
	connStr := fmt.Sprintf("amqp://%s:%s@%s:%s/",
		os.Getenv("RABBITMQ_USER"),
		os.Getenv("RABBITMQ_PASS"),
		os.Getenv("RABBITMQ_HOST"),
		os.Getenv("RABBITMQ_PORT"),
	)

	conn, err := amqp.Dial(connStr)
	if err != nil {
		log.Printf("Failed to connect to RabbitMQ for audit: %v", err)
		return
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Printf("Failed to open channel for audit: %v", err)
		return
	}
	defer ch.Close()

	msg := AuditLogMessage{
		UserID:  userID,
		Action:  action,
		Details: details,
	}
	body, _ := json.Marshal(msg)

	ch.Publish(
		"",           // exchange
		"audit_logs", // routing key
		false,        // mandatory
		false,        // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})
}
