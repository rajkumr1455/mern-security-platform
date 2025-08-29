const ReportTemplateEngine = require('./ReportTemplateEngine');
const VisualizationEngine = require('./VisualizationEngine');
const ReportExportEngine = require('./ReportExportEngine');

class SecurityReportGenerator {
  constructor() {
    this.templateEngine = new ReportTemplateEngine();
    this.visualizationEngine = new VisualizationEngine();
    this.exportEngine = new ReportExportEngine();
  }

  async generateComprehensiveReport(scanResults, options = {}) {
    const {
      title = 'Security Assessment Report',
      includeVisualizations = true,
      format = 'html',
      target = 'Unknown Target'
    } = options;

    // Process scan results
    const processedData = this.processScanResults(scanResults);
    
    // Generate report data
    const reportData = {
      title,
      target,
      timestamp: new Date().toISOString(),
      summary: this.generateExecutiveSummary(processedData),
      ...processedData
    }

    // Generate visualizations if requested
    if (includeVisualizations) {
      reportData.visualizations = await this.generateVisualizations()
    }

    // Export in requested format
    return await this.exportEngine.exportReport(reportData, format, options);
  }

  processScanResults(scanResults) {
    const vulnerabilities = [];
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let infoCount = 0;

    // Process different types of scan results
    if (scanResults.web2Results) {
      vulnerabilities.push(...this.processWeb2Results(scanResults.web2Results))
    }

    if (scanResults.web3Results) {
      vulnerabilities.push(...this.processWeb3Results(scanResults.web3Results))
    }

    if (scanResults.reconResults) {
      vulnerabilities.push(...this.processReconResults(scanResults.reconResults))
    }

    // Count vulnerabilities by severity
    vulnerabilities.forEach(vuln => {
      switch (vuln.severity?.toLowerCase()) {
        case 'critical':
          criticalCount++
          break;
        case 'high':
          highCount++;
          break;
        case 'medium':
          mediumCount++;
          break;
        case 'low':
          lowCount++;
          break;
        default:
          infoCount++;
      }
    });

    return {
      vulnerabilities,
      totalVulnerabilities: vulnerabilities.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      infoCount,
      scanDuration: scanResults.duration || 'Unknown',
      reportId: `RPT_${Date.now()}`
    };
  }

  processWeb2Results(web2Results) {
    const vulnerabilities = [];
    
    if (web2Results.vulnerabilities) {
      web2Results.vulnerabilities.forEach(vuln => {
        vulnerabilities.push({
          title: vuln.title || vuln.name || 'Web2 Vulnerability',
          severity: vuln.severity || 'medium',
          description: vuln.description || 'Web application vulnerability detected',
          location: vuln.url || vuln.location,
          recommendation: vuln.recommendation || 'Review and remediate this vulnerability',
          category: 'Web Application',
          cve: vuln.cve,
          cvss: vuln.cvss
        });
      });
    }

    return vulnerabilities;
  }

  processWeb3Results(web3Results) {
    const vulnerabilities = [];
    
    if (web3Results.vulnerabilities) {
      web3Results.vulnerabilities.forEach(vuln => {
        vulnerabilities.push({
          title: vuln.title || vuln.name || 'Smart Contract Vulnerability',
          severity: vuln.severity || 'high',
          description: vuln.description || 'Smart contract security issue detected',
          location: vuln.contract || vuln.address,
          recommendation: vuln.recommendation || 'Review smart contract code and fix the vulnerability',
          category: 'Smart Contract',
          gasImpact: vuln.gasImpact,
          functionName: vuln.function
        });
      });
    }

    return vulnerabilities;
  }

  processReconResults(reconResults) {
    const vulnerabilities = [];
    
    if (reconResults.exposedServices) {
      reconResults.exposedServices.forEach(service => {
        vulnerabilities.push({
          title: `Exposed Service: ${service.name}`,
          severity: 'medium',
          description: `Service ${service.name} is exposed on port ${service.port}`,
          location: `${service.host}:${service.port}`,
          recommendation: 'Review if this service should be publicly accessible',
          category: 'Network Security'
        });
      });
    }

    if (reconResults.subdomains) {
      reconResults.subdomains.forEach(subdomain => {
        if (subdomain.vulnerable) {
          vulnerabilities.push({
            title: `Vulnerable Subdomain: ${subdomain.name}`,
            severity: 'low',
            description: 'Subdomain may be vulnerable to takeover',
            location: subdomain.name,
            recommendation: 'Verify subdomain configuration and DNS records',
            category: 'DNS Security'
          });
        }
      });
    }

    return vulnerabilities;
  }

  generateExecutiveSummary(data) {
    const { totalVulnerabilities, criticalCount, highCount, mediumCount } = data;
    
    if (totalVulnerabilities === 0) {
      return 'No security vulnerabilities were identified during this assessment. The target appears to have a strong security posture.';
    }

    let riskLevel = 'Low';
    if (criticalCount > 0) {
      riskLevel = 'Critical';
    } else if (highCount > 0) {
      riskLevel = 'High';
    } else if (mediumCount > 0) {
      riskLevel = 'Medium';
    }

    return `Security assessment identified ${totalVulnerabilities} vulnerabilities with an overall risk level of ${riskLevel}. ` +
           `Critical issues: ${criticalCount}, High severity: ${highCount}, Medium severity: ${mediumCount}. ` +
           `Immediate attention is recommended for critical and high severity vulnerabilities.`;
  }

  async generateVisualizations(data) {
    const visualizations = {};

    try {
      // Generate security score gauge
      const securityScore = this.calculateSecurityScore(data);
      visualizations.securityGauge = this.visualizationEngine.generateSecurityGauge({
        score: securityScore,
        title: 'Overall Security Score'
      });

      // Generate severity distribution chart
      visualizations.severityChart = this.visualizationEngine.generateSeverityChart(data.vulnerabilities);

      // Generate risk heatmap
      visualizations.riskHeatmap = this.visualizationEngine.generateHeatmap({
        values: [[data.criticalCount, data.highCount], [data.mediumCount, data.lowCount]],
        xLabels: ['Critical/High', 'Medium/Low'],
        yLabels: ['Severity', 'Count']
      });

    } catch (error) {
      console.warn('Failed to generate visualizations:', error.message);
    }

    return visualizations;
  }

  calculateSecurityScore(data) {
    const { totalVulnerabilities, criticalCount, highCount, mediumCount, lowCount } = data;
    
    if (totalVulnerabilities === 0) return 100;
    
    // Weighted scoring system
    const criticalWeight = 25;
    const highWeight = 15;
    const mediumWeight = 10;
    const lowWeight = 5;
    
    const totalDeduction = (criticalCount * criticalWeight) + 
                          (highCount * highWeight) + 
                          (mediumCount * mediumWeight) + 
                          (lowCount * lowWeight);
    
    const score = Math.max(0, 100 - totalDeduction);
    return Math.round(score);
  }

  async generateQuickReport(vulnerabilities, target = 'Unknown') {
    const processedData = {
      vulnerabilities: vulnerabilities || [],
      totalVulnerabilities: vulnerabilities?.length || 0,
      criticalCount: vulnerabilities?.filter(v => v.severity === 'critical').length || 0,
      highCount: vulnerabilities?.filter(v => v.severity === 'high').length || 0,
      mediumCount: vulnerabilities?.filter(v => v.severity === 'medium').length || 0,
      lowCount: vulnerabilities?.filter(v => v.severity === 'low').length || 0,
      infoCount: vulnerabilities?.filter(v => v.severity === 'info').length || 0
    };

    const reportData = {
      title: 'Quick Security Report',
      target,
      timestamp: new Date().toISOString(),
      summary: this.generateExecutiveSummary(processedData),
      ...processedData
    }

    return await this.exportEngine.exportReport(reportData, 'html');
  }
}

module.exports = SecurityReportGenerator;