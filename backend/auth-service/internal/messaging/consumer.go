package messaging

import (
	"encoding/json"
	"log"
	"time"

	"github.com/Antiaastu/distributed-event-ticketing/auth-service/internal/models"
	"github.com/Antiaastu/distributed-event-ticketing/auth-service/internal/repository"
)

type AuditLogMessage struct {
	UserID    uint      `json:"user_id"`
	Action    string    `json:"action"`
	Details   string    `json:"details"`
	IPAddress string    `json:"ip_address"`
	CreatedAt time.Time `json:"created_at"`
}

func StartAuditConsumer(repo repository.UserRepository) {
	if Channel == nil {
		log.Println("RabbitMQ channel not initialized, skipping audit consumer")
		return
	}

	msgs, err := Channel.Consume(
		"audit_logs", // queue
		"",           // consumer
		true,         // auto-ack
		false,        // exclusive
		false,        // no-local
		false,        // no-wait
		nil,          // args
	)
	if err != nil {
		log.Printf("Failed to register audit consumer: %v", err)
		return
	}

	go func() {
		for d := range msgs {
			var msg AuditLogMessage
			if err := json.Unmarshal(d.Body, &msg); err != nil {
				log.Printf("Error decoding audit message: %v", err)
				continue
			}

			log.Printf("Received audit log: %s - %s", msg.Action, msg.Details)

			auditLog := &models.AuditLog{
				UserID:    msg.UserID,
				Action:    msg.Action,
				Details:   msg.Details,
				IPAddress: msg.IPAddress,
				CreatedAt: msg.CreatedAt,
			}

			if err := repo.CreateAuditLog(auditLog); err != nil {
				log.Printf("Error saving audit log: %v", err)
			}
		}
	}()
}
