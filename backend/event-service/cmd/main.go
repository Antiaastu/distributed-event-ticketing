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

	eventRepo := repository.NewEventRepository()
	eventService := service.NewEventService(eventRepo)
	eventHandler := handlers.NewEventHandler(eventService)

	// Start RabbitMQ Consumer
	go messaging.StartConsumer(eventService)

	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api")

	// Public or Internal endpoints
	api.GET("/events", eventHandler.GetEvents)
	api.GET("/events/:id", eventHandler.GetEvent)
	api.POST("/events/:id/lock", eventHandler.LockSeats)

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
