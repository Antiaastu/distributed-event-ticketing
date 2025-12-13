package messaging

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

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
		log.Fatal("Failed to connect to RabbitMQ: ", err)
	}

	Channel, err = conn.Channel()
	if err != nil {
		log.Fatal("Failed to open a channel: ", err)
	}

	_, err = Channel.QueueDeclare(
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
}

func PublishPaymentSuccess(bookingID uint, userID uint, amount float64) {
	message := map[string]interface{}{
		"booking_id": bookingID,
		"user_id":    userID,
		"amount":     amount,
	}
	body, _ := json.Marshal(message)

	err := Channel.Publish(
		"",                // exchange
		"payment_success", // routing key
		false,             // mandatory
		false,             // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})
	if err != nil {
		log.Println("Failed to publish message: ", err)
	}
}
