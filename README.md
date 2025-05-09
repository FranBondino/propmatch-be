# 🏡 PropMatch

A full-stack web application that allows users to request appointments to visit apartments to rent. Also allowing renters to find potential roommates based on preferences and letting owners manage their apartments, expenses and rents. Built with a **NestJS backend** and a **Bubble.io frontend**, the app also integrates notifications through e-mail and expense automation through cron-job.

---

## 🚀 Features

- 📄 User Registration & Login (JWT Authentication)
- 👤 Role-based Access Control (`user`, `admin`, `owner`)
- 🏠 Apartment Listings.
- 📅 Appointment Booking.
- 🔔 Notification System (via e-mail)
- 📆 Appointment slot validation.
- 👤 Matching system between renters.
- 🔐 Admin controls (grant/revoke access, view all appointments)
- 📊 RESTful API for frontend consumption

---

## 🧱 Technologies Used

### 🔧 Backend
- **[NestJS](https://nestjs.com/)** — Progressive Node.js framework
- **TypeScript**
- **PostgreSQL** with **TypeORM** — Database & ORM
- **JWT** — Authentication
- **Class-validator / class-transformer** — Input validation
- **Dotenv** — Environment config
- **Bcrypt** — Secure password hashing

### 🎨 Frontend
- **[Bubble.io](https://bubble.io)** — No-code visual frontend builder  
  > Note: The Bubble.io frontend is currently in private development and not publicly accessible. Deployment is planned.

---

## 🛠️ Setup Instructions

1. **Clone the repo:**
   ```bash
   git clone [https://github.com/yourusername/property-vehicle-booking-api.git](https://github.com/FranBondino/propmatch-be)

