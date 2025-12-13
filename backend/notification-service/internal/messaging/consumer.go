package messaging

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/Antiaastu/distributed-event-ticketing/notification-service/internal/service"
	"github.com/streadway/amqp"
)

func StartConsumer(svc service.NotificationService) {
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
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatal("Failed to open a channel: ", err)
	}
	defer ch.Close()

	forever := make(chan bool)

	// Declare queues
	queues := []string{"booking_confirmed", "email_verification", "password_reset"}
	for _, qName := range queues {
		q, err := ch.QueueDeclare(
			qName, // name
			true,  // durable
			false, // delete when unused
			false, // exclusive
			false, // no-wait
			nil,   // arguments
		)
		if err != nil {
			log.Fatal("Failed to declare queue: ", err)
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

		go func(queueName string, messages <-chan amqp.Delivery) {
			for d := range messages {
				log.Printf("Received a message from %s: %s", queueName, d.Body)

				if queueName == "booking_confirmed" {
					var event struct {
						BookingID uint    `json:"booking_id"`
						UserID    uint    `json:"user_id"`
						EventID   uint    `json:"event_id"`
						Amount    float64 `json:"amount"`
						SeatCount int     `json:"seat_count"`
						Seats     string  `json:"seats"`
					}
					if err := json.Unmarshal(d.Body, &event); err != nil {
						log.Println("Error parsing message:", err)
						continue
					}

					if err := svc.ProcessBookingConfirmation(event.BookingID, event.UserID, event.EventID, event.Amount, event.SeatCount, event.Seats); err != nil {
						log.Println("Failed to process booking confirmation:", err)
					}
				} else if queueName == "email_verification" {
					var event map[string]string
					if err := json.Unmarshal(d.Body, &event); err != nil {
						log.Println("Error parsing message:", err)
						continue
					}
					if err := svc.SendVerificationEmail(event["email"], event["code"]); err != nil {
						log.Println("Failed to send verification email:", err)
					}
				} else if queueName == "password_reset" {
					var event map[string]string
					if err := json.Unmarshal(d.Body, &event); err != nil {
						log.Println("Error parsing message:", err)
						continue
					}
					if err := svc.SendPasswordResetEmail(event["email"], event["code"]); err != nil {
						log.Println("Failed to send password reset email:", err)
					}
				}
			}
		}(qName, msgs)
	}

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	<-forever
}
