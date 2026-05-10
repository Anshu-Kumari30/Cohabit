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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS houses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        invite_code VARCHAR(50),
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
        date DATE,
        category VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS expense_splits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        expense_id INT NOT NULL,
        user_id INT NOT NULL,
        FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        assigned_to INT,
        assigned_to_name VARCHAR(255),
        due_date DATE,
        priority ENUM('low','medium','high') DEFAULT 'medium',
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

app.get('/api/expenses', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, description, amount, paid_by AS paidBy, paid_by_name AS paidByName, date, category
       FROM expenses
       ORDER BY created_at DESC`
    );

    for (const expense of rows) {
      const [splits] = await pool.query(
        'SELECT user_id FROM expense_splits WHERE expense_id = ?',
        [expense.id]
      );
      expense.splitWith = splits.map((row) => row.user_id);
    }

    res.json({ success: true, expenses: rows });
  } catch (error) {
    console.error('Expenses Error:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching expenses' });
  }
});

app.post('/api/expenses', async (req, res) => {
  const { description, amount, paidBy, paidByName, date, category, splitWith } = req.body;

  if (!description || !amount || !paidBy) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const expenseDate = date || new Date().toISOString().split('T')[0];
  const splitIds = Array.isArray(splitWith) ? splitWith.map((id) => Number(id)) : [];

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO expenses (description, amount, paid_by, paid_by_name, date, category)
       VALUES (?, ?, ?, ?, ?, ?)` ,
      [description, Number(amount), Number(paidBy), paidByName || null, expenseDate, category || null]
    );

    const expenseId = result.insertId;

    for (const userId of splitIds) {
      await connection.query(
        'INSERT INTO expense_splits (expense_id, user_id) VALUES (?, ?)',
        [expenseId, userId]
      );
    }

    await connection.commit();

    const createdExpense = {
      id: expenseId,
      description,
      amount: Number(amount),
      paidBy: Number(paidBy),
      paidByName: paidByName || null,
      date: expenseDate,
      category: category || null,
      splitWith: splitIds,
    };

    res.status(201).json({ success: true, expense: createdExpense });
  } catch (error) {
    await connection.rollback();
    console.error('Add Expense Error:', error.message);
    res.status(500).json({ success: false, message: 'Error adding expense' });
  } finally {
    connection.release();
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [result] = await pool.query('DELETE FROM expenses WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete Expense Error:', error.message);
    res.status(500).json({ success: false, message: 'Error deleting expense' });
  }
});

app.get('/api/chores', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, assigned_to AS assignedTo, assigned_to_name AS assignedToName,
              due_date AS dueDate, completed, priority
       FROM chores
       ORDER BY created_at DESC`
    );

    res.json({ success: true, chores: rows });
  } catch (error) {
    console.error('Chores Error:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching chores' });
  }
});

app.post('/api/chores', async (req, res) => {
  const { title, assignedTo, assignedToName, dueDate, priority } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Missing title' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO chores (title, assigned_to, assigned_to_name, due_date, priority, completed)
       VALUES (?, ?, ?, ?, ?, ?)` ,
      [title, assignedTo || null, assignedToName || null, dueDate || null, priority || 'medium', false]
    );

    const chore = {
      id: result.insertId,
      title,
      assignedTo: assignedTo || null,
      assignedToName: assignedToName || null,
      dueDate: dueDate || null,
      completed: false,
      priority: priority || 'medium',
    };

    res.status(201).json({ success: true, chore });
  } catch (error) {
    console.error('Add Chore Error:', error.message);
    res.status(500).json({ success: false, message: 'Error adding chore' });
  }
});

app.patch('/api/chores/:id/toggle', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [updateResult] = await pool.query(
      'UPDATE chores SET completed = NOT completed WHERE id = ?',
      [id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Chore not found' });
    }

    const [rows] = await pool.query(
      `SELECT id, title, assigned_to AS assignedTo, assigned_to_name AS assignedToName,
              due_date AS dueDate, completed, priority
       FROM chores WHERE id = ?`,
      [id]
    );

    res.json({ success: true, chore: rows[0] });
  } catch (error) {
    console.error('Toggle Chore Error:', error.message);
    res.status(500).json({ success: false, message: 'Error updating chore' });
  }
});

app.delete('/api/chores/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [result] = await pool.query('DELETE FROM chores WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Chore not found' });
    }
    res.json({ success: true, message: 'Chore deleted' });
  } catch (error) {
    console.error('Delete Chore Error:', error.message);
    res.status(500).json({ success: false, message: 'Error deleting chore' });
  }
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
