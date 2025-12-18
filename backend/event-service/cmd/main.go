package main

import (
	"log"

	_ "github.com/Antiaastu/distributed-event-ticketing/event-service/docs"
	"github.com/Antiaastu/distributed-event-ticketing/event-service/internal/database"
	"github.com/Antiaastu/distributed-event-ticketing/event-service/internal/handlers"
	"github.com/Antiaastu/distributed-event-ticketing/event-service/internal/messaging"
	"github.com/Antiaastu/distributed-event-ticketing/event-service/internal/middleware"
	"github.com/Antiaastu/distributed-event-ticketing/event-service/internal/repository"
	"github.com/Antiaastu/distributed-event-ticketing/event-service/internal/service"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Event Service API
// @version 1.0
// @description This is the event service.
// @host localhost:3003
// @BasePath /api
func main() {
	database.ConnectDB()
	database.ConnectRedis()
	messaging.ConnectRabbitMQ()

	eventRepo := repository.NewEventRepository()
	eventService := service.NewEventService(eventRepo)
	eventHandler := handlers.NewEventHandler(eventService)

	// Start RabbitMQ Consumer
	go messaging.StartConsumer(eventService)

	r := gin.Default()

	// CORS handled by Nginx Gateway

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api")

	// Public or Internal endpoints
	api.GET("/events", eventHandler.GetEvents)
	api.GET("/events/:id", eventHandler.GetEvent)
	api.POST("/events/:id/lock", eventHandler.LockSeats)
	api.POST("/events/:id/unlock", eventHandler.UnlockSeats)

	// Protected endpoints
	api.Use(middleware.AuthMiddleware())
	{
		api.POST("/events", eventHandler.CreateEvent)
		api.GET("/events/my", eventHandler.GetMyEvents)
		api.PUT("/events/:id", eventHandler.UpdateEvent)
	}

	log.Println("Event Service running on port 3003")
	r.Run(":3003")
}
