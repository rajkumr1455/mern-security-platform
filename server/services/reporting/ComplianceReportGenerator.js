const SecurityReportGenerator = require('./SecurityReportGenerator');

class ComplianceReportGenerator extends SecurityReportGenerator {
  constructor() {
    super();
    this.complianceFrameworks = {
      'OWASP': {
        name: 'OWASP Top 10',
        categories: [
          'A01:2021 – Broken Access Control',
          'A02:2021 – Cryptographic Failures',
          'A03:2021 – Injection',
          'A04:2021 – Insecure Design',
          'A05:2021 – Security Misconfiguration',
          'A06:2021 – Vulnerable and Outdated Components',
          'A07:2021 – Identification and Authentication Failures',
          'A08:2021 – Software and Data Integrity Failures',
          'A09:2021 – Security Logging and Monitoring Failures',
          'A10:2021 – Server-Side Request Forgery'
        ]
      },
      'NIST': {
        name: 'NIST Cybersecurity Framework',
        categories: [
          'Identify (ID)',
          'Protect (PR)',
          'Detect (DE)',
          'Respond (RS)',
          'Recover (RC)'
        ]
      },
      'ISO27001': {
        name: 'ISO/IEC 27001',
        categories: [
          'Information Security Policies',
          'Organization of Information Security',
          'Human Resource Security',
          'Asset Management',
          'Access Control',
          'Cryptography',
          'Physical and Environmental Security',
          'Operations Security',
          'Communications Security',
          'System Acquisition, Development and Maintenance',
          'Supplier Relationships',
          'Information Security Incident Management',
          'Information Security Aspects of Business Continuity Management',
          'Compliance'
        ]
      }
    };
  }

  async generateComplianceReport(scanResults, framework = 'OWASP', options = {}) {
    const {
      title = `${framework} Compliance Report`,
      includeRecommendations = true,
      includeGaps = true
    } = options;

    // Process scan results
    const processedData = this.processScanResults(scanResults);
    
    // Map vulnerabilities to compliance framework
    const complianceMapping = this.mapToComplianceFramework(processedData.vulnerabilities, framework);
    
    // Generate compliance assessment
    const complianceAssessment = this.generateComplianceAssessment(complianceMapping, framework);
    
    // Generate report data
    const reportData = {
      title,
      framework,
      timestamp: new Date().toISOString(),
      summary: this.generateComplianceSummary(complianceAssessment),
      complianceScore: this.calculateComplianceScore(complianceAssessment),
      assessment: complianceAssessment,
      ...processedData
    }

    if (includeRecommendations) {
      reportData.recommendations = this.generateComplianceRecommendations()
    }

    if (includeGaps) {
      reportData.gaps = this.identifyComplianceGaps()
    }

    return await this.exportEngine.exportReport(reportData, 'html', {
      ...options,
      template: 'compliance_report'
    })
  }

  mapToComplianceFramework(vulnerabilities, framework) {
    const mapping = {};
    const frameworkData = this.complianceFrameworks[framework];
    
    if (!frameworkData) {
      throw new Error(`Unsupported compliance framework: ${framework}`);
    }

    // Initialize mapping
    frameworkData.categories.forEach(category => {
      mapping[category] = {
        vulnerabilities: [],
        riskLevel: 'Low',
        compliant: true
      };
    });

    // Map vulnerabilities to framework categories
    vulnerabilities.forEach(vuln => {
      const categories = this.categorizeVulnerability(vuln, framework);
      categories.forEach(category => {
        if (mapping[category]) {
          mapping[category].vulnerabilities.push(vuln);
          // Update risk level based on vulnerability severity
          if (vuln.severity === 'critical' || vuln.severity === 'high') {
            mapping[category].riskLevel = 'High';
            mapping[category].compliant = false;
          } else if (vuln.severity === 'medium' && mapping[category].riskLevel === 'Low') {
            mapping[category].riskLevel = 'Medium';
            mapping[category].compliant = false;
          }
        }
      });
    });

    return mapping;
  }

  categorizeVulnerability(vulnerability, framework) {
    const categories = [];
    const title = vulnerability.title?.toLowerCase() || '';
    const description = vulnerability.description?.toLowerCase() || '';
    
    switch (framework) {
      case 'OWASP':
        if (title.includes('access') || title.includes('authorization') || title.includes('privilege')) {
          categories.push('A01:2021 – Broken Access Control');
        }
        if (title.includes('crypto') || title.includes('encryption') || title.includes('ssl') || title.includes('tls')) {
          categories.push('A02:2021 – Cryptographic Failures');
        }
        if (title.includes('injection') || title.includes('sql') || title.includes('xss') || title.includes('script')) {
          categories.push('A03:2021 – Injection');
        }
        if (title.includes('config') || title.includes('misconfiguration') || title.includes('default')) {
          categories.push('A05:2021 – Security Misconfiguration');
        }
        if (title.includes('component') || title.includes('library') || title.includes('dependency')) {
          categories.push('A06:2021 – Vulnerable and Outdated Components');
        }
        if (title.includes('authentication') || title.includes('session') || title.includes('login')) {
          categories.push('A07:2021 – Identification and Authentication Failures');
        }
        if (title.includes('logging') || title.includes('monitoring') || title.includes('audit')) {
          categories.push('A09:2021 – Security Logging and Monitoring Failures');
        }
        if (title.includes('ssrf') || title.includes('request forgery')) {
          categories.push('A10:2021 – Server-Side Request Forgery');
        }
        break;
        
      case 'NIST':
        if (vulnerability.category === 'Network Security' || title.includes('network')) {
          categories.push('Identify (ID)');
        }
        if (title.includes('access') || title.includes('encryption')) {
          categories.push('Protect (PR)');
        }
        if (title.includes('monitoring') || title.includes('detection')) {
          categories.push('Detect (DE)');
        }
        break;
        
      case 'ISO27001':
        if (title.includes('access') || title.includes('authorization')) {
          categories.push('Access Control');
        }
        if (title.includes('crypto') || title.includes('encryption')) {
          categories.push('Cryptography');
        }
        if (title.includes('config') || title.includes('operation')) {
          categories.push('Operations Security');
        }
        break;
    }
    
    // Default category if no specific match
    if (categories.length === 0) {
      categories.push(this.complianceFrameworks[framework].categories[0]);
    }
    
    return categories;
  }

  generateComplianceAssessment(mapping, framework) {
    const assessment = {
      framework,
      totalCategories: Object.keys(mapping).length,
      compliantCategories: 0,
      nonCompliantCategories: 0,
      categories: {}
    };

    Object.entries(mapping).forEach(([category, data]) => {
      assessment.categories[category] = {
        compliant: data.compliant,
        riskLevel: data.riskLevel,
        vulnerabilityCount: data.vulnerabilities.length,
        vulnerabilities: data.vulnerabilities
      };

      if (data.compliant) {
        assessment.compliantCategories++;
      } else {
        assessment.nonCompliantCategories++;
      }
    });

    return assessment;
  }

  calculateComplianceScore(assessment) {
    const totalCategories = assessment.totalCategories;
    const compliantCategories = assessment.compliantCategories;
    
    if (totalCategories === 0) return 100;
    
    return Math.round((compliantCategories / totalCategories) * 100);
  }

  generateComplianceSummary(assessment) {
    const { framework, totalCategories, compliantCategories, nonCompliantCategories } = assessment;
    const compliancePercentage = this.calculateComplianceScore(assessment);
    
    return `Compliance assessment against ${framework} framework shows ${compliancePercentage}% compliance. ` +
           `${compliantCategories} out of ${totalCategories} categories are compliant. ` +
           `${nonCompliantCategories} categories require attention to achieve full compliance.`;
  }

  generateComplianceRecommendations(assessment) {
    const recommendations = [];
    
    Object.entries(assessment.categories).forEach(([category, data]) => {
      if (!data.compliant) {
        recommendations.push({
          category,
          priority: data.riskLevel,
          recommendation: `Address ${data.vulnerabilityCount} vulnerabilities in ${category} to improve compliance`,
          actions: this.getRecommendedActions(category, data.vulnerabilities)
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    });
  }

  getRecommendedActions(category, vulnerabilities) {
    const actions = [];
    
    vulnerabilities.forEach(vuln => {
      if (vuln.recommendation) {
        actions.push(vuln.recommendation);
      }
    });

    // Add generic actions based on category
    if (category.includes('Access Control')) {
      actions.push('Implement proper access controls and authorization mechanisms');
      actions.push('Review and update user permissions regularly');
    }
    
    if (category.includes('Cryptographic')) {
      actions.push('Implement strong encryption for data at rest and in transit');
      actions.push('Use up-to-date cryptographic algorithms');
    }
    
    if (category.includes('Configuration')) {
      actions.push('Review and harden system configurations');
      actions.push('Remove default credentials and unnecessary services');
    }

    return [...new Set(actions)] // Remove duplicates
  }

  identifyComplianceGaps(assessment) {
    const gaps = []
    
    Object.entries(assessment.categories).forEach(([category, data]) => {
      if (!data.compliant) {
        gaps.push({
          category,
          riskLevel: data.riskLevel,
          description: `Non-compliance in ${category} due to ${data.vulnerabilityCount} security issues`,
          impact: this.assessGapImpact(data.riskLevel),
          effort: this.estimateRemediationEffort(data.vulnerabilities)
        });
      }
    });

    return gaps;
  }

  assessGapImpact(riskLevel) {
    switch (riskLevel) {
      case 'High': return 'Significant compliance risk, immediate attention required';
      case 'Medium': return 'Moderate compliance risk, should be addressed in next cycle';
      case 'Low': return 'Minor compliance risk, can be addressed in routine maintenance';
      default: return 'Unknown impact';
    }
  }

  estimateRemediationEffort(vulnerabilities) {
    const totalVulns = vulnerabilities.length;
    const criticalHigh = vulnerabilities.filter(v => ['critical', 'high'].includes(v.severity)).length;
    
    if (criticalHigh > 5) return 'High effort required';
    if (totalVulns > 10) return 'Medium effort required';
    return 'Low effort required';
  }
}

module.exports = ComplianceReportGenerator;