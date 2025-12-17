# Event Ticketing Frontend

The frontend application for the Distributed Event Ticketing System, built with Next.js 16 and React 19. It provides a modern, responsive interface for users to browse events, select seats, and manage their bookings, as well as an admin dashboard for event organizers.

## 🛠️ Technologies

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI / Shadcn UI
- **Icons**: Lucide React
- **State Management**: React Context API + LocalStorage Persistence

## 🌟 Features

- **User Authentication**: Secure login and signup with JWT handling.
- **Event Browsing**: View available events with details.
- **Interactive Seat Selection**: Visual seat map allowing selection of Standard, VIP, and VVIP seats.
- **Booking Flow**: Step-by-step checkout process with real-time seat locking.
- **User Dashboard**: View past and upcoming bookings (`/my-tickets`).
- **Admin Dashboard**: Manage events, view sales statistics, and create new events (`/dashboard`).
- **State Persistence**: Booking progress and admin tabs are saved to prevent data loss on refresh.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed.
- Backend services running (see `../backend/README.md`).

### Installation

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
frontend/src/
├── app/                # Next.js App Router pages
│   ├── (auth)/         # Auth pages (login, signup)
│   ├── dashboard/      # Admin dashboard
│   ├── events/         # Event listing and details
│   ├── checkout/       # Booking checkout flow
│   └── ...
├── components/         # Reusable UI components
│   ├── ui/             # Shadcn UI primitives
│   └── ...
├── context/            # Global state (AuthContext, EventContext)
└── types/              # TypeScript definitions
```

## ⚙️ Configuration

The application connects to the backend services via the **API Gateway**.

- **API Gateway URL**: `http://localhost:8080`
- **Endpoints**:
  - Auth: `/api/auth`
  - Events: `/api/events`
  - Bookings: `/api/bookings`
  - Payments: `/api/payments`

Ensure the backend (Docker Compose) is running, which will start the Nginx gateway on port 8080.

## 🎨 UI/UX Highlights

- **Loading States**: Optimized to prevent flickering; "Loading..." text is hidden in favor of smooth transitions.
- **Responsive Design**: Fully responsive layout for mobile and desktop.
- **Feedback**: Toast notifications for success/error actions.
