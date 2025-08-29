const logger = require('../../utils/logger');
const { ApiResponse, ErrorCodes } = require('../../utils/apiResponse');

/**
 * Security Service Orchestrator
 * Coordinates all security scanning services and provides unified interface
 * Modularized from IntegratedSecurityService.js (453 lines)
 */
class SecurityServiceOrchestrator {
  constructor() {
    this.scanners = new Map();
    this.analyzers = new Map();
    this.validators = new Map();
    this.activeScanSessions = new Map();
    this.scanHistory = new Map();
    
    this.initializeServices()
  }

  /**
   * Initialize security services
   */
  async initializeServices() {
    try {
      // Initialize specialized scanners
      const PortScanner = require('./PortScanner');
      const VulnerabilityScanner = require('./VulnerabilityScanner');
      const WebApplicationScanner = require('./WebApplicationScanner');
      const NetworkScanner = require('./NetworkScanner');
      
      // Initialize analyzers
      const ThreatAnalyzer = require('./ThreatAnalyzer');
      const RiskAssessmentEngine = require('./RiskAssessmentEngine');
      const ComplianceValidator = require('./ComplianceValidator');

      // Register scanners
      this.scanners.set('port', new PortScanner());
      this.scanners.set('vulnerability', new VulnerabilityScanner());
      this.scanners.set('web_application', new WebApplicationScanner());
      this.scanners.set('network', new NetworkScanner());

      // Register analyzers
      this.analyzers.set('threat', new ThreatAnalyzer());
      this.analyzers.set('risk', new RiskAssessmentEngine());
      
      // Register validators
      this.validators.set('compliance', new ComplianceValidator());

      logger.info('Security services initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize security services', { error: error.message });
      // Continue with available services
    }
  }

  /**
   * Perform comprehensive security scan
   * @param {Object} target - Target to scan
   * @param {Object} options - Scan options
   */
  async performComprehensiveScan(target, options = {}) {
    const sessionId = this.generateSessionId();
    
    try {
      logger.info('Starting comprehensive security scan', { 
        sessionId, 
        target: target.url || target.ip,
        scanTypes: options.scanTypes || 'all'
      });

      const session = {
        id: sessionId,
        target,
        options,
        status: 'initializing',
        progress: 0,
        startTime: new Date(),
        results: {
          port_scan: null,
          vulnerability_scan: null,
          web_app_scan: null,
          network_scan: null,
          threat_analysis: null,
          risk_assessment: null,
          compliance_check: null
        },
        summary: {},
        errors: [],
        warnings: []
      }

      this.activeScanSessions.set(sessionId, session);

      // Phase 1: Network Discovery (20% progress)
      if (this.shouldRunScan('network', options)) {
        session.status = 'network_discovery';
        session.progress = 5;
        this.updateScanProgress(sessionId, session);

        try {
          session.results.network_scan = await this.scanners.get('network').scan(target, options);
          session.progress = 20;
        } catch (error) {
          session.errors.push({ phase: 'network_discovery', error: error.message });
        }
      }

      // Phase 2: Port Scanning (40% progress)
      if (this.shouldRunScan('port', options)) {
        session.status = 'port_scanning';
        session.progress = 25;
        this.updateScanProgress(sessionId, session);

        try {
          session.results.port_scan = await this.scanners.get('port').scan(target, options);
          session.progress = 40;
        } catch (error) {
          session.errors.push({ phase: 'port_scanning', error: error.message });
        }
      }

      // Phase 3: Vulnerability Scanning (60% progress)
      if (this.shouldRunScan('vulnerability', options)) {
        session.status = 'vulnerability_scanning';
        session.progress = 45;
        this.updateScanProgress(sessionId, session);

        try {
          const vulnTarget = this.prepareVulnerabilityTarget();
          session.results.vulnerability_scan = await this.scanners.get('vulnerability').scan(vulnTarget, options);
          session.progress = 60;
        } catch (error) {
          session.errors.push({ phase: 'vulnerability_scanning', error: error.message });
        }
      }

      // Phase 4: Web Application Scanning (75% progress)
      if (this.shouldRunScan('web_application', options) && this.isWebTarget()) {
        session.status = 'web_app_scanning';
        session.progress = 65;
        this.updateScanProgress(sessionId, session);

        try {
          session.results.web_app_scan = await this.scanners.get('web_application').scan(target, options);
          session.progress = 75;
        } catch (error) {
          session.errors.push({ phase: 'web_app_scanning', error: error.message });
        }
      }

      // Phase 5: Threat Analysis (85% progress)
      session.status = 'threat_analysis';
      session.progress = 80;
      this.updateScanProgress(sessionId, session);

      try {
        const consolidatedResults = this.consolidateScanResults(session.results);
        session.results.threat_analysis = await this.analyzers.get('threat').analyze(consolidatedResults, options);
        session.progress = 85;
      } catch (error) {
        session.errors.push({ phase: 'threat_analysis', error: error.message });
      }

      // Phase 6: Risk Assessment (95% progress)
      session.status = 'risk_assessment';
      session.progress = 90;
      this.updateScanProgress(sessionId, session);

      try {
        session.results.risk_assessment = await this.analyzers.get('risk').assess(session.results, options);
        session.progress = 95;
      } catch (error) {
        session.errors.push({ phase: 'risk_assessment', error: error.message });
      }

      // Phase 7: Compliance Validation (100% progress)
      if (options.checkCompliance) {
        session.status = 'compliance_validation';
        this.updateScanProgress(sessionId, session);

        try {
          session.results.compliance_check = await this.validators.get('compliance').validate(session.results, options);
        } catch (error) {
          session.errors.push({ phase: 'compliance_validation', error: error.message });
        }
      }

      // Finalization
      session.status = 'completed';
      session.progress = 100;
      session.endTime = new Date();
      session.summary = this.generateScanSummary(session.results);

      // Move to history
      this.scanHistory.set(sessionId, session);
      this.activeScanSessions.delete(sessionId);

      logger.info('Security scan completed', {
        sessionId,
        duration: session.endTime - session.startTime,
        errors: session.errors.length,
        findings: session.summary.total_findings
      });

      return this.formatScanResponse()

    } catch (error) {
      logger.error('Security scan failed', { sessionId, error: error.message });
      
      if (this.activeScanSessions.has(sessionId)) {
        const session = this.activeScanSessions.get(sessionId);
        session.status = 'failed';
        session.error = error.message;
        this.scanHistory.set(sessionId, session);
        this.activeScanSessions.delete(sessionId);
      }

      throw new Error(`Security scan failed: ${error.message}`);
    }
  }

  /**
   * Get scan session status
   * @param {string} sessionId - Session ID
   */
  getScanStatus(sessionId) {
    const session = this.activeScanSessions.get(sessionId) || this.scanHistory.get(sessionId);
    
    if (!session) {
      throw new Error(`Scan session ${sessionId} not found`);
    }

    return {
      id: sessionId,
      status: session.status,
      progress: session.progress,
      startTime: session.startTime,
      endTime: session.endTime,
      current_phase: session.status,
      errors: session.errors,
      warnings: session.warnings
    }
  }

  /**
   * Get scan results
   * @param {string} sessionId - Session ID
   */
  getScanResults(sessionId) {
    const session = this.scanHistory.get(sessionId) || this.activeScanSessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Scan session ${sessionId} not found`);
    }

    if (session.status !== 'completed' && session.status !== 'failed') {
      throw new Error(`Scan session ${sessionId} is not yet completed`);
    }

    return this.formatScanResponse()
  }

  /**
   * Cancel active scan session
   * @param {string} sessionId - Session ID
   */
  cancelScan(sessionId) {
    if (this.activeScanSessions.has(sessionId)) {
      const session = this.activeScanSessions.get(sessionId);
      session.status = 'cancelled';
      session.endTime = new Date();
      
      this.scanHistory.set(sessionId, session);
      this.activeScanSessions.delete(sessionId);
      
      logger.info('Scan cancelled', { sessionId });
      return true;
    }
    
    return false;
  }

  /**
   * List scan sessions
   * @param {Object} filters - Filter options
   */
  listScans(filters = {}) {
    const scans = [];
    
    // Add active scans
    for (const [id, session] of this.activeScanSessions) {
      if (this.matchesFilters(session, filters)) {
        scans.push({
          id,
          target: session.target,
          status: session.status,
          progress: session.progress,
          startTime: session.startTime
        });
      }
    }
    
    // Add historical scans
    for (const [id, session] of this.scanHistory) {
      if (this.matchesFilters(session, filters)) {
        scans.push({
          id,
          target: session.target,
          status: session.status,
          startTime: session.startTime,
          endTime: session.endTime,
          summary: session.summary
        });
      }
    }
    
    return scans.sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * Get service health
   */
  getServiceHealth() {
    return {
      status: 'healthy',
      active_scans: this.activeScanSessions.size,
      completed_scans: this.scanHistory.size,
      scanners: {
        available: Array.from(this.scanners.keys()),
        count: this.scanners.size
      },
      analyzers: {
        available: Array.from(this.analyzers.keys()),
        count: this.analyzers.size
      },
      validators: {
        available: Array.from(this.validators.keys()),
        count: this.validators.size
      },
      uptime: process.uptime()
    }
  }

  // Helper methods
  generateSessionId() {
    return `security_scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  updateScanProgress(sessionId, session) {
    // Emit progress update if WebSocket available
    if (global.io) {
      global.io.emit('scan_progress', {
        sessionId,
        status: session.status,
        progress: session.progress
      });
    }
  }

  shouldRunScan(scanType, options) {
    if (options.scanTypes === 'all') return true;
    if (Array.isArray(options.scanTypes)) {
      return options.scanTypes.includes(scanType);
    }
    return options.scanTypes === scanType;
  }

  isWebTarget(target) {
    return target.url || target.type === 'web' || target.port === 80 || target.port === 443;
  }

  prepareVulnerabilityTarget(target, scanResults) {
    return {
      ...target,
      open_ports: scanResults.port_scan?.open_ports || [],
      services: scanResults.network_scan?.services || []
    }
  }

  consolidateScanResults(results) {
    const consolidated = {
      findings: [],
      services: [],
      vulnerabilities: [],
      risks: []
    }

    // Consolidate findings from all scans
    Object.values(results).forEach(result => {
      if (result && result.findings) {
        consolidated.findings.push(...result.findings)
      }
      if (result && result.vulnerabilities) {
        consolidated.vulnerabilities.push(...result.vulnerabilities)
      }
      if (result && result.services) {
        consolidated.services.push(...result.services)
      }
    })

    return consolidated;
  }

  generateScanSummary(results) {
    const summary = {
      total_findings: 0,
      critical_findings: 0,
      high_findings: 0,
      medium_findings: 0,
      low_findings: 0,
      services_discovered: 0,
      vulnerabilities_found: 0,
      risk_score: 0
    }

    // Count findings by severity
    Object.values(results).forEach(result => {
      if (result && result.findings) {
        result.findings.forEach(finding => {
          summary.total_findings++;
          switch (finding.severity) {
            case 'critical': summary.critical_findings++; break;
            case 'high': summary.high_findings++; break;
            case 'medium': summary.medium_findings++; break;
            case 'low': summary.low_findings++; break;
          }
        });
      }
    });

    // Calculate risk score
    summary.risk_score = Math.min(
      (summary.critical_findings * 25) + 
      (summary.high_findings * 15) + 
      (summary.medium_findings * 10) + 
      (summary.low_findings * 5), 
      100
    );

    return summary;
  }

  formatScanResponse(session) {
    return {
      id: session.id,
      target: session.target,
      status: session.status,
      progress: session.progress,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.endTime ? session.endTime - session.startTime : null,
      results: session.results,
      summary: session.summary,
      errors: session.errors,
      warnings: session.warnings
    }
  }

  matchesFilters(session, filters) {
    if (filters.status && session.status !== filters.status) {
      return false;
    }
    if (filters.target && !session.target.url?.includes(filters.target) && !session.target.ip?.includes(filters.target)) {
      return false;
    }
    return true;
  }
}

module.exports = SecurityServiceOrchestrator;