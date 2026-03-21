const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

let app;
let mongoServer;

const Admin = require('../models/Admin');
const Menu = require('../models/Menu');

beforeAll(async () => {
  // Start in-memory MongoDB and set env var before loading the app
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'testsecret';

  // Import app after setting MONGODB_URI so it connects to memory server
  app = require('../server');

  // Wait for mongoose to connect
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
  // Clean DB between tests
  await Admin.deleteMany({});
  await Menu.deleteMany({});
});

describe('Menu offer toggle', () => {
  test('enables offer with percent correctly and disables', async () => {
    // create admin
    const admin = await Admin.create({ name: 'Test', email: 'a@test.com', password: 'secret' });
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // create menu item
    const createRes = await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Pulao', description: 'Test', price: 200, category: 'Rice & Biryani', type: 'veg', spiceLevel: 'medium', cuisine: 'Indian'
      });
    expect(createRes.status).toBe(201);
    const item = createRes.body.data;
    expect(item).toBeDefined();

    // Enable offer with 20% discount
    const enRes = await request(app)
      .patch(`/api/menu/${item._id}/toggle-offer`)
      .set('Authorization', `Bearer ${token}`)
      .send({ offerType: 'percent', offerValue: 20 });

    expect(enRes.status).toBe(200);
    expect(enRes.body.success).toBe(true);
    expect(enRes.body.data.isOffer).toBe(true);
    expect(enRes.body.data.offerType).toBe('percent');
    expect(enRes.body.data.offerValue).toBe(20);
    // computed price should be 160 (200 * 0.8)
    expect(enRes.body.data.offerPrice).toBe(160);

    // Disable offer
    const disRes = await request(app)
      .patch(`/api/menu/${item._id}/toggle-offer`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(disRes.status).toBe(200);
    expect(disRes.body.success).toBe(true);
    expect(disRes.body.data.isOffer).toBe(false);
    expect(disRes.body.data.offerPrice).toBeNull();
  });

  test('rejects enabling offer without details', async () => {
    const admin = await Admin.create({ name: 'Test2', email: 'b@test.com', password: 'secret' });
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const createRes = await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Burger', description: 'Test', price: 150, category: 'Main Course', type: 'non-veg', spiceLevel: 'medium', cuisine: 'Continental'
      });
    expect(createRes.status).toBe(201);
    const item = createRes.body.data;

    // Attempt to enable without offerType/value
    const res = await request(app)
      .patch(`/api/menu/${item._id}/toggle-offer`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    // Because item not currently an offer, server expects details and should return 400
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
