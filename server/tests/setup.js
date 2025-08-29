/**;
 * Server-side Test Setup
 * Configuration for Node.js/Express testing
 */;

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Cleanup after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  // Stop the in-memory MongoDB instance
  await mongoServer.stop();
});

// Global test utilities
global.testUtils = {
  // Create test user
  createTestUser: async (userData = {}) => {
    const User = require('../models/User');
    const defaultUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPassword123!',
      role: 'analyst'
    }

    const user = new User({ ...defaultUser, ...userData })
    await user.save();
    return user;
  },

  // Create test target
  createTestTarget: async (targetData = {}) => {
    const Target = require('../models/Target');
    const defaultTarget = {
      name: 'Test Target',
      type: 'domain',
      value: 'example.com',
      description: 'Test target for unit tests'
    }

    const target = new Target({ ...defaultTarget, ...targetData })
    await target.save();
    return target;
  },

  // Create test scan
  createTestScan: async (scanData = {}) => {
    const Scan = require('../models/Scan');
    const defaultScan = {
      name: 'Test Scan',
      type: 'port',
      status: 'pending',
      results: []
    }

    const scan = new Scan({ ...defaultScan, ...scanData })
    await scan.save();
    return scan;
  },

  // Mock external API responses
  mockApiResponse: (data, status = 200) => ({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {}
  }),

  // Wait for async operations
  waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate test JWT token
  generateTestToken: (payload = {}) => {
    const jwt = require('jsonwebtoken');
    const defaultPayload = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'analyst'
    }

    return jwt.sign(
      { ...defaultPayload, ...payload },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    )
  }
}

// Mock external services
jest.mock('../services/NotificationService', () => ({
  sendNotification: jest.fn().mockResolvedValue(true),
  sendEmail: jest.fn().mockResolvedValue(true),
  sendSlackMessage: jest.fn().mockResolvedValue(true)
}));

jest.mock('../services/ExternalToolIntegrationService', () => ({
  runNmap: jest.fn().mockResolvedValue({ results: [] }),
  runSqlmap: jest.fn().mockResolvedValue({ results: [] }),
  runNikto: jest.fn().mockResolvedValue({ results: [] })
}));

// Suppress console output during tests
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}