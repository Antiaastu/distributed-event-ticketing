package main

import (
	"log"

	"github.com/Antiaastu/distributed-event-ticketing/notification-service/internal/handlers"
	"github.com/Antiaastu/distributed-event-ticketing/notification-service/internal/messaging"
	"github.com/Antiaastu/distributed-event-ticketing/notification-service/internal/service"
	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("Notification Service starting...")

	notificationService := service.NewNotificationService()

	// Start Consumer in a goroutine
	go messaging.StartConsumer(notificationService)

	// Start HTTP Server
	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	handler := handlers.NewNotificationHandler(notificationService)
	r.GET("/api/notifications/tickets/:bookingID/pdf", handler.DownloadTicket)

	log.Println("Notification Service HTTP server running on port 3005")
	r.Run(":3005")
}
