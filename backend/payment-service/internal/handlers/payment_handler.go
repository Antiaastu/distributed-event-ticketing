package handlers

import (
	"net/http"

	"github.com/Antiaastu/distributed-event-ticketing/payment-service/internal/service"
	"github.com/gin-gonic/gin"
)

type PaymentHandler struct {
	service service.PaymentService
}

func NewPaymentHandler(service service.PaymentService) *PaymentHandler {
	return &PaymentHandler{service: service}
}

type InitializePaymentRequest struct {
	BookingID uint    `json:"booking_id" binding:"required"`
	UserID    uint    `json:"user_id" binding:"required"`
	Amount    float64 `json:"amount" binding:"required,gt=0"`
	Email     string  `json:"email" binding:"required,email"`
	FirstName string  `json:"first_name" binding:"required"`
	LastName  string  `json:"last_name" binding:"required"`
}

// @Summary Initialize Payment
// @Description Initialize a payment with Chapa
// @Tags payments
// @Accept json
// @Produce json
// @Param input body InitializePaymentRequest true "Payment Input"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /payments/initialize [post]
func (h *PaymentHandler) InitializePayment(c *gin.Context) {
	var req InitializePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	checkoutURL, err := h.service.InitializePayment(req.BookingID, req.UserID, req.Amount, req.Email, req.FirstName, req.LastName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"checkout_url": checkoutURL})
}

// @Summary Verify Payment
// @Description Verify a payment transaction
// @Tags payments
// @Accept json
// @Produce json
// @Param tx_ref path string true "Transaction Reference"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /payments/verify/{tx_ref} [get]
func (h *PaymentHandler) VerifyPayment(c *gin.Context) {
	txRef := c.Param("tx_ref")
	if txRef == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Transaction reference is required"})
		return
	}

	payment, err := h.service.VerifyPayment(txRef)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment verified successfully", "payment": payment})
}
