package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/Antiaastu/distributed-event-ticketing/payment-service/internal/chapa"
	"github.com/Antiaastu/distributed-event-ticketing/payment-service/internal/messaging"
	"github.com/Antiaastu/distributed-event-ticketing/payment-service/internal/models"
	"github.com/Antiaastu/distributed-event-ticketing/payment-service/internal/repository"
)

type PaymentService interface {
	InitializePayment(bookingID, userID uint, amount float64, email, firstName, lastName string) (string, error)
	VerifyPayment(txRef string) (*models.Payment, error)
}

type paymentService struct {
	repo        repository.PaymentRepository
	chapaClient *chapa.ChapaClient
}

func NewPaymentService(repo repository.PaymentRepository) PaymentService {
	return &paymentService{
		repo:        repo,
		chapaClient: chapa.NewChapaClient(),
	}
}

func (s *paymentService) InitializePayment(bookingID, userID uint, amount float64, email, firstName, lastName string) (string, error) {
	txRef := fmt.Sprintf("tx-%d-%d-%d", userID, bookingID, time.Now().Unix())

	payment := &models.Payment{
		BookingID: bookingID,
		UserID:    userID,
		Amount:    amount,
		Currency:  "ETB",
		TxRef:     txRef,
		Status:    models.PaymentStatusPending,
	}

	fmt.Printf("Attempting to create payment: %+v\n", payment)
	if err := s.repo.CreatePayment(payment); err != nil {
		fmt.Printf("Error creating payment: %v\n", err)
		return "", err
	}
	fmt.Println("Payment created successfully in DB")

	req := &chapa.InitializeRequest{
		Amount:      fmt.Sprintf("%.2f", amount),
		Currency:    "ETB",
		Email:       email,
		FirstName:   firstName,
		LastName:    lastName,
		TxRef:       txRef,
		CallbackURL: "http://localhost:3004/api/payments/callback",
		ReturnURL:   fmt.Sprintf("http://localhost:3000/payment/success?tx_ref=%s", txRef),
	}

	resp, err := s.chapaClient.InitializeTransaction(req)
	if err != nil {
		payment.Status = models.PaymentStatusFailed
		s.repo.UpdatePayment(payment)
		return "", err
	}

	return resp.Data.CheckoutURL, nil
}

func (s *paymentService) VerifyPayment(txRef string) (*models.Payment, error) {
	fmt.Printf("Verifying payment for txRef: %s\n", txRef)
	payment, err := s.repo.FindByTxRef(txRef)
	if err != nil {
		fmt.Printf("Payment not found in DB for txRef: %s, error: %v\n", txRef, err)
		return nil, errors.New("payment not found")
	}
	fmt.Printf("Found payment in DB: %+v\n", payment)

	if payment.Status == models.PaymentStatusSuccess {
		fmt.Println("Payment already successful")
		return payment, nil
	}

	resp, err := s.chapaClient.VerifyTransaction(txRef)
	if err != nil {
		fmt.Printf("Chapa verification error: %v\n", err)
		return nil, err
	}
	fmt.Printf("Chapa response: %+v\n", resp)

	if resp.Status == "success" || resp.Data.Status == "success" {
		payment.Status = models.PaymentStatusSuccess
		if err := s.repo.UpdatePayment(payment); err != nil {
			fmt.Printf("Error updating payment status: %v\n", err)
			return nil, err
		}
		fmt.Println("Payment updated to success in DB")

		// Publish Event to RabbitMQ
		messaging.PublishPaymentSuccess(payment.BookingID, payment.UserID, payment.Amount)
	} else {
		payment.Status = models.PaymentStatusFailed
		s.repo.UpdatePayment(payment)
		fmt.Println("Payment verification failed at Chapa")
		return nil, errors.New("payment verification failed")
	}

	return payment, nil
}
