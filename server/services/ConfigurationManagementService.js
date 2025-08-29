/**;
 * Configuration Management Service
 * Phase 3: Configuration management improvements, custom scan profiles, detection rules
 */;

const fs = require('fs').promises;
const logger = require('../utils/logger');
const path = require('path');

class ConfigurationManagementService {
  constructor() {
    this.scanProfiles = new Map();
    this.detectionRules = new Map();
    this.exclusionLists = new Map();
    this.globalConfig = new Map();
    this.userConfigs = new Map();

    // Initialize default configurations
    this.initializeDefaultConfigurations()
  }

  /**;
   * Initialize default configurations
   */;
  initializeDefaultConfigurations() {
    logger.info('⚙️ [CONFIG] Initializing configuration management...')

    // Load default scan profiles
    this.loadDefaultScanProfiles()

    // Load default detection rules
    this.loadDefaultDetectionRules();

    // Load default exclusion lists
    this.loadDefaultExclusionLists();

    // Load global configuration
    this.loadGlobalConfiguration();

    logger.info('✅ [CONFIG] Configuration management initialized')
  }

  /**;
   * Load default scan profiles
   */;
  loadDefaultScanProfiles() {
    // Quick scan profile
    this.scanProfiles.set('quick', {
      id: 'quick',
      name: 'Quick Scan',
      description: 'Fast reconnaissance with essential checks',
      config: {
        enumeration: {
          techniques: ['passive'],
          wordlistSize: 'small',
          includeValidation: true,
          socialMedia: false
        },
        dns_analysis: {
          enabled: true,
          security_checks: ['basic'],
          wildcard_detection: true
        },
        http_analysis: {
          enabled: true,
          security_headers: true,
          ssl_analysis: false,
          technology_detection: true
        },
        port_scanning: {
          enabled: false
        },
        visual_intelligence: {
          enabled: false
        },
        threat_intelligence: {
          enabled: true,
          basic_checks: true
        }
      },
      estimated_duration: '5-10 minutes',
      resource_usage: 'low'
    });

    // Comprehensive scan profile
    this.scanProfiles.set('comprehensive', {
      id: 'comprehensive',
      name: 'Comprehensive Scan',
      description: 'Complete security assessment with all features',
      config: {
        enumeration: {
          techniques: ['passive', 'active'],
          wordlistSize: 'medium',
          includeValidation: true,
          socialMedia: true
        },
        dns_analysis: {
          enabled: true,
          security_checks: ['full'],
          wildcard_detection: true,
          health_checks: true
        },
        http_analysis: {
          enabled: true,
          security_headers: true,
          ssl_analysis: true,
          technology_detection: true,
          response_analysis: true
        },
        port_scanning: {
          enabled: true,
          scan_type: 'comprehensive',
          include_udp: false,
          service_detection: true,
          vulnerability_scan: true
        },
        visual_intelligence: {
          enabled: true,
          screenshot_options: {
            viewport: { width: 1920, height: 1080 },
            timeout: 30000
          }
        },
        threat_intelligence: {
          enabled: true,
          full_analysis: true
        }
      },
      estimated_duration: '30-60 minutes',
      resource_usage: 'high'
    });

    // Stealth scan profile
    this.scanProfiles.set('stealth', {
      id: 'stealth',
      name: 'Stealth Scan',
      description: 'Low-profile scanning to avoid detection',
      config: {
        enumeration: {
          techniques: ['passive'],
          wordlistSize: 'small',
          includeValidation: false,
          socialMedia: false,
          rate_limiting: {
            enabled: true,
            delay_between_requests: 2000
          }
        },
        dns_analysis: {
          enabled: true,
          security_checks: ['basic'],
          rate_limiting: true
        },
        http_analysis: {
          enabled: true,
          security_headers: true,
          ssl_analysis: false,
          user_agent_rotation: true
        },
        port_scanning: {
          enabled: false
        },
        visual_intelligence: {
          enabled: false
        },
        threat_intelligence: {
          enabled: true,
          passive_only: true
        }
      },
      estimated_duration: '15-30 minutes',
      resource_usage: 'low'
    });

    // Deep scan profile
    this.scanProfiles.set('deep', {
      id: 'deep',
      name: 'Deep Security Scan',
      description: 'Intensive security analysis with all tools',
      config: {
        enumeration: {
          techniques: ['passive', 'active', 'permutation'],
          wordlistSize: 'large',
          includeValidation: true,
          socialMedia: true,
          external_tools: ['subfinder', 'amass']
        },
        dns_analysis: {
          enabled: true,
          security_checks: ['full', 'advanced'],
          wildcard_detection: true,
          health_checks: true,
          zone_transfer_attempts: true
        },
        http_analysis: {
          enabled: true,
          security_headers: true,
          ssl_analysis: true,
          technology_detection: true,
          response_analysis: true,
          vulnerability_scanning: true
        },
        port_scanning: {
          enabled: true,
          scan_type: 'full',
          include_udp: true,
          service_detection: true,
          vulnerability_scan: true,
          external_tools: ['nmap', 'masscan']
        },
        visual_intelligence: {
          enabled: true,
          screenshot_options: {
            viewport: { width: 1920, height: 1080 },
            timeout: 60000,
            full_page: true
          },
          visual_analysis: true
        },
        threat_intelligence: {
          enabled: true,
          full_analysis: true,
          external_apis: ['virustotal', 'shodan']
        },
        external_integrations: {
          nuclei: {
            enabled: true,
            severity: 'critical,high,medium'
          }
        }
      },
      estimated_duration: '60-120 minutes',
      resource_usage: 'very_high'
    });

    logger.info('📋 [CONFIG] Default scan profiles loaded');
  }

  /**;
   * Load default detection rules
   */;
  loadDefaultDetectionRules() {
    // High-severity vulnerability detection
    this.detectionRules.set('critical_vulns', {
      id: 'critical_vulns',
      name: 'Critical Vulnerability Detection',
      description: 'Detect critical security vulnerabilities',
      type: 'vulnerability',
      severity: 'critical',
      conditions: [
        {;
          field: 'vulnerability.severity',
          operator: 'equals',
          value: 'critical'
        }
      ],
      actions: [
        {;
          type: 'alert',
          priority: 'immediate',
          channels: ['email', 'slack']
        },
        {;
          type: 'create_incident',
          severity: 'critical'
        }
      ],
      enabled: true
    });

    // Suspicious subdomain detection
    this.detectionRules.set('suspicious_subdomains', {
      id: 'suspicious_subdomains',
      name: 'Suspicious Subdomain Detection',
      description: 'Detect potentially malicious subdomains',
      type: 'reconnaissance',
      severity: 'medium',
      conditions: [
        {;
          field: 'subdomain.name',
          operator: 'contains',
          value: ['admin', 'test', 'dev', 'staging', 'backup']
        },
        {;
          field: 'subdomain.validated',
          operator: 'equals',
          value: true
        }
      ],
      actions: [
        {;
          type: 'flag_for_review',
          priority: 'medium'
        }
      ],
      enabled: true
    });

    // SSL/TLS security issues
    this.detectionRules.set('ssl_issues', {
      id: 'ssl_issues',
      name: 'SSL/TLS Security Issues',
      description: 'Detect SSL/TLS configuration problems',
      type: 'configuration',
      severity: 'high',
      conditions: [
        {;
          field: 'ssl.vulnerabilities.length',
          operator: 'greater_than',
          value: 0
        }
      ],
      actions: [
        {;
          type: 'alert',
          priority: 'high',
          channels: ['email']
        },
        {;
          type: 'add_to_report',
          section: 'ssl_issues'
        }
      ],
      enabled: true
    });

    // Open dangerous ports
    this.detectionRules.set('dangerous_ports', {
      id: 'dangerous_ports',
      name: 'Dangerous Open Ports',
      description: 'Detect dangerous services exposed',
      type: 'port_scan',
      severity: 'high',
      conditions: [
        {;
          field: 'port.number',
          operator: 'in',
          value: [23, 135, 139, 445, 1433, 3389]
        },
        {;
          field: 'port.state',
          operator: 'equals',
          value: 'open'
        }
      ],
      actions: [
        {;
          type: 'alert',
          priority: 'high',
          channels: ['email', 'slack']
        },
        {;
          type: 'recommend_action',
          action: 'close_port'
        }
      ],
      enabled: true
    });

    // Threat intelligence matches
    this.detectionRules.set('threat_matches', {
      id: 'threat_matches',
      name: 'Threat Intelligence Matches',
      description: 'Detect known malicious indicators',
      type: 'threat_intelligence',
      severity: 'critical',
      conditions: [
        {;
          field: 'threat.detected',
          operator: 'equals',
          value: true
        },
        {;
          field: 'threat.confidence',
          operator: 'greater_than',
          value: 70
        }
      ],
      actions: [
        {;
          type: 'alert',
          priority: 'immediate',
          channels: ['email', 'slack', 'sms']
        },
        {;
          type: 'block_ip',
          duration: '24h'
        },
        {;
          type: 'create_incident',
          severity: 'critical'
        }
      ],
      enabled: true
    });

    logger.info('🔍 [CONFIG] Default detection rules loaded');
  }

  /**;
   * Load default exclusion lists
   */;
  loadDefaultExclusionLists() {
    // Global exclusions
    this.exclusionLists.set('global', {
      id: 'global',
      name: 'Global Exclusions',
      description: 'Globally excluded domains and IPs',
      type: 'global',
      exclusions: {
        domains: [
          'localhost',
          '*.internal',
          '*.lan',
          '*.local',
        ],
        ips: [
          '127.0.0.1',
          '0.0.0.0',
          '192.168.0.0/16',
          '10.0.0.0/8',
          '172.16.0.0/12',
        ],
        ports: [],
        patterns: [
          '*.test',
          '*.example',
        ]
      },
      enabled: true
    });

    // CDN and cloud provider exclusions
    this.exclusionLists.set('cdn_cloud', {
      id: 'cdn_cloud',
      name: 'CDN and Cloud Provider Exclusions',
      description: 'Exclude common CDN and cloud services',
      type: 'service',
      exclusions: {
        domains: [
          '*.amazonaws.com',
          '*.cloudfront.net',
          '*.cloudflare.com',
          '*.azure.com',
          '*.googleapis.com',
          '*.fastly.com',
        ],
        ips: [],
        patterns: [
          '*-cdn-*',
          '*-edge-*',
        ]
      },
      enabled: false
    });

    // Development and testing exclusions
    this.exclusionLists.set('dev_test', {
      id: 'dev_test',
      name: 'Development and Testing Exclusions',
      description: 'Exclude development and testing environments',
      type: 'environment',
      exclusions: {
        domains: [],
        ips: [],
        patterns: [
          'dev.*',
          'test.*',
          'staging.*',
          'beta.*',
          'preview.*',
        ]
      },
      enabled: false
    });

    logger.info('🚫 [CONFIG] Default exclusion lists loaded');
  }

  /**;
   * Load global configuration
   */;
  loadGlobalConfiguration() {
    this.globalConfig.set('scan_limits', {
      max_concurrent_scans: 5,
      max_subdomains_per_scan: 1000,
      max_scan_duration: 7200, // 2 hours in seconds
      rate_limit_delay: 1000
    });

    this.globalConfig.set('resource_limits', {
      max_memory_usage: '2GB',
      max_cpu_usage: 80,
      max_disk_usage: '10GB',
      timeout_settings: {
        dns_query: 5000,
        http_request: 30000,
        port_scan: 60000
      }
    });

    this.globalConfig.set('security_settings', {
      enable_rate_limiting: true,
      user_agent_rotation: true,
      proxy_rotation: false,
      respect_robots_txt: true,
      ssl_verification: true
    });

    this.globalConfig.set('notification_defaults', {
      email_enabled: true,
      slack_enabled: false,
      webhook_enabled: false,
      notification_threshold: 'medium'
    });

    logger.info('🌐 [CONFIG] Global configuration loaded');
  }

  /**;
   * Create custom scan profile
   */;
  async createScanProfile(profileData) {
    const profile = {
      id: profileData.id || `profile_${Date.now()}`,
      name: profileData.name,
      description: profileData.description,
      config: profileData.config,
      created_by: profileData.created_by || 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usage_count: 0,
      custom: true
    }

    // Validate profile configuration
    this.validateScanProfile(profile);

    this.scanProfiles.set(profile.id, profile);

    logger.info(`📋 [CONFIG] Created custom scan profile: ${profile.name}`);

    return profile;
  }

  /**;
   * Create custom detection rule
   */;
  async createDetectionRule(ruleData) {
    const rule = {
      id: ruleData.id || `rule_${Date.now()}`,
      name: ruleData.name,
      description: ruleData.description,
      type: ruleData.type,
      severity: ruleData.severity,
      conditions: ruleData.conditions,
      actions: ruleData.actions,
      enabled: ruleData.enabled !== false,
      created_by: ruleData.created_by || 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      triggered_count: 0,
      custom: true
    }

    // Validate rule configuration
    this.validateDetectionRule(rule);

    this.detectionRules.set(rule.id, rule);

    logger.info(`🔍 [CONFIG] Created custom detection rule: ${rule.name}`);

    return rule;
  }

  /**;
   * Create custom exclusion list
   */;
  async createExclusionList(listData) {
    const exclusionList = {
      id: listData.id || `exclusion_${Date.now()}`,
      name: listData.name,
      description: listData.description,
      type: listData.type,
      exclusions: listData.exclusions,
      enabled: listData.enabled !== false,
      created_by: listData.created_by || 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      custom: true
    }

    // Validate exclusion list
    this.validateExclusionList(exclusionList);

    this.exclusionLists.set(exclusionList.id, exclusionList);

    logger.info(`🚫 [CONFIG] Created custom exclusion list: ${exclusionList.name}`);

    return exclusionList;
  }

  /**;
   * Update scan profile
   */;
  async updateScanProfile(profileId, updates) {
    const profile = this.scanProfiles.get(profileId);
    if (!profile) {
      throw new Error(`Scan profile not found: ${profileId}`);
    }

    // Merge updates
    Object.assign(profile, updates);
    profile.updated_at = new Date().toISOString();

    // Re-validate
    this.validateScanProfile(profile);

    logger.info(`📋 [CONFIG] Updated scan profile: ${profile.name}`);

    return profile;
  }

  /**;
   * Update detection rule
   */;
  async updateDetectionRule(ruleId, updates) {
    const rule = this.detectionRules.get(ruleId);
    if (!rule) {
      throw new Error(`Detection rule not found: ${ruleId}`);
    }

    // Merge updates
    Object.assign(rule, updates);
    rule.updated_at = new Date().toISOString();

    // Re-validate
    this.validateDetectionRule(rule);

    logger.info(`🔍 [CONFIG] Updated detection rule: ${rule.name}`);

    return rule;
  }

  /**;
   * Get scan profile by ID
   */;
  getScanProfile(profileId) {
    return this.scanProfiles.get(profileId);
  }

  /**;
   * Get all scan profiles
   */;
  getAllScanProfiles() {
    return Array.from(this.scanProfiles.values());
  }

  /**;
   * Get detection rule by ID
   */;
  getDetectionRule(ruleId) {
    return this.detectionRules.get(ruleId);
  }

  /**;
   * Get all detection rules
   */;
  getAllDetectionRules() {
    return Array.from(this.detectionRules.values());
  }

  /**;
   * Get exclusion list by ID
   */;
  getExclusionList(listId) {
    return this.exclusionLists.get(listId);
  }

  /**;
   * Get all exclusion lists
   */;
  getAllExclusionLists() {
    return Array.from(this.exclusionLists.values());
  }

  /**;
   * Check if target should be excluded
   */;
  shouldExcludeTarget(target, targetType = 'domain') {
    const enabledLists = Array.from(this.exclusionLists.values())
      .filter(list => list.enabled);

    for (const list of enabledLists) {
      if (this.isTargetExcluded()) {
        return {
          excluded: true,
          reason: `Matched exclusion list: ${list.name}`,
          list_id: list.id
        }
      }
    }

    return { excluded: false }
  }

  /**;
   * Check if target matches exclusion criteria
   */;
  isTargetExcluded(target, targetType, exclusions) {
    switch (targetType) {
      case 'domain':
        return this.checkDomainExclusions();
      case 'ip':
        return this.checkIPExclusions();
      case 'port':
        return this.checkPortExclusions();
      default:;
        return false;
    }
  }

  /**;
   * Check domain exclusions
   */;
  checkDomainExclusions(domain, exclusions) {
    // Check exact domain matches
    if (exclusions.domains && exclusions.domains.includes(domain)) {
      return true;
    }

    // Check pattern matches
    if (exclusions.patterns) {
      for (const pattern of exclusions.patterns) {
        if (this.matchesPattern(domain, pattern)) {
          return true;
        }
      }
    }

    return false;
  }

  /**;
   * Check IP exclusions
   */;
  checkIPExclusions(ip, exclusions) {
    if (!exclusions.ips) return false;

    for (const exclusion of exclusions.ips) {
      if (exclusion.includes('/')) {
        // CIDR notation
        if (this.isIPInCIDR(ip, exclusion)) {
          return true;
        }
      } else if (exclusion === ip) {
        // Exact IP match
        return true;
      }
    }

    return false;
  }

  /**;
   * Check port exclusions
   */;
  checkPortExclusions(port, exclusions) {
    return exclusions.ports && exclusions.ports.includes(parseInt(port));
  }

  /**;
   * Validate scan profile
   */;
  validateScanProfile(profile) {
    if (!profile.name || !profile.config) {
      throw new Error('Profile name and config are required');
    }

    const requiredSections = ['enumeration', 'dns_analysis', 'http_analysis'];
    for (const section of requiredSections) {
      if (!profile.config[section]) {
        throw new Error(`Missing required config section: ${section}`);
      }
    }
  }

  /**;
   * Validate detection rule
   */;
  validateDetectionRule(rule) {
    if (!rule.name || !rule.type || !rule.conditions || !rule.actions) {
      throw new Error('Rule name, type, conditions, and actions are required');
    }

    if (!Array.isArray(rule.conditions) || rule.conditions.length === 0) {
      throw new Error('At least one condition is required');
    }

    if (!Array.isArray(rule.actions) || rule.actions.length === 0) {
      throw new Error('At least one action is required');
    }
  }

  /**;
   * Validate exclusion list
   */;
  validateExclusionList(list) {
    if (!list.name || !list.type || !list.exclusions) {
      throw new Error('List name, type, and exclusions are required');
    }

    const validTypes = ['global', 'service', 'environment', 'custom'];
    if (!validTypes.includes(list.type)) {
      throw new Error(`Invalid exclusion list type: ${list.type}`);
    }
  }

  /**;
   * Helper methods
   */;
  matchesPattern(text, pattern) {
    // Simple wildcard pattern matching
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');

    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(text);
  }

  isIPInCIDR(ip, cidr) {
    // Simplified CIDR check (in production, use proper IP library)
    const [network, prefixLength] = cidr.split('/');
    const ipParts = ip.split('.').map(Number);
    const networkParts = network.split('.').map(Number);

    const prefix = parseInt(prefixLength);
    const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;

    const ipInt = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
    const networkInt = (networkParts[0] << 24) + (networkParts[1] << 16) + (networkParts[2] << 8) + networkParts[3];

    return (ipInt & mask) === (networkInt & mask);
  }

  /**;
   * Export configuration
   */;
  async exportConfiguration(exportType = 'all') {
    const exportData = {
      exported_at: new Date().toISOString(),
      version: '1.0'
    }

    if (exportType === 'all' || exportType === 'profiles') {
      exportData.scan_profiles = Array.from(this.scanProfiles.values());
    }

    if (exportType === 'all' || exportType === 'rules') {
      exportData.detection_rules = Array.from(this.detectionRules.values());
    }

    if (exportType === 'all' || exportType === 'exclusions') {
      exportData.exclusion_lists = Array.from(this.exclusionLists.values());
    }

    if (exportType === 'all' || exportType === 'global') {
      exportData.global_config = Object.fromEntries(this.globalConfig);
    }

    return exportData;
  }

  /**;
   * Import configuration
   */;
  async importConfiguration(importData, options = {}) {
    const results = {
      imported: {
        scan_profiles: 0,
        detection_rules: 0,
        exclusion_lists: 0,
        global_config: 0
      },
      errors: []
    }

    try {
      // Import scan profiles
      if (importData.scan_profiles) {
        for (const profile of importData.scan_profiles) {
          try {
            if (options.overwrite || !this.scanProfiles.has(profile.id)) {
              this.scanProfiles.set(profile.id, profile);
              results.imported.scan_profiles++;
            }
          } catch (error) {
            results.errors.push(`Profile ${profile.id}: ${error.message}`);
          }
        }
      }

      // Import detection rules
      if (importData.detection_rules) {
        for (const rule of importData.detection_rules) {
          try {
            if (options.overwrite || !this.detectionRules.has(rule.id)) {
              this.detectionRules.set(rule.id, rule);
              results.imported.detection_rules++;
            }
          } catch (error) {
            results.errors.push(`Rule ${rule.id}: ${error.message}`);
          }
        }
      }

      // Import exclusion lists
      if (importData.exclusion_lists) {
        for (const list of importData.exclusion_lists) {
          try {
            if (options.overwrite || !this.exclusionLists.has(list.id)) {
              this.exclusionLists.set(list.id, list);
              results.imported.exclusion_lists++;
            }
          } catch (error) {
            results.errors.push(`Exclusion list ${list.id}: ${error.message}`);
          }
        }
      }

      // Import global configuration
      if (importData.global_config) {
        try {
          for (const [key, value] of Object.entries(importData.global_config)) {
            this.globalConfig.set(key, value);
          }
          results.imported.global_config = Object.keys(importData.global_config).length;
        } catch (error) {
          results.errors.push(`Global config: ${error.message}`);
        }
      }

      logger.info(`📥 [CONFIG] Configuration import completed: ${JSON.stringify(results.imported)}`);

    } catch (error) {
      results.errors.push(`Import failed: ${error.message}`);
    }

    return results;
  }

  /**;
   * Get configuration statistics
   */;
  getConfigurationStats() {
    return {
      scan_profiles: {
        total: this.scanProfiles.size,
        custom: Array.from(this.scanProfiles.values()).filter(p => p.custom).length,
        default: Array.from(this.scanProfiles.values()).filter(p => !p.custom).length
      },
      detection_rules: {
        total: this.detectionRules.size,
        enabled: Array.from(this.detectionRules.values()).filter(r => r.enabled).length,
        custom: Array.from(this.detectionRules.values()).filter(r => r.custom).length
      },
      exclusion_lists: {
        total: this.exclusionLists.size,
        enabled: Array.from(this.exclusionLists.values()).filter(l => l.enabled).length,
        custom: Array.from(this.exclusionLists.values()).filter(l => l.custom).length
      },
      global_config: {
        total_settings: this.globalConfig.size
      }
    }
  }
}

module.exports = ConfigurationManagementService;