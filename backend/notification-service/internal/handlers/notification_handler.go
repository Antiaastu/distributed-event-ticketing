package handlers

import (
	"net/http"
	"os"
	"strconv"

	"github.com/Antiaastu/distributed-event-ticketing/notification-service/internal/service"
	"github.com/gin-gonic/gin"
)

type NotificationHandler struct {
	service service.NotificationService
}

func NewNotificationHandler(service service.NotificationService) *NotificationHandler {
	return &NotificationHandler{service: service}
}

func (h *NotificationHandler) DownloadTicket(c *gin.Context) {
	bookingIDStr := c.Param("bookingID")
	bookingID, err := strconv.ParseUint(bookingIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

	pdfPath, err := h.service.DownloadTicket(uint(bookingID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer os.Remove(pdfPath) // Clean up after serving

	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Content-Disposition", "attachment; filename="+pdfPath)
	c.Header("Content-Type", "application/pdf")
	c.File(pdfPath)
}
