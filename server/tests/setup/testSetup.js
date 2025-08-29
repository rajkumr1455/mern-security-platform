/**
 * Test Setup Configuration
 * Comprehensive test environment setup for the modular architecture
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const logger = require('../../utils/logger');

// Global test configuration
global.testConfig = {
  timeout: 30000,
  mongoServer: null,
  testDatabase: null
}

/**
 * Setup test environment before all tests
 */
beforeAll(async () => {
  // Suppress console logs during tests unless explicitly needed
  if (process.env.TEST_VERBOSE !== 'true') {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  }

  // Setup in-memory MongoDB for integration tests
  if (process.env.TEST_TYPE === 'integration') {
    global.testConfig.mongoServer = await MongoMemoryServer.create();
    const mongoUri = global.testConfig.mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    global.testConfig.testDatabase = mongoose.connection.db;
    logger.info('Test MongoDB connected');
  }

  // Mock external services
  setupServiceMocks();
}, 60000);

/**
 * Cleanup after all tests
 */
afterAll(async () => {
  // Cleanup database connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (global.testConfig.mongoServer) {
    await global.testConfig.mongoServer.stop();
  }

  // Cleanup any remaining timers
  jest.clearAllTimers();
}, 30000);

/**
 * Setup service mocks for testing
 */
function setupServiceMocks() {
  // Mock Web3 provider calls
  jest.mock('web3', () => ({
    Web3: jest.fn().mockImplementation(() => ({
      eth: {
        getCode: jest.fn().mockResolvedValue('0x608060405234801561001057600080fd5b50'),
        getBalance: jest.fn().mockResolvedValue('1000000000000000000'),
        getTransactionCount: jest.fn().mockResolvedValue(10)
      },
      utils: {
        isAddress: jest.fn().mockReturnValue(true),
        toWei: jest.fn().mockImplementation((value, unit) => value + '000000000000000000'),
        fromWei: jest.fn().mockImplementation((value, unit) => value.slice(0, -18) || '0')
      }
    }))
  }));

  // Mock external tool integrations
  jest.mock('child_process', () => ({
    exec: jest.fn().mockImplementation((command, callback) => {
      // Mock different tool outputs based on command
      if (command.includes('slither')) {
        callback(null, mockSlitherOutput(), '');
      } else if (command.includes('mythril')) {
        callback(null, mockMythrilOutput(), '');
      } else {
        callback(null, 'Mock tool output', '');
      }
    }),
    spawn: jest.fn().mockReturnValue({
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'close') callback(0);
      })
    })
  }));

  // Mock file system operations
  jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    writeFileSync: jest.fn(),
    readFileSync: jest.fn().mockReturnValue('mock file content'),
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    promises: {
      writeFile: jest.fn().mockResolvedValue(),
      readFile: jest.fn().mockResolvedValue('mock file content'),
      mkdir: jest.fn().mockResolvedValue(),
      access: jest.fn().mockResolvedValue()
    }
  }))

  // Mock network requests
  jest.mock('axios', () => ({
    get: jest.fn().mockResolvedValue({ data: { result: 'mock api response' } }),
    post: jest.fn().mockResolvedValue({ data: { success: true } }),
    create: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: { result: 'mock api response' } }),
      post: jest.fn().mockResolvedValue({ data: { success: true } })
    })
  }));
}

/**
 * Mock Slither tool output
 */
function mockSlitherOutput() {
  return JSON.stringify({
    success: true,
    results: {
      detectors: [
        {
          check: 'reentrancy-eth',
          impact: 'High',
          confidence: 'Medium',
          description: 'Reentrancy vulnerability detected',
          elements: [
            {
              type: 'function',
              name: 'withdraw',
              source_mapping: {
                start: 100,
                length: 50,
                filename_relative: 'contract.sol',
                lines: [10, 11, 12]
              }
            }
          ]
        }
      ]
    }
  });
}

/**
 * Mock Mythril tool output
 */
function mockMythrilOutput() {
  return JSON.stringify({
    issues: [
      {
        title: 'Integer Overflow',
        type: 'Warning',
        severity: 'Medium',
        description: 'Potential integer overflow detected',
        filename: 'contract.sol',
        lineno: 15,
        function: 'add'
      }
    ]
  });
}

/**
 * Create test data factories
 */
global.testFactories = {
  /**
   * Create mock contract data
   */
  createMockContract: (overrides = {}) => ({
    address: '0x1234567890123456789012345678901234567890',
    name: 'TestContract',
    network: "ethereum",
    source_code: `
      pragma solidity ^0.8.0;
      contract TestContract {
        mapping(address => uint256) public balances;
        
        function withdraw() public {
          uint256 amount = balances[msg.sender];
          require(amount > 0, "No balance");
          
          (bool success, ) = msg.sender.call{value: amount}("");
          require(success, "Transfer failed");
          
          balances[msg.sender] = 0;
        }
      }
    `,
    ...overrides
  }),

  /**
   * Create mock analysis results
   */
  createMockAnalysisResults: (overrides = {}) => ({
    id: "analysis_123456789',
    status: 'completed',
    progress: 100,
    startTime: new Date('2024-01-01T00:00:00Z'),
    endTime: new Date('2024-01-01T00:05:00Z'),
    results: {
      contract_analysis: {
        vulnerabilities: [
          {
            type: 'reentrancy',
            severity: 'high',
            description: 'Reentrancy vulnerability detected',
            confidence: 85,
            tool: 'slither'
          }
        ],
        metrics: {
          lines_of_code: 50,
          functions_count: 3,
          complexity_score: 25
        }
      },
      network_scan: {
        contracts: [
          {
            address: '0x1234567890123456789012345678901234567890',
            verified: true,
            security_score: 75
          }
        ]
      },
      vulnerability_scan: {
        vulnerabilities: [
          {
            type: 'access_control',
            severity: 'medium',
            description: 'Missing access control',
            confidence: 90
          }
        ]
      }
    },
    summary: {
      total_vulnerabilities: 2,
      critical_vulnerabilities: 0,
      contracts_analyzed: 1,
      tools_used: ['slither', 'mythril']
    },
    ...overrides
  }),

  /**
   * Create mock scan session
   */
  createMockScanSession: (overrides = {}) => ({
    id: 'scan_123456789',
    target: { ip: '192.168.1.100', url: 'https://example.com' },
    status: 'completed',
    progress: 100,
    startTime: new Date('2024-01-01T00:00:00Z'),
    endTime: new Date('2024-01-01T00:10:00Z'),
    results: {
      port_scan: {
        open_ports: [80, 443, 22],
        findings: [
          { severity: 'low', description: 'SSH port open' }
        ]
      },
      vulnerability_scan: {
        vulnerabilities: [
          { severity: 'medium', type: 'outdated_software' }
        ]
      }
    },
    summary: {
      total_findings: 2,
      critical_findings: 0,
      high_findings: 0,
      medium_findings: 1,
      low_findings: 1,
      risk_score: 35
    },
    ...overrides
  })
}

/**
 * Test utilities
 */
global.testUtils = {
  /**
   * Wait for a condition to be true
   */
  waitFor: async (condition, timeout = 5000, interval = 100) => {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  },

  /**
   * Create a mock WebSocket for testing real-time features
   */
  createMockWebSocket: () => ({
    emit: jest.fn(),
    on: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    disconnect: jest.fn()
  }),

  /**
   * Generate random test data
   */
  randomString: (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
  },

  randomAddress: () => {
    return '0x' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  },

  randomPort: () => {
    return Math.floor(Math.random() * 65535) + 1;
  }
}

module.exports = {
  setupServiceMocks,
  mockSlitherOutput,
  mockMythrilOutput
}