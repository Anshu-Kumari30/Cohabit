# 🏠 COHABIT - Roommate Management System

A full-stack web application designed to simplify shared living. Track expenses, manage chores, and coordinate household activities with your roommates seamlessly.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![React](https://img.shields.io/badge/react-19.2.0-blue)

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based user authentication with encrypted passwords
- 💰 **Expense Tracking** - Log shared expenses and automatically calculate balances
- ✅ **Chore Management** - Assign, track, and complete household tasks
- 🏘️ **House Management** - Create houses and invite roommates with unique codes
- 📊 **Real-time Balance Calculation** - Automatic expense splitting among roommates
- 📱 **Responsive Design** - Beautiful dark-themed UI that works on all devices
- 🔔 **Activity Dashboard** - Overview of expenses, chores, and household stats

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Lucide React** - Beautiful icon library
- **React Toastify** - Elegant notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Secure authentication tokens
- **bcrypt.js** - Password hashing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas/register) (Free tier available)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Anshu-Kumari30/Cohabit.git
cd Cohabit
```

### 2. Backend Setup

#### Install Dependencies

cd backend
npm install
```

#### Configure Environment Variables



#### Start the Backend Server
```bash
npm run dev
```

Backend will run on **http://localhost:5000**

✅ You should see:
```
✅ MongoDB Connected
🚀 SERVER STARTED SUCCESSFULLY!
📍 URL: http://localhost:5000
```

### 3. Frontend Setup

Open a **new terminal** window:

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Start the Frontend Development Server
```bash
npm start
```

Frontend will run on **http://localhost:3000**

Your browser should automatically open the application!

## 📱 Usage

### Getting Started

1. **Register an Account**
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

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Houses
- `POST /api/houses` - Create new house (protected)
- `GET /api/houses/my-house` - Get user's house (protected)
- `POST /api/houses/join/:inviteCode` - Join house (protected)
- `DELETE /api/houses/:houseId/leave` - Leave house (protected)

### Expenses
- `GET /api/expenses` - Get all expenses (protected)
- `POST /api/expenses` - Create new expense (protected)
- `DELETE /api/expenses/:id` - Delete expense (protected)
- `GET /api/expenses/balances/calculate` - Calculate balances (protected)

### Chores
- `GET /api/chores` - Get all chores (protected)
- `POST /api/chores` - Create new chore (protected)
- `PATCH /api/chores/:id/toggle` - Toggle chore completion (protected)
- `DELETE /api/chores/:id` - Delete chore (protected)

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






