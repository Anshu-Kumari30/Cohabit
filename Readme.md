# 🏠 COHABIT — Roommate Management System

A full-stack web application to simplify shared living. Track expenses with smart splitting, manage chores with rotation, settle debts, and coordinate household activities — all in one place.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-19.2.0-blue)
![MySQL](https://img.shields.io/badge/mysql-8.0-orange)

## ✨ Features

- 🔐 **JWT Authentication** — Register, login, and demo login
- 💰 **Smart Expense Splitting** — Equal, percentage, or custom split amounts
- 📊 **Analytics Dashboard** — Monthly trends, category breakdown, per-person spending (Chart.js)
- ✅ **Chore Management** — One-off and recurring chores with auto-rotation
- 🛒 **Shopping List** — Shared list with check/uncheck and delete
- 💸 **Settlements** — Record payments between roommates with UPI deep links
- 👥 **Roommate Management** — View members, invite codes, and roles
- 🔔 **Notifications** — Bell panel with mark-read functionality
- 📱 **Responsive Design** — Mobile-first with bottom navigation, dark theme
- 🧪 **Demo Mode** — One-click demo login with pre-seeded data
- 📄 **Swagger Docs** — Interactive API documentation at `/api-docs`

## 🛠️ Tech Stack

### Frontend
| Library | Purpose |
|---------|---------|
| **React 19** | UI framework |
| **Tailwind CSS 3** | Styling |
| **Chart.js + react-chartjs-2** | Analytics charts |
| **Framer Motion** | Animations |
| **Lucide React** | Icons |
| **React Toastify** | Notifications |
| **React Hook Form + Zod** | Form validation |
| **Axios** | HTTP client |

### Backend
| Library | Purpose |
|---------|---------|
| **Node.js + Express** | API server |
| **MySQL 8 + mysql2** | Database |
| **JWT (jsonwebtoken)** | Authentication |
| **bcryptjs** | Password hashing |
| **Zod** | Request validation |
| **node-cron** | Chore rotation scheduler |
| **multer** | File uploads |
| **swagger-jsdoc + swagger-ui-express** | API docs |

## 📋 Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org/)
- **MySQL** 8.0+ — [Download](https://dev.mysql.com/downloads/)
- **npm** (comes with Node.js)

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Anshu-Kumari30/Cohabit.git
cd Cohabit

# Backend
cd backend
npm install

# Frontend (new terminal)
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=cohabit_user
DB_PASSWORD=your_password
DB_NAME=cohabit

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_123456
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
```

### 3. Create MySQL Database
```sql
CREATE DATABASE IF NOT EXISTS cohabit;
CREATE USER IF NOT EXISTS 'cohabit_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON cohabit.* TO 'cohabit_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Seed Demo Data & Start
```bash
# Terminal 1 — Backend
cd backend
node seed.js
npm run dev

# Terminal 2 — Frontend
cd frontend
npm start
```

### 5. Open the App

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Swagger Docs:** http://localhost:5000/api-docs

### Demo Credentials
```
Email:    demo@cohabit.app
Password: demo1234
```

## 📱 Usage

### Getting Started
1. Click **Demo Login** on the landing page, or Register a new account
2. Create or join a house using an invite code
3. Start adding expenses, chores, and shopping items

### Key Features Walkthrough

| Feature | How to Use |
|---------|-----------|
| **Add Expense** | Click ➕ → Choose description, amount, split type (equal/%/custom) → Select who splits |
| **Analytics** | Switch to Analytics tab → Filter by 30d/3m/all → View charts |
| **Recurring Chore** | Click ➕ on Chores tab → Toggle "Recurring" → Set frequency & rotation order |
| **Settle Up** | Click Settle button → Select payer & receiver → Amount → Use UPI deep link |
| **Shopping List** | Switch to Shopping tab → Add items → Check off when bought |

## 🧪 Running Tests
```bash
cd backend
npm test
```

## 📁 Project Structure
```
Cohabit/
├── backend/
│   ├── server.js          # Express server + all routes + DB schema
│   ├── seed.js            # Demo data seeder
│   ├── fix_schema.js      # DB migration helper
│   ├── tests/
│   │   └── api.test.js    # 11 API integration tests
│   ├── uploads/           # Uploaded files
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AuthPages.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── SkeletonCard.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   └── services/
│   │       └── api.js     # Axios API client
│   └── package.json
└── DEPLOY_BACKEND.md
```

## 📄 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/demo-login` | Demo auto-login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile (UPI ID) |
| GET/POST | `/api/expenses` | List / Create expenses |
| GET | `/api/expenses/analytics` | Expense analytics |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET/POST | `/api/chores` | List / Create chores |
| PUT | `/api/chores/:id` | Update chore |
| DELETE | `/api/chores/:id` | Delete chore |
| GET | `/api/balances` | Get balances |
| GET/POST | `/api/settlements` | List / Create settlements |
| GET/POST | `/api/shopping-items` | List / Create shopping items |
| PUT | `/api/shopping-items/:id` | Toggle checked status |
| DELETE | `/api/shopping-items/:id` | Delete shopping item |
| GET | `/api/notifications` | List notifications |
| PUT | `/api/notifications/read-all` | Mark all read |
| PUT | `/api/notifications/:id/read` | Mark one read |
| POST | `/api/houses` | Create house |
| POST | `/api/houses/join` | Join house by code |
| GET | `/api/houses/my-house` | Get current house |
| POST | `/api/upload` | Upload receipt (multipart) |
   - Click "Sign Up" tab
   - Fill in your details
   - Create a strong password

2. **Create or Join a House**
   - Create a new house with a unique name
   - OR join an existing house using an invite code

3. **Add Expenses**
   - Click "Add Expense" button
   - Enter description, amount, and category
   - Select roommates to split with
   - Expenses are automatically divided

4. **Manage Chores**
   - Click "Add Chore" button
   - Assign to a roommate
   - Set due date and priority
   - Mark as complete when done

5. **View Dashboard**
   - See all expenses and balances
   - Track completed chores
   - View household statistics

## 📁 Project Structure
```
Cohabit/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── House.js             # House schema
│   │   ├── Expense.js           # Expense schema
│   │   └── Chore.js             # Chore schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── house.js             # House management routes
│   │   ├── expense.js           # Expense routes
│   │   └── chore.js             # Chore routes
│   ├── server.js                # Express server entry point
│   └── package.json             # Backend dependencies
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthPages.jsx   # Login/Signup pages
│   │   │   └── Dashboard.jsx   # Main dashboard
│   │   ├── services/
│   │   │   └── api.js          # API client configuration
│   │   ├── App.js              # Main app component
│   │   └── index.js            # React entry point
│   └── package.json            # Frontend dependencies
│
├── .gitignore                   # Git ignore rules
└── README.md                    # Project documentation
```

## 🔐 Security Features

- **Password Hashing** - Passwords encrypted with bcrypt (10 salt rounds)
- **JWT Authentication** - Secure token-based authentication
- **Protected Routes** - Middleware to verify user authentication
- **Environment Variables** - Sensitive data stored in .env files
- **CORS Protection** - Cross-origin resource sharing configuration



## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
```
❌ MongoDB Connection Error: bad auth : authentication failed
```
**Solution:** 
- Check MongoDB Atlas username and password
- Verify IP whitelist (add 0.0.0.0/0 for testing)
- Ensure cluster is running (not paused)

**Port Already in Use:**
```
Error: listen EADDRINUSE :::5000
```
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F



### Frontend Issues

**Cannot Connect to Backend:**
- Ensure backend server is running on port 5000
- Check `FRONTEND_URL` in backend `.env`
- Verify API base URL in `frontend/src/services/api.js`

**Module Not Found:**
```bash
cd frontend
npm install
```

## 🚢 Deployment

### Backend Deployment (Render/Railway)

1. Create account on [Render](https://render.com) or [Railway](https://railway.app)
2. Connect GitHub repository
3. Set environment variables in dashboard
4. Deploy backend service

### Frontend Deployment (Vercel/Netlify)

1. Create account on [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Deploy

## 🤝 Contributing

Contributions are welcome! 






