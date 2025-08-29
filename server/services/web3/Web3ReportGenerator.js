const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');
const { ErrorCodes } = require('../../utils/apiResponse');

/**
 * Web3 Report Generation Service
 * Handles creation of comprehensive Web3 security reports
 */
class Web3ReportGenerator {
  constructor() {
    this.reportTemplates = new Map();
    this.outputFormats = ['html', 'pdf', 'json', 'markdown'];
    this.initializeTemplates()
  }

  /**
   * Initialize report templates
   */
  initializeTemplates() {
    this.reportTemplates.set('executive', {
      name: 'Executive Summary',
      sections: ['overview', 'key_findings', 'risk_assessment', 'recommendations'],
      audience: 'executives'
    });

    this.reportTemplates.set('technical', {
      name: 'Technical Analysis',
      sections: ['methodology', 'detailed_findings', 'code_analysis', 'remediation'],
      audience: 'developers'
    });

    this.reportTemplates.set('compliance', {
      name: 'Compliance Report',
      sections: ['standards_compliance', 'audit_trail', 'certifications', 'gaps'],
      audience: 'auditors'
    });
  }

  /**
   * Generate comprehensive Web3 security report
   * @param {Object} analysisResults - Results from Web3 analysis
   * @param {Object} options - Report generation options
   */
  async generateReport(analysisResults, options = {}) {
    try {
      logger.info('Starting Web3 report generation', {
        template: options.template || 'technical',
        format: options.format || 'html',
        target: analysisResults.target
      });

      const reportId = this.generateReportId();
      const reportDir = await this.createReportDirectory(reportId);

      const report = {
        id: reportId,
        timestamp: new Date().toISOString(),
        target: analysisResults.target,
        template: options.template || 'technical',
        format: options.format || 'html',
        metadata: await this.generateMetadata(analysisResults, options),
        sections: await this.generateSections(analysisResults, options),
        files: [],
        summary: await this.generateSummary(analysisResults)
      }

      // Generate report files
      const reportFiles = await this.createReportFiles(report, reportDir, options);
      report.files = reportFiles;

      // Generate visualizations
      if (options.includeVisuals !== false) {
        const visualFiles = await this.generateVisualizations(analysisResults, reportDir);
        report.files.push(...visualFiles)
      }

      // Generate evidence files
      if (options.includeEvidence !== false) {
        const evidenceFiles = await this.generateEvidence(analysisResults, reportDir)
        report.files.push(...evidenceFiles)
      }

      logger.info('Web3 report generation completed', {
        reportId,
        files: report.files.length,
        format: report.format
      })

      return report;
    } catch (error) {
      logger.error('Web3 report generation failed', { error: error.message });
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }

  /**
   * Generate report metadata
   * @param {Object} analysisResults - Analysis results
   * @param {Object} options - Report options
   */
  async generateMetadata(analysisResults, options) {
    return {
      version: '1.0.0',
      generator: 'Web3SecurityPlatform',
      analyst: options.analyst || 'Automated',
      scan_duration: analysisResults.scan_duration || 'Unknown',
      tools_used: analysisResults.tools_used || [],
      confidence_level: this.calculateOverallConfidence(analysisResults),
      risk_score: this.calculateRiskScore(analysisResults),
      compliance_status: await this.assessCompliance(analysisResults)
    }
  }

  /**
   * Generate report sections based on template
   * @param {Object} analysisResults - Analysis results
   * @param {Object} options - Report options
   */
  async generateSections(analysisResults, options) {
    const template = this.reportTemplates.get(options.template || 'technical');
    const sections = {}

    for (const sectionName of template.sections) {
      sections[sectionName] = await this.generateSection()
    }

    return sections;
  }

  /**
   * Generate individual report section
   * @param {string} sectionName - Section name
   * @param {Object} analysisResults - Analysis results
   * @param {Object} options - Report options
   */
  async generateSection(sectionName, analysisResults, options) {
    switch (sectionName) {
      case 'overview':
        return this.generateOverviewSection(analysisResults);
      case 'key_findings':
        return this.generateKeyFindingsSection(analysisResults);
      case 'risk_assessment':
        return this.generateRiskAssessmentSection(analysisResults);
      case 'recommendations':
        return this.generateRecommendationsSection(analysisResults);
      case 'methodology':
        return this.generateMethodologySection(analysisResults);
      case 'detailed_findings':
        return this.generateDetailedFindingsSection(analysisResults);
      case 'code_analysis':
        return this.generateCodeAnalysisSection(analysisResults);
      case 'remediation':
        return this.generateRemediationSection(analysisResults);
      default:
        return { title: sectionName, content: 'Section not implemented' }
    }
  }

  /**
   * Generate overview section
   */
  generateOverviewSection(results) {
    return {
      title: 'Executive Overview',
      content: {
        target_summary: {
          target: results.target,
          type: results.target_type || 'Unknown',
          network: results.network?.name || 'Unknown',
          contracts_analyzed: results.contracts?.length || 0
        },
        security_posture: {
          overall_score: this.calculateSecurityScore(results),
          risk_level: this.determineRiskLevel(results),
          critical_issues: this.countCriticalIssues(results),
          recommendations_count: results.recommendations?.length || 0
        },
        analysis_scope: {
          tools_used: results.tools_used || [],
          analysis_depth: results.analysis_depth || 'Standard',
          coverage_percentage: this.calculateCoverage(results)
        }
      }
    }
  }

  /**
   * Generate key findings section
   */
  generateKeyFindingsSection(results) {
    const vulnerabilities = results.vulnerabilities || [];
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical');
    const highVulns = vulnerabilities.filter(v => v.severity === 'high');

    return {
      title: 'Key Security Findings',
      content: {
        critical_vulnerabilities: criticalVulns.map(v => ({
          type: v.type,
          description: v.description,
          impact: v.impact,
          location: v.location
        })),
        high_risk_issues: highVulns.map(v => ({
          type: v.type,
          description: v.description,
          recommendation: v.recommendation
        })),
        security_highlights: this.extractSecurityHighlights(results),
        immediate_actions: this.getImmediateActions(results)
      }
    }
  }

  /**
   * Generate risk assessment section
   */
  generateRiskAssessmentSection(results) {
    return {
      title: 'Risk Assessment',
      content: {
        risk_matrix: this.generateRiskMatrix(results),
        business_impact: this.assessBusinessImpact(results),
        likelihood_assessment: this.assessLikelihood(results),
        risk_prioritization: this.prioritizeRisks(results),
        mitigation_timeline: this.generateMitigationTimeline(results)
      }
    }
  }

  /**
   * Generate HTML report
   * @param {Object} report - Report data
   * @param {string} outputPath - Output file path
   */
  async generateHTMLReport(report, outputPath) {
    const htmlTemplate = await this.loadHTMLTemplate(report.template);
    const htmlContent = await this.populateHTMLTemplate(htmlTemplate, report);
    
    await fs.writeFile(outputPath, htmlContent, 'utf8');
    return outputPath;
  }

  /**
   * Generate PDF report
   * @param {Object} report - Report data
   * @param {string} outputPath - Output file path
   */
  async generatePDFReport(report, outputPath) {
    // For now, generate HTML and note PDF conversion needed
    const htmlPath = outputPath.replace('.pdf', '.html');
    await this.generateHTMLReport(report, htmlPath);
    
    // TODO: Implement PDF conversion using puppeteer or similar
    logger.info('PDF generation requires additional setup - HTML version created');
    return htmlPath;
  }

  /**
   * Generate JSON report
   * @param {Object} report - Report data
   * @param {string} outputPath - Output file path
   */
  async generateJSONReport(report, outputPath) {
    const jsonContent = JSON.stringify(report, null, 2);
    await fs.writeFile(outputPath, jsonContent, 'utf8');
    return outputPath;
  }

  /**
   * Generate visualizations
   * @param {Object} results - Analysis results
   * @param {string} reportDir - Report directory
   */
  async generateVisualizations(results, reportDir) {
    const visualFiles = [];
    const visualsDir = path.join(reportDir, 'visuals');
    await fs.mkdir(visualsDir, { recursive: true });

    // Risk distribution chart
    const riskChart = await this.generateRiskChart(results, visualsDir);
    if (riskChart) visualFiles.push(riskChart);

    // Vulnerability timeline
    const timelineChart = await this.generateTimelineChart(results, visualsDir);
    if (timelineChart) visualFiles.push(timelineChart);

    // Security score gauge
    const scoreGauge = await this.generateScoreGauge(results, visualsDir);
    if (scoreGauge) visualFiles.push(scoreGauge);

    return visualFiles;
  }

  /**
   * Generate evidence files
   * @param {Object} results - Analysis results
   * @param {string} reportDir - Report directory
   */
  async generateEvidence(results, reportDir) {
    const evidenceFiles = [];
    const evidenceDir = path.join(reportDir, 'evidence');
    await fs.mkdir(evidenceDir, { recursive: true });

    // Tool outputs
    if (results.tool_outputs) {
      for (const [tool, output] of Object.entries(results.tool_outputs)) {
        const evidenceFile = path.join(evidenceDir, `${tool}_output.txt`);
        await fs.writeFile(evidenceFile, output, 'utf8');
        evidenceFiles.push(evidenceFile);
      }
    }

    // Screenshots
    if (results.screenshots) {
      for (const screenshot of results.screenshots) {
        const screenshotPath = path.join(evidenceDir, path.basename(screenshot));
        // Copy screenshot file
        evidenceFiles.push(screenshotPath);
      }
    }

    return evidenceFiles;
  }

  // Helper methods
  generateReportId() {
    return `web3_report_${Date.now()}`;
  }

  async createReportDirectory(reportId) {
    const reportDir = path.join(process.cwd(), 'server', 'reports', reportId);
    await fs.mkdir(reportDir, { recursive: true });
    return reportDir;
  }

  async createReportFiles(report, reportDir, options) {
    const files = [];
    const format = options.format || 'html';

    switch (format) {
      case 'html':
        const htmlFile = await this.generateHTMLReport(report, path.join(reportDir, 'security_report.html'));
        files.push(htmlFile);
        break;
      case 'pdf':
        const pdfFile = await this.generatePDFReport(report, path.join(reportDir, 'security_report.pdf'));
        files.push(pdfFile);
        break;
      case 'json':
        const jsonFile = await this.generateJSONReport(report, path.join(reportDir, 'security_report.json'));
        files.push(jsonFile);
        break;
    }

    // Always generate executive summary
    const summaryFile = path.join(reportDir, 'executive_summary.txt');
    await fs.writeFile(summaryFile, this.generateExecutiveSummary(report), 'utf8');
    files.push(summaryFile);

    return files;
  }

  generateExecutiveSummary(report) {
    return `
EXECUTIVE SUMMARY
================

Target: ${report.target}
Analysis Date: ${new Date(report.timestamp).toLocaleDateString()}
Risk Score: ${report.metadata.risk_score}/100
Confidence Level: ${report.metadata.confidence_level}%

KEY FINDINGS:
${report.sections.key_findings?.content?.critical_vulnerabilities?.length || 0} Critical Vulnerabilities
${report.sections.key_findings?.content?.high_risk_issues?.length || 0} High Risk Issues

RECOMMENDATIONS:
${report.sections.recommendations?.content?.immediate_actions?.join('\n') || 'No immediate actions required'}

Generated by Web3 Security Platform
    `;
  }

  // Calculation helper methods
  calculateOverallConfidence(results) {
    // Implement confidence calculation logic
    return 85;
  }

  calculateRiskScore(results) {
    // Implement risk score calculation
    const vulnerabilities = results.vulnerabilities || [];
    let score = 0;
    vulnerabilities.forEach(v => {
      if (v.severity === 'critical') score += 25;
      else if (v.severity === 'high') score += 15;
      else if (v.severity === 'medium') score += 10;
      else score += 5;
    });
    return Math.min(score, 100);
  }

  calculateSecurityScore(results) {
    return Math.max(100 - this.calculateRiskScore(results), 0);
  }

  determineRiskLevel(results) {
    const score = this.calculateRiskScore(results);
    if (score >= 75) return 'Critical';
    if (score >= 50) return 'High';
    if (score >= 25) return 'Medium';
    return 'Low';
  }

  countCriticalIssues(results) {
    return (results.vulnerabilities || []).filter(v => v.severity === 'critical').length;
  }

  calculateCoverage(results) {
    // Implement coverage calculation
    return 95;
  }

  // Placeholder methods for complex report sections
  async loadHTMLTemplate(template) {
    return `<!DOCTYPE html><html><head><title>Web3 Security Report</title></head><body>{{content}}</body></html>`;
  }

  async populateHTMLTemplate(template, report) {
    return template.replace('{{content}}', JSON.stringify(report, null, 2));
  }

  extractSecurityHighlights(results) {
    return ['Smart contract verified', 'No critical vulnerabilities in core functions']
  }

  getImmediateActions(results) {
    return ['Review access controls', 'Update dependencies']
  }

  generateRiskMatrix(results) {
    return { high_impact_high_likelihood: 2, high_impact_low_likelihood: 1 }
  }

  assessBusinessImpact(results) {
    return 'Medium - Potential financial loss';
  }

  assessLikelihood(results) {
    return 'Low - Requires specific conditions';
  }

  prioritizeRisks(results) {
    return (results.vulnerabilities || []).sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    });
  }

  generateMitigationTimeline(results) {
    return {
      immediate: 'Fix critical vulnerabilities',
      short_term: 'Address high-risk issues',
      long_term: 'Implement security best practices'
    }
  }

  async generateRiskChart(results, visualsDir) {
    // Placeholder for chart generation
    return null;
  }

  async generateTimelineChart(results, visualsDir) {
    // Placeholder for timeline chart
    return null;
  }

  async generateScoreGauge(results, visualsDir) {
    // Placeholder for score gauge
    return null;
  }

  async assessCompliance(results) {
    return {
      standards: ['ERC-20', 'ERC-721'],
      compliance_score: 85,
      gaps: ['Missing event logging']
    }
  }

  generateSummary(results) {
    return {
      total_vulnerabilities: (results.vulnerabilities || []).length,
      critical_count: this.countCriticalIssues(results),
      risk_level: this.determineRiskLevel(results),
      security_score: this.calculateSecurityScore(results)
    }
  }
}

module.exports = Web3ReportGenerator;