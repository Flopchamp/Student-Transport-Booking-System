# Student Transport Booking System

A full-stack web application for managing student transportation services. The system allows parents to book transport for their children, administrators to manage routes/vehicles/drivers, and drivers to manage their assigned trips.

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Database:** MySQL with Sequelize ORM
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **Security:** bcryptjs, helmet, express-rate-limit, cors

### Frontend
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS v4
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast

---

## Project Structure

```
student-transport-booking-system/
├── server/                    # Backend API
│   ├── src/
│   │   ├── config/           # Database & environment config
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Auth & error handling
│   │   ├── models/           # Sequelize models
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic (email, SMS)
│   │   ├── utils/           # Helpers & utilities
│   │   └── validators/      # Input validation
│   ├── server.js            # Entry point
│   ├── seed.js              # Database seeder
│   └── package.json
│
├── client/                   # Frontend React app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/        # React Context (Auth)
│   │   ├── layouts/         # Page layouts (Admin, Parent, Driver)
│   │   ├── lib/             # API client
│   │   ├── pages/           # Route pages
│   │   │   ├── admin/       # Admin dashboard pages
│   │   │   ├── auth/        # Login/Auth pages
│   │   │   ├── driver/      # Driver portal pages
│   │   │   └── parent/      # Parent portal pages
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # Main app with routing
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## Features

### Role-Based Access

| Role | Capabilities |
|------|-------------|
| **Parent** | Register/Login, manage students, browse routes, create bookings, make payments, view booking history, file complaints, view announcements, track vehicles |
| **Admin** | Manage routes, vehicles, drivers, users, bookings, payments, complaints, announcements, analytics, audit logs, system settings, fleet tracking, trip management |
| **Driver** | View assigned bookings, update trip status, GPS tracking |

### Core Functionality

- **Authentication:** JWT-based auth with role-based access control
- **Route Management:** Define routes with stops, fares, schedules
- **Vehicle Fleet:** Manage vehicles with capacity tracking
- **Driver Assignment:** Assign drivers to routes/vehicles
- **Booking System:** Parent bookings with pickup/dropoff stops
- **Payment Processing:** Stripe card & M-Pesa mobile money (simulated)
- **Complaint System:** Parents can submit issues; admin resolves
- **Announcements:** Admin broadcasts to parents
- **Audit Logging:** Track admin actions
- **Trip Management:** Start/complete trips with timestamps

---

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+

### Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE student_transport;
```

2. Create a `.env` file in `server/`:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=student_transport
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

### Installation & Running

**Backend:**
```bash
cd server
npm install
npm run dev    # Development with nodemon
# or
npm start     # Production
```

**Frontend:**
```bash
cd client
npm install
npm run dev   # Start at http://localhost:5173
# or
npm run build # Production build
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Register new parent |
| `/api/v1/auth/login` | POST | User login |
| `/api/v1/users` | GET/POST | User management |
| `/api/v1/routes` | GET/POST | Route CRUD |
| `/api/v1/vehicles` | GET/POST | Vehicle CRUD |
| `/api/v1/drivers` | GET/POST | Driver CRUD |
| `/api/v1/bookings` | GET/POST | Booking CRUD |
| `/api/v1/payments` | GET/POST | Payment processing |
| `/api/v1/complaints` | GET/POST | Complaint handling |
| `/api/v1/announcements` | GET/POST | Announcements |
| `/api/v1/analytics` | GET | Dashboard analytics |
| `/api/v1/audit-logs` | GET | Audit logs |
| `/api/v1/tracking` | GET/POST | GPS tracking |

---

## Models

- **User** - Parent, Admin, Driver accounts
- **Student** - Children linked to parents
- **Route** - Transport routes with stops
- **Vehicle** - Buses/vans with capacity
- **Driver** - Driver profile & assignment
- **Booking** - Transport bookings
- **Payment** - Payment transactions
- **Complaint** - Parent complaints
- **Announcement** - Admin broadcasts
- **Trip** - Trip lifecycle tracking
- **AuditLog** - Admin action history
- **Setting** - System configuration

---


## License

ISC