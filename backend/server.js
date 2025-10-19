const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
// Import models
const User = require('./models/User');
const Expense = require('./models/Expense');
const Chore = require('./models/Chore');
const mongoose = require('mongoose');

// Connect to MongoDB
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});
const app = express();
app.use(cors());
app.use(express.json());




// Root route
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({ 
      status: 'OK',
      message: 'API is running',
      users: userCount
    });
  } catch (error) {
    res.json({ 
      status: 'OK',
      message: 'API is running',
      users: 0
    });
  }
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Register
// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        avatar: newUser.avatar
      }
    });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});


  // Login
// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

  

const PORT = process.env.PORT || 5000;
// In-memory storage for expenses and chores
let expenses = [
  { id: 1, description: 'Electricity Bill', amount: 150, paidBy: 1, paidByName: 'John Doe', date: '2025-10-10', category: 'utilities', splitWith: [1, 2, 3] },
  { id: 2, description: 'Groceries', amount: 85, paidBy: 1, paidByName: 'John Doe', date: '2025-10-12', category: 'food', splitWith: [1, 2, 3] }
];

let chores = [
  { id: 1, title: 'Clean Kitchen', assignedTo: 1, assignedToName: 'John Doe', dueDate: '2025-10-20', completed: false, priority: 'high' },
  { id: 2, title: 'Take Out Trash', assignedTo: 1, assignedToName: 'John Doe', dueDate: '2025-10-19', completed: false, priority: 'medium' }
];

// Get all expenses
app.get('/api/expenses', (req, res) => {
  res.json({ success: true, expenses });
});

// Add expense
app.post('/api/expenses', (req, res) => {
  const newExpense = {
    id: expenses.length + 1,
    ...req.body,
    date: req.body.date || new Date().toISOString().split('T')[0]
  };
  expenses.push(newExpense);
  res.status(201).json({ success: true, expense: newExpense });
});

// Delete expense
app.delete('/api/expenses/:id', (req, res) => {
  const id = parseInt(req.params.id);
  expenses = expenses.filter(e => e.id !== id);
  res.json({ success: true, message: 'Expense deleted' });
});

// Get all chores
app.get('/api/chores', (req, res) => {
  res.json({ success: true, chores });
});

// Add chore
app.post('/api/chores', (req, res) => {
  const newChore = {
    id: chores.length + 1,
    ...req.body,
    completed: false
  };
  chores.push(newChore);
  res.status(201).json({ success: true, chore: newChore });
});

// Toggle chore completion
app.patch('/api/chores/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id);
  const chore = chores.find(c => c.id === id);
  if (chore) {
    chore.completed = !chore.completed;
    res.json({ success: true, chore });
  } else {
    res.status(404).json({ success: false, message: 'Chore not found' });
  }
});

// Delete chore
app.delete('/api/chores/:id', (req, res) => {
  const id = parseInt(req.params.id);
  chores = chores.filter(c => c.id !== id);
  res.json({ success: true, message: 'Chore deleted' });
});
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 SERVER STARTED SUCCESSFULLY!');
  console.log('📍 URL: http://localhost:' + PORT);
  console.log('💚 Health: http://localhost:' + PORT + '/api/health');
  console.log('👥 Users: http://localhost:' + PORT + '/api/users');
  console.log('🔐 Auth: http://localhost:' + PORT + '/api/auth');
  console.log('='.repeat(50) + '\n');
});