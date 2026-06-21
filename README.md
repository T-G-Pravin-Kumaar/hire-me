# Hire Me - verified Driver Booking MERN Platform

Hire Me connects vehicle owners with verified drivers for one-way journeys, supporting both driver-provided transport and driving a customer's personal vehicle.

---

## Technical Stack
- **Frontend**: React, React Router v6, Axios, Lucide React (for premium icons), and Vanilla HSL-based CSS.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JSON Web Tokens (JWT), and bcryptjs.
- **Environment**: Vite Dev Server (port `3000`) proxied to Express API Server (port `5000`).

---

## Directory Mappings
```text
hire-me/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Auth, Driver, Trip, Review, Admin logic
│   │   ├── middleware/      # JWT validation, RBAC, Rest Status Check
│   │   ├── models/          # Mongoose Schemas (User, Driver, Customer, Trip, etc.)
│   │   ├── routes/          # Express API route bindings
│   │   ├── utils/           # Haversine distance calculator
│   │   ├── app.js           # Express configuration
│   │   ├── server.js        # Entry server point
│   │   └── seed.js          # Database seeding script
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/      # Common components: Navbar, RatingStars, MapSimulator, etc.
    │   ├── context/         # AuthContext state manager
    │   ├── pages/           # Public & Role-protected views (Admin, Driver, Customer)
    │   ├── services/        # Axios API clients
    │   ├── App.jsx          # Route registry
    │   ├── index.css        # Vanilla CSS system
    │   └── main.jsx         # Render mount
    ├── vite.config.js
    ├── index.html
    └── package.json
```

---

## Seeding & Running instructions

### 1. Database Setup & Seeding
Make sure local MongoDB is running at `mongodb://127.0.0.1:27017/`.
From the backend directory:
```bash
cd backend
npm run seed
```
This clears previous data and seeds mock credentials.

### 2. Run Backend API Server
Start the Express API server (runs on port `5000`):
```bash
cd backend
npm run dev
```

### 3. Run Frontend Dev Client
Start the Vite React client (runs on port `3000`):
```bash
cd ../frontend
npm run dev
```

---

## Seeded accounts & Credentials
All seeded accounts use password: `password123`

| Role | Name | Email | Standby Location | Status / Extra details |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Super Admin | `admin@hireme.com` | N/A | Full platform controls |
| **Customer** | Rohan Sharma | `rohan@gmail.com` | N/A | Booking passenger |
| **Customer** | Pooja Patel | `pooja@gmail.com` | N/A | Booking passenger |
| **Driver** | Suresh Kumar | `suresh@driver.com` | Majestic Bus Station | **Verified** / **Available** / Manual Skill / Customer's Car |
| **Driver** | Vikram Singh | `vikram@driver.com` | Indiranagar Metro | **Verified** / **Available** / Both Skills / Both Service Styles |
| **Driver** | Karan Malhotra | `karan@driver.com` | Airport | **Verified** / **Resting** (Cannot search or receive bookings) |
| **Driver** | Anil Prasad | `anil@driver.com` | Electronic City | **Pending Verification** (Cannot search or receive bookings) |
