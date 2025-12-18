package worker

import (
	"fmt"
	"time"

	"github.com/Antiaastu/distributed-event-ticketing/booking-service/internal/service"
)

func StartCleanupWorker(bookingService service.BookingService) {
	ticker := time.NewTicker(1 * time.Minute)
	go func() {
		for range ticker.C {
			fmt.Println("Running cleanup worker...")
			if err := bookingService.CancelStaleBookings(); err != nil {
				fmt.Printf("Error in cleanup worker: %v\n", err)
			}
		}
	}()
}
