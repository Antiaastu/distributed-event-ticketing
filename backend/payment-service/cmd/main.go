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

	// Add CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
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

	api := r.Group("/api")
	{
		api.POST("/payments/initialize", paymentHandler.InitializePayment)
		api.GET("/payments/verify/:tx_ref", paymentHandler.VerifyPayment)
	}

	log.Println("Payment Service running on port 3004")
	r.Run(":3004")
}
