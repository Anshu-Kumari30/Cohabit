<div align="center">

# 🏠 COHABIT

### Smart Roommate Management System

*Simplifying shared living through intelligent expense tracking and household coordination*

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About

**COHABIT** is a modern, full-stack web application designed to eliminate the friction of shared living. Whether you're sharing an apartment with friends, managing a student house, or coordinating with housemates, COHABIT provides all the tools you need to maintain harmony and transparency.

### Why COHABIT?

- 💸 **No More Awkward Money Conversations** - Automatic expense splitting and balance tracking
- 🧹 **Fair Chore Distribution** - Visual task management with priority levels
- 📊 **Complete Transparency** - Everyone sees expenses, balances, and responsibilities
- 🔒 **Privacy First** - Secure authentication and data protection
- 📱 **Works Everywhere** - Responsive design for desktop, tablet, and mobile

---

## ✨ Features

### 🔐 Authentication & Security
- Secure user registration and login with JWT tokens
- Password encryption using bcrypt (10 salt rounds)
- Protected API routes with middleware authentication
- Session persistence with local storage

### 💰 Expense Management
- **Create & Track Expenses** - Log shared costs with descriptions and categories
- **Automatic Splitting** - Divide expenses equally or customize splits
- **Balance Calculation** - Real-time "who owes whom" tracking
- **Expense Categories** - Organize by utilities, food, rent, entertainment, etc.
- **Expense History** - Complete audit trail of all transactions
- **Delete & Edit** - Full control over your expense records

### ✅ Chore Management
- **Task Assignment** - Assign chores to specific roommates
- **Priority Levels** - Mark tasks as high, medium, or low priority
- **Due Dates** - Set deadlines to keep everyone accountable
- **Status Tracking** - Mark chores as pending, in-progress, or completed
- **Completion History** - Track who completes tasks on time
- **Visual Dashboard** - See all pending and completed chores at a glance

### 🏘️ House Management
- **Create Houses** - Set up your shared living space
- **Invite System** - Unique invite codes for adding roommates
- **Member Management** - View all house members and their roles
- **Admin Controls** - House creators have administrative privileges
- **Leave House** - Members can leave at any time (admin transfers ownership)

### 📊 Dashboard & Analytics
- **Overview Statistics** - Total expenses, completion rates, balances
- **Recent Activity** - Latest expenses and chores
- **Balance Summary** - Visual representation of who owes what
- **Completion Metrics** - Chore completion percentages per user
- **Expense Trends** - Category breakdowns and spending patterns

### 🎨 User Experience
- **Dark Theme** - Modern, eye-friendly design with glassmorphism effects
- **Responsive Layout** - Seamless experience across all devices
- **Real-time Updates** - Instant feedback on all actions
- **Toast Notifications** - Elegant success/error messages
- **Loading States** - Professional loading indicators
- **Error Handling** - Graceful error messages with helpful guidance

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.12-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)

</div>

### Detailed Stack

**Frontend:**
- **React 19** - Latest version with concurrent features
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Modern icon library with 1000+ icons
- **Axios** - Promise-based HTTP client
- **React Toastify** - Beautiful toast notifications
- **React Router DOM** - Client-side routing (ready for implementation)

**Backend:**
- **Node.js 16+** - JavaScript runtime environment
- **Express.js 4.x** - Minimal and flexible web framework
- **MongoDB Atlas** - Cloud-hosted NoSQL database
- **Mongoose 8.x** - Elegant MongoDB object modeling
- **JWT (jsonwebtoken)** - Stateless authentication
- **bcrypt.js** - Password hashing algorithm
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing
- **nodemon** - Auto-restart development server

**Development Tools:**
- **VS Code** - Recommended IDE
- **Postman/Thunder Client** - API testing
- **MongoDB Compass** - Database GUI
- **Git** - Version control

---

## 📸 Screenshots

<div align="center">

### Authentication Page
*Secure login and registration with password strength indicator*

![Auth Page](https://via.placeholder.com/800x400/1a202c/60a5fa?text=Login+%26+Registration+Screen)

### Dashboard Overview
*Central hub showing expenses, chores, and household statistics*

![Dashboard](https://via.placeholder.com/800x400/1a202c/60a5fa?text=Dashboard+Overview)

### Expense Tracking
*Manage shared expenses with automatic balance calculation*

![Expenses](https://via.placeholder.com/800x400/1a202c/60a5fa?text=Expense+Management)

### Chore Management
*Assign and track household tasks with priorities*

![Chores](https://via.placeholder.com/800x400/1a202c/60a5fa?text=Chore+Management)

</div>

---

## 🚀 Installation

### Prerequisites

Ensure you have the following installed on your system:
```bash
node --version  # v16.0.0 or higher
npm --version   # v8.0.0 or higher
git --version   # v2.0.0 or higher
```

### Quick Start

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Anshu-Kumari30/Cohabit.git
cd Cohabit
```

#### 2️⃣ Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (see Configuration section below)
# Start the development server
npm run dev
```

✅ **Expected Output:**
```
==================================================
✅ MongoDB Connected Successfully!
📊 Database: cohabit
🌐 Host: cluster.mongodb.net
==================================================

🚀 SERVER STARTED SUCCESSFULLY!
📍 URL: http://localhost:5000
💚 Health: http://localhost:5000/api/health
==================================================
```

#### 3️⃣ Frontend Setup

**Open a new terminal:**
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

✅ **Expected Output:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

🎉 **Your browser should automatically open to `http://localhost:3000`**

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# Get your connection string from MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cohabit?retryWrites=true&w=majority&appName=cohabit

# JWT Configuration
# Generate a strong secret: openssl rand -base64 32
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRE=30d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### MongoDB Atlas Setup

1. **Create Account:** [Sign up at MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. **Create Cluster:** Choose free M0 tier
3. **Create Database User:**
   - Username: `your_username`
   - Password: `strong_password` (no special characters recommended)
4. **Whitelist IP:**
   - Network Access → Add IP Address
   - For development: `0.0.0.0/0` (allow all)
   - For production: Add specific IPs
5. **Get Connection String:**
   - Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your actual password

### Frontend Configuration

API base URL is configured in `frontend/src/services/api.js`:
```javascript
const API_URL = 'http://localhost:5000/api';
```

Change this for production deployment.

---

## 📖 Usage

### Getting Started Guide

#### 1. Create Your Account

1. Navigate to `http://localhost:3000`
2. Click the **"Sign Up"** tab
3. Fill in your details:
   - First Name
   - Last Name
   - Email address
   - Password (min 8 characters with special characters)
4. Click **"Create Account"**

#### 2. Create or Join a House

**Option A: Create a New House**
1. Click **"Add House"** button
2. Enter house name and optional description
3. You'll receive a unique **invite code**
4. Share this code with your roommates

**Option B: Join an Existing House**
1. Get the invite code from your housemate
2. Click **"Join House"**
3. Enter the invite code
4. You're now part of the household!

#### 3. Add an Expense

1. Navigate to **"Expenses"** tab
2. Click **"Add Expense"** button
3. Fill in details:
   - **Description:** e.g., "Electricity Bill"
   - **Amount:** e.g., 150
   - **Category:** utilities/food/rent/other
   - **Paid By:** Select who paid
   - **Split With:** Check roommates to split with
4. Click **"Add Expense"**
5. Balances are automatically calculated!

#### 4. Create a Chore

1. Navigate to **"Chores"** tab
2. Click **"Add Chore"** button
3. Enter details:
   - **Title:** e.g., "Clean Kitchen"
   - **Assign To:** Select roommate
   - **Due Date:** Pick a date
   - **Priority:** high/medium/low
4. Click **"Add Chore"**

#### 5. Complete a Chore

1. Find the chore in the list
2. Click the **checkbox** to mark complete
3. Status updates automatically
4. Completion tracked on dashboard

#### 6. View Balances

1. Go to **"Overview"** tab
2. See **"Current Balances"** section
3. Green = You're owed money
4. Red = You owe money
5. Click on any expense to see details

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "avatar": "JD"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### House Endpoints

#### Create House
```http
POST /api/houses
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Awesome House",
  "description": "Best roommates ever"
}
```

#### Get My House
```http
GET /api/houses/my-house
Authorization: Bearer {token}
```

#### Join House
```http
POST /api/houses/join/:inviteCode
Authorization: Bearer {token}
```

### Expense Endpoints

#### Get All Expenses
```http
GET /api/expenses
Authorization: Bearer {token}
```

#### Create Expense
```http
POST /api/expenses
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Electricity Bill",
  "amount": 150,
  "category": "utilities",
  "paidBy": "507f1f77bcf86cd799439011",
  "splitWith": [
    { "user": "507f1f77bcf86cd799439011" },
    { "user": "507f191e810c19729de860ea" }
  ]
}
```

#### Calculate Balances
```http
GET /api/expenses/balances/calculate
Authorization: Bearer {token}
```

### Chore Endpoints

#### Get All Chores
```http
GET /api/chores
Authorization: Bearer {token}
```

#### Create Chore
```http
POST /api/chores
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Clean Kitchen",
  "description": "Deep clean all surfaces",
  "assignedTo": "507f1f77bcf86cd799439011",
  "dueDate": "2025-10-25",
  "priority": "high",
  "category": "cleaning"
}
```

#### Toggle Chore Completion
```http
PATCH /api/chores/:choreId/toggle
Authorization: Bearer {token}
```

---

## 📁 Project Structure
```
Cohabit/
│
├── 📂 backend/                    # Backend Node.js application
│   ├── 📂 middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── 📂 models/
│   │   ├── User.js               # User schema & methods
│   │   ├── House.js              # House schema & methods
│   │   ├── Expense.js            # Expense schema & calculations
│   │   └── Chore.js              # Chore schema & tracking
│   ├── 📂 routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── house.js              # House management routes
│   │   ├── expense.js            # Expense CRUD routes
│   │   └── chore.js              # Chore CRUD routes
│   ├── 📄 .env                   # Environment variables (gitignored)
│   ├── 📄 .env.example           # Environment template
│   ├── 📄 server.js              # Express server entry point
│   ├── 📄 package.json           # Backend dependencies
│   └── 📄 package-lock.json
│
├── 📂 frontend/                   # React frontend application
│   ├── 📂 public/
│   │   ├── index.html            # HTML template
│   │   └── favicon.ico           # App icon
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── AuthPages.jsx    # Login & Registration UI
│   │   │   └── Dashboard.jsx    # Main application dashboard
│   │   ├── 📂 services/
│   │   │   └── api.js           # Axios API client
│   │   ├── 📄 App.js            # Root component
│   │   ├── 📄 App.css           # App styles
│   │   ├── 📄 index.js          # React entry point
│   │   └── 📄 index.css         # Global styles (Tailwind)
│   ├── 📄 package.json          # Frontend dependencies
│   ├── 📄 tailwind.config.js    # Tailwind configuration
│   └── 📄 postcss.config.js     # PostCSS configuration
│
├── 📄 .gitignore                 # Git ignore rules
├── 📄 README.md                  # This file
└── 📄 LICENSE                    # MIT License
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### ❌ MongoDB Connection Failed

**Error:**
```
MongoDB Connection Error: bad auth : authentication failed
```

**Solutions:**
1. Check username and password in `.env`
2. Verify IP whitelist in MongoDB Atlas (add `0.0.0.0/0` for testing)
3. Ensure cluster is not paused (free tier auto-pauses)
4. Check if password contains special characters (encode them)

#### ❌ Port Already in Use

**Error:**
```
Error: listen EADDRINUSE :::5000
```

**Solution (Windows):**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Solution (Mac/Linux):**
```bash
lsof -ti:5000 | xargs kill -9
```

#### ❌ Cannot Connect to Backend

**Error:** Frontend shows "Network Error" or "ERR_CONNECTION_REFUSED"

**Solutions:**
1. Verify backend is running: `http://localhost:5000/api/health`
2. Check CORS configuration in `server.js`
3. Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
4. Check API base URL in `frontend/src/services/api.js`

#### ❌ JWT Token Expired

**Error:** "Invalid or expired token. Please login again."

**Solution:**
1. Logout and login again
2. Check `JWT_EXPIRE` in `.env` (default: 30 days)
3. Clear browser local storage

#### ❌ Module Not Found

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🚢 Deployment

### Backend Deployment (Railway)

1. **Create Account:** [Railway.app](https://railway.app)
2. **New Project:** Click "New Project" → "Deploy from GitHub"
3. **Select Repository:** Choose `Cohabit`
4. **Configure:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Environment Variables:** Add all from `.env`
6. **Deploy:** Click deploy

### Frontend Deployment (Vercel)

1. **Create Account:** [Vercel.com](https://vercel.com)
2. **Import Project:** Click "New Project" → Import from GitHub
3. **Configure:**
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. **Environment Variables:**
```
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
```
5. **Deploy:** Click deploy

---

## 🗺️ Roadmap

### Planned Features

- [ ] **Google OAuth Integration** - Sign in with Google
- [ ] **Email Notifications** - Expense and chore reminders
- [ ] **Recurring Expenses** - Automatic monthly bills
- [ ] **Recurring Chores** - Weekly/monthly task automation
- [ ] **File Uploads** - Attach receipts to expenses
- [ ] **Budget Tracking** - Monthly spending limits per category
- [ ] **Split Customization** - Unequal expense splits
- [ ] **House Settings** - Currency, timezone configuration
- [ ] **Mobile App** - React Native iOS/Android apps
- [ ] **Dark/Light Theme Toggle** - User preference
- [ ] **Notifications System** - Real-time push notifications
- [ ] **Expense Charts** - Visual spending analytics
- [ ] **Payment Integration** - Venmo/PayPal/UPI links
- [ ] **Shopping List** - Shared grocery lists
- [ ] **Calendar View** - Visual chore timeline
- [ ] **Member Roles** - Admin, member, guest permissions
- [ ] **Activity Log** - Complete audit trail
- [ ] **Export Data** - Download expenses as CSV/PDF

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the Repository**
```bash
   # Click "Fork" button on GitHub
```

2. **Clone Your Fork**
```bash
   git clone https://github.com/YOUR_USERNAME/Cohabit.git
   cd Cohabit
```

3. **Create a Branch**
```bash
   git checkout -b feature/amazing-feature
```

4. **Make Changes**
   - Write clean, commented code
   - Follow existing code style
   - Test thoroughly

5. **Commit Changes**
```bash
   git add .
   git commit -m "feat: add amazing feature"
```

6. **Push to GitHub**
```bash
   git push origin feature/amazing-feature
```

7. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Describe your changes
   - Submit!

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Code Style

- Use **2 spaces** for indentation
- Use **semicolons**
- Use **camelCase** for variables
- Use **PascalCase** for components
- Add **comments** for complex logic
- Write **meaningful** commit messages

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
```
MIT License

Copyright (c) 2025 Anshu Kumari

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Authors & Contributors

<div align="center">

### 👨‍💻 Lead Developer

**Anshu Kumari**

[![GitHub](https://img.shields.io/badge/GitHub-Anshu--Kumari30-181717?style=for-the-badge&logo=github)](https://github.com/Anshu-Kumari30)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/your-profile)
[![Email](https://img.shields.io/badge/Email-Contact-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:your.email@example.com)

</div>

### 🙏 Special Thanks

- Coffee ☕ - For fueling late-night coding sessions
- All Beta Testers - For valuable feedback
- Open Source Community - For amazing tools and libraries

---

## 📧 Support & Contact

### Get Help

- 📖 **Documentation:** [GitHub Wiki](https://github.com/Anshu-Kumari30/Cohabit/wiki)
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/Anshu-Kumari30/Cohabit/issues)
- 💡 **Feature Requests:** [GitHub Discussions](https://github.com/Anshu-Kumari30/Cohabit/discussions)
- ✉️ **Email:** your.email@example.com

### Stay Updated

- ⭐ **Star this repo** to get updates
- 👀 **Watch** for new releases
- 🔔 **Follow** on GitHub for more projects

---

<div align="center">

### ⭐ If you find COHABIT helpful, please give it a star!

**Made with ❤️ and ☕ by Anshu Kumari**

*Simplifying roommate life, one expense at a time*

</div>