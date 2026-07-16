/**
 * Seed script for Cohabit demo data
 * Run: node seed.js
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cohabit',
};

async function seed() {
  const pool = mysql.createPool(dbConfig);

  console.log('🌱 Seeding database...\n');

  // Clear existing data
  await pool.query('DELETE FROM notifications');
  await pool.query('DELETE FROM shopping_items');
  await pool.query('DELETE FROM settlements');
  await pool.query('DELETE FROM expense_splits');
  await pool.query('DELETE FROM expenses');
  await pool.query('DELETE FROM chores');
  await pool.query('DELETE FROM users');
  await pool.query('DELETE FROM houses');

  // Create users
  const password = await bcrypt.hash('demo1234', 10);
  const users = [
    ['Aarav', 'Sharma', 'demo@cohabit.app', password, 'AS', 'admin', true],
    ['Priya', 'Patel', 'priya@cohabit.app', password, 'PP', 'member', true],
    ['Rahul', 'Verma', 'rahul@cohabit.app', password, 'RV', 'member', true],
  ];

  for (const u of users) {
    await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, avatar, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      u
    );
  }
  console.log('✅ Users created (demo@cohabit.app / demo1234)');

  // Create house
  const [house] = await pool.query(
    'INSERT INTO houses (name, description, invite_code) VALUES (?, ?, ?)',
    ['Sunset Villa', 'A cozy 3BHK in Andheri West, Mumbai', 'SUNSET12']
  );
  const houseId = house.insertId;

  // Assign users to house
  await pool.query('UPDATE users SET house_id = ? WHERE email IN (?, ?, ?)', [houseId, 'demo@cohabit.app', 'priya@cohabit.app', 'rahul@cohabit.app']);
  console.log('✅ House created: Sunset Villa');

  // Create expenses
  const expenses = [
    ['Electricity Bill - June', 4200, 1, 'Aarav Sharma', '2026-06-15', 'utilities', 'equal'],
    ['Groceries - Week 1', 2850, 2, 'Priya Patel', '2026-06-10', 'food', 'equal'],
    ['Internet Bill', 1500, 3, 'Rahul Verma', '2026-06-05', 'utilities', 'equal'],
    ['Dinner at Pizza Place', 2100, 1, 'Aarav Sharma', '2026-06-20', 'food', 'equal'],
    ['Cleaning Supplies', 650, 2, 'Priya Patel', '2026-06-18', 'household', 'equal'],
    ['Netflix Subscription', 649, 3, 'Rahul Verma', '2026-06-01', 'entertainment', 'equal'],
    ['Water Filter', 3200, 1, 'Aarav Sharma', '2026-06-25', 'household', 'equal'],
    ['Cab to Airport', 850, 2, 'Priya Patel', '2026-06-12', 'other', 'equal'],
    ['Month 1 Rent', 45000, 3, 'Rahul Verma', '2026-06-01', 'rent', 'equal'],
    ['Electricity Bill - May', 3800, 1, 'Aarav Sharma', '2026-05-20', 'utilities', 'equal'],
  ];

  for (const e of expenses) {
    const [result] = await pool.query(
      'INSERT INTO expenses (description, amount, paid_by, paid_by_name, date, category, split_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [e[0], e[1], e[2], e[3], e[4], e[5], e[6]]
    );
    const expenseId = result.insertId;
    // Split equally among all 3 users
    const splitAmount = e[1] / 3;
    for (let userId = 1; userId <= 3; userId++) {
      await pool.query(
        'INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)',
        [expenseId, userId, splitAmount]
      );
    }
  }
  console.log('✅ 10 expenses created');

  // Create chores
  const chores = [
    ['Clean Kitchen', 2, 'Priya Patel', '2026-07-05', 'high', false, null, null],
    ['Take out Trash', 3, 'Rahul Verma', '2026-07-03', 'low', false, null, null],
    ['Vacuum Living Room', 1, 'Aarav Sharma', '2026-07-07', 'medium', false, null, null],
    ['Mop Floors', 2, 'Priya Patel', '2026-07-10', 'medium', true, 'weekly', JSON.stringify([1, 2, 3])],
    ['Water Plants', 3, 'Rahul Verma', '2026-07-02', 'low', false, null, null],
    ['Clean Bathroom', 1, 'Aarav Sharma', '2026-07-08', 'high', true, 'weekly', JSON.stringify([1, 2, 3])],
  ];

  for (const c of chores) {
    await pool.query(
      `INSERT INTO chores (title, assigned_to, assigned_to_name, due_date, priority,
        is_recurring, recurring_frequency, rotation_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      c
    );
  }
  console.log('✅ 6 chores created');

  // Create a settlement
  await pool.query(
    'INSERT INTO settlements (from_user, to_user, amount, note) VALUES (?, ?, ?, ?)',
    [3, 1, 1500, 'Paid for dinner']
  );
  console.log('✅ 1 settlement created');

  // Create shopping items
  const items = [
    ['Milk', 1],
    ['Bread', 2],
    ['Eggs', 3],
    ['Cooking Oil', 1],
    ['Detergent', 2],
  ];
  for (const item of items) {
    await pool.query('INSERT INTO shopping_items (name, added_by) VALUES (?, ?)', item);
  }
  console.log('✅ 5 shopping items created');

  console.log('\n🎉 Seeding complete!');
  console.log('📧 Demo login: demo@cohabit.app / demo1234\n');

  await pool.end();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
