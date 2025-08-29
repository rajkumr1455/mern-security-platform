/**;
 * Comprehensive Reporting Service
 * Advanced reporting and analytics for Sudomy scans
 */;

const fs = require('fs').promises;
const logger = require('../utils/logger');
const path = require('path');

class ComprehensiveReportingService {
  constructor() {
    this.reportFormats = ['json', 'csv', 'html', 'pdf'];
    this.templates = {
      executive: 'executive_summary',
      technical: 'technical_detailed',
      trend: 'trend_analysis'
    }
  }

  /**;
   * Generate comprehensive report
   */;
  async generateReport(scanResults, reportType = 'comprehensive', format = 'json') {
    const report = {
      metadata: this.generateMetadata(scanResults, reportType),
      executive_summary: {},
      technical_details: {},
      findings: {},
      recommendations: {},
      appendices: {}
    }

    try {
      // Executive Summary
      report.executive_summary = await this.generateExecutiveSummary(scanResults);

      // Technical Details
      report.technical_details = await this.generateTechnicalDetails(scanResults);

      // Findings Analysis
      report.findings = await this.analyzeFindingsForReport(scanResults);

      // Recommendations
      report.recommendations = await this.generateRecommendations(scanResults);

      // Export in requested format
      return await this.exportReport()

    } catch (error) {
      logger.error('Report generation error:', error);
      throw error;
    }
  }

  generateMetadata(scanResults, reportType) {
    return {
      report_id: `report_${Date.now()}`,
      generated_at: new Date().toISOString(),
      report_type: reportType,
      scan_target: scanResults.target || scanResults.domain,
      scan_id: scanResults.scanId || scanResults.id,
      scan_duration: this.calculateScanDuration(scanResults),
      total_findings: this.countTotalFindings(scanResults),
      risk_level: this.calculateOverallRiskLevel(scanResults)
    }
  }

  async generateExecutiveSummary(scanResults) {
    return {
      overview: this.generateOverview(scanResults),
      key_metrics: this.generateKeyMetrics(scanResults),
      risk_assessment: this.generateRiskAssessment(scanResults),
      priority_actions: this.generatePriorityActions(scanResults),
      compliance_status: this.generateComplianceStatus(scanResults)
    }
  }

  generateOverview(scanResults) {
    const subdomainCount = this.getSubdomainCount(scanResults);
    const vulnerabilityCount = this.getVulnerabilityCount(scanResults);

    return {
      target: scanResults.target || scanResults.domain,
      scan_date: scanResults.timestamp || new Date().toISOString(),
      scope: `Comprehensive reconnaissance and security assessment`,
      key_findings: {
        subdomains_discovered: subdomainCount,
        vulnerabilities_found: vulnerabilityCount,
        security_score: this.calculateSecurityScore(scanResults)
      }
    }
  }

  generateKeyMetrics(scanResults) {
    return {
      asset_discovery: {
        total_subdomains: this.getSubdomainCount(scanResults),
        active_subdomains: this.getActiveSubdomainCount(scanResults),
        technologies_identified: this.getTechnologyCount(scanResults),
        open_ports: this.getOpenPortCount(scanResults)
      },
      security_metrics: {
        critical_vulnerabilities: this.getCriticalVulnCount(scanResults),
        high_vulnerabilities: this.getHighVulnCount(scanResults),
        medium_vulnerabilities: this.getMediumVulnCount(scanResults),
        low_vulnerabilities: this.getLowVulnCount(scanResults)
      },
      compliance_metrics: {
        ssl_tls_compliance: this.getSSLComplianceScore(scanResults),
        security_headers_score: this.getSecurityHeadersScore(scanResults),
        dns_security_score: this.getDNSSecurityScore(scanResults)
      }
    }
  }

  generateRiskAssessment(scanResults) {
    const riskFactors = this.analyzeRiskFactors(scanResults);

    return {
      overall_risk_level: this.calculateOverallRiskLevel(scanResults),
      risk_factors: riskFactors,
      business_impact: this.assessBusinessImpact(riskFactors),
      threat_landscape: this.analyzeThreatLandscape(scanResults),
      risk_matrix: this.generateRiskMatrix(riskFactors)
    }
  }

  analyzeRiskFactors(scanResults) {
    const factors = [];

    // DNS Security Risks
    if (scanResults.dns_analysis?.security?.vulnerabilities?.length > 0) {
      factors.push({
        category: 'DNS Security',
        risk_level: 'High',
        description: 'DNS vulnerabilities detected',
        impact: 'Domain hijacking, cache poisoning'
      });
    }

    // SSL/TLS Risks
    if (scanResults.http_analysis?.ssl_analysis?.vulnerabilities?.length > 0) {
      factors.push({
        category: 'SSL/TLS Security',
        risk_level: 'High',
        description: 'SSL/TLS vulnerabilities found',
        impact: 'Man-in-the-middle attacks, data interception'
      });
    }

    // Missing Security Headers
    const headerScore = scanResults.http_analysis?.security_headers?.security_score?.score || 0;
    if (headerScore < 70) {
      factors.push({
        category: 'Security Headers',
        risk_level: 'Medium',
        description: 'Missing critical security headers',
        impact: 'XSS, clickjacking, data leakage'
      });
    }

    return factors;
  }

  async generateTechnicalDetails(scanResults) {
    return {
      enumeration_details: this.generateEnumerationDetails(scanResults),
      dns_analysis: this.generateDNSAnalysisDetails(scanResults),
      http_analysis: this.generateHTTPAnalysisDetails(scanResults),
      vulnerability_details: this.generateVulnerabilityDetails(scanResults),
      technology_stack: this.generateTechnologyStack(scanResults)
    }
  }

  generateEnumerationDetails(scanResults) {
    if (!scanResults.enumeration_results) return {}

    const enumeration = scanResults.enumeration_results;
    return {
      techniques_used: enumeration.summary?.techniques_used || [],
      total_subdomains: enumeration.summary?.total_unique_subdomains || 0,
      source_breakdown: enumeration.summary?.source_breakdown || {},
      validation_results: enumeration.validation_results || {},
      methodology: {
        passive_enumeration: enumeration.techniques?.passive ? 'Enabled' : 'Disabled',
        active_enumeration: enumeration.techniques?.active ? 'Enabled' : 'Disabled',
        permutation_testing: enumeration.techniques?.permutation ? 'Enabled' : 'Disabled'
      }
    }
  }

  generateDNSAnalysisDetails(scanResults) {
    if (!scanResults.dns_analysis) return {}

    const dns = scanResults.dns_analysis;
    return {
      record_analysis: dns.records || {},
      security_assessment: dns.security || {},
      health_metrics: dns.health || {},
      wildcard_detection: dns.analysis?.wildcardDetection || {},
      response_analysis: dns.analysis?.responseAnalysis || {}
    }
  }

  generateHTTPAnalysisDetails(scanResults) {
    if (!scanResults.http_analysis) return {}

    const http = scanResults.http_analysis;
    return {
      basic_information: http.basic_info || {},
      security_headers: http.security_headers || {},
      ssl_tls_analysis: http.ssl_analysis || {},
      technology_detection: http.technology_detection || {},
      response_analysis: http.response_analysis || {},
      security_assessment: http.security_assessment || {}
    }
  }

  // Helper methods for metric calculations
  getSubdomainCount(scanResults) {
    return scanResults.enumeration_results?.all_subdomains?.length ||
           scanResults.findings?.subdomains?.total || 0;
  }

  getVulnerabilityCount(scanResults) {
    let count = 0;
    if (scanResults.dns_analysis?.security?.vulnerabilities) {
      count += scanResults.dns_analysis.security.vulnerabilities.length;
    }
    if (scanResults.http_analysis?.ssl_analysis?.vulnerabilities) {
      count += scanResults.http_analysis.ssl_analysis.vulnerabilities.length;
    }
    return count;
  }

  calculateSecurityScore(scanResults) {
    let totalScore = 100;
    let factors = 0;

    // DNS Security Score
    if (scanResults.dns_analysis?.security?.vulnerabilities?.length > 0) {
      totalScore -= 20;
      factors++;
    }

    // HTTP Security Score
    const headerScore = scanResults.http_analysis?.security_headers?.security_score?.score || 100;
    totalScore = (totalScore + headerScore) / 2;
    factors++;

    // SSL Security Score
    if (scanResults.http_analysis?.ssl_analysis?.vulnerabilities?.length > 0) {
      totalScore -= 15;
      factors++;
    }

    return Math.max(0, Math.round(totalScore));
  }

  calculateOverallRiskLevel(scanResults) {
    const score = this.calculateSecurityScore(scanResults);
    if (score >= 80) return 'Low';
    if (score >= 60) return 'Medium';
    if (score >= 40) return 'High';
    return 'Critical';
  }

  async exportReport(report, format) {
    switch (format.toLowerCase()) {
      case 'json':
        return this.exportJSON(report);
      case 'csv':
        return this.exportCSV(report);
      case 'html':
        return this.exportHTML(report);
      case 'pdf':
        return this.exportPDF(report);
      default:;
        return this.exportJSON()
    }
  }

  exportJSON(report) {
    return {
      format: 'json',
      data: report,
      download_filename: `sudomy_report_${Date.now()}.json`
    }
  }

  exportCSV(report) {
    // Create CSV from key findings
    const csvData = this.convertToCSV(report);
    return {
      format: 'csv',
      data: csvData,
      download_filename: `sudomy_report_${Date.now()}.csv`
    }
  }

  convertToCSV(report) {
    const headers = ['Metric', 'Value', 'Category'];
    const rows = [headers];

    // Add key metrics
    if (report.executive_summary?.key_metrics) {
      const metrics = report.executive_summary.key_metrics;
      Object.entries(metrics).forEach(([category, values]) => {
        Object.entries(values).forEach(([metric, value]) => {
          rows.push([metric.replace(/_/g, ' '), value, category]);
        });
      });
    }

    return rows.map(row => row.join(',')).join('\n');
  }

  exportHTML(report) {
    const html = this.generateHTMLReport(report);
    return {
      format: 'html',
      data: html,
      download_filename: `sudomy_report_${Date.now()}.html`
    }
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html>;
<head>;
    <title>Sudomy Security Assessment Report</title>
    <style>;
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #2196F3; color: white; padding: 20px; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #2196F3; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #f5f5f5; }
        .risk-high { color: #f44336; }
        .risk-medium { color: #ff9800; }
        .risk-low { color: #4caf50; }
    </style>;
</head>;
<body>;
    <div class='header'>
        <h1>Sudomy Security Assessment Report</h1>
        <p>Target: ${report.metadata?.scan_target || 'Unknown'}</p>
        <p>Generated: ${report.metadata?.generated_at || new Date().toISOString()}</p>
    </div>;

    <div class='section'>
        <h2>Executive Summary</h2>
        <p>Overall Risk Level: <span class='risk-${report.metadata?.risk_level?.toLowerCase()}'>${report.metadata?.risk_level || 'Unknown'}</span></p>
        <div class='metric'>Subdomains: ${report.executive_summary?.key_metrics?.asset_discovery?.total_subdomains || 0}</div>
        <div class='metric'>Vulnerabilities: ${report.executive_summary?.key_metrics?.security_metrics?.critical_vulnerabilities || 0}</div>
        <div class='metric'>Security Score: ${report.executive_summary?.overview?.key_findings?.security_score || 0}%</div>
    </div>;

    <div class='section'>
        <h2>Key Findings</h2>
        ${this.generateFindingsHTML(report.findings || {})}
    </div>;

    <div class='section'>
        <h2>Recommendations</h2>;
        ${this.generateRecommendationsHTML(report.recommendations || {})}
    </div>;
</body>;
</html>`;
  }

  generateFindingsHTML(findings) {
    if (!findings || Object.keys(findings).length === 0) {
      return '<p>No specific findings to report.</p>';
    }

    return Object.entries(findings)
      .map(([category, data]) => `<h3>${category}</h3><p>${JSON.stringify(data)}</p>`)
      .join('');
  }

  generateRecommendationsHTML(recommendations) {
    if (!recommendations || Object.keys(recommendations).length === 0) {
      return '<p>No specific recommendations available.</p>';
    }

    return Object.entries(recommendations)
      .map(([category, recs]) => `<h3>${category}</h3><ul>${Array.isArray(recs) ? recs.map(r => `<li>${r}</li>`).join('') : `<li>${recs}</li>`}</ul>`)
      .join('');
  }

  exportPDF(report) {
    // For now, return HTML that can be converted to PDF
    const html = this.generateHTMLReport(report);
    return {
      format: 'pdf',
      data: html,
      download_filename: `sudomy_report_${Date.now()}.pdf`,
      note: 'PDF generation requires additional processing'
    }
  }

  // Additional helper methods
  calculateScanDuration(scanResults) {
    if (scanResults.started_at && scanResults.completed_at) {
      const start = new Date(scanResults.started_at);
      const end = new Date(scanResults.completed_at);
      return Math.round((end - start) / 1000); // seconds
    }
    return 0;
  }

  countTotalFindings(scanResults) {
    let count = 0;
    count += this.getSubdomainCount(scanResults);
    count += this.getVulnerabilityCount(scanResults);
    return count;
  }

  getActiveSubdomainCount(scanResults) {
    return scanResults.enumeration_results?.validation_results?.valid_subdomains?.length || 0;
  }

  getTechnologyCount(scanResults) {
    const tech = scanResults.http_analysis?.technology_detection || {}
    return Object.values(tech).flat().length;
  }

  getOpenPortCount(scanResults) {
    return scanResults.findings?.ports?.total || 0;
  }

  getCriticalVulnCount(scanResults) {
    return this.getVulnCountBySeverity()
  }

  getHighVulnCount(scanResults) {
    return this.getVulnCountBySeverity()
  }

  getMediumVulnCount(scanResults) {
    return this.getVulnCountBySeverity()
  }

  getLowVulnCount(scanResults) {
    return this.getVulnCountBySeverity()
  }

  getVulnCountBySeverity(scanResults, severity) {
    let count = 0;

    // DNS vulnerabilities
    if (scanResults.dns_analysis?.security?.vulnerabilities) {
      count += scanResults.dns_analysis.security.vulnerabilities.filter(v => v.severity === severity).length;
    }

    // HTTP vulnerabilities
    if (scanResults.http_analysis?.ssl_analysis?.vulnerabilities) {
      count += scanResults.http_analysis.ssl_analysis.vulnerabilities.filter(v => v.severity === severity).length;
    }

    return count;
  }

  getSSLComplianceScore(scanResults) {
    const ssl = scanResults.http_analysis?.ssl_analysis;
    if (!ssl) return 0;

    let score = 100;
    if (ssl.vulnerabilities?.length > 0) score -= 30;
    if (ssl.protocols?.ssl3?.supported) score -= 20;
    if (ssl.protocols?.tls1?.supported) score -= 15;

    return Math.max(0, score);
  }

  getSecurityHeadersScore(scanResults) {
    return scanResults.http_analysis?.security_headers?.security_score?.score || 0;
  }

  getDNSSecurityScore(scanResults) {
    const dns = scanResults.dns_analysis?.security;
    if (!dns) return 0;

    let score = 100;
    if (dns.vulnerabilities?.length > 0) score -= 40;
    if (!dns.dnssec?.enabled) score -= 20;
    if (!dns.caa?.configured) score -= 10;

    return Math.max(0, score);
  }

  assessBusinessImpact(riskFactors) {
    const highRiskCount = riskFactors.filter(f => f.risk_level === 'High').length;

    if (highRiskCount >= 3) return 'Critical business impact - immediate action required';
    if (highRiskCount >= 1) return 'Significant business impact - action required within 30 days';
    return 'Low business impact - monitor and improve over time';
  }

  analyzeThreatLandscape(scanResults) {
    return {
      external_exposure: this.getActiveSubdomainCount(scanResults),
      attack_surface: this.getSubdomainCount(scanResults) + this.getOpenPortCount(scanResults),
      threat_level: this.calculateOverallRiskLevel(scanResults)
    }
  }

  generateRiskMatrix(riskFactors) {
    const matrix = {
      critical: riskFactors.filter(f => f.risk_level === 'Critical').length,
      high: riskFactors.filter(f => f.risk_level === 'High').length,
      medium: riskFactors.filter(f => f.risk_level === 'Medium').length,
      low: riskFactors.filter(f => f.risk_level === 'Low').length
    }

    return matrix;
  }

  generatePriorityActions(scanResults) {
    const actions = [];

    if (scanResults.dns_analysis?.security?.vulnerabilities?.length > 0) {
      actions.push({
        priority: 1,
        action: 'Fix DNS security vulnerabilities',
        timeline: 'Immediate',
        impact: 'High'
      });
    }

    if (scanResults.http_analysis?.ssl_analysis?.vulnerabilities?.length > 0) {
      actions.push({
        priority: 2,
        action: 'Update SSL/TLS configuration',
        timeline: '1-2 weeks',
        impact: 'High'
      });
    }

    const headerScore = this.getSecurityHeadersScore(scanResults);
    if (headerScore < 70) {
      actions.push({
        priority: 3,
        action: 'Implement missing security headers',
        timeline: '2-4 weeks',
        impact: 'Medium'
      });
    }

    return actions;
  }

  generateComplianceStatus(scanResults) {
    return {
      ssl_tls_compliance: this.getSSLComplianceScore(scanResults) > 80 ? 'Compliant' : 'Non-compliant',
      security_headers: this.getSecurityHeadersScore(scanResults) > 70 ? 'Compliant' : 'Non-compliant',
      dns_security: this.getDNSSecurityScore(scanResults) > 70 ? 'Compliant' : 'Non-compliant'
    }
  }

  async analyzeFindingsForReport(scanResults) {
    return {
      asset_discovery: {
        subdomains: scanResults.enumeration_results?.all_subdomains || [],
        active_services: scanResults.enumeration_results?.validation_results?.http_accessible || [],
        technologies: scanResults.http_analysis?.technology_detection || {}
      },
      security_findings: {
        dns_vulnerabilities: scanResults.dns_analysis?.security?.vulnerabilities || [],
        ssl_vulnerabilities: scanResults.http_analysis?.ssl_analysis?.vulnerabilities || [],
        missing_headers: this.analyzeMissingHeaders(scanResults.http_analysis?.security_headers)
      },
      configuration_issues: {
        dns_misconfigurations: this.analyzeDNSMisconfigurations(scanResults.dns_analysis),
        ssl_misconfigurations: this.analyzeSSLMisconfigurations(scanResults.http_analysis?.ssl_analysis)
      }
    }
  }

  analyzeMissingHeaders(securityHeaders) {
    if (!securityHeaders) return [];

    const missing = [];
    Object.entries(securityHeaders).forEach(([header, config]) => {
      if (header !== 'security_score' && !config.present) {
        missing.push({
          header: header.replace(/_/g, '-'),
          risk: config.analysis?.risk || 'Medium',
          recommendation: config.analysis?.recommendation || 'Implement this security header'
        });
      }
    });

    return missing;
  }

  analyzeDNSMisconfigurations(dnsAnalysis) {
    const issues = [];

    if (dnsAnalysis?.security?.dnssec && !dnsAnalysis.security.dnssec.enabled) {
      issues.push({
        issue: 'DNSSEC not enabled',
        risk: 'Medium',
        recommendation: 'Enable DNSSEC to prevent DNS spoofing'
      });
    }

    if (dnsAnalysis?.analysis?.wildcardDetection?.wildcard_detected) {
      issues.push({
        issue: 'Wildcard DNS detected',
        risk: 'Low',
        recommendation: 'Review wildcard DNS configuration for security implications'
      });
    }

    return issues;
  }

  analyzeSSLMisconfigurations(sslAnalysis) {
    const issues = [];

    if (sslAnalysis?.protocols?.ssl3?.supported) {
      issues.push({
        issue: 'SSLv3 protocol enabled',
        risk: 'High',
        recommendation: 'Disable SSLv3 protocol support'
      });
    }

    if (sslAnalysis?.ciphers?.analysis && !sslAnalysis.ciphers.analysis.perfect_forward_secrecy) {
      issues.push({
        issue: 'Perfect Forward Secrecy not enabled',
        risk: 'Medium',
        recommendation: 'Enable PFS cipher suites'
      });
    }

    return issues;
  }

  async generateRecommendations(scanResults) {
    return {
      immediate_actions: this.generateImmediateActions(scanResults),
      short_term_improvements: this.generateShortTermImprovements(scanResults),
      long_term_strategy: this.generateLongTermStrategy(scanResults),
      best_practices: this.generateBestPractices(scanResults)
    }
  }

  generateImmediateActions(scanResults) {
    const actions = [];

    // Critical vulnerabilities
    const criticalVulns = this.getCriticalVulnCount(scanResults);
    if (criticalVulns > 0) {
      actions.push('Address critical vulnerabilities immediately');
    }

    // DNS zone transfer
    if (scanResults.enumeration_results?.techniques?.active?.zone_transfer?.successful) {
      actions.push('Restrict DNS zone transfers to authorized servers only');
    }

    // SSL/TLS issues
    if (scanResults.http_analysis?.ssl_analysis?.protocols?.ssl3?.supported) {
      actions.push('Disable SSLv3 protocol support');
    }

    return actions;
  }

  generateShortTermImprovements(scanResults) {
    const improvements = [];

    // Security headers
    const headerScore = this.getSecurityHeadersScore(scanResults);
    if (headerScore < 70) {
      improvements.push('Implement missing security headers (HSTS, CSP, X-Frame-Options)');
    }

    // DNS security
    if (!scanResults.dns_analysis?.security?.dnssec?.enabled) {
      improvements.push('Enable DNSSEC for domain protection');
    }

    // Certificate improvements
    const cert = scanResults.http_analysis?.ssl_analysis?.certificate;
    if (cert?.days_until_expiry < 30) {
      improvements.push('Renew SSL certificate before expiration');
    }

    return improvements;
  }

  generateLongTermStrategy(scanResults) {
    return [
      'Implement continuous security monitoring',
      'Regular vulnerability assessments',
      'Security awareness training for development teams',
      'Establish incident response procedures',
      'Consider implementing a Web Application Firewall (WAF)'
    ]
  }

  generateBestPractices(scanResults) {
    return [
      'Regular security assessments and penetration testing',
      'Implement security headers across all web properties',
      'Use strong SSL/TLS configurations with modern cipher suites',
      'Enable DNSSEC and implement proper DNS security',
      'Monitor for new subdomains and unauthorized services',
      'Maintain an updated inventory of all digital assets',
      'Implement proper certificate management procedures'
    ]
  }
}

module.exports = ComprehensiveReportingService;