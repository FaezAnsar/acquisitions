import app from '#src/app.js';
import request from 'supertest';
describe('API Endpoints', () => {
  describe('GET /health   ', () => {
    it('should return Health status ', async () => {
      const res = await request(app).get('/health');
      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api   ', () => {
    it('should return API message ', async () => {
      const res = await request(app).get('/api').expect(200);
      expect(res.text).toBe('Acquisitions API is running');
    });
  });
  describe('GET /nonexistent   ', () => {
    it('should return 404 for nonexistent route', async () => {
      const res = await request(app).get('/nonexistent').expect(404);

      expect(res.body).toHaveProperty('error', 'Route not found');
    });
  });
});
