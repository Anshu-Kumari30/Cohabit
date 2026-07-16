const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const cron = require('node-cron');
const multer = require('multer');
const path = require('path');
const { z } = require('zod');
require('express-async-errors');

dotenv.config();

const app = express();
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  (process.env.FRONTEND_URL || ''),
].filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, true); // allow all origins in dev
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

// ─── Multer for receipt uploads ───
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `receipt-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── MySQL Pool ───
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

// ─── Zod Schemas ───
const registerSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const expenseSchema = z.object({
  description: z.string().trim().min(1, 'Description is required').max(100),
  amount: z.number().positive('Amount must be positive'),
  paidBy: z.number().int().positive(),
  paidByName: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  splitType: z.enum(['equal', 'percentage', 'custom']).default('equal'),
  splits: z.array(z.object({
    userId: z.number().int().positive(),
    value: z.number().min(0)
  })).optional(),
  splitWith: z.array(z.number().int().positive()).optional(),
  notes: z.string().optional().nullable(),
  receipt: z.string().optional().nullable()
});

const choreSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100),
  assignedTo: z.number().int().positive().optional().nullable(),
  assignedToName: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(['daily', 'weekly', 'monthly']).optional().nullable(),
  rotationOrder: z.array(z.number().int().positive()).optional()
});

const settlementSchema = z.object({
  from: z.number().int().positive(),
  to: z.number().int().positive(),
  amount: z.number().positive('Amount must be positive'),
  note: z.string().optional().nullable()
});

const shoppingItemSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required'),
  addedBy: z.number().int().positive()
});

// ─── Helpers ───
const createAvatar = (firstName, lastName) => {
  const first = (firstName || '').trim()[0] || '';
  const last = (lastName || '').trim()[0] || '';
  return `${first}${last}`.toUpperCase();
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
};

const authMiddleware = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await pool.query('SELECT id, first_name AS firstName, last_name AS lastName, email, avatar, role, is_active AS isActive FROM users WHERE id = ?', [decoded.id]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ─── Global Error Handler ───
app.use((err, req, res, next) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });
  }
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error', statusCode: err.status || 500 });
});

// ─── Initialize Database Tables ───
async function initializeDatabase() {
  const setupPool = mysql.createPool({ ...dbConfig, database: undefined });

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
        upi_id VARCHAR(100) DEFAULT NULL,
        google_id VARCHAR(255) DEFAULT NULL,
        house_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS houses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        invite_code VARCHAR(50) UNIQUE,
        currency VARCHAR(10) DEFAULT 'INR',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        description VARCHAR(500) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        paid_by INT NOT NULL,
        paid_by_name VARCHAR(255),
        split_type ENUM('equal','percentage','custom') DEFAULT 'equal',
        date DATE,
        category VARCHAR(255),
        notes TEXT,
        receipt_url VARCHAR(500) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS expense_splits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        expense_id INT NOT NULL,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) DEFAULT NULL,
        percentage DECIMAL(5,2) DEFAULT NULL,
        settled BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assigned_to INT,
        assigned_to_name VARCHAR(255),
        due_date DATE,
        priority ENUM('low','medium','high') DEFAULT 'medium',
        completed BOOLEAN DEFAULT FALSE,
        completed_at DATETIME DEFAULT NULL,
        is_recurring BOOLEAN DEFAULT FALSE,
        recurring_frequency ENUM('daily','weekly','monthly') DEFAULT NULL,
        rotation_order JSON DEFAULT NULL,
        current_assignee_index INT DEFAULT 0,
        category VARCHAR(100) DEFAULT 'other',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settlements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        from_user INT NOT NULL,
        to_user INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        note VARCHAR(500) DEFAULT NULL,
        settled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_user) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (to_user) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS shopping_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        added_by INT NOT NULL,
        is_checked BOOLEAN DEFAULT FALSE,
        checked_by INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('expense','chore','settlement') NOT NULL,
        message VARCHAR(500) NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        related_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ MySQL Connected and schema ready');
  } finally {
    await setupPool.end();
  }
}

// ═══════════════════════════════════════════════════════════════
//  HEALTH & USERS
// ═══════════════════════════════════════════════════════════════

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
    res.json({ status: 'OK', message: 'API is running', users: 0, database: 'mysql' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, first_name AS firstName, last_name AS lastName, email, avatar, role,
              is_active AS isActive, upi_id AS upiId, house_id AS houseId, created_at AS createdAt
       FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Users Error:', error.message);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.get('/api/users/me', authMiddleware, async (req, res) => {
  res.json({ success: true, user: req.user });
});

app.patch('/api/users/me', authMiddleware, async (req, res) => {
  const { firstName, lastName, upiId } = req.body;
  const updates = [];
  const params = [];
  if (firstName) { updates.push('first_name = ?'); params.push(firstName); }
  if (lastName) { updates.push('last_name = ?'); params.push(lastName); }
  if (upiId !== undefined) { updates.push('upi_id = ?'); params.push(upiId); }
  if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
  params.push(req.user.id);
  await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
  const [rows] = await pool.query('SELECT id, first_name AS firstName, last_name AS lastName, email, avatar, role, upi_id AS upiId FROM users WHERE id = ?', [req.user.id]);
  res.json({ success: true, user: rows[0] });
});

// ═══════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════

app.post('/api/auth/register', async (req, res) => {
  const data = registerSchema.parse(req.body);
  const normalizedEmail = data.email.toLowerCase().trim();
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
  if (existing.length > 0) {
    return res.status(400).json({ success: false, message: 'User with this email already exists' });
  }
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const avatar = createAvatar(data.firstName, data.lastName);
  const [result] = await pool.query(
    'INSERT INTO users (first_name, last_name, email, password, avatar) VALUES (?, ?, ?, ?, ?)',
    [data.firstName, data.lastName, normalizedEmail, hashedPassword, avatar]
  );
  const token = generateToken(result.insertId);
  res.status(201).json({
    success: true, message: 'User registered successfully',
    token,
    user: { id: result.insertId, firstName: data.firstName, lastName: data.lastName, email: normalizedEmail, avatar }
  });
});

app.post('/api/auth/login', async (req, res) => {
  const data = loginSchema.parse(req.body);
  const normalizedEmail = data.email.toLowerCase().trim();
  const [rows] = await pool.query(
    'SELECT id, first_name AS firstName, last_name AS lastName, email, avatar, password, role, is_active AS isActive FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail]
  );
  if (!rows.length) return res.status(401).json({ success: false, message: 'Invalid email or password' });
  const user = rows[0];
  if (!user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated' });
  const isValid = await bcrypt.compare(data.password, user.password);
  if (!isValid) return res.status(401).json({ success: false, message: 'Invalid email or password' });
  const token = generateToken(user.id);
  res.json({
    success: true, message: 'Login successful', token,
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, avatar: user.avatar, role: user.role }
  });
});

// ─── Demo Login ───
app.post('/api/auth/demo-login', async (req, res) => {
  const [rows] = await pool.query('SELECT id, first_name AS firstName, last_name AS lastName, email, avatar FROM users WHERE email = ? LIMIT 1', ['demo@cohabit.app']);
  if (!rows.length) return res.status(404).json({ success: false, message: 'Demo user not found. Run seed script first.' });
  const user = rows[0];
  const token = generateToken(user.id);
  res.json({ success: true, message: 'Demo login successful', token, user });
});

// ─── Google OAuth ───
const { OAuth2Client } = require('google-auth-library');
let googleClient;
const initGoogleClient = () => {
  const gId = process.env.GOOGLE_CLIENT_ID;
  if (gId) { googleClient = new OAuth2Client(gId); return true; }
  return false;
};
const googleAvailable = initGoogleClient();

app.post('/api/auth/google', async (req, res) => {
  if (!googleAvailable) {
    return res.status(503).json({ success: false, message: 'Google sign-in is not configured. Set GOOGLE_CLIENT_ID in .env' });
  }
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ success: false, message: 'Google credential token is required' });
  const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  const googleId = payload.sub;
  const email = payload.email.toLowerCase().trim();
  const firstName = payload.given_name || email.split('@')[0];
  const lastName = payload.family_name || '';
  const avatar = payload.picture || createAvatar(firstName, lastName);

  // Check if user exists by Google ID or email
  let [rows] = await pool.query(
    'SELECT id, first_name AS firstName, last_name AS lastName, email, avatar, role FROM users WHERE google_id = ? LIMIT 1',
    [googleId]
  );
  if (rows.length === 0) {
    [rows] = await pool.query(
      'SELECT id, first_name AS firstName, last_name AS lastName, email, avatar, role FROM users WHERE email = ? LIMIT 1',
      [email]
    );
  }

  let user;
  if (rows.length > 0) {
    user = rows[0];
    // Update google_id if not set
    await pool.query('UPDATE users SET google_id = ?, avatar = ? WHERE id = ?', [googleId, avatar, user.id]);
  } else {
    // Create new user
    const [result] = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, avatar, google_id, is_active) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
      [firstName, lastName, email, '', avatar, googleId]
    );
    user = { id: result.insertId, firstName, lastName, email, avatar, role: 'member' };
  }

  const token = generateToken(user.id);
  res.json({ success: true, message: 'Google sign-in successful', token, user });
});

// ═══════════════════════════════════════════════════════════════
//  EXPENSES (with Smart Splitting)
// ═══════════════════════════════════════════════════════════════

app.get('/api/expenses', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, description, amount, paid_by AS paidBy, paid_by_name AS paidByName,
            split_type AS splitType, date, category, notes, receipt_url AS receiptUrl,
            created_at AS createdAt
     FROM expenses ORDER BY created_at DESC`
  );
  for (const expense of rows) {
    const [splits] = await pool.query(
      `SELECT es.user_id AS userId, u.first_name AS firstName, u.last_name AS lastName,
              es.amount, es.percentage, es.settled
       FROM expense_splits es JOIN users u ON es.user_id = u.id
       WHERE es.expense_id = ?`, [expense.id]
    );
    expense.splits = splits;
  }
  res.json({ success: true, expenses: rows });
});

app.post('/api/expenses', async (req, res) => {
  const data = expenseSchema.parse(req.body);
  const expenseDate = data.date || new Date().toISOString().split('T')[0];
  const splitType = data.splitType || 'equal';
  let splits = data.splits || [];

  // If using legacy splitWith, convert to splits
  if (data.splitWith && data.splitWith.length > 0 && splits.length === 0) {
    splits = data.splitWith.map(userId => ({ userId, value: 0 }));
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO expenses (description, amount, paid_by, paid_by_name, split_type, date, category, notes, receipt_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.description, Number(data.amount), Number(data.paidBy), data.paidByName || null,
       splitType, expenseDate, data.category || null, data.notes || null, data.receipt || null]
    );
    const expenseId = result.insertId;

    const userIds = splits.map(s => s.userId);
    // Always include payer in splits if not already there
    if (!userIds.includes(Number(data.paidBy))) {
      userIds.push(Number(data.paidBy));
    }

    const numPeople = userIds.length;
    const amount = Number(data.amount);

    for (const userId of userIds) {
      let splitAmount = 0;
      let splitPercentage = null;
      const customSplit = splits.find(s => s.userId === userId);

      if (splitType === 'equal') {
        splitAmount = amount / numPeople;
      } else if (splitType === 'percentage') {
        splitPercentage = customSplit?.value || (100 / numPeople);
        splitAmount = (splitPercentage / 100) * amount;
      } else if (splitType === 'custom') {
        splitAmount = customSplit?.value || (amount / numPeople);
      }

      await connection.query(
        'INSERT INTO expense_splits (expense_id, user_id, amount, percentage) VALUES (?, ?, ?, ?)',
        [expenseId, userId, splitAmount, splitPercentage]
      );
    }

    await connection.commit();

    const [expense] = await pool.query(
      'SELECT id, description, amount, paid_by AS paidBy, paid_by_name AS paidByName, split_type AS splitType, date, category, notes, receipt_url AS receiptUrl, created_at AS createdAt FROM expenses WHERE id = ?',
      [expenseId]
    );
    const [splitsResult] = await pool.query(
      `SELECT es.user_id AS userId, u.first_name AS firstName, u.last_name AS lastName, es.amount, es.percentage, es.settled
       FROM expense_splits es JOIN users u ON es.user_id = u.id WHERE es.expense_id = ?`, [expenseId]
    );
    expense[0].splits = splitsResult;

    // Create notification for involved users
    for (const s of splitsResult) {
      if (s.userId !== Number(data.paidBy)) {
        await connection.query(
          'INSERT INTO notifications (user_id, type, message, related_id) VALUES (?, ?, ?, ?)',
          [s.userId, 'expense', `${data.paidByName || 'Someone'} added an expense "${data.description}" — ₹${Number(data.amount).toFixed(2)}`, expenseId]
        );
      }
    }

    res.status(201).json({ success: true, expense: expense[0] });
  } catch (error) {
    await connection.rollback();
    console.error('Add Expense Error:', error.message);
    res.status(500).json({ success: false, message: 'Error adding expense', error: error.message });
  } finally {
    connection.release();
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  const [result] = await pool.query('DELETE FROM expenses WHERE id = ?', [Number(req.params.id)]);
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Expense not found' });
  res.json({ success: true, message: 'Expense deleted' });
});

// ─── Expense Analytics ───
app.get('/api/expenses/analytics', async (req, res) => {
  const { houseId, range } = req.query;
  let dateFilter = '';
  if (range === '30d') dateFilter = 'AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
  else if (range === '3m') dateFilter = 'AND date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)';

  // Monthly spend trend
  const [monthlyTrend] = await pool.query(
    `SELECT DATE_FORMAT(date, '%Y-%m') AS month, SUM(amount) AS total
     FROM expenses WHERE 1=1 ${dateFilter} GROUP BY month ORDER BY month ASC`
  );

  // Category breakdown
  const [categoryBreakdown] = await pool.query(
    `SELECT category, SUM(amount) AS total, COUNT(*) AS count
     FROM expenses WHERE 1=1 ${dateFilter} GROUP BY category ORDER BY total DESC`
  );

  // Per-person spending
  const [perPerson] = await pool.query(
    `SELECT e.paid_by AS userId, u.first_name AS firstName, u.last_name AS lastName,
            SUM(e.amount) AS totalSpent, COUNT(*) AS expenseCount
     FROM expenses e JOIN users u ON e.paid_by = u.id
     WHERE 1=1 ${dateFilter} GROUP BY e.paid_by ORDER BY totalSpent DESC`
  );

  res.json({ success: true, analytics: { monthlyTrend, categoryBreakdown, perPerson } });
});

// ═══════════════════════════════════════════════════════════════
//  CHORES (with Recurring Support)
// ═══════════════════════════════════════════════════════════════

app.get('/api/chores', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, title, description, assigned_to AS assignedTo, assigned_to_name AS assignedToName,
            due_date AS dueDate, completed, completed_at AS completedAt, priority,
            is_recurring AS isRecurring, recurring_frequency AS recurringFrequency,
            rotation_order AS rotationOrder, current_assignee_index AS currentAssigneeIndex,
            category, created_at AS createdAt
     FROM chores ORDER BY created_at DESC`
  );
  // Parse JSON fields
  for (const c of rows) {
    if (typeof c.rotationOrder === 'string') c.rotationOrder = JSON.parse(c.rotationOrder);
  }
  res.json({ success: true, chores: rows });
});

app.post('/api/chores', async (req, res) => {
  const data = choreSchema.parse(req.body);
  const [result] = await pool.query(
    `INSERT INTO chores (title, description, assigned_to, assigned_to_name, due_date, priority,
                         is_recurring, recurring_frequency, rotation_order, current_assignee_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.title, req.body.description || null, data.assignedTo || null, data.assignedToName || null,
     data.dueDate || null, data.priority || 'medium',
     data.isRecurring || false, data.recurringFrequency || null,
     data.rotationOrder ? JSON.stringify(data.rotationOrder) : null, 0]
  );

  const [chore] = await pool.query(
    `SELECT id, title, assigned_to AS assignedTo, assigned_to_name AS assignedToName,
            due_date AS dueDate, completed, priority, is_recurring AS isRecurring,
            recurring_frequency AS recurringFrequency, rotation_order AS rotationOrder
     FROM chores WHERE id = ?`, [result.insertId]
  );
  if (chore[0].rotationOrder && typeof chore[0].rotationOrder === 'string') {
    chore[0].rotationOrder = JSON.parse(chore[0].rotationOrder);
  }

  // Notification for assignee
  if (data.assignedTo) {
    await pool.query(
      'INSERT INTO notifications (user_id, type, message, related_id) VALUES (?, ?, ?, ?)',
      [data.assignedTo, 'chore', `A new chore "${data.title}" has been assigned to you`, result.insertId]
    );
  }

  res.status(201).json({ success: true, chore: chore[0] });
});

app.patch('/api/chores/:id/toggle', async (req, res) => {
  const id = Number(req.params.id);
  const [chore] = await pool.query('SELECT completed FROM chores WHERE id = ?', [id]);
  if (!chore.length) return res.status(404).json({ success: false, message: 'Chore not found' });

  const nowCompleted = !chore[0].completed;
  await pool.query(
    'UPDATE chores SET completed = ?, completed_at = ? WHERE id = ?',
    [nowCompleted, nowCompleted ? new Date() : null, id]
  );

  // If chore is recurring and completed, auto-rotate
  if (nowCompleted) {
    const [c] = await pool.query('SELECT is_recurring, rotation_order, current_assignee_index FROM chores WHERE id = ?', [id]);
    if (c[0]?.is_recurring && c[0]?.rotation_order) {
      const order = typeof c[0].rotation_order === 'string' ? JSON.parse(c[0].rotation_order) : c[0].rotation_order;
      if (order.length > 0) {
        const nextIdx = (c[0].current_assignee_index + 1) % order.length;
        const nextUserId = order[nextIdx];
        const [nextUser] = await pool.query('SELECT id, first_name, last_name FROM users WHERE id = ?', [nextUserId]);
        if (nextUser.length) {
          const name = `${nextUser[0].first_name} ${nextUser[0].last_name}`;
          const nextDue = new Date();
          if (c[0].recurring_frequency === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
          else if (c[0].recurring_frequency === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1);
          else nextDue.setDate(nextDue.getDate() + 1);

          await pool.query(
            `UPDATE chores SET assigned_to = ?, assigned_to_name = ?, current_assignee_index = ?,
             completed = 0, completed_at = NULL, due_date = ? WHERE id = ?`,
            [nextUserId, name, nextIdx, nextDue.toISOString().split('T')[0], id]
          );

          await pool.query(
            'INSERT INTO notifications (user_id, type, message, related_id) VALUES (?, ?, ?, ?)',
            [nextUserId, 'chore', `Recurring chore has been rotated to you`, id]
          );
        }
      }
    }
  }

  const [rows] = await pool.query(
    `SELECT id, title, assigned_to AS assignedTo, assigned_to_name AS assignedToName,
            due_date AS dueDate, completed, priority, is_recurring AS isRecurring
     FROM chores WHERE id = ?`, [id]
  );
  res.json({ success: true, chore: rows[0] });
});

app.delete('/api/chores/:id', async (req, res) => {
  const [result] = await pool.query('DELETE FROM chores WHERE id = ?', [Number(req.params.id)]);
  if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Chore not found' });
  res.json({ success: true, message: 'Chore deleted' });
});

// ═══════════════════════════════════════════════════════════════
//  SETTLEMENTS
// ═══════════════════════════════════════════════════════════════

app.get('/api/settlements', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.id, s.from_user AS fromUser, s.to_user AS toUser, s.amount, s.note, s.settled_at AS settledAt,
            fu.first_name AS fromFirstName, fu.last_name AS fromLastName,
            tu.first_name AS toFirstName, tu.last_name AS toLastName
     FROM settlements s
     JOIN users fu ON s.from_user = fu.id
     JOIN users tu ON s.to_user = tu.id
     ORDER BY s.settled_at DESC`
  );
  res.json({ success: true, settlements: rows });
});

app.post('/api/settlements', async (req, res) => {
  const data = settlementSchema.parse(req.body);
  const [result] = await pool.query(
    'INSERT INTO settlements (from_user, to_user, amount, note) VALUES (?, ?, ?, ?)',
    [data.from, data.to, data.amount, data.note || null]
  );

  // Notify the recipient
  await pool.query(
    'INSERT INTO notifications (user_id, type, message, related_id) VALUES (?, ?, ?, ?)',
    [data.to, 'settlement', `You received a payment of ₹${Number(data.amount).toFixed(2)}`, result.insertId]
  );

  const [settlement] = await pool.query(
    `SELECT s.id, s.from_user AS fromUser, s.to_user AS toUser, s.amount, s.note, s.settled_at AS settledAt,
            fu.first_name AS fromFirstName, fu.last_name AS fromLastName,
            tu.first_name AS toFirstName, tu.last_name AS toLastName
     FROM settlements s
     JOIN users fu ON s.from_user = fu.id
     JOIN users tu ON s.to_user = tu.id
     WHERE s.id = ?`, [result.insertId]
  );
  res.status(201).json({ success: true, settlement: settlement[0] });
});

// ═══════════════════════════════════════════════════════════════
//  BALANCES
// ═══════════════════════════════════════════════════════════════

app.get('/api/balances', async (req, res) => {
  // Calculate what each person paid
  const [paid] = await pool.query(
    `SELECT paid_by AS userId, SUM(amount) AS total FROM expenses GROUP BY paid_by`
  );
  // Calculate what each person owes (their split amounts)
  const [owes] = await pool.query(
    `SELECT es.user_id AS userId, SUM(es.amount) AS total
     FROM expense_splits es GROUP BY es.user_id`
  );
  // Get settlements
  const [sent] = await pool.query(
    `SELECT from_user AS userId, SUM(amount) AS total FROM settlements GROUP BY from_user`
  );
  const [received] = await pool.query(
    `SELECT to_user AS userId, SUM(amount) AS total FROM settlements GROUP BY to_user`
  );

  const [users] = await pool.query('SELECT id, first_name AS firstName, last_name AS lastName FROM users');
  const balances = {};
  for (const u of users) {
    balances[u.id] = { userId: u.id, name: `${u.firstName} ${u.lastName}`, paid: 0, owes: 0, balance: 0 };
  }
  for (const p of paid) if (balances[p.userId]) balances[p.userId].paid = Number(p.total);
  for (const o of owes) if (balances[o.userId]) balances[o.userId].owes = Number(o.total);
  for (const s of sent) if (balances[s.userId]) balances[s.userId].paid += Number(s.total); // settling increases what you've "paid"
  for (const r of received) if (balances[r.userId]) balances[r.userId].owes -= Number(r.total); // being paid reduces what you owe

  for (const id in balances) {
    balances[id].balance = balances[id].paid - balances[id].owes;
  }

  res.json({ success: true, balances: Object.values(balances) });
});

// ═══════════════════════════════════════════════════════════════
//  SHOPPING LIST
// ═══════════════════════════════════════════════════════════════

app.get('/api/shopping-items', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT si.id, si.name, si.added_by AS addedBy, si.is_checked AS isChecked,
            si.checked_by AS checkedBy, si.created_at AS createdAt,
            u.first_name AS addedByFirstName, u.last_name AS addedByLastName
     FROM shopping_items si
     JOIN users u ON si.added_by = u.id
     ORDER BY si.is_checked ASC, si.created_at DESC`
  );
  res.json({ success: true, items: rows });
});

app.post('/api/shopping-items', async (req, res) => {
  const data = shoppingItemSchema.parse(req.body);
  const [result] = await pool.query(
    'INSERT INTO shopping_items (name, added_by) VALUES (?, ?)',
    [data.name, data.addedBy]
  );
  const [item] = await pool.query(
    `SELECT si.id, si.name, si.added_by AS addedBy, si.is_checked AS isChecked,
            si.created_at AS createdAt, u.first_name AS addedByFirstName, u.last_name AS addedByLastName
     FROM shopping_items si JOIN users u ON si.added_by = u.id WHERE si.id = ?`,
    [result.insertId]
  );
  res.status(201).json({ success: true, item: item[0] });
});

app.patch('/api/shopping-items/:id/toggle', async (req, res) => {
  const id = Number(req.params.id);
  const { checkedBy } = req.body;
  const [item] = await pool.query('SELECT is_checked FROM shopping_items WHERE id = ?', [id]);
  if (!item.length) return res.status(404).json({ success: false, message: 'Item not found' });
  const newChecked = !item[0].is_checked;
  await pool.query(
    'UPDATE shopping_items SET is_checked = ?, checked_by = ? WHERE id = ?',
    [newChecked, newChecked ? (checkedBy || null) : null, id]
  );
  const [updated] = await pool.query(
    `SELECT id, name, is_checked AS isChecked, checked_by AS checkedBy FROM shopping_items WHERE id = ?`, [id]
  );
  res.json({ success: true, item: updated[0] });
});

app.delete('/api/shopping-items/:id', async (req, res) => {
  await pool.query('DELETE FROM shopping_items WHERE id = ?', [Number(req.params.id)]);
  res.json({ success: true, message: 'Item deleted' });
});

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

app.get('/api/notifications', authMiddleware, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, type, message, is_read AS isRead, related_id AS relatedId, created_at AS createdAt FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.user.id]
  );
  res.json({ success: true, notifications: rows });
});

app.patch('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
    [Number(req.params.id), req.user.id]);
  res.json({ success: true });
});

app.patch('/api/notifications/read-all', authMiddleware, async (req, res) => {
  await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════════
//  HOUSES
// ═══════════════════════════════════════════════════════════════

app.post('/api/houses', authMiddleware, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'House name required' });
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const [result] = await pool.query(
    'INSERT INTO houses (name, description, invite_code) VALUES (?, ?, ?)',
    [name, description || null, inviteCode]
  );
  await pool.query('UPDATE users SET house_id = ?, role = ? WHERE id = ?', [result.insertId, 'admin', req.user.id]);
  const [house] = await pool.query('SELECT * FROM houses WHERE id = ?', [result.insertId]);
  res.status(201).json({ success: true, house: house[0] });
});

app.get('/api/houses/my-house', authMiddleware, async (req, res) => {
  if (!req.user.house_id) return res.status(404).json({ success: false, message: 'Not part of any house' });
  const [house] = await pool.query('SELECT * FROM houses WHERE id = ?', [req.user.house_id]);
  if (!house.length) return res.status(404).json({ success: false, message: 'House not found' });
  const [members] = await pool.query(
    'SELECT id, first_name AS firstName, last_name AS lastName, email, avatar, role, upi_id AS upiId FROM users WHERE house_id = ?',
    [req.user.house_id]
  );
  house[0].members = members;
  res.json({ success: true, house: house[0] });
});

app.post('/api/houses/join/:inviteCode', authMiddleware, async (req, res) => {
  const [house] = await pool.query('SELECT * FROM houses WHERE invite_code = ?', [req.params.inviteCode.toUpperCase()]);
  if (!house.length) return res.status(404).json({ success: false, message: 'Invalid invite code' });
  await pool.query('UPDATE users SET house_id = ?, role = ? WHERE id = ?', [house[0].id, 'member', req.user.id]);
  const [members] = await pool.query('SELECT id, first_name AS firstName, last_name AS lastName, email, avatar, role FROM users WHERE house_id = ?', [house[0].id]);
  house[0].members = members;
  res.json({ success: true, message: 'Joined house successfully', house: house[0] });
});

// ═══════════════════════════════════════════════════════════════
//  RECEIPT UPLOAD
// ═══════════════════════════════════════════════════════════════

app.post('/api/upload/receipt', authMiddleware, upload.single('receipt'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

// ═══════════════════════════════════════════════════════════════
//  CRON: Auto-rotate recurring chores (run daily at 6 AM)
// ═══════════════════════════════════════════════════════════════

cron.schedule('0 6 * * *', async () => {
  console.log('⏰ Running chore rotation check...');
  const [recurringChores] = await pool.query(
    `SELECT id, title, recurring_frequency, rotation_order, current_assignee_index,
            assigned_to, due_date FROM chores WHERE is_recurring = 1 AND completed = 1`
  );
  for (const chore of recurringChores) {
    if (!chore.rotation_order) continue;
    const order = typeof chore.rotation_order === 'string' ? JSON.parse(chore.rotation_order) : chore.rotation_order;
    if (order.length === 0) continue;

    const nextIdx = (chore.current_assignee_index + 1) % order.length;
    const nextUserId = order[nextIdx];
    const [user] = await pool.query('SELECT id, first_name, last_name FROM users WHERE id = ?', [nextUserId]);
    if (!user.length) continue;
    const name = `${user[0].first_name} ${user[0].last_name}`;
    const nextDue = new Date();
    if (chore.recurring_frequency === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
    else if (chore.recurring_frequency === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1);
    else nextDue.setDate(nextDue.getDate() + 1);

    await pool.query(
      `UPDATE chores SET assigned_to = ?, assigned_to_name = ?, current_assignee_index = ?,
       completed = 0, completed_at = NULL, due_date = ? WHERE id = ?`,
      [nextUserId, name, nextIdx, nextDue.toISOString().split('T')[0], chore.id]
    );
    console.log(`🔄 Rotated chore "${chore.title}" to ${name}`);
  }
});

// ═══════════════════════════════════════════════════════════════
//  SWAGGER API DOCS
// ═══════════════════════════════════════════════════════════════

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: { title: 'Cohabit API', version: '1.0.0', description: 'Roommate expense & chore management API' },
  servers: [{ url: `http://localhost:${PORT}/api` }],
};
const swaggerOptions = { swaggerDefinition, apis: ['./server.js'] };
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ═══════════════════════════════════════════════════════════════
//  START SERVER
// ═══════════════════════════════════════════════════════════════

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀  COHABIT SERVER STARTED');
      console.log('📍  URL:     http://localhost:' + PORT);
      console.log('💚  Health:  http://localhost:' + PORT + '/api/health');
      console.log('📚  API Docs: http://localhost:' + PORT + '/api-docs');
      console.log('🛢️  Database: MySQL');
      console.log('='.repeat(60) + '\n');
    });
  })
  .catch((error) => {
    console.error('❌ MySQL startup error:', error.message);
    process.exit(1);
  });
