package main

import (
	"log"

	_ "github.com/Antiaastu/distributed-event-ticketing/booking-service/docs"
	"github.com/Antiaastu/distributed-event-ticketing/booking-service/internal/database"
	"github.com/Antiaastu/distributed-event-ticketing/booking-service/internal/handlers"
	"github.com/Antiaastu/distributed-event-ticketing/booking-service/internal/messaging"
	"github.com/Antiaastu/distributed-event-ticketing/booking-service/internal/middleware"
	"github.com/Antiaastu/distributed-event-ticketing/booking-service/internal/repository"
	"github.com/Antiaastu/distributed-event-ticketing/booking-service/internal/service"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Booking Service API
// @version 1.0
// @description This is the booking service.
// @host localhost:3002
// @BasePath /api
func main() {
	database.ConnectDB()

	bookingRepo := repository.NewBookingRepository()
	bookingService := service.NewBookingService(bookingRepo)
	bookingHandler := handlers.NewBookingHandler(bookingService)

	// Connect to RabbitMQ and start consumer
	messaging.ConnectRabbitMQ(bookingService)

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

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Public/Internal routes (no auth required for service-to-service or public access)
	r.GET("/api/bookings/:id", bookingHandler.GetBooking)

	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.POST("/bookings", bookingHandler.CreateBooking)
		api.GET("/bookings/event/:eventId/seats", bookingHandler.GetEventBookedSeats)
		api.GET("/organizer/sales", bookingHandler.GetOrganizerSales)
		api.GET("/organizer/sales/:eventId", bookingHandler.GetSales)
		api.GET("/bookings/user", bookingHandler.GetUserBookings)
		api.GET("/bookings/all", bookingHandler.GetAllBookings)
	}

	log.Println("Booking Service running on port 3002")
	r.Run(":3002")
}
