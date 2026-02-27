const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cohabit',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

const createAvatar = (firstName, lastName) => {
  const first = (firstName || '').trim()[0] || '';
  const last = (lastName || '').trim()[0] || '';
  return `${first}${last}`.toUpperCase();
};

async function initializeDatabase() {
  const setupPool = mysql.createPool({
    ...dbConfig,
    database: undefined,
  });

  try {
    await setupPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(8) NOT NULL,
        role ENUM('admin', 'member') NOT NULL DEFAULT 'member',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ MySQL Connected and schema ready');
  } finally {
    await setupPool.end();
  }
}

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, first_name AS firstName, last_name AS lastName, email, avatar, role, is_active AS isActive, created_at AS createdAt
       FROM users
       ORDER BY created_at DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error('Users Error:', error.message);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    const [countRows] = await pool.query('SELECT COUNT(*) AS userCount FROM users');
    res.json({
      status: 'OK',
      message: 'API is running',
      users: countRows[0]?.userCount || 0,
      database: 'mysql',
    });
  } catch (error) {
    res.json({
      status: 'OK',
      message: 'API is running',
      users: 0,
      database: 'mysql',
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = createAvatar(firstName, lastName);

    const [result] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, avatar)
       VALUES (?, ?, ?, ?, ?)`,
      [String(firstName).trim(), String(lastName).trim(), normalizedEmail, hashedPassword, avatar]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: result.insertId,
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        email: normalizedEmail,
        avatar,
      },
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const [rows] = await pool.query(
      `SELECT id, first_name AS firstName, last_name AS lastName, email, avatar, password
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
});

let expenses = [
  { id: 1, description: 'Electricity Bill', amount: 150, paidBy: 1, paidByName: 'John Doe', date: '2025-10-10', category: 'utilities', splitWith: [1, 2, 3] },
  { id: 2, description: 'Groceries', amount: 85, paidBy: 1, paidByName: 'John Doe', date: '2025-10-12', category: 'food', splitWith: [1, 2, 3] }
];

let chores = [
  { id: 1, title: 'Clean Kitchen', assignedTo: 1, assignedToName: 'John Doe', dueDate: '2025-10-20', completed: false, priority: 'high' },
  { id: 2, title: 'Take Out Trash', assignedTo: 1, assignedToName: 'John Doe', dueDate: '2025-10-19', completed: false, priority: 'medium' }
];

app.get('/api/expenses', (req, res) => {
  res.json({ success: true, expenses });
});

app.post('/api/expenses', (req, res) => {
  const newExpense = {
    id: expenses.length + 1,
    ...req.body,
    date: req.body.date || new Date().toISOString().split('T')[0],
  };

  expenses.push(newExpense);
  res.status(201).json({ success: true, expense: newExpense });
});

app.delete('/api/expenses/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  expenses = expenses.filter((expense) => expense.id !== id);
  res.json({ success: true, message: 'Expense deleted' });
});

app.get('/api/chores', (req, res) => {
  res.json({ success: true, chores });
});

app.post('/api/chores', (req, res) => {
  const newChore = {
    id: chores.length + 1,
    ...req.body,
    completed: false,
  };

  chores.push(newChore);
  res.status(201).json({ success: true, chore: newChore });
});

app.patch('/api/chores/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const chore = chores.find((item) => item.id === id);

  if (!chore) {
    return res.status(404).json({ success: false, message: 'Chore not found' });
  }

  chore.completed = !chore.completed;
  return res.json({ success: true, chore });
});

app.delete('/api/chores/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  chores = chores.filter((chore) => chore.id !== id);
  res.json({ success: true, message: 'Chore deleted' });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 SERVER STARTED SUCCESSFULLY!');
      console.log('📍 URL: http://localhost:' + PORT);
      console.log('💚 Health: http://localhost:' + PORT + '/api/health');
      console.log('👥 Users: http://localhost:' + PORT + '/api/users');
      console.log('🔐 Auth: http://localhost:' + PORT + '/api/auth');
      console.log('🛢️ Database: MySQL');
      console.log('='.repeat(50) + '\n');
    });
  })
  .catch((error) => {
    console.error('❌ MySQL startup error:', error.message);
    process.exit(1);
  });
