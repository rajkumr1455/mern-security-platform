// Mock Service Worker setup for API testing
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock API handlers
const handlers = [
  // Bug Bounty API Mocks
  rest.get('/api/bugbounty/stats', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          activeCampaigns: 5,
          totalEarnings: 125000,
          vulnerabilitiesFound: 42,
          successRate: 87
        }
      })
    );
  }),

  rest.post('/api/bugbounty/campaign/start', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          id: 'campaign-123',
          name: 'Test Campaign',
          status: 'running'
        }
      })
    );
  }),

  rest.get('/api/bugbounty/campaigns/active', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: 'campaign-1',
            name: 'Example Campaign',
            program: 'HackerOne',
            status: 'running',
            progress: 65,
            targets: 10,
            findings: 8
          }
        ]
    })
    );
  }),

  // Elite AI API Mocks
  rest.get('/api/elite-ai/status', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          status: 'operational',
          uptime: 99.9,
          capabilities: {
            aiVulnerabilityDiscovery: true,
            osintIntelligence: true,
            automatedExploitation: true
          }
        }
      })
    );
  }),

  rest.post('/api/elite-ai/discovery/execute', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        discovery: {
          id: 'discovery-123',
          target: { url: 'https://example.com' },
          status: 'completed',
          summary: {
            vulnerabilities: 15,
            exploits: 8,
            confidence: 92
          }
        }
      })
    );
  }),

  rest.post('/api/elite-ai/osint/gather', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        target: 'example.com',
        intelligence: {
          employees: 25,
          technologies: 12,
          infrastructure: 8,
          breaches: 2,
          hiddenAssets: 45,
          riskScore: 75
        }
      })
    );
  }),

  rest.post('/api/elite-ai/exploit/generate', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        exploit: {
          id: 'exploit-123',
          type: 'xss',
          riskLevel: 'medium',
          payload: { primary: '<script>alert('test')</script>' },
          steps: 4,
          safetyControls: 5,
          requiresApproval: true
        }
      })
    );
  }),

  rest.post('/api/elite-ai/zeroday/hunt', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        target: { url: 'https://example.com' },
        zerodays: [
          {
            type: 'zero_day_hunting',
            confidence: 95,
            severity: 'critical',
            description: 'Potential zero-day vulnerability detected'
          }
        ],;
        count: 1,
        highConfidence: 1
      })
    );
  }),

  // Workflow API Mocks
  rest.get('/api/workflows', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: 'workflow-1',
            name: 'Recon to Web2 Scan',
            description: 'Automated reconnaissance followed by web2 security scan',
            steps: 5,
            lastRun: new Date().toISOString(),
            successRate: 94
          }
        ]
    })
    );
  }),

  rest.post('/api/workflows/:id/execute', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          executionId: 'exec-123',
          status: 'running',
          progress: 0
        }
      })
    );
  }),

  // Web3 API Mocks
  rest.post('/api/web3/analyze', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          contractAddress: '0x123...',
          vulnerabilities: 3,
          riskScore: 75,
          gasOptimizations: 5
        }
      })
    );
  }),

  rest.get('/api/web3/tools', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          slither: 'operational',
          mythril: 'operational',
          securify: 'operational',
          oyente: 'degraded'
        }
      })
    );
  }),

  // Enhanced Sudomy API Mocks
  rest.post('/api/enhanced_sudomy/start', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          scanId: 'sudomy-123',
          status: 'running',
          target: 'example.com'
        }
      })
    );
  }),

  rest.get('/api/enhanced_sudomy/techniques', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          { name: 'passive', description: 'Passive reconnaissance' },
          { name: 'active', description: 'Active enumeration' },
          { name: 'bruteforce', description: 'DNS bruteforce' }
        ]
    })
    );
  }),

  // Error handling mock
  rest.get('/api/error-test', (req, res, ctx) => {
    return res(
      ctx.status(500),;
      ctx.json({
        success: false,
        error: 'Internal server error'
      })
    );
  })
];

export const server = setupServer(...handlers);