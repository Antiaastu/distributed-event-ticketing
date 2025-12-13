package messaging

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/Antiaastu/distributed-event-ticketing/event-service/internal/service"
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

func StartConsumer(eventService service.EventService) {
	connStr := fmt.Sprintf("amqp://%s:%s@%s:%s/",
		os.Getenv("RABBITMQ_USER"),
		os.Getenv("RABBITMQ_PASS"),
		os.Getenv("RABBITMQ_HOST"),
		os.Getenv("RABBITMQ_PORT"),
	)

	conn, err := amqp.Dial(connStr)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	// Don't close connection here, as we want it to stay open for the consumer

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %v", err)
	}

	q, err := ch.QueueDeclare(
		"booking_confirmed", // name
		true,                // durable
		false,               // delete when unused
		false,               // exclusive
		false,               // no-wait
		nil,                 // arguments
	)
	if err != nil {
		log.Fatalf("Failed to declare a queue: %v", err)
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
		log.Fatalf("Failed to register a consumer: %v", err)
	}

	go func() {
		for d := range msgs {
			var event BookingConfirmedEvent
			if err := json.Unmarshal(d.Body, &event); err != nil {
				log.Printf("Error decoding event: %v", err)
				continue
			}

			log.Printf("Received booking confirmed event for event %d, seats: %d", event.EventID, event.SeatCount)

			if err := eventService.UpdateEventSeats(event.EventID, event.SeatCount, event.Seats); err != nil {
				log.Printf("Error updating event seats: %v", err)
			}
		}
	}()

	log.Println("Waiting for messages. To exit press CTRL+C")
}
