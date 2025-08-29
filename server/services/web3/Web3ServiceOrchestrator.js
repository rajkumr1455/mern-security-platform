const logger = require('../../utils/logger');
const { ApiResponse, ErrorCodes } = require('../../utils/apiResponse');
const Web3ContractAnalyzer = require('./Web3ContractAnalyzer');
const Web3NetworkScanner = require('./Web3NetworkScanner');
const Web3VulnerabilityScanner = require('./Web3VulnerabilityScanner');
const Web3ReportGenerator = require('./Web3ReportGenerator');

/**
 * Web3 Service Orchestrator
 * Coordinates all Web3 security analysis services and provides unified interface
 */
class Web3ServiceOrchestrator {
  constructor() {
    this.contractAnalyzer = new Web3ContractAnalyzer();
    this.networkScanner = new Web3NetworkScanner();
    this.vulnerabilityScanner = new Web3VulnerabilityScanner();
    this.reportGenerator = new Web3ReportGenerator();
    
    this.analysisQueue = new Map();
    this.activeAnalyses = new Map();
    this.analysisHistory = new Map();
  }

  /**
   * Perform comprehensive Web3 security analysis
   * @param {Object} target - Target to analyze
   * @param {Object} options - Analysis options
   */
  async performComprehensiveAnalysis(target, options = {}) {
    const analysisId = this.generateAnalysisId();
    
    try {
      logger.info('Starting comprehensive Web3 analysis', { 
        analysisId, 
        target: target.address || target.url,
        options 
      });

      // Initialize analysis tracking
      const analysis = {
        id: analysisId,
        target,
        options,
        status: 'initializing',
        progress: 0,
        startTime: new Date(),
        results: {
          contract_analysis: null,
          network_scan: null,
          vulnerability_scan: null,
          report: null
        },
        errors: [],
        warnings: []
      }

      this.activeAnalyses.set(analysisId, analysis);

      // Phase 1: Network Scanning (25% progress)
      analysis.status = 'network_scanning';
      analysis.progress = 10;
      this.updateAnalysisProgress(analysisId, analysis);

      try {
        analysis.results.network_scan = await this.networkScanner.scanTarget(target, options);
        analysis.progress = 25;
        this.updateAnalysisProgress()
      } catch (error) {
        analysis.errors.push({ phase: 'network_scanning', error: error.message });
        analysis.warnings.push('Network scanning failed, continuing with available data');
      }

      // Phase 2: Contract Analysis (50% progress)
      if (this.shouldAnalyzeContract()) {
        analysis.status = 'contract_analysis';
        analysis.progress = 30;
        this.updateAnalysisProgress(analysisId, analysis);

        try {
          const contractCode = await this.extractContractCode();
          analysis.results.contract_analysis = await this.contractAnalyzer.analyzeContract(contractCode, options);
          analysis.progress = 50;
          this.updateAnalysisProgress()
        } catch (error) {
          analysis.errors.push({ phase: 'contract_analysis', error: error.message });
          analysis.warnings.push('Contract analysis failed, using network scan results only');
        }
      }

      // Phase 3: Vulnerability Scanning (75% progress)
      analysis.status = 'vulnerability_scanning';
      analysis.progress = 55;
      this.updateAnalysisProgress(analysisId, analysis);

      try {
        const scanTarget = this.prepareScanTarget();
        analysis.results.vulnerability_scan = await this.vulnerabilityScanner.performScan(scanTarget, options);
        analysis.progress = 75;
        this.updateAnalysisProgress()
      } catch (error) {
        analysis.errors.push({ phase: 'vulnerability_scanning', error: error.message });
        analysis.warnings.push('Vulnerability scanning encountered issues');
      }

      // Phase 4: Report Generation (100% progress)
      analysis.status = 'generating_report';
      analysis.progress = 80;
      this.updateAnalysisProgress(analysisId, analysis);

      try {
        const consolidatedResults = this.consolidateResults(analysis.results);
        analysis.results.report = await this.reportGenerator.generateReport(consolidatedResults, options);
        analysis.progress = 100;
        analysis.status = 'completed';
        analysis.endTime = new Date();
        this.updateAnalysisProgress()
      } catch (error) {
        analysis.errors.push({ phase: 'report_generation', error: error.message });
        analysis.status = 'completed_with_errors';
        analysis.progress = 100;
      }

      // Store in history and cleanup
      this.analysisHistory.set(analysisId, analysis);
      this.activeAnalyses.delete(analysisId);

      logger.info('Web3 analysis completed', {
        analysisId,
        status: analysis.status,
        duration: analysis.endTime - analysis.startTime,
        errors: analysis.errors.length
      });

      return this.formatAnalysisResponse()

    } catch (error) {
      logger.error('Web3 analysis failed', { analysisId, error: error.message });
      
      // Update analysis with error
      if (this.activeAnalyses.has(analysisId)) {
        const analysis = this.activeAnalyses.get(analysisId);
        analysis.status = 'failed';
        analysis.errors.push({ phase: 'orchestration', error: error.message });
        this.activeAnalyses.delete(analysisId);
        this.analysisHistory.set(analysisId, analysis);
      }

      throw new Error(`Web3 analysis failed: ${error.message}`);
    }
  }

  /**
   * Get analysis status and progress
   * @param {string} analysisId - Analysis ID
   */
  getAnalysisStatus(analysisId) {
    if (this.activeAnalyses.has(analysisId)) {
      const analysis = this.activeAnalyses.get(analysisId);
      return {
        id: analysisId,
        status: analysis.status,
        progress: analysis.progress,
        current_phase: analysis.status,
        estimated_completion: this.estimateCompletion(analysis),
        errors: analysis.errors,
        warnings: analysis.warnings
      }
    }

    if (this.analysisHistory.has(analysisId)) {
      const analysis = this.analysisHistory.get(analysisId);
      return {
        id: analysisId,
        status: analysis.status,
        progress: 100,
        completed_at: analysis.endTime,
        duration: analysis.endTime - analysis.startTime,
        errors: analysis.errors,
        warnings: analysis.warnings
      }
    }

    throw new Error(`Analysis ${analysisId} not found`);
  }

  /**
   * Get analysis results
   * @param {string} analysisId - Analysis ID
   */
  getAnalysisResults(analysisId) {
    const analysis = this.analysisHistory.get(analysisId) || this.activeAnalyses.get(analysisId);
    
    if (!analysis) {
      throw new Error(`Analysis ${analysisId} not found`);
    }

    if (analysis.status !== 'completed' && analysis.status !== 'completed_with_errors') {
      throw new Error(`Analysis ${analysisId} is not yet completed`);
    }

    return this.formatAnalysisResponse()
  }

  /**
   * Cancel running analysis
   * @param {string} analysisId - Analysis ID
   */
  cancelAnalysis(analysisId) {
    if (this.activeAnalyses.has(analysisId)) {
      const analysis = this.activeAnalyses.get(analysisId);
      analysis.status = 'cancelled';
      analysis.endTime = new Date();
      
      this.analysisHistory.set(analysisId, analysis);
      this.activeAnalyses.delete(analysisId);
      
      logger.info('Analysis cancelled', { analysisId });
      return true;
    }
    
    return false;
  }

  /**
   * List all analyses (active and historical)
   * @param {Object} filters - Filter options
   */
  listAnalyses(filters = {}) {
    const analyses = [];
    
    // Add active analyses
    for (const [id, analysis] of this.activeAnalyses) {
      if (this.matchesFilters(analysis, filters)) {
        analyses.push({
          id,
          target: analysis.target,
          status: analysis.status,
          progress: analysis.progress,
          startTime: analysis.startTime
        });
      }
    }
    
    // Add historical analyses
    for (const [id, analysis] of this.analysisHistory) {
      if (this.matchesFilters(analysis, filters)) {
        analyses.push({
          id,
          target: analysis.target,
          status: analysis.status,
          startTime: analysis.startTime,
          endTime: analysis.endTime,
          duration: analysis.endTime ? analysis.endTime - analysis.startTime : null
        });
      }
    }
    
    return analyses.sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * Get service health and statistics
   */
  getServiceHealth() {
    return {
      status: 'healthy',
      active_analyses: this.activeAnalyses.size,
      completed_analyses: this.analysisHistory.size,
      services: {
        contract_analyzer: this.contractAnalyzer ? 'healthy' : 'unavailable',
        network_scanner: this.networkScanner ? 'healthy' : 'unavailable',
        vulnerability_scanner: this.vulnerabilityScanner ? 'healthy' : 'unavailable',
        report_generator: this.reportGenerator ? 'healthy' : 'unavailable'
      },
      uptime: process.uptime(),
      memory_usage: process.memoryUsage()
    }
  }

  // Helper methods
  generateAnalysisId() {
    return `web3_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  updateAnalysisProgress(analysisId, analysis) {
    // Emit progress update event if WebSocket available
    if (global.io) {
      global.io.emit('analysis_progress', {
        analysisId,
        status: analysis.status,
        progress: analysis.progress
      });
    }
  }

  shouldAnalyzeContract(target, networkScanResults) {
    // Determine if contract analysis is needed
    return target.address || 
           target.source_code || 
           (networkScanResults && networkScanResults.contracts.length > 0);
  }

  async extractContractCode(target, networkScanResults) {
    if (target.source_code) {
      return target.source_code;
    }
    
    if (networkScanResults && networkScanResults.contracts.length > 0) {
      // Try to get source code from network scan results
      const contract = networkScanResults.contracts[0];
      return contract.source_code || contract.bytecode || '';
    }
    
    return '';
  }

  prepareScanTarget(target, results) {
    return {
      ...target,
      network_info: results.network_scan,
      contract_info: results.contract_analysis
    }
  }

  consolidateResults(results) {
    const consolidated = {
      target: results.network_scan?.target || 'Unknown',
      timestamp: new Date().toISOString(),
      vulnerabilities: [],
      contracts: [],
      network: null,
      tools_used: []
    }

    // Consolidate vulnerabilities
    if (results.contract_analysis?.vulnerabilities) {
      consolidated.vulnerabilities.push(...results.contract_analysis.vulnerabilities)
    }
    if (results.vulnerability_scan?.vulnerabilities) {
      consolidated.vulnerabilities.push(...results.vulnerability_scan.vulnerabilities)
    }

    // Consolidate contracts
    if (results.network_scan?.contracts) {
      consolidated.contracts.push(...results.network_scan.contracts)
    }

    // Network information
    if (results.network_scan?.network) {
      consolidated.network = results.network_scan.network
    }

    // Tools used
    if (results.contract_analysis?.tools_used) {
      consolidated.tools_used.push(...results.contract_analysis.tools_used)
    }
    if (results.vulnerability_scan?.tools_used) {
      consolidated.tools_used.push(...results.vulnerability_scan.tools_used)
    }

    return consolidated
  }

  formatAnalysisResponse(analysis) {
    return {
      id: analysis.id,
      target: analysis.target,
      status: analysis.status,
      progress: analysis.progress,
      startTime: analysis.startTime,
      endTime: analysis.endTime,
      duration: analysis.endTime ? analysis.endTime - analysis.startTime : null,
      results: analysis.results,
      errors: analysis.errors,
      warnings: analysis.warnings,
      summary: this.generateAnalysisSummary(analysis)
    }
  }

  generateAnalysisSummary(analysis) {
    const summary = {
      total_vulnerabilities: 0,
      critical_vulnerabilities: 0,
      contracts_analyzed: 0,
      tools_used: [],
      risk_score: 0
    }

    if (analysis.results.vulnerability_scan) {
      summary.total_vulnerabilities = analysis.results.vulnerability_scan.vulnerabilities?.length || 0;
      summary.critical_vulnerabilities = analysis.results.vulnerability_scan.vulnerabilities?.filter(v => v.severity === 'critical').length || 0;
    }

    if (analysis.results.network_scan) {
      summary.contracts_analyzed = analysis.results.network_scan.contracts?.length || 0;
    }

    // Collect all tools used
    Object.values(analysis.results).forEach(result => {
      if (result && result.tools_used) {
        summary.tools_used.push(...result.tools_used)
      }
    })
    summary.tools_used = [...new Set(summary.tools_used)]

    return summary
  }

  estimateCompletion(analysis) {
    const elapsed = Date.now() - analysis.startTime;
    const estimatedTotal = elapsed / (analysis.progress / 100);
    const remaining = estimatedTotal - elapsed;
    
    return new Date(Date.now() + remaining);
  }

  matchesFilters(analysis, filters) {
    if (filters.status && analysis.status !== filters.status) {
      return false;
    }
    if (filters.target && !analysis.target.address?.includes(filters.target) && !analysis.target.url?.includes(filters.target)) {
      return false;
    }
    return true;
  }
}

module.exports = Web3ServiceOrchestrator;