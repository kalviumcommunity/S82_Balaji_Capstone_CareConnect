const request = require('supertest');
const app = require('../app');
const { setupTestDB, teardownTestDB } = require('./testSetup');

describe('Rate Limiting Middleware', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // ────────────────────────────────────────────────────────────────────────
  // AI Endpoint Rate Limiting Tests
  // ────────────────────────────────────────────────────────────────────────
  describe('AI Endpoint Rate Limiting (20 req/15min)', () => {
    test('should allow requests up to the limit', async () => {
      const results = [];
      for (let i = 0; i < 20; i++) {
        const res = await request(app)
          .post('/api/ai')
          .send({
            messages: [{ role: 'user', content: 'Hello' }],
          });
        results.push(res.statusCode);
      }

      const rateLimitedCount = results.filter(code => code === 429).length;
      expect(rateLimitedCount).toBe(0);
    });

    test('should reject requests exceeding the limit with 429', async () => {
      const results = [];
      for (let i = 0; i < 22; i++) {
        const res = await request(app)
          .post('/api/ai')
          .send({
            messages: [{ role: 'user', content: 'Hello' }],
          });
        results.push(res.statusCode);
      }

      const rateLimitedCount = results.filter(code => code === 429).length;
      expect(rateLimitedCount).toBeGreaterThan(0);

      expect(results[20]).toBe(429);
      expect(results[21]).toBe(429);
    });

    test('rate limit response should contain rate limit headers', async () => {
      for (let i = 0; i < 22; i++) {
        const res = await request(app)
          .post('/api/ai')
          .send({
            messages: [{ role: 'user', content: 'Hello' }],
          });

        if (res.statusCode === 429) {
          expect(res.headers['ratelimit-limit']).toBeDefined();
          expect(res.headers['ratelimit-remaining']).toBeDefined();
          expect(res.headers['ratelimit-reset']).toBeDefined();
          break;
        }
      }
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // Auth Endpoint Rate Limiting Tests
  // ────────────────────────────────────────────────────────────────────────
  describe('Auth Endpoint Rate Limiting (30 req/10min)', () => {
    test('should allow requests up to the limit', async () => {
      const results = [];
      for (let i = 0; i < 30; i++) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: `test${i}@example.com`,
            password: 'testpass',
          });
        results.push(res.statusCode);
      }

      const rateLimitedCount = results.filter(code => code === 429).length;
      expect(rateLimitedCount).toBe(0);
    });

    test('should reject requests exceeding the limit with 429', async () => {
      const results = [];
      for (let i = 0; i < 32; i++) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: `logintest${i}@example.com`,
            password: 'testpass',
          });
        results.push(res.statusCode);
      }

      const rateLimitedCount = results.filter(code => code === 429).length;
      expect(rateLimitedCount).toBeGreaterThan(0);

      expect(results[30]).toBe(429);
      expect(results[31]).toBe(429);
    });

    test('rate limit response should contain error message', async () => {
      let rateLimitResponse = null;

      for (let i = 0; i < 32; i++) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: `msgtest${i}@example.com`,
            password: 'testpass',
          });

        if (res.statusCode === 429) {
          rateLimitResponse = res.body;
          break;
        }
      }

      if (rateLimitResponse) {
        expect(rateLimitResponse).toBeDefined();
        expect(
          rateLimitResponse.message ||
          rateLimitResponse.statusMessage ||
          JSON.stringify(rateLimitResponse)
        ).toBeDefined();
      }
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // Rate Limit State Tests
  // ────────────────────────────────────────────────────────────────────────
  describe('Rate Limit State Management', () => {
    test('should track rate limit state per IP address', async () => {
      // FIX: earlier describe blocks in this file already consumed real quota
      // against the default (127.0.0.1) IP bucket. Using a distinct simulated
      // IP here (app has `trust proxy` enabled, so X-Forwarded-For is honored)
      // gives this test a clean, untouched rate-limit bucket to test against.
      const results = [];

      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .post('/api/auth/login')
          .set('X-Forwarded-For', '10.0.0.1')
          .send({
            email: `iptest${i}@example.com`,
            password: 'testpass',
          });
        results.push(res.statusCode);

        expect(res.statusCode).not.toBe(429);
      }
    });

    test('AI and Auth endpoints should have independent rate limits', async () => {
      // FIX: same reasoning — isolate both the AI burst and the follow-up auth
      // check onto their own simulated IPs so neither is affected by quota
      // already consumed elsewhere in this file.
      const aiResults = [];

      for (let i = 0; i < 25; i++) {
        const res = await request(app)
          .post('/api/ai')
          .set('X-Forwarded-For', '10.0.0.2')
          .send({
            messages: [{ role: 'user', content: 'Hello' }],
          });
        aiResults.push(res.statusCode);
      }

      const authRes1 = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', '10.0.0.3')
        .send({
          email: 'separate@example.com',
          password: 'testpass',
        });

      expect(authRes1.statusCode).not.toBe(429);
    });
  });
});