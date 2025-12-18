package main

import (
	"log"

	_ "github.com/Antiaastu/distributed-event-ticketing/auth-service/docs"
	"github.com/Antiaastu/distributed-event-ticketing/auth-service/internal/database"
	"github.com/Antiaastu/distributed-event-ticketing/auth-service/internal/handlers"
	"github.com/Antiaastu/distributed-event-ticketing/auth-service/internal/messaging"
	"github.com/Antiaastu/distributed-event-ticketing/auth-service/internal/middleware"
	"github.com/Antiaastu/distributed-event-ticketing/auth-service/internal/repository"
	"github.com/Antiaastu/distributed-event-ticketing/auth-service/internal/service"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Auth Service API
// @version 1.0
// @description This is the authentication service.
// @host localhost:3001
// @BasePath /api
func main() {
	database.ConnectDB()
	database.SeedAdmin()
	messaging.ConnectRabbitMQ()

	userRepo := repository.NewUserRepository()
	authService := service.NewAuthService(userRepo)
	authHandler := handlers.NewAuthHandler(authService)

	// Start Audit Consumer
	messaging.StartAuditConsumer(userRepo)

	r := gin.Default()

	// CORS handled by Nginx Gateway

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	authRoutes := r.Group("/api/auth")
	{
		authRoutes.POST("/register", authHandler.Register)
		authRoutes.POST("/login", authHandler.Login)
		authRoutes.POST("/verify-email", authHandler.VerifyEmail)
		authRoutes.POST("/forgot-password", authHandler.ForgotPassword)
		authRoutes.POST("/reset-password", authHandler.ResetPassword)
		authRoutes.POST("/refresh-token", authHandler.RefreshToken)
		authRoutes.POST("/reapply", authHandler.ReapplyOrganizer)
		authRoutes.GET("/users/:id", authHandler.GetUserByID)

		authRoutes.Use(middleware.AuthMiddleware())
		{
			authRoutes.GET("/me", authHandler.GetProfile)
			authRoutes.POST("/change-password", authHandler.ChangePassword)
		}

		// Admin routes
		adminRoutes := authRoutes.Group("/admin")
		adminRoutes.Use(middleware.AuthMiddleware())
		{
			adminRoutes.POST("/promote", authHandler.PromoteToOrganizer)
			adminRoutes.POST("/approve", authHandler.ApproveOrganizer)
			adminRoutes.POST("/reject", authHandler.RejectOrganizer)
			adminRoutes.GET("/organizers/pending", authHandler.GetPendingOrganizers)
			adminRoutes.GET("/users", authHandler.GetAllUsers)
			adminRoutes.DELETE("/users", authHandler.DeleteUser)
			adminRoutes.GET("/audit-logs", authHandler.GetAuditLogs)
		}
	}
	log.Println("Auth Service running on port 3001")
	r.Run(":3001")
}
