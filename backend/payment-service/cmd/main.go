package main

import (
	"log"

	_ "github.com/Antiaastu/distributed-event-ticketing/payment-service/docs"
	"github.com/Antiaastu/distributed-event-ticketing/payment-service/internal/database"
	"github.com/Antiaastu/distributed-event-ticketing/payment-service/internal/handlers"
	"github.com/Antiaastu/distributed-event-ticketing/payment-service/internal/messaging"
	"github.com/Antiaastu/distributed-event-ticketing/payment-service/internal/repository"
	"github.com/Antiaastu/distributed-event-ticketing/payment-service/internal/service"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Payment Service API
// @version 1.0
// @description This is the payment service.
// @host localhost:3004
// @BasePath /api
func main() {
	database.ConnectDB()
	messaging.ConnectRabbitMQ()

	paymentRepo := repository.NewPaymentRepository()
	paymentService := service.NewPaymentService(paymentRepo)
	paymentHandler := handlers.NewPaymentHandler(paymentService)

	r := gin.Default()

	// CORS handled by Nginx Gateway

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api")
	{
		api.POST("/payments/initialize", paymentHandler.InitializePayment)
		api.GET("/payments/verify/:tx_ref", paymentHandler.VerifyPayment)
	}

	log.Println("Payment Service running on port 3004")
	r.Run(":3004")
}
