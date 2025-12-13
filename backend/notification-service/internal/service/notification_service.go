package service

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/go-pdf/fpdf"
	"gopkg.in/gomail.v2"
)

type NotificationService interface {
	SendTicketEmail(email string, bookingID uint, amount float64) error
	SendVerificationEmail(email, code string) error
	SendPasswordResetEmail(email, code string) error
	ProcessBookingConfirmation(bookingID, userID, eventID uint, amount float64, seatCount int, seats string) error
	DownloadTicket(bookingID uint) (string, error)
}

type notificationService struct{}

func NewNotificationService() NotificationService {
	return &notificationService{}
}

func (s *notificationService) DownloadTicket(bookingID uint) (string, error) {
	booking, err := s.fetchBookingDetails(bookingID)
	if err != nil {
		return "", err
	}

	eventID := uint(booking["event_id"].(float64))
	event, err := s.fetchEventDetails(eventID)
	if err != nil {
		return "", err
	}

	var amount float64
	if val, ok := booking["total_amount"]; ok {
		amount = val.(float64)
	} else if val, ok := booking["amount"]; ok {
		amount = val.(float64)
	}

	seatCount := int(booking["seat_count"].(float64))
	seats, _ := booking["seats"].(string)

	return s.generatePDFTicket(bookingID, amount, event, seatCount, seats)
}

func (s *notificationService) fetchBookingDetails(bookingID uint) (map[string]interface{}, error) {
	resp, err := http.Get(fmt.Sprintf("http://booking-service:3002/api/bookings/%d", bookingID))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch booking: status %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if booking, ok := result["booking"].(map[string]interface{}); ok {
		return booking, nil
	}
	return nil, fmt.Errorf("invalid booking response format")
}

func (s *notificationService) SendVerificationEmail(email, code string) error {
	verificationLink := fmt.Sprintf("http://localhost:3000/verify-email?token=%s&email=%s", code, email)

	htmlBody := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
				.container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
				.header { text-align: center; margin-bottom: 30px; }
				.button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; }
				.footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h2>Welcome to TicketHub!</h2>
				</div>
				<p>Hi there,</p>
				<p>Thank you for signing up. Please verify your email address to activate your account and start booking tickets.</p>
				<div style="text-align: center; margin: 30px 0;">
					<a href="%s" class="button">Verify Email Address</a>
				</div>
				<p>If the button doesn't work, you can copy and paste this link into your browser:</p>
				<p><a href="%s">%s</a></p>
				<p>This link will expire in 15 minutes.</p>
				<div class="footer">
					<p>&copy; 2025 TicketHub. All rights reserved.</p>
				</div>
			</div>
		</body>
		</html>
	`, verificationLink, verificationLink, verificationLink)

	m := gomail.NewMessage()
	m.SetHeader("From", os.Getenv("SMTP_EMAIL"))
	m.SetHeader("To", email)
	m.SetHeader("Subject", "Verify your email - TicketHub")
	m.SetBody("text/html", htmlBody)

	d := gomail.NewDialer(
		os.Getenv("SMTP_HOST"),
		587,
		os.Getenv("SMTP_EMAIL"),
		os.Getenv("SMTP_PASSWORD"),
	)

	return d.DialAndSend(m)
}

func (s *notificationService) SendPasswordResetEmail(email, code string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", os.Getenv("SMTP_EMAIL"))
	m.SetHeader("To", email)
	m.SetHeader("Subject", "Password Reset")
	m.SetBody("text/html", fmt.Sprintf("<h1>Password Reset</h1><p>Your password reset code is: <b>%s</b></p>", code))

	d := gomail.NewDialer(
		os.Getenv("SMTP_HOST"),
		587,
		os.Getenv("SMTP_EMAIL"),
		os.Getenv("SMTP_PASSWORD"),
	)

	return d.DialAndSend(m)
}

func (s *notificationService) SendTicketEmail(email string, bookingID uint, amount float64) error {
	// Deprecated, kept for interface compatibility if needed
	return nil
}

func (s *notificationService) ProcessBookingConfirmation(bookingID, userID, eventID uint, amount float64, seatCount int, seats string) error {
	userEmail, err := s.fetchUserEmail(userID)
	if err != nil {
		return fmt.Errorf("failed to fetch user email: %v", err)
	}

	eventDetails, err := s.fetchEventDetails(eventID)
	if err != nil {
		return fmt.Errorf("failed to fetch event details: %v", err)
	}

	pdfPath, err := s.generatePDFTicket(bookingID, amount, eventDetails, seatCount, seats)
	if err != nil {
		return fmt.Errorf("failed to generate PDF: %v", err)
	}
	defer os.Remove(pdfPath)

	return s.sendEmailWithAttachment(userEmail, bookingID, amount, eventDetails, pdfPath)
}

func (s *notificationService) fetchUserEmail(userID uint) (string, error) {
	resp, err := http.Get(fmt.Sprintf("http://auth-service:3001/api/auth/users/%d", userID))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to fetch user: status %d", resp.StatusCode)
	}

	var user struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return "", err
	}
	return user.Email, nil
}

func (s *notificationService) fetchEventDetails(eventID uint) (map[string]interface{}, error) {
	resp, err := http.Get(fmt.Sprintf("http://event-service:3003/api/events/%d", eventID))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch event: status %d", resp.StatusCode)
	}

	var event map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&event); err != nil {
		return nil, err
	}
	return event, nil
}

func (s *notificationService) generatePDFTicket(bookingID uint, amount float64, event map[string]interface{}, seatCount int, seats string) (string, error) {
	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// --- Header Section ---
	pdf.SetFillColor(240, 240, 240)
	pdf.Rect(0, 0, 210, 40, "F")

	pdf.SetFont("Arial", "B", 24)
	pdf.SetTextColor(0, 51, 102) // Dark Blue
	pdf.SetXY(10, 10)
	pdf.Cell(0, 15, "TicketHub")

	pdf.SetFont("Arial", "", 10)
	pdf.SetTextColor(100, 100, 100)
	pdf.SetXY(10, 25)
	pdf.Cell(0, 10, "Your Gateway to Amazing Events")

	// --- Event Title ---
	pdf.SetY(50)
	pdf.SetFont("Arial", "B", 22)
	pdf.SetTextColor(0, 0, 0)
	pdf.MultiCell(0, 10, fmt.Sprintf("%v", event["title"]), "", "C", false)
	pdf.Ln(5)

	// --- Event Details Box ---
	pdf.SetFillColor(250, 250, 250)
	pdf.SetDrawColor(200, 200, 200)
	pdf.Rect(10, pdf.GetY(), 190, 40, "FD")

	currentY := pdf.GetY() + 5
	pdf.SetY(currentY)

	// Date
	pdf.SetFont("Arial", "B", 12)
	pdf.SetX(15)
	pdf.Cell(20, 10, "Date:")
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(0, 10, fmt.Sprintf("%v", event["date"]))
	pdf.Ln(8)

	// Venue
	pdf.SetFont("Arial", "B", 12)
	pdf.SetX(15)
	pdf.Cell(20, 10, "Venue:")
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(0, 10, fmt.Sprintf("%v", event["location"]))
	pdf.Ln(15)

	// --- Booking Info ---
	pdf.SetFont("Arial", "B", 14)
	pdf.SetTextColor(0, 51, 102)
	pdf.Cell(0, 10, "Booking Information")
	pdf.Ln(10)
	pdf.SetTextColor(0, 0, 0)

	// Table Header
	pdf.SetFillColor(230, 230, 230)
	pdf.SetFont("Arial", "B", 11)
	pdf.CellFormat(60, 10, "Booking ID", "1", 0, "C", true, 0, "")
	pdf.CellFormat(60, 10, "Total Seats", "1", 0, "C", true, 0, "")
	pdf.CellFormat(60, 10, "Amount Paid", "1", 1, "C", true, 0, "")

	// Table Content
	pdf.SetFont("Arial", "", 11)
	pdf.CellFormat(60, 10, fmt.Sprintf("#%d", bookingID), "1", 0, "C", false, 0, "")
	pdf.CellFormat(60, 10, fmt.Sprintf("%d", seatCount), "1", 0, "C", false, 0, "")
	pdf.CellFormat(60, 10, fmt.Sprintf("$%.2f", amount), "1", 1, "C", false, 0, "")
	pdf.Ln(10)

	// --- Seats Detail ---
	if seats != "" {
		pdf.SetFont("Arial", "B", 14)
		pdf.SetTextColor(0, 51, 102)
		pdf.Cell(0, 10, "Seat Details")
		pdf.Ln(8)
		pdf.SetTextColor(0, 0, 0)
		pdf.SetFont("Arial", "", 11)

		var seatList []map[string]interface{}
		if err := json.Unmarshal([]byte(seats), &seatList); err == nil {
			var seatStrs []string
			for _, seat := range seatList {
				row := seat["row"]
				number := seat["number"]
				// Try to get ticket class from ID (e.g., "vip-1-4")
				id, _ := seat["id"].(string)
				class := "Standard"
				if parts := strings.Split(id, "-"); len(parts) > 0 {
					class = strings.ToUpper(parts[0])
				}

				seatStrs = append(seatStrs, fmt.Sprintf("[%s] Row %v, Seat %v", class, row, number))
			}

			// Print seats in columns or list
			for _, s := range seatStrs {
				pdf.Cell(0, 8, s)
				pdf.Ln(6)
			}
		} else {
			pdf.MultiCell(0, 8, seats, "", "", false)
		}
	}
	pdf.Ln(15)

	// --- Footer / QR Placeholder ---
	pdf.SetDrawColor(0, 0, 0)
	pdf.Rect(85, pdf.GetY(), 40, 40, "D") // Placeholder for QR
	pdf.SetXY(85, pdf.GetY()+15)
	pdf.SetFont("Arial", "I", 9)
	pdf.CellFormat(40, 10, "Scan at Gate", "", 0, "C", false, 0, "")

	pdf.SetY(-30)
	pdf.SetFont("Arial", "I", 8)
	pdf.Cell(0, 10, "Thank you for choosing TicketHub. Please present this ticket at the entrance.")

	filename := fmt.Sprintf("ticket_%d.pdf", bookingID)
	err := pdf.OutputFileAndClose(filename)
	if err != nil {
		return "", err
	}
	return filename, nil
}

func (s *notificationService) sendEmailWithAttachment(email string, bookingID uint, amount float64, event map[string]interface{}, pdfPath string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", os.Getenv("SMTP_EMAIL"))
	m.SetHeader("To", email)
	m.SetHeader("Subject", fmt.Sprintf("Your Ticket for %v", event["title"]))

	htmlBody := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
				.container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
				.header { background: linear-gradient(135deg, #007bff 0%%, #0056b3 100%%); padding: 30px; text-align: center; color: #ffffff; }
				.header h1 { margin: 0; font-size: 28px; font-weight: 700; }
				.content { padding: 40px 30px; color: #333333; }
				.event-title { font-size: 24px; font-weight: bold; color: #0056b3; margin-bottom: 10px; }
				.info-row { margin-bottom: 15px; border-bottom: 1px solid #eeeeee; padding-bottom: 10px; }
				.info-label { font-weight: bold; color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
				.info-value { font-size: 18px; margin-top: 5px; }
				.footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee; }
				.btn { display: inline-block; background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>Booking Confirmed!</h1>
					<p>Get ready for an amazing experience</p>
				</div>
				<div class="content">
					<div class="event-title">%v</div>
					
					<div class="info-row">
						<div class="info-label">Date & Time</div>
						<div class="info-value">%v</div>
					</div>
					
					<div class="info-row">
						<div class="info-label">Venue</div>
						<div class="info-value">%v</div>
					</div>

					<div class="info-row">
						<div class="info-label">Booking Reference</div>
						<div class="info-value">#%d</div>
					</div>

					<div class="info-row" style="border-bottom: none;">
						<div class="info-label">Amount Paid</div>
						<div class="info-value">$%.2f</div>
					</div>

					<div style="text-align: center; margin-top: 30px;">
						<p>Your official ticket is attached to this email as a PDF.</p>
						<p style="color: #666; font-size: 14px;">Please save it or print it out to present at the venue.</p>
					</div>
				</div>
				<div class="footer">
					<p>&copy; 2025 TicketHub. All rights reserved.</p>
					<p>Need help? Contact support@tickethub.com</p>
				</div>
			</div>
		</body>
		</html>
	`, event["title"], event["date"], event["location"], bookingID, amount)

	m.SetBody("text/html", htmlBody)
	m.Attach(pdfPath)

	d := gomail.NewDialer(
		os.Getenv("SMTP_HOST"),
		587,
		os.Getenv("SMTP_EMAIL"),
		os.Getenv("SMTP_PASSWORD"),
	)

	return d.DialAndSend(m)
}
