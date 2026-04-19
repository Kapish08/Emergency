/**
 * Basic unit tests for hospital controller logic
 */

const { app } = require('../server');
const request = require('supertest');

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
    const res = await request(app).get('/api/hospitals/invalid-id');
    expect(res.statusCode).toBe(404);
  });
});

describe('Auth API', () => {
  it('should reject login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'password123' });
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
