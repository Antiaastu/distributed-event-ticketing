package database

import (
	"fmt"
	"log"
	"os"

	"github.com/Antiaastu/distributed-event-ticketing/auth-service/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	log.Println("Connected to Database")
	DB.AutoMigrate(&models.User{}, &models.AuditLog{})
}

func SeedAdmin() {
	var count int64
	DB.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&count)
	if count == 0 {
		password := os.Getenv("ADMIN_PASSWORD")
		if password == "" {
			password = "adminpassword"
		}
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

		email := os.Getenv("ADMIN_EMAIL")
		if email == "" {
			email = "admin@tickethub.com"
		}

		admin := models.User{
			Email:          email,
			Password:       string(hashedPassword),
			Role:           models.RoleAdmin,
			IsVerified:     true,
			ApprovalStatus: models.ApprovalStatusApproved,
		}
		DB.Create(&admin)
		log.Println("Admin user seeded")
	}
}
