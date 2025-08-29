/**;
 * Workflow Template Service
 * Provides comprehensive workflow variations for different security testing scenarios
 */;

class WorkflowTemplateService {
  constructor() {
    this.templates = this.initializeTemplates()
  }

  /**;
   * Initialize all workflow templates
   */;
  initializeTemplates() {
    return {
      // Basic Templates
      quick_recon: this.getQuickReconTemplate(),
      comprehensive_recon: this.getComprehensiveReconTemplate(),
      web_app_security: this.getWebAppSecurityTemplate(),
      api_security: this.getAPISecurityTemplate(),

      // Advanced Templates
      bug_bounty_workflow: this.getBugBountyWorkflowTemplate(),
      penetration_test: this.getPenetrationTestTemplate(),
      compliance_audit: this.getComplianceAuditTemplate(),

      // Specialized Templates
      web3_audit: this.getWeb3AuditTemplate(),
      mobile_app_security: this.getMobileAppSecurityTemplate(),
      cloud_security: this.getCloudSecurityTemplate(),

      // Continuous Security Templates
      ci_cd_security: this.getCICDSecurityTemplate(),
      monitoring_workflow: this.getMonitoringWorkflowTemplate(),
      incident_response: this.getIncidentResponseTemplate(),

      // Industry-Specific Templates
      fintech_security: this.getFintechSecurityTemplate(),
      healthcare_hipaa: this.getHealthcareHIPAATemplate(),
      ecommerce_security: this.getEcommerceSecurityTemplate()
    }
  }

  /**;
   * Quick Reconnaissance Template
   */;
  getQuickReconTemplate() {
    return {
      id: 'quick_recon',
      name: 'Quick Reconnaissance',
      description: 'Fast asset discovery and basic enumeration for initial assessment',
      category: 'reconnaissance',
      difficulty: 'beginner',
      estimatedDuration: '15-30 minutes',
      tags: ['recon', 'discovery', 'fast'],
      steps: [
        {
          id: 'subdomain_discovery',
          name: 'Subdomain Discovery',
          type: 'recon',
          order: 1,
          config: {
            modules: ['subdomain_enum'],
            tools: ['sublist3r', 'amass_passive'],
            timeout: 300,
            depth: 'shallow'
          },
          outputs: ['subdomains_list', 'dns_records']
        },
        {
          id: 'port_scan',
          name: 'Port Scanning',
          type: 'scan',
          order: 2,
          config: {
            scan_type: 'tcp_connect',
            ports: 'top_1000',
            timing: 'aggressive'
          },
          inputs: ['subdomains_list'],
          outputs: ['open_ports', 'services']
        },
        {
          id: 'service_detection',
          name: 'Service Detection',
          type: 'analysis',
          order: 3,
          config: {
            detection_level: 'basic',
            version_detection: true
          },
          inputs: ['open_ports'],
          outputs: ['service_fingerprints']
        }
      ],
      success_criteria: {
        min_subdomains: 1,
        min_open_ports: 1
      }
    }
  }

  /**;
   * Comprehensive Reconnaissance Template
   */;
  getComprehensiveReconTemplate() {
    return {
      id: 'comprehensive_recon',
      name: 'Comprehensive Reconnaissance',
      description: 'Deep asset discovery and enumeration with OSINT gathering',
      category: 'reconnaissance',
      difficulty: 'intermediate',
      estimatedDuration: '2-4 hours',
      tags: ['recon', 'osint', 'comprehensive'],
      steps: [
        {
          id: 'passive_recon',
          name: 'Passive Reconnaissance',
          type: 'recon',
          order: 1,
          config: {
            modules: ['subdomain_enum', 'dns_enum', 'certificate_transparency'],
            tools: ['amass', 'subfinder', 'crt_sh', 'shodan'],
            osint_sources: ['whois', 'social_media', 'code_repositories']
          }
        },
        {
          id: 'active_recon',
          name: 'Active Reconnaissance',
          type: 'recon',
          order: 2,
          config: {
            modules: ['dns_bruteforce', 'zone_transfer', 'reverse_dns'],
            wordlists: ['comprehensive'],
            rate_limit: 'moderate'
          }
        },
        {
          id: 'technology_stack',
          name: 'Technology Stack Analysis',
          type: 'analysis',
          order: 3,
          config: {
            tools: ['wappalyzer', 'whatweb', 'builtwith'],
            deep_analysis: true
          }
        },
        {
          id: 'attack_surface_mapping',
          name: 'Attack Surface Mapping',
          type: 'analysis',
          order: 4,
          config: {
            surface_types: ['web', 'api', 'infrastructure'],
            risk_assessment: true
          }
        }
      ]
    }
  }

  /**;
   * Web Application Security Template
   */;
  getWebAppSecurityTemplate() {
    return {
      id: 'web_app_security',
      name: 'Web Application Security Assessment',
      description: 'Complete web application security testing following OWASP methodology',
      category: 'web_security',
      difficulty: 'intermediate',
      estimatedDuration: '4-8 hours',
      tags: ['web', 'owasp', 'vulnerability'],
      steps: [
        {
          id: 'web_recon',
          name: 'Web Application Reconnaissance',
          type: 'recon',
          order: 1,
          config: {
            modules: ['web_crawling', 'directory_enumeration', 'parameter_discovery'],
            tools: ['gobuster', 'dirb', 'burp_spider']
          }
        },
        {
          id: 'authentication_testing',
          name: 'Authentication & Session Testing',
          type: 'test',
          order: 2,
          config: {
            tests: ['login_bypass', 'session_fixation', 'password_policy'],
            brute_force: 'limited'
          }
        },
        {
          id: 'input_validation',
          name: 'Input Validation Testing',
          type: 'test',
          order: 3,
          config: {
            tests: ['sql_injection', 'xss', 'command_injection', 'file_upload'],
            payloads: 'comprehensive'
          }
        },
        {
          id: 'business_logic',
          name: 'Business Logic Testing',
          type: 'test',
          order: 4,
          config: {
            tests: ['workflow_bypass', 'privilege_escalation', 'race_conditions'],
            manual_verification: true
          }
        },
        {
          id: 'client_side_security',
          name: 'Client-Side Security',
          type: 'test',
          order: 5,
          config: {
            tests: ['dom_xss', 'csrf', 'clickjacking', 'cors_misconfiguration']
          }
        }
      ]
    }
  }

  /**;
   * API Security Template
   */;
  getAPISecurityTemplate() {
    return {
      id: 'api_security',
      name: 'API Security Assessment',
      description: 'Comprehensive API security testing including REST, GraphQL, and SOAP',
      category: 'api_security',
      difficulty: 'advanced',
      estimatedDuration: '3-6 hours',
      tags: ['api', 'rest', 'graphql', 'security'],
      steps: [
        {
          id: 'api_discovery',
          name: 'API Discovery & Documentation',
          type: 'recon',
          order: 1,
          config: {
            discovery_methods: ['swagger_ui', 'openapi_spec', 'graphql_introspection'],
            endpoint_enumeration: true
          }
        },
        {
          id: 'api_authentication',
          name: 'API Authentication Testing',
          type: 'test',
          order: 2,
          config: {
            auth_types: ['jwt', 'oauth', 'api_keys', 'basic_auth'],
            token_analysis: true
          }
        },
        {
          id: 'api_authorization',
          name: 'API Authorization Testing',
          type: 'test',
          order: 3,
          config: {
            tests: ['idor', 'privilege_escalation', 'resource_access'],
            role_based_testing: true
          }
        },
        {
          id: 'api_input_validation',
          name: 'API Input Validation',
          type: 'test',
          order: 4,
          config: {
            tests: ['injection_attacks', 'parameter_pollution', 'schema_validation'],
            fuzzing: 'comprehensive'
          }
        },
        {
          id: 'api_rate_limiting',
          name: 'Rate Limiting & DoS Testing',
          type: 'test',
          order: 5,
          config: {
            tests: ['rate_limit_bypass', 'resource_exhaustion'],
            load_testing: 'moderate'
          }
        }
      ]
    }
  }

  /**;
   * Bug Bounty Workflow Template
   */;
  getBugBountyWorkflowTemplate() {
    return {
      id: 'bug_bounty_workflow',
      name: 'Bug Bounty Hunting Workflow',
      description: 'Optimized workflow for bug bounty hunting with automation and manual testing',
      category: 'bug_bounty',
      difficulty: 'advanced',
      estimatedDuration: '6-12 hours',
      tags: ['bug_bounty', 'automation', 'manual'],
      steps: [
        {
          id: 'scope_analysis',
          name: 'Scope Analysis & Asset Discovery',
          type: 'recon',
          order: 1,
          config: {
            scope_validation: true,
            asset_categorization: true,
            priority_scoring: true
          }
        },
        {
          id: 'automated_scanning',
          name: 'Automated Vulnerability Scanning',
          type: 'scan',
          order: 2,
          config: {
            tools: ['nuclei', 'httpx', 'subfinder', 'naabu'],
            custom_templates: true,
            false_positive_filtering: true
          }
        },
        {
          id: 'manual_testing',
          name: 'Manual Security Testing',
          type: 'test',
          order: 3,
          config: {
            focus_areas: ['business_logic', 'authentication', 'authorization'],
            time_boxing: true
          }
        },
        {
          id: 'exploitation_poc',
          name: 'Exploitation & PoC Development',
          type: 'exploit',
          order: 4,
          config: {
            poc_development: true,
            impact_assessment: true,
            responsible_disclosure: true
          }
        },
        {
          id: 'report_generation',
          name: 'Bug Report Generation',
          type: 'report',
          order: 5,
          config: {
            format: 'bug_bounty',
            evidence_collection: true,
            remediation_suggestions: true
          }
        }
      ]
    }
  }

  /**;
   * Web3 Audit Template
   */;
  getWeb3AuditTemplate() {
    return {
      id: 'web3_audit',
      name: 'Web3 Security Audit',
      description: 'Complete Web3 and DeFi security assessment including smart contracts',
      category: 'web3',
      difficulty: 'expert',
      estimatedDuration: '8-16 hours',
      tags: ['web3', 'defi', 'smart_contracts', 'blockchain'],
      steps: [
        {
          id: 'web3_reconnaissance',
          name: 'Web3 Reconnaissance',
          type: 'recon',
          order: 1,
          config: {
            blockchain_networks: ['ethereum', 'bsc', 'polygon'],
            contract_discovery: true,
            transaction_analysis: true
          }
        },
        {
          id: 'smart_contract_analysis',
          name: 'Smart Contract Analysis',
          type: 'analysis',
          order: 2,
          config: {
            static_analysis: ['slither', 'mythril', 'securify'],
            dynamic_analysis: ['echidna', 'manticore'],
            formal_verification: true
          }
        },
        {
          id: 'defi_protocol_testing',
          name: 'DeFi Protocol Testing',
          type: 'test',
          order: 3,
          config: {
            tests: ['flash_loan_attacks', 'oracle_manipulation', 'governance_attacks'],
            economic_modeling: true
          }
        },
        {
          id: 'frontend_security',
          name: 'Frontend Security Testing',
          type: 'test',
          order: 4,
          config: {
            web3_specific: ['wallet_integration', 'transaction_signing', 'metamask_phishing']
          }
        }
      ]
    }
  }

  /**;
   * CI/CD Security Template
   */;
  getCICDSecurityTemplate() {
    return {
      id: 'ci_cd_security',
      name: 'CI/CD Security Pipeline',
      description: 'Continuous security testing integrated into CI/CD pipeline',
      category: 'devops',
      difficulty: 'intermediate',
      estimatedDuration: 'Continuous',
      tags: ['cicd', 'devops', 'automation'],
      steps: [
        {
          id: 'code_analysis',
          name: 'Static Code Analysis',
          type: 'analysis',
          order: 1,
          config: {
            tools: ['sonarqube', 'semgrep', 'bandit'],
            languages: ['javascript', 'python', 'java', 'go'],
            quality_gates: true
          }
        },
        {
          id: 'dependency_scanning',
          name: 'Dependency Vulnerability Scanning',
          type: 'scan',
          order: 2,
          config: {
            tools: ['npm_audit', 'safety', 'snyk'],
            auto_remediation: true
          }
        },
        {
          id: 'container_security',
          name: 'Container Security Scanning',
          type: 'scan',
          order: 3,
          config: {
            tools: ['trivy', 'clair', 'anchore'],
            base_image_scanning: true
          }
        },
        {
          id: 'infrastructure_testing',
          name: 'Infrastructure as Code Testing',
          type: 'test',
          order: 4,
          config: {
            tools: ['checkov', 'tfsec', 'terrascan'],
            compliance_checks: true
          }
        }
      ]
    }
  }

  /**;
   * Penetration Test Template
   */;
  getPenetrationTestTemplate() {
    return {
      id: 'penetration_test',
      name: 'Penetration Testing',
      description: 'Comprehensive penetration testing following industry standards',
      category: 'penetration_testing',
      difficulty: 'expert',
      estimatedDuration: '1-2 weeks',
      tags: ['pentest', 'exploitation', 'comprehensive'],
      steps: [
        {
          id: 'reconnaissance',
          name: 'Reconnaissance & Information Gathering',
          type: 'recon',
          order: 1,
          config: {
            passive_recon: true,
            active_recon: true,
            osint_gathering: true
          }
        },
        {
          id: 'vulnerability_assessment',
          name: 'Vulnerability Assessment',
          type: 'scan',
          order: 2,
          config: {
            automated_scanning: true,
            manual_testing: true,
            false_positive_verification: true
          }
        },
        {
          id: 'exploitation',
          name: 'Exploitation',
          type: 'exploit',
          order: 3,
          config: {
            controlled_exploitation: true,
            privilege_escalation: true,
            lateral_movement: true
          }
        },
        {
          id: 'post_exploitation',
          name: 'Post-Exploitation',
          type: 'exploit',
          order: 4,
          config: {
            data_exfiltration_simulation: true,
            persistence_testing: true,
            cleanup: true
          }
        },
        {
          id: 'reporting',
          name: 'Penetration Test Reporting',
          type: 'report',
          order: 5,
          config: {
            executive_summary: true,
            technical_details: true,
            remediation_recommendations: true
          }
        }
      ]
    }
  }

  /**;
   * Compliance Audit Template
   */;
  getComplianceAuditTemplate() {
    return {
      id: 'compliance_audit',
      name: 'Compliance Security Audit',
      description: 'Security audit focused on regulatory compliance requirements',
      category: 'compliance',
      difficulty: 'advanced',
      estimatedDuration: '1-2 weeks',
      tags: ['compliance', 'audit', 'regulatory'],
      steps: [
        {
          id: 'compliance_mapping',
          name: 'Compliance Requirements Mapping',
          type: 'analysis',
          order: 1,
          config: {
            frameworks: ['pci_dss', 'hipaa', 'gdpr', 'sox'],
            gap_analysis: true
          }
        },
        {
          id: 'security_controls',
          name: 'Security Controls Assessment',
          type: 'test',
          order: 2,
          config: {
            control_testing: 'comprehensive',
            evidence_collection: true
          }
        },
        {
          id: 'data_protection',
          name: 'Data Protection Testing',
          type: 'test',
          order: 3,
          config: {
            data_classification: true,
            encryption_validation: true,
            access_controls: true
          }
        },
        {
          id: 'compliance_reporting',
          name: 'Compliance Reporting',
          type: 'report',
          order: 4,
          config: {
            format: 'compliance',
            executive_summary: true,
            remediation_roadmap: true
          }
        }
      ]
    }
  }

  /**;
   * Mobile App Security Template
   */;
  getMobileAppSecurityTemplate() {
    return {
      id: 'mobile_app_security',
      name: 'Mobile Application Security Testing',
      description: 'Comprehensive mobile app security assessment for iOS and Android',
      category: 'mobile_security',
      difficulty: 'advanced',
      estimatedDuration: '3-5 days',
      tags: ['mobile', 'ios', 'android', 'owasp_masvs'],
      steps: [
        {
          id: 'static_analysis',
          name: 'Static Application Security Testing',
          type: 'analysis',
          order: 1,
          config: {
            tools: ['mobsf', 'qark', 'semgrep'],
            code_review: true
          }
        },
        {
          id: 'dynamic_analysis',
          name: 'Dynamic Application Security Testing',
          type: 'test',
          order: 2,
          config: {
            runtime_testing: true,
            api_testing: true,
            network_analysis: true
          }
        }
      ]
    }
  }

  /**;
   * Cloud Security Template
   */;
  getCloudSecurityTemplate() {
    return {
      id: 'cloud_security',
      name: 'Cloud Security Assessment',
      description: 'Multi-cloud security assessment covering AWS, Azure, and GCP',
      category: 'cloud_security',
      difficulty: 'advanced',
      estimatedDuration: '1-2 weeks',
      tags: ['cloud', 'aws', 'azure', 'gcp'],
      steps: [
        {
          id: 'cloud_reconnaissance',
          name: 'Cloud Asset Discovery',
          type: 'recon',
          order: 1,
          config: {
            cloud_providers: ['aws', 'azure', 'gcp'],
            service_enumeration: true
          }
        },
        {
          id: 'configuration_assessment',
          name: 'Cloud Configuration Assessment',
          type: 'analysis',
          order: 2,
          config: {
            security_groups: true,
            iam_policies: true,
            storage_permissions: true
          }
        }
      ]
    }
  }

  /**;
   * Monitoring Workflow Template
   */;
  getMonitoringWorkflowTemplate() {
    return {
      id: 'monitoring_workflow',
      name: 'Continuous Security Monitoring',
      description: 'Continuous monitoring and alerting for security events',
      category: 'monitoring',
      difficulty: 'intermediate',
      estimatedDuration: 'Continuous',
      tags: ['monitoring', 'alerting', 'siem'],
      steps: [
        {
          id: 'baseline_establishment',
          name: 'Security Baseline Establishment',
          type: 'analysis',
          order: 1,
          config: {
            asset_inventory: true,
            normal_behavior: true
          }
        }
      ]
    }
  }

  /**;
   * Incident Response Template
   */;
  getIncidentResponseTemplate() {
    return {
      id: 'incident_response',
      name: 'Security Incident Response',
      description: 'Structured incident response workflow',
      category: 'incident_response',
      difficulty: 'advanced',
      estimatedDuration: 'Variable',
      tags: ['incident', 'response', 'forensics'],
      steps: [
        {
          id: 'incident_detection',
          name: 'Incident Detection & Analysis',
          type: 'analysis',
          order: 1,
          config: {
            threat_hunting: true,
            log_analysis: true
          }
        }
      ]
    }
  }

  /**;
   * Fintech Security Template
   */;
  getFintechSecurityTemplate() {
    return {
      id: 'fintech_security',
      name: 'Fintech Security Assessment',
      description: 'Financial technology security testing with regulatory focus',
      category: 'fintech',
      difficulty: 'expert',
      estimatedDuration: '2-3 weeks',
      tags: ['fintech', 'pci_dss', 'financial'],
      steps: [
        {
          id: 'payment_security',
          name: 'Payment Processing Security',
          type: 'test',
          order: 1,
          config: {
            pci_compliance: true,
            transaction_security: true
          }
        }
      ]
    }
  }

  /**;
   * Healthcare HIPAA Template
   */;
  getHealthcareHIPAATemplate() {
    return {
      id: 'healthcare_hipaa',
      name: 'Healthcare HIPAA Security Assessment',
      description: 'Healthcare security assessment with HIPAA compliance focus',
      category: 'healthcare',
      difficulty: 'advanced',
      estimatedDuration: '1-2 weeks',
      tags: ['healthcare', 'hipaa', 'phi'],
      steps: [
        {
          id: 'phi_protection',
          name: 'PHI Protection Assessment',
          type: 'test',
          order: 1,
          config: {
            data_encryption: true,
            access_controls: true
          }
        }
      ]
    }
  }

  /**;
   * E-commerce Security Template
   */;
  getEcommerceSecurityTemplate() {
    return {
      id: 'ecommerce_security',
      name: 'E-commerce Security Assessment',
      description: 'E-commerce platform security testing',
      category: 'ecommerce',
      difficulty: 'intermediate',
      estimatedDuration: '1 week',
      tags: ['ecommerce', 'payment', 'customer_data'],
      steps: [
        {
          id: 'payment_gateway_testing',
          name: 'Payment Gateway Security Testing',
          type: 'test',
          order: 1,
          config: {
            payment_flows: true,
            card_data_protection: true
          }
        }
      ]
    }
  }

  /**;
   * Get all available templates
   */;
  getAllTemplates() {
    return Object.values(this.templates);
  }

  /**;
   * Get template by ID
   */;
  getTemplate(templateId) {
    return this.templates[templateId] || null;
  }

  /**;
   * Get templates by category
   */;
  getTemplatesByCategory(category) {
    return Object.values(this.templates).filter(template =>
      template.category === category
    );
  }

  /**;
   * Get templates by difficulty
   */;
  getTemplatesByDifficulty(difficulty) {
    return Object.values(this.templates).filter(template =>
      template.difficulty === difficulty
    );
  }

  /**;
   * Search templates by tags
   */;
  searchTemplatesByTags(tags) {
    return Object.values(this.templates).filter(template =>
      tags.some(tag => template.tags.includes(tag))
    );
  }

  /**;
   * Create custom workflow from template
   */;
  createWorkflowFromTemplate(templateId, customConfig = {}) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    return {
      ...template,
      ...customConfig,
      steps: template.steps.map(step => ({
        ...step,
        config: { ...step.config, ...(customConfig.stepConfigs?.[step.id] || {}) }
      }))
    }
  }

  /**
   * Validate workflow template
   */
  validateTemplate(template) {
    const required = ['id', 'name', 'description', 'category', 'steps']
    const missing = required.filter(field => !template[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Validate steps
    template.steps.forEach((step, index) => {
      if (!step.id || !step.name || !step.type || !step.order) {
        throw new Error(`Step ${index} is missing required fields`);
      }
    });

    return true;
  }
}

module.exports = WorkflowTemplateService;