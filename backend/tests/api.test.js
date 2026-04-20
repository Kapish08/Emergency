/**
 * Basic unit tests for hospital controller logic
 */

const { app } = require('../server');
const request = require('supertest');
const mongoose = require('mongoose');

afterAll(async () => {
  // Close database connection after tests finish to avoid open handle errors
  await mongoose.connection.close();
});

describe('Health Check', () => {
  it('should return 200 OK for /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});

describe('Hospitals API', () => {
  it('should return hospitals list', async () => {
    const res = await request(app).get('/api/hospitals');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.hospitals)).toBe(true);
  });

  it('should return hospitals near NYC coordinates', async () => {
    const res = await request(app).get('/api/hospitals?lat=40.7549&lng=-73.9769&radius=50');
    expect(res.statusCode).toBe(200);
    expect(res.body.hospitals.length).toBeGreaterThan(0);
  });

  it('should apply emergency type weighting', async () => {
    const res = await request(app).get('/api/hospitals?lat=40.7128&lng=-74.006&emergencyType=cardiac');
    expect(res.statusCode).toBe(200);
    expect(res.body.emergencyType).toBe('cardiac');
  });

  it('should return stats', async () => {
    const res = await request(app).get('/api/hospitals/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body.stats).toHaveProperty('totalHospitals');
    expect(res.body.stats).toHaveProperty('icu');
    expect(res.body.stats).toHaveProperty('general');
  });

  it('should return 404 for unknown hospital id', async () => {
    // We use a valid hexadecimal MongoDB ObjectId that doesn't exist
    const res = await request(app).get('/api/hospitals/603d2b2f9b1e8a001c8e4a1a');
    expect(res.statusCode).toBe(404);
  });
});

describe('Auth API', () => {
  const testEmail = `john_${Date.now()}@example.com`;
  const testPassword = 'password123';

  beforeAll(async () => {
    // Ensure we create a test user to login with successfully
    await request(app).post('/api/auth/signup').send({
      name: 'John Doe',
      email: testEmail,
      password: testPassword
    });
  });

  it('should reject login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});

describe('Alerts API', () => {
  it('should return active alerts', async () => {
    const res = await request(app).get('/api/alerts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.alerts)).toBe(true);
  });
});
