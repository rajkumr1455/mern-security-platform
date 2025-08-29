const request = require('supertest');
const app = require('../../index');
const Web3ServiceOrchestrator = require('../../services/web3/Web3ServiceOrchestrator');

describe('Web3 Service Orchestrator Integration Tests', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new Web3ServiceOrchestrator();
  });

  afterEach(() => {
    // Cleanup any active analyses
    for (const [id] of orchestrator.activeAnalyses) {
      orchestrator.cancelAnalysis(id);
    }
  });

  describe('Comprehensive Analysis', () => {
    test('should perform complete Web3 analysis workflow', async () => {
      const target = {
        address: "0x1234567890123456789012345678901234567890",
        source_code: `
          pragma solidity ^0.8.0;
          contract TestContract {
            mapping(address => uint256) public balances;
            
            function withdraw() public {
              uint256 amount = balances[msg.sender];
              require(amount > 0, "No balance");
              
              (bool success, ) = msg.sender.call{value: amount}("");
              require(success, "Transfer failed");
              
              balances[msg.sender] = 0; // State change after external call - reentrancy!
            }
          }
        `
      }

      const options = {
        tools: ["slither', 'mythril'],
        includeVisuals: true,
        includeEvidence: true
      }

      const result = await orchestrator.performComprehensiveAnalysis(target, options);

      // Verify analysis structure
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('status', 'completed');
      expect(result).toHaveProperty('results');
      expect(result.results).toHaveProperty('contract_analysis');
      expect(result.results).toHaveProperty('vulnerability_scan');
      expect(result.results).toHaveProperty('report');

      // Verify vulnerability detection
      const vulnScan = result.results.vulnerability_scan;
      expect(vulnScan.vulnerabilities).toHaveLength(1);
      expect(vulnScan.vulnerabilities[0]).toMatchObject({
        type: 'reentrancy',
        severity: 'high',
        tool: 'slither'
      });

      // Verify summary
      expect(result.summary).toHaveProperty('total_vulnerabilities', 1);
      expect(result.summary.tools_used).toContain('slither');
    }, 30000);

    test('should handle network scanning for Web3 applications', async () => {
      const target = {
        url: 'https://app.uniswap.org',
        type: 'web3_application'
      }

      const result = await orchestrator.performComprehensiveAnalysis(target);

      expect(result.results).toHaveProperty('network_scan');
      expect(result.results.network_scan).toHaveProperty('defi_protocols');
      expect(result.results.network_scan).toHaveProperty('risks');
    });

    test('should generate comprehensive reports', async () => {
      const target = {
        address: '0x1234567890123456789012345678901234567890'
      }

      const options = {
        format: 'html',
        template: 'technical'
      }

      const result = await orchestrator.performComprehensiveAnalysis(target, options);

      expect(result.results.report).toHaveProperty('files');
      expect(result.results.report.files.length).toBeGreaterThan(0);
      expect(result.results.report).toHaveProperty('metadata');
      expect(result.results.report.metadata).toHaveProperty('confidence_level');
    });
  });

  describe('Analysis Status Tracking', () => {
    test('should track analysis progress', async () => {
      const target = { address: '0x1234567890123456789012345678901234567890' }
      
      // Start analysis (don't await)
      const analysisPromise = orchestrator.performComprehensiveAnalysis(target);
      
      // Wait a bit for analysis to start
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get active analyses
      const activeAnalyses = Array.from(orchestrator.activeAnalyses.keys());
      expect(activeAnalyses.length).toBe(1);
      
      const analysisId = activeAnalyses[0];
      const status = orchestrator.getAnalysisStatus(analysisId);
      
      expect(status).toHaveProperty('id', analysisId);
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('progress');
      expect(status.progress).toBeGreaterThanOrEqual(0);
      
      // Wait for completion
      await analysisPromise;
      
      // Check final status
      const finalStatus = orchestrator.getAnalysisStatus(analysisId);
      expect(finalStatus.status).toBe('completed');
      expect(finalStatus.progress).toBe(100);
    });

    test('should handle analysis cancellation', async () => {
      const target = { address: '0x1234567890123456789012345678901234567890' }
      
      // Start analysis
      const analysisPromise = orchestrator.performComprehensiveAnalysis(target);
      
      // Wait for analysis to start
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const activeAnalyses = Array.from(orchestrator.activeAnalyses.keys());
      const analysisId = activeAnalyses[0];
      
      // Cancel analysis
      const cancelled = orchestrator.cancelAnalysis(analysisId);
      expect(cancelled).toBe(true);
      
      // Verify cancellation
      const status = orchestrator.getAnalysisStatus(analysisId);
      expect(status.status).toBe('cancelled');
      
      // Analysis promise should still resolve
      await expect(analysisPromise).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid targets gracefully', async () => {
      const target = { invalid: 'target' }
      
      await expect(
        orchestrator.performComprehensiveAnalysis(target)
      ).rejects.toThrow();
    });

    test('should continue analysis when individual services fail', async () => {
      const target = {
        address: '0x1234567890123456789012345678901234567890',
        source_code: 'invalid solidity code'
      }

      const result = await orchestrator.performComprehensiveAnalysis(target);
      
      // Should complete despite errors
      expect(result.status).toBe('completed');
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Service Health', () => {
    test('should report service health status', () => {
      const health = orchestrator.getServiceHealth();
      
      expect(health).toHaveProperty('status', 'healthy');
      expect(health).toHaveProperty('active_analyses');
      expect(health).toHaveProperty('completed_analyses');
      expect(health).toHaveProperty('services');
      expect(health.services).toHaveProperty('contract_analyzer');
      expect(health.services).toHaveProperty('network_scanner');
      expect(health.services).toHaveProperty('vulnerability_scanner');
      expect(health.services).toHaveProperty('report_generator');
    });
  });
});

describe('Web3 API Integration Tests', () => {
  describe('POST /api/web3/analyze', () => {
    test('should start Web3 analysis and return analysis ID', async () => {
      const response = await request(app)
        .post('/api/web3/analyze')
        .send({
          target: {
            address: '0x1234567890123456789012345678901234567890'
          },
          options: {
            tools: ['slither']
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('status');
    });

    test('should return validation error for missing target', async () => {
      const response = await request(app)
        .post('/api/web3/analyze')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/web3/analysis/:id/status', () => {
    test('should return analysis status', async () => {
      // First start an analysis
      const startResponse = await request(app)
        .post('/api/web3/analyze')
        .send({
          target: { address: '0x1234567890123456789012345678901234567890' }
        });

      const analysisId = startResponse.body.data.id;

      // Then check status
      const statusResponse = await request(app)
        .get(`/api/web3/analysis/${analysisId}/status`)
        .expect(200);

      expect(statusResponse.body.success).toBe(true);
      expect(statusResponse.body.data).toHaveProperty('id', analysisId);
      expect(statusResponse.body.data).toHaveProperty('status');
      expect(statusResponse.body.data).toHaveProperty('progress');
    });

    test('should return 404 for non-existent analysis', async () => {
      const response = await request(app)
        .get('/api/web3/analysis/non-existent-id/status')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/web3/analysis/:id/results', () => {
    test('should return analysis results when completed', async () => {
      // Start and wait for analysis completion
      const startResponse = await request(app)
        .post('/api/web3/analyze')
        .send({
          target: { address: '0x1234567890123456789012345678901234567890' }
        });

      const analysisId = startResponse.body.data.id;

      // Poll until completed (with timeout)
      let completed = false;
      let attempts = 0;
      const maxAttempts = 30;

      while (!completed && attempts < maxAttempts) {
        const statusResponse = await request(app)
          .get(`/api/web3/analysis/${analysisId}/status`);
        
        if (statusResponse.body.data.status === 'completed') {
          completed = true;
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }
      }

      expect(completed).toBe(true);

      // Get results
      const resultsResponse = await request(app)
        .get(`/api/web3/analysis/${analysisId}/results`)
        .expect(200);

      expect(resultsResponse.body.success).toBe(true);
      expect(resultsResponse.body.data).toHaveProperty('results');
      expect(resultsResponse.body.data).toHaveProperty('summary');
    }, 60000);
  });

  describe('DELETE /api/web3/analysis/:id', () => {
    test('should cancel active analysis', async () => {
      // Start analysis
      const startResponse = await request(app)
        .post('/api/web3/analyze')
        .send({
          target: { address: '0x1234567890123456789012345678901234567890' }
        });

      const analysisId = startResponse.body.data.id;

      // Cancel analysis
      const cancelResponse = await request(app)
        .delete(`/api/web3/analysis/${analysisId}`)
        .expect(200);

      expect(cancelResponse.body.success).toBe(true);

      // Verify cancellation
      const statusResponse = await request(app)
        .get(`/api/web3/analysis/${analysisId}/status`);

      expect(statusResponse.body.data.status).toBe('cancelled');
    });
  });

  describe('GET /api/web3/health', () => {
    test('should return service health status', async () => {
      const response = await request(app)
        .get('/api/web3/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty("services");
    });
  });
});