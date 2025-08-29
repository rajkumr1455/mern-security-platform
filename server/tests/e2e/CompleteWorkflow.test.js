const request = require('supertest');
const app = require('../../index');
const Web3ServiceOrchestrator = require('../../services/web3/Web3ServiceOrchestrator');
const SecurityServiceOrchestrator = require('../../services/security/SecurityServiceOrchestrator');
const ReportingServiceOrchestrator = require('../../services/reporting/ReportingServiceOrchestrator');

describe('Complete Workflow End-to-End Tests', () => {
  let web3Orchestrator;
  let securityOrchestrator;
  let reportingOrchestrator;

  beforeAll(async () => {
    web3Orchestrator = new Web3ServiceOrchestrator();
    securityOrchestrator = new SecurityServiceOrchestrator();
    reportingOrchestrator = new ReportingServiceOrchestrator();
  });

  afterAll(async () => {
    // Cleanup any active processes
    for (const [id] of web3Orchestrator.activeAnalyses) {
      web3Orchestrator.cancelAnalysis(id);
    }
    for (const [id] of securityOrchestrator.activeScanSessions) {
      securityOrchestrator.cancelScan(id);
    }
  });

  describe('Complete Web3 Security Analysis Workflow', () => {
    test('should perform end-to-end Web3 analysis with report generation', async () => {
      // Step 1: Start Web3 analysis via API
      const analysisResponse = await request(app)
        .post('/api/web3/analyze')
        .send({
          contractAddress: '0x1234567890123456789012345678901234567890',
          network: 'ethereum',
          generateReport: true,
          options: {
            tools: ['slither', 'mythril'],
            includeVisuals: true,
            includeEvidence: true
          }
        })
        .expect(200);

      expect(analysisResponse.body.success).toBe(true);
      expect(analysisResponse.body.data).toHaveProperty('analysisId');
      expect(analysisResponse.body.data).toHaveProperty('reportId');

      const { analysisId, reportId } = analysisResponse.body.data;

      // Step 2: Monitor analysis progress
      let analysisCompleted = false;
      let attempts = 0;
      const maxAttempts = 30;

      while (!analysisCompleted && attempts < maxAttempts) {
        const statusResponse = await request(app)
          .get(`/api/web3/analysis/${analysisId}/status`)
          .expect(200);

        const status = statusResponse.body.data.status;
        
        if (status === 'completed' || status === 'failed') {
          analysisCompleted = true;
          expect(status).toBe('completed');
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }
      }

      expect(analysisCompleted).toBe(true);

      // Step 3: Get analysis results
      const resultsResponse = await request(app)
        .get(`/api/web3/analysis/${analysisId}/results`)
        .expect(200);

      expect(resultsResponse.body.success).toBe(true);
      expect(resultsResponse.body.data).toHaveProperty('results');
      expect(resultsResponse.body.data.results).toHaveProperty('contract_analysis');
      expect(resultsResponse.body.data.results).toHaveProperty('vulnerability_scan');
      expect(resultsResponse.body.data.results).toHaveProperty('report');

      // Step 4: Verify report generation
      const reportStatusResponse = await request(app)
        .get(`/api/reports/${reportId}/status`)
        .expect(200);

      expect(reportStatusResponse.body.data.status).toBe('completed');

      // Step 5: Download report
      const reportResponse = await request(app)
        .get(`/api/reports/${reportId}/download/security_report.html`)
        .expect(200);

      expect(reportResponse.headers['content-type']).toContain('text/html');
    }, 60000);

    test('should handle Web3 DeFi protocol analysis', async () => {
      const response = await request(app)
        .post('/api/web3/defi/analyze')
        .send({
          protocol: 'uniswap',
          contractAddress: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
          network: 'ethereum'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('defi_analysis');
      expect(response.body.data.defi_analysis).toHaveProperty('protocol_risks');
      expect(response.body.data.defi_analysis).toHaveProperty('liquidity_analysis');
    });
  });

  describe('Complete Security Scanning Workflow', () => {
    test('should perform comprehensive security scan with all phases', async () => {
      // Step 1: Start security scan
      const target = {
        ip: '192.168.1.100',
        url: 'https://example.com',
        ports: [80, 443, 22]
      }

      const scanOptions = {
        scanTypes: 'all',
        checkCompliance: true,
        generateReport: true
      }

      const scanResult = await securityOrchestrator.performComprehensiveScan(target, scanOptions);

      expect(scanResult.status).toBe('completed');
      expect(scanResult.results).toHaveProperty('port_scan');
      expect(scanResult.results).toHaveProperty('vulnerability_scan');
      expect(scanResult.results).toHaveProperty('web_app_scan');
      expect(scanResult.results).toHaveProperty('threat_analysis');
      expect(scanResult.results).toHaveProperty('risk_assessment');
      expect(scanResult.results).toHaveProperty('compliance_check');

      // Step 2: Verify scan summary
      expect(scanResult.summary).toHaveProperty('total_findings');
      expect(scanResult.summary).toHaveProperty('risk_score');
      expect(scanResult.summary.risk_score).toBeGreaterThanOrEqual(0);
      expect(scanResult.summary.risk_score).toBeLessThanOrEqual(100);

      // Step 3: Generate security report
      const reportResult = await reportingOrchestrator.generateReport(scanResult, {
        type: 'security',
        format: 'html',
        template: 'technical'
      });

      expect(reportResult.status).toBe('completed');
      expect(reportResult.files.length).toBeGreaterThan(0);
    }, 45000);

    test('should handle scan cancellation gracefully', async () => {
      const target = { ip: '192.168.1.100' }

      // Start a scan
      const scanPromise = securityOrchestrator.performComprehensiveScan(target);

      // Wait for scan to start
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get active scan ID
      const activeSessions = Array.from(securityOrchestrator.activeScanSessions.keys());
      expect(activeSessions.length).toBe(1);

      const sessionId = activeSessions[0];

      // Cancel the scan
      const cancelled = securityOrchestrator.cancelScan(sessionId);
      expect(cancelled).toBe(true);

      // Verify scan was cancelled
      await expect(scanPromise).rejects.toThrow();

      const status = securityOrchestrator.getScanStatus(sessionId);
      expect(status.status).toBe('cancelled');
    });
  });

  describe('Integrated Reporting Workflow', () => {
    test('should generate multiple report formats', async () => {
      const mockData = global.testFactories.createMockAnalysisResults();

      // Generate HTML report
      const htmlReport = await reportingOrchestrator.generateReport(mockData, {
        type: 'security',
        format: 'html',
        template: 'executive'
      });

      expect(htmlReport.files.some(f => f.endsWith('.html'))).toBe(true);

      // Generate JSON report
      const jsonReport = await reportingOrchestrator.generateReport(mockData, {
        type: 'security',
        format: 'json'
      });

      expect(jsonReport.files.some(f => f.endsWith('.json'))).toBe(true);

      // Generate compliance report
      const complianceReport = await reportingOrchestrator.generateReport(mockData, {
        type: 'compliance',
        format: 'html',
        includeVisualizations: true
      });

      expect(complianceReport.status).toBe('completed');
    });

    test('should handle concurrent report generation', async () => {
      const mockData1 = global.testFactories.createMockAnalysisResults();
      const mockData2 = global.testFactories.createMockScanSession();

      // Start multiple reports concurrently
      const reportPromises = [
        reportingOrchestrator.generateReport(mockData1, { type: 'security', format: 'html' }),
        reportingOrchestrator.generateReport(mockData2, { type: 'security', format: 'json' }),
        reportingOrchestrator.generateReport(mockData1, { type: 'compliance', format: 'html' })
      ];

      const results = await Promise.all(reportPromises);

      results.forEach(result => {
        expect(result.status).toBe('completed');
        expect(result.files.length).toBeGreaterThan(0);
      });

      // Verify all reports have unique IDs
      const reportIds = results.map(r => r.id);
      const uniqueIds = new Set(reportIds);
      expect(uniqueIds.size).toBe(reportIds.length);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle service failures gracefully', async () => {
      // Mock a service failure
      const originalAnalyze = web3Orchestrator.contractAnalyzer.analyzeContract;
      web3Orchestrator.contractAnalyzer.analyzeContract = jest.fn()
        .mockRejectedValue(new Error('Service temporarily unavailable'));

      const target = global.testFactories.createMockContract();

      const result = await web3Orchestrator.performComprehensiveAnalysis(target);

      // Should complete with errors but not fail completely
      expect(result.status).toBe('completed');
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);

      // Restore original method
      web3Orchestrator.contractAnalyzer.analyzeContract = originalAnalyze;
    });

    test('should handle invalid input data', async () => {
      // Test with invalid contract address
      const response = await request(app)
        .post('/api/web3/analyze')
        .send({
          contractAddress: 'invalid-address',
          network: 'ethereum'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');

      // Test with missing required fields
      const response2 = await request(app)
        .post('/api/web3/analyze')
        .send({})
        .expect(400);

      expect(response2.body.success).toBe(false);
      expect(response2.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle multiple concurrent analyses', async () => {
      const contracts = Array.from({ length: 3 }, (_, i) => 
        global.testFactories.createMockContract({
          address: global.testUtils.randomAddress(),
          name: `TestContract${i}`
        })
      );

      const analysisPromises = contracts.map(contract =>
        web3Orchestrator.performComprehensiveAnalysis(contract, { tools: ['slither'] })
      );

      const results = await Promise.all(analysisPromises);

      results.forEach((result, index) => {
        expect(result.status).toBe('completed');
        expect(result.target.name).toBe(`TestContract${index}`);
      });

      // Verify all analyses have unique IDs
      const analysisIds = results.map(r => r.id);
      const uniqueIds = new Set(analysisIds);
      expect(uniqueIds.size).toBe(analysisIds.length);
    }, 30000);

    test('should maintain service health under load', async () => {
      // Check initial health
      const initialHealth = web3Orchestrator.getServiceHealth();
      expect(initialHealth.status).toBe('healthy');

      // Perform multiple operations
      const operations = Array.from({ length: 5 }, () =>
        web3Orchestrator.performComprehensiveAnalysis(
          global.testFactories.createMockContract({ address: global.testUtils.randomAddress() })
        )
      );

      await Promise.all(operations);

      // Check health after load
      const finalHealth = web3Orchestrator.getServiceHealth();
      expect(finalHealth.status).toBe('healthy');
      expect(finalHealth.completed_analyses).toBe(initialHealth.completed_analyses + 5);
    });
  });

  describe('Real-time Updates and WebSocket Integration', () => {
    test('should emit progress updates during analysis', async () => {
      const mockSocket = global.testUtils.createMockWebSocket();
      global.io = mockSocket;

      const target = global.testFactories.createMockContract();
      
      await web3Orchestrator.performComprehensiveAnalysis(target);

      // Verify progress updates were emitted
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'analysis_progress',
        expect.objectContaining({
          analysisId: expect.any(String),
          status: expect.any(String),
          progress: expect.any(Number)
        })
      );

      // Cleanup
      delete global.io;
    });
  });
});