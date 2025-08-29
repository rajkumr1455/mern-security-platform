const SecurityServiceOrchestrator = require('../../services/security/SecurityServiceOrchestrator');

describe('SecurityServiceOrchestrator Unit Tests', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new SecurityServiceOrchestrator();
  });

  afterEach(() => {
    // Cleanup any active scan sessions
    for (const [id] of orchestrator.activeScanSessions) {
      orchestrator.cancelScan(id);
    }
  });

  describe('Service Initialization', () => {
    test('should initialize all security services', async () => {
      await orchestrator.initializeServices();

      expect(orchestrator.scanners.size).toBeGreaterThan(0);
      expect(orchestrator.analyzers.size).toBeGreaterThan(0);
      expect(orchestrator.validators.size).toBeGreaterThan(0);

      // Check specific services
      expect(orchestrator.scanners.has('port')).toBe(true);
      expect(orchestrator.scanners.has('vulnerability')).toBe(true);
      expect(orchestrator.scanners.has('web_application')).toBe(true);
      expect(orchestrator.scanners.has('network')).toBe(true);
    });

    test('should handle service initialization failures gracefully', async () => {
      // Mock a service failure
      const originalRequire = require;
      jest.doMock('../../services/security/PortScanner', () => {
        throw new Error('Service unavailable');
      });

      // Should not throw, but continue with available services
      await expect(orchestrator.initializeServices()).resolves.not.toThrow();
    });
  });

  describe('Comprehensive Security Scanning', () => {
    test('should perform complete security scan workflow', async () => {
      const target = {
        ip: '192.168.1.100',
        url: 'https://example.com'
      }

      const options = {
        scanTypes: 'all',
        checkCompliance: true
      }

      // Mock scanner methods to avoid actual network calls
      orchestrator.scanners.set('network', {
        scan: jest.fn().mockResolvedValue({
          services: [{ port: 80, service: 'http' }],
          findings: []
        })
      });

      orchestrator.scanners.set('port', {
        scan: jest.fn().mockResolvedValue({
          open_ports: [80, 443],
          findings: [{ severity: 'low', description: 'Open port detected' }]
        })
      });

      orchestrator.scanners.set('vulnerability', {
        scan: jest.fn().mockResolvedValue({
          vulnerabilities: [{ severity: 'medium', type: 'outdated_software' }],
          findings: []
        })
      });

      orchestrator.scanners.set('web_application', {
        scan: jest.fn().mockResolvedValue({
          findings: [{ severity: 'high', type: 'xss_vulnerability' }]
        })
      });

      orchestrator.analyzers.set('threat', {
        analyze: jest.fn().mockResolvedValue({
          threats: [{ level: 'medium', description: 'Potential attack vector' }]
        })
      });

      orchestrator.analyzers.set('risk', {
        assess: jest.fn().mockResolvedValue({
          risk_score: 65,
          risk_level: 'medium'
        })
      });

      orchestrator.validators.set('compliance', {
        validate: jest.fn().mockResolvedValue({
          compliance_score: 80,
          gaps: ['Missing security headers']
        })
      });

      const result = await orchestrator.performComprehensiveScan(target, options);

      // Verify scan structure
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('status', 'completed');
      expect(result).toHaveProperty('results');
      expect(result.results).toHaveProperty('port_scan');
      expect(result.results).toHaveProperty('vulnerability_scan');
      expect(result.results).toHaveProperty('web_app_scan');
      expect(result.results).toHaveProperty('threat_analysis');
      expect(result.results).toHaveProperty('risk_assessment');
      expect(result.results).toHaveProperty('compliance_check');

      // Verify summary
      expect(result.summary).toHaveProperty('total_findings');
      expect(result.summary).toHaveProperty('risk_score');
      expect(result.summary.risk_score).toBeGreaterThan(0);
    });

    test('should handle selective scanning', async () => {
      const target = { ip: '192.168.1.100' }
      const options = { scanTypes: ['port', 'vulnerability'] }

      // Mock only required scanners
      orchestrator.scanners.set('port', {
        scan: jest.fn().mockResolvedValue({ open_ports: [22, 80] })
      });

      orchestrator.scanners.set('vulnerability', {
        scan: jest.fn().mockResolvedValue({ vulnerabilities: [] })
      });

      orchestrator.analyzers.set('threat', {
        analyze: jest.fn().mockResolvedValue({ threats: [] })
      });

      orchestrator.analyzers.set('risk', {
        assess: jest.fn().mockResolvedValue({ risk_score: 20 })
      });

      const result = await orchestrator.performComprehensiveScan(target, options);

      expect(result.results.port_scan).toBeDefined();
      expect(result.results.vulnerability_scan).toBeDefined();
      expect(result.results.network_scan).toBeNull();
      expect(result.results.web_app_scan).toBeNull();
    });

    test('should continue scanning when individual services fail', async () => {
      const target = { ip: '192.168.1.100' }

      // Mock services with one failure
      orchestrator.scanners.set('port', {
        scan: jest.fn().mockRejectedValue(new Error('Port scan failed'))
      });

      orchestrator.scanners.set('vulnerability', {
        scan: jest.fn().mockResolvedValue({ vulnerabilities: [] })
      });

      orchestrator.analyzers.set('threat', {
        analyze: jest.fn().mockResolvedValue({ threats: [] })
      });

      orchestrator.analyzers.set('risk', {
        assess: jest.fn().mockResolvedValue({ risk_score: 10 })
      });

      const result = await orchestrator.performComprehensiveScan(target);

      expect(result.status).toBe('completed');
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].phase).toBe('port_scanning');
      expect(result.results.vulnerability_scan).toBeDefined();
    });
  });

  describe('Scan Session Management', () => {
    test('should track scan progress', async () => {
      const target = { ip: '192.168.1.100' }

      // Mock slow scanner to test progress tracking
      orchestrator.scanners.set('port', {
        scan: jest.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({ open_ports: [] }), 100))
        )
      });

      orchestrator.analyzers.set('threat', {
        analyze: jest.fn().mockResolvedValue({ threats: [] })
      });

      orchestrator.analyzers.set('risk', {
        assess: jest.fn().mockResolvedValue({ risk_score: 0 })
      });

      // Start scan (don't await)
      const scanPromise = orchestrator.performComprehensiveScan(target);

      // Wait for scan to start
      await new Promise(resolve => setTimeout(resolve, 50));

      // Check active sessions
      const activeSessions = Array.from(orchestrator.activeScanSessions.keys());
      expect(activeSessions.length).toBe(1);

      const sessionId = activeSessions[0];
      const status = orchestrator.getScanStatus(sessionId);

      expect(status).toHaveProperty('id', sessionId);
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('progress');
      expect(status.progress).toBeGreaterThanOrEqual(0);

      // Wait for completion
      await scanPromise;

      // Check final status
      const finalStatus = orchestrator.getScanStatus(sessionId);
      expect(finalStatus.status).toBe('completed');
      expect(finalStatus.progress).toBe(100);
    });

    test('should handle scan cancellation', async () => {
      const target = { ip: '192.168.1.100' }

      // Mock long-running scanner
      orchestrator.scanners.set('port', {
        scan: jest.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({ open_ports: [] }), 5000))
        )
      });

      // Start scan
      const scanPromise = orchestrator.performComprehensiveScan(target);

      // Wait for scan to start
      await new Promise(resolve => setTimeout(resolve, 100));

      const activeSessions = Array.from(orchestrator.activeScanSessions.keys());
      const sessionId = activeSessions[0];

      // Cancel scan
      const cancelled = orchestrator.cancelScan(sessionId);
      expect(cancelled).toBe(true);

      // Verify cancellation
      const status = orchestrator.getScanStatus(sessionId);
      expect(status.status).toBe('cancelled');

      // Scan promise should still resolve/reject
      await expect(scanPromise).rejects.toThrow();
    });
  });

  describe('Target Type Detection', () => {
    test('should detect web targets correctly', () => {
      expect(orchestrator.isWebTarget({ url: 'https://example.com' })).toBe(true);
      expect(orchestrator.isWebTarget({ type: 'web' })).toBe(true);
      expect(orchestrator.isWebTarget({ port: 80 })).toBe(true);
      expect(orchestrator.isWebTarget({ port: 443 })).toBe(true);
      expect(orchestrator.isWebTarget({ ip: '192.168.1.1' })).toBe(false);
    });

    test('should determine scan types correctly', () => {
      expect(orchestrator.shouldRunScan('port', { scanTypes: 'all' })).toBe(true);
      expect(orchestrator.shouldRunScan('port', { scanTypes: ['port', 'vuln'] })).toBe(true);
      expect(orchestrator.shouldRunScan('port', { scanTypes: ['vuln'] })).toBe(false);
      expect(orchestrator.shouldRunScan('port', { scanTypes: 'port' })).toBe(true);
    });
  });

  describe('Results Consolidation', () => {
    test('should consolidate scan results correctly', () => {
      const results = {
        port_scan: {
          findings: [{ type: 'open_port', severity: 'low' }],
          services: [{ port: 80, service: 'http' }]
        },
        vulnerability_scan: {
          vulnerabilities: [{ type: 'outdated_software', severity: 'medium' }],
          findings: [{ type: 'vuln', severity: 'high' }]
        }
      }

      const consolidated = orchestrator.consolidateScanResults(results);

      expect(consolidated.findings).toHaveLength(2);
      expect(consolidated.vulnerabilities).toHaveLength(1);
      expect(consolidated.services).toHaveLength(1);
    });

    test('should generate scan summary correctly', () => {
      const results = {
        port_scan: {
          findings: [
            { severity: 'critical' },
            { severity: 'high' },
            { severity: 'medium' }
          ]
        },
        vulnerability_scan: {
          findings: [
            { severity: 'high' },
            { severity: 'low' }
          ]
        }
      }

      const summary = orchestrator.generateScanSummary(results);

      expect(summary.total_findings).toBe(5);
      expect(summary.critical_findings).toBe(1);
      expect(summary.high_findings).toBe(2);
      expect(summary.medium_findings).toBe(1);
      expect(summary.low_findings).toBe(1);
      expect(summary.risk_score).toBeGreaterThan(0);
    });
  });

  describe('Service Health Monitoring', () => {
    test('should report service health status', () => {
      const health = orchestrator.getServiceHealth();

      expect(health).toHaveProperty('status', 'healthy');
      expect(health).toHaveProperty('active_scans');
      expect(health).toHaveProperty('completed_scans');
      expect(health).toHaveProperty('scanners');
      expect(health).toHaveProperty('analyzers');
      expect(health).toHaveProperty('validators');
      expect(health.scanners).toHaveProperty('available');
      expect(health.scanners).toHaveProperty('count');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid targets gracefully', async () => {
      const target = { invalid: 'target' }

      await expect(
        orchestrator.performComprehensiveScan(target)
      ).rejects.toThrow();
    });

    test('should handle missing scan session gracefully', () => {
      expect(() => {
        orchestrator.getScanStatus('non-existent-id');
      }).toThrow('Scan session non-existent-id not found');
    });

    test('should handle incomplete scan results request', () => {
      // Create a mock active session
      const sessionId = 'test-session';
      orchestrator.activeScanSessions.set(sessionId, {
        id: sessionId,
        status: 'scanning',
        progress: 50
      });

      expect(() => {
        orchestrator.getScanResults(sessionId);
      }).toThrow('is not yet completed');
    });
  });

  describe('Filter Matching', () => {
    test('should match filters correctly', () => {
      const session = {
        status: 'completed',
        target: { url: 'https://example.com', ip: '192.168.1.1' }
      }

      expect(orchestrator.matchesFilters(session, {})).toBe(true);
      expect(orchestrator.matchesFilters(session, { status: 'completed' })).toBe(true);
      expect(orchestrator.matchesFilters(session, { status: 'failed' })).toBe(false);
      expect(orchestrator.matchesFilters(session, { target: 'example.com' })).toBe(true);
      expect(orchestrator.matchesFilters(session, { target: '192.168.1.1' })).toBe(true);
      expect(orchestrator.matchesFilters(session, { target: 'notfound' })).toBe(false);
    });
  });
});