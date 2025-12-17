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

	// CORS handled by Nginx Gateway

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Public/Internal routes (no auth required for service-to-service or public access)
	r.GET("/api/bookings/:id", bookingHandler.GetBooking)

	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.POST("/bookings", bookingHandler.CreateBooking)
		api.GET("/bookings/event/:eventId/seats", bookingHandler.GetEventBookedSeats)
		api.GET("/bookings/organizer/sales", bookingHandler.GetOrganizerSales)
		api.GET("/bookings/organizer/sales/:eventId", bookingHandler.GetSales)
		api.GET("/bookings/user", bookingHandler.GetUserBookings)
		api.GET("/bookings/all", bookingHandler.GetAllBookings)
	}

	log.Println("Booking Service running on port 3002")
	r.Run(":3002")
}
