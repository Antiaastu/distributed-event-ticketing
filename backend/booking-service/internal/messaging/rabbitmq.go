package messaging

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/streadway/amqp"
)

type BookingConfirmer interface {
	ConfirmBooking(bookingID uint) error
}

func ConnectRabbitMQ(bookingService BookingConfirmer) {
	connStr := fmt.Sprintf("amqp://%s:%s@%s:%s/",
		os.Getenv("RABBITMQ_USER"),
		os.Getenv("RABBITMQ_PASS"),
		os.Getenv("RABBITMQ_HOST"),
		os.Getenv("RABBITMQ_PORT"),
	)

	conn, err := amqp.Dial(connStr)
	if err != nil {
		log.Fatal("Failed to connect to RabbitMQ: ", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		log.Fatal("Failed to open a channel: ", err)
	}

	q, err := ch.QueueDeclare(
		"payment_success", // name
		true,              // durable
		false,             // delete when unused
		false,             // exclusive
		false,             // no-wait
		nil,               // arguments
	)
	if err != nil {
		log.Fatal("Failed to declare a queue: ", err)
	}

	// Declare audit_logs queue
	_, err = ch.QueueDeclare(
		"audit_logs", // name
		true,         // durable
		false,        // delete when unused
		false,        // exclusive
		false,        // no-wait
		nil,          // arguments
	)
	if err != nil {
		log.Fatal("Failed to declare audit_logs queue: ", err)
	}

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		log.Fatal("Failed to register a consumer: ", err)
	}

	go func() {
		for d := range msgs {
			var message struct {
				BookingID uint    `json:"booking_id"`
				UserID    uint    `json:"user_id"`
				Amount    float64 `json:"amount"`
			}
			if err := json.Unmarshal(d.Body, &message); err != nil {
				log.Printf("Error decoding message: %s", err)
				continue
			}

			log.Printf("Received payment success for booking %d", message.BookingID)
			if err := bookingService.ConfirmBooking(message.BookingID); err != nil {
				log.Printf("Error confirming booking: %s", err)
			}
		}
	}()
}
