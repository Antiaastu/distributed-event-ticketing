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
- **Monitoring**: Prometheus & Grafana
- **Load Testing**: k6

## 🛡️ Security: Rate Limiting

To protect the backend services from abuse, **Nginx** is configured with rate limiting:
- **Zone**: 10MB shared memory zone tracking IP addresses.
- **Limit**: **10 requests per second** per IP.
- **Burst**: Allows a burst of up to **20 requests** before rejecting with `503 Service Temporarily Unavailable`.

## 📉 Load Testing

The project includes a **k6** setup running in Docker for stress testing.

### Running a Load Test
You don't need to install k6 locally. Run the following command to execute the load test script:

```bash
docker-compose run --rm k6
```

This runs the script located at `backend/k6/script.js`.

### Performance Benchmarks
Recent stress testing (ramping up to **100 concurrent users**) yielded:
- **Throughput**: ~64 requests/second
- **Latency (p95)**: < 3ms
- **Error Rate**: 0% (at 100 concurrent users)

## 📊 Monitoring

The backend services are instrumented with Prometheus metrics to provide visibility into system performance.

### Metrics Exposed
Each service exposes a `/metrics` endpoint that provides:
- **Request Counts**: `http_requests_total` (labeled by method, path, status)
- **Latency**: `http_request_duration_seconds` (histogram)
- **Runtime Metrics**: Go memory usage, goroutines, GC stats.

### Infrastructure
- **Prometheus**: Configured to scrape all backend services every 5 seconds.
- **Grafana**: Pre-configured to connect to Prometheus as a data source.

### Access
- **Prometheus UI**: http://localhost:9090
- **Grafana UI**: http://localhost:3100

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

### Service Endpoints (via API Gateway)
All services are now accessed via the Nginx API Gateway on port **8080**.

| Service | Path Prefix | Description |
|---------|-------------|-------------|
| Auth Service | `/api/auth` | User authentication |
| Booking Service | `/api/bookings` | Booking management |
| Event Service | `/api/events` | Events & Seats |
| Payment Service | `/api/payments` | Payment processing |
| Notification Service | `/api/notifications` | PDF Tickets & Notifications |



## 📂 Directory Structure

```
backend/
├── nginx/              # Nginx configuration
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
