package main

import (
	"log"

	"github.com/Antiaastu/distributed-event-ticketing/notification-service/internal/handlers"
	"github.com/Antiaastu/distributed-event-ticketing/notification-service/internal/messaging"
	"github.com/Antiaastu/distributed-event-ticketing/notification-service/internal/middleware"
	"github.com/Antiaastu/distributed-event-ticketing/notification-service/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	log.Println("Notification Service starting...")

	notificationService := service.NewNotificationService()

	// Start Consumer in a goroutine
	go messaging.StartConsumer(notificationService)

	// Start HTTP Server
	r := gin.Default()

	// Apply Prometheus Middleware
	r.Use(middleware.PrometheusMiddleware())

	// Expose Prometheus Metrics Endpoint
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// CORS handled by Nginx Gateway

	handler := handlers.NewNotificationHandler(notificationService)
	r.GET("/api/notifications/tickets/:bookingID/pdf", handler.DownloadTicket)

	log.Println("Notification Service HTTP server running on port 3005")
	r.Run(":3005")
}
