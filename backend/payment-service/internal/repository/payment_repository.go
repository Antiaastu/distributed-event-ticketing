package repository

import (
	"github.com/Antiaastu/distributed-event-ticketing/payment-service/internal/database"
	"github.com/Antiaastu/distributed-event-ticketing/payment-service/internal/models"
)

type PaymentRepository interface {
	CreatePayment(payment *models.Payment) error
	UpdatePayment(payment *models.Payment) error
	FindByTxRef(txRef string) (*models.Payment, error)
}

type paymentRepository struct{}

func NewPaymentRepository() PaymentRepository {
	return &paymentRepository{}
}

func (r *paymentRepository) CreatePayment(payment *models.Payment) error {
	return database.DB.Create(payment).Error
}

func (r *paymentRepository) UpdatePayment(payment *models.Payment) error {
	return database.DB.Save(payment).Error
}

func (r *paymentRepository) FindByTxRef(txRef string) (*models.Payment, error) {
	var payment models.Payment
	err := database.DB.Where("tx_ref = ?", txRef).First(&payment).Error
	return &payment, err
}
