package messaging

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/streadway/amqp"
)

var Channel *amqp.Channel

func ConnectRabbitMQ() {
	connStr := fmt.Sprintf("amqp://%s:%s@%s:%s/",
		os.Getenv("RABBITMQ_USER"),
		os.Getenv("RABBITMQ_PASS"),
		os.Getenv("RABBITMQ_HOST"),
		os.Getenv("RABBITMQ_PORT"),
	)

	conn, err := amqp.Dial(connStr)
	if err != nil {
		log.Printf("Failed to connect to RabbitMQ: %v", err)
		return
	}

	Channel, err = conn.Channel()
	if err != nil {
		log.Printf("Failed to open a channel: %v", err)
		return
	}

	// Declare audit_logs queue
	_, err = Channel.QueueDeclare(
		"audit_logs", // name
		true,         // durable
		false,        // delete when unused
		false,        // exclusive
		false,        // no-wait
		nil,          // arguments
	)
	if err != nil {
		log.Printf("Failed to declare audit_logs queue: %v", err)
	}
}

type AuditLogMessage struct {
	UserID    uint      `json:"user_id"`
	Action    string    `json:"action"`
	Details   string    `json:"details"`
	IPAddress string    `json:"ip_address"`
	CreatedAt time.Time `json:"created_at"`
}

func PublishAuditLog(userID uint, action, details string) {
	if Channel == nil {
		return
	}

	msg := AuditLogMessage{
		UserID:    userID,
		Action:    action,
		Details:   details,
		CreatedAt: time.Now(),
	}

	body, _ := json.Marshal(msg)

	err := Channel.Publish(
		"",           // exchange
		"audit_logs", // routing key
		false,        // mandatory
		false,        // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})

	if err != nil {
		log.Printf("Failed to publish audit log: %v", err)
	}
}
