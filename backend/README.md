# Event Ticketing Backend

This directory contains the backend microservices for the Distributed Event Ticketing System. Built with Go, it leverages a microservices architecture to ensure scalability, fault tolerance, and separation of concerns.

## 🏗️ Architecture

The backend is composed of the following independent services:

- **Auth Service**: Handles user registration, login, and JWT token generation.
- **Event Service**: Manages event creation, listing, and seat availability. It handles the critical "seat locking" mechanism.
- **Booking Service**: Orchestrates the booking process, validating requests and communicating with the Event and Payment services.
- **Payment Service**: Simulates payment processing for bookings.
- **Notification Service**: Listens for events (like successful bookings) and sends notifications (e.g., emails).

## 🛠️ Technologies

- **Language**: Go (Golang)
- **Web Framework**: Gin
- **Database**: PostgreSQL (Relational data), Redis (Caching & Distributed Locking)
- **Message Broker**: RabbitMQ (Inter-service communication)
- **Containerization**: Docker

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Go 1.21+ (optional, for local development)

### Environment Setup
Ensure you have a `.env` file in the `backend/` root or within each service directory if running individually. A typical setup is handled via `docker-compose.yml` which injects necessary environment variables.

### Running with Docker Compose (Recommended)
This will start all microservices along with PostgreSQL, Redis, and RabbitMQ.

```bash
# From the backend directory
docker-compose up --build
```

### Service Endpoints (Default Ports)
| Service | Port | Description |
|---------|------|-------------|
| Auth Service | 3001 | User authentication |
| Booking Service | 3002 | Booking management |
| Event Service | 3003 | Events & Seats |
| Payment Service | 3004 | Payment processing |
| Notification Service | 3005 | Background consumer |

## 📂 Directory Structure

```
backend/
├── auth-service/       # Go module for Auth
├── booking-service/    # Go module for Booking
├── event-service/      # Go module for Events
├── notification-service/ # Go module for Notifications
├── payment-service/    # Go module for Payments
├── init-scripts/       # SQL scripts for DB initialization
├── docker-compose.yml  # Docker orchestration
└── start_services.ps1  # Helper script for Windows
```

## 🧪 API Testing
A Postman collection (`postman_collection.json`) is included in the root of this directory to help you test the API endpoints. Import it into Postman to get started.

## 📝 Key Implementation Details
- **Concurrency Control**: Uses Redis distributed locks to prevent double-booking of the same seat.
- **Data Consistency**: Uses RabbitMQ to ensure eventual consistency between Booking, Payment, and Notification services.
- **VIP Logic**: The Booking Service intelligently parses seat IDs to distinguish between Standard, VIP, and VVIP tickets, updating availability accordingly.
