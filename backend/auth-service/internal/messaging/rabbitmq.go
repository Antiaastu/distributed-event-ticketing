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

	// Declare queues
	queues := []string{"email_verification", "password_reset"}
	for _, q := range queues {
		_, err = Channel.QueueDeclare(
			q,     // name
			true,  // durable
			false, // delete when unused
			false, // exclusive
			false, // no-wait
			nil,   // arguments
		)
		if err != nil {
			log.Fatal("Failed to declare queue: ", err)
		}
	}
}

func PublishEmailVerification(email, code string) {
	message := map[string]string{
		"email": email,
		"code":  code,
	}
	body, _ := json.Marshal(message)

	err := Channel.Publish(
		"",                   // exchange
		"email_verification", // routing key
		false,                // mandatory
		false,                // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})
	if err != nil {
		log.Println("Failed to publish message: ", err)
	}
}

func PublishPasswordReset(email, code string) {
	message := map[string]string{
		"email": email,
		"code":  code,
	}
	body, _ := json.Marshal(message)

	err := Channel.Publish(
		"",               // exchange
		"password_reset", // routing key
		false,            // mandatory
		false,            // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})
	if err != nil {
		log.Println("Failed to publish message: ", err)
	}
}
