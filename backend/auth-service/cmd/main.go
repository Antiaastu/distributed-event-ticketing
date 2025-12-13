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
			adminRoutes.GET("/audit-logs", authHandler.GetAuditLogs)
		}
	}
	log.Println("Auth Service running on port 3001")
	r.Run(":3001")
}
