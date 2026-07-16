const request = require('supertest');

// We'll use the MySQL pool from server - for testing we create a simple test setup
const BASE_URL = 'http://localhost:5000/api';

describe('Cohabit API Tests', () => {
  let token;
  let userId;

  test('GET /health - should return OK', async () => {
    const res = await request(BASE_URL).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  test('POST /auth/register - should register a new user', async () => {
    const res = await request(BASE_URL)
      .post('/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@test.com`,
        password: 'testpass123',
        confirmPassword: 'testpass123'
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
    userId = res.body.user.id;
  });

  test('POST /auth/login - should login existing user', async () => {
    const res = await request(BASE_URL)
      .post('/auth/login')
      .send({ email: 'demo@cohabit.app', password: 'demo1234' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test('POST /auth/login - should reject wrong password', async () => {
    const res = await request(BASE_URL)
      .post('/auth/login')
      .send({ email: 'demo@cohabit.app', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('POST /expenses - should create an expense', async () => {
    const res = await request(BASE_URL)
      .post('/expenses')
      .send({
        description: 'Test Expense',
        amount: 100,
        paidBy: 1,
        paidByName: 'Test User',
        splitType: 'equal',
        splits: [{ userId: 1, value: 0 }]
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.expense).toBeDefined();
    expect(Number(res.body.expense.amount)).toBe(100);
  });

  test('GET /expenses - should fetch expenses', async () => {
    const res = await request(BASE_URL).get('/expenses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.expenses)).toBe(true);
  });

  test('GET /balances - should calculate balances', async () => {
    const res = await request(BASE_URL).get('/balances');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.balances)).toBe(true);
  });

  test('POST /settlements - should create a settlement', async () => {
    const res = await request(BASE_URL)
      .post('/settlements')
      .send({ from: 1, to: 2, amount: 500, note: 'Test settlement' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('GET /shopping-items - should fetch shopping list', async () => {
    const res = await request(BASE_URL).get('/shopping-items');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  test('POST /shopping-items - should create shopping item', async () => {
    const res = await request(BASE_URL)
      .post('/shopping-items')
      .send({ name: 'Test Item', addedBy: 1 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.item.name).toBe('Test Item');
  });
});
