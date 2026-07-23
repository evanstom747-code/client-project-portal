# Client Project Management Portal

A full-stack web application for managing client projects with role-based access for Admins, Staff, and Clients.

## Tech Stack
- **Frontend:** React.js + Tailwind CSS (Vite)
- **Backend:** Node.js + Express.js
- **Database:** MySQL
- **Auth:** JWT
- **Email:** Nodemailer

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL 8.0+

---

### 1. Database Setup

Open MySQL and run the schema:
```bash
mysql -u root -p < server/config/schema.sql
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Edit `.env` with your database credentials:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234
DB_NAME=client_portal
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
```

Seed the database with demo data:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

---

## Demo Accounts

| Role   | Email                | Password  |
|--------|----------------------|-----------|
| Admin  | admin@portal.com     | admin123  |
| Staff  | staff@portal.com     | staff123  |
| Client | client@portal.com    | client123 |

---

## Features

### Admin
- Create, edit, delete projects
- Assign projects to clients and staff
- Manage all users and roles
- Add milestones and tasks
- Upload deliverables

### Staff
- View assigned projects
- Update task and milestone status
- Upload project files

### Client
- View own projects and progress
- Track milestones and tasks (read-only)
- Download uploaded deliverables

---

## Project Structure

```
client-portal/
├── server/
│   ├── config/         # DB, schema, seed
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth, upload
│   ├── routes/         # API routes
│   ├── utils/          # Email helper
│   └── index.js        # Entry point
└── client/
    └── src/
        ├── components/ # Shared UI components
        ├── context/    # Auth context
        ├── pages/      # Page components
        └── utils/      # Axios instance
```
