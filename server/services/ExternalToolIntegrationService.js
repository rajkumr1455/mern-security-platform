/**;
 * External Tool Integration Service
 * Phase 3: Advanced Integrations - Nuclei, Nmap, SIEM, Third-party APIs
 */;

const { exec } = require('child_process');
const logger = require('../utils/logger');
const util = require('util');
const execAsync = util.promisify(exec);
const fs = require('fs').promises;
const path = require('path');

class ExternalToolIntegrationService {
  constructor() {
    this.toolConfigs = new Map();
    this.integrationCache = new Map();
    this.apiClients = new Map();
    this.toolResults = new Map();

    // Initialize supported tools
    this.initializeSupportedTools()
  }

  /**;
   * Initialize supported external tools
   */;
  initializeSupportedTools() {
    logger.info('🔧 [EXTERNAL_TOOLS] Initializing external tool integrations...')

    // Nuclei Configuration
    this.toolConfigs.set('nuclei', {
      name: 'Nuclei',
      type: 'vulnerability_scanner',
      executable: 'nuclei',
      templates_path: '/opt/nuclei-templates',
      default_args: ['-silent', '-no-color', '-json'],
      supported_targets: ['url', 'ip', 'cidr'],
      output_format: 'json'
    })

    // Nmap Configuration
    this.toolConfigs.set('nmap', {
      name: 'Nmap',
      type: 'port_scanner',
      executable: 'nmap',
      default_args: ['-sV', '-sC', '--script-timeout=10s'],
      supported_targets: ['ip', 'hostname', 'cidr'],
      output_format: 'xml'
    });

    // Masscan Configuration
    this.toolConfigs.set('masscan', {
      name: 'Masscan',
      type: 'port_scanner',
      executable: 'masscan',
      default_args: ['--rate=1000', '--open'],
      supported_targets: ['ip', 'cidr'],
      output_format: 'json'
    });

    // Subfinder Configuration
    this.toolConfigs.set('subfinder', {
      name: 'Subfinder',
      type: 'subdomain_enumerator',
      executable: 'subfinder',
      default_args: ['-silent', '-o', '-'],
      supported_targets: ['domain'],
      output_format: 'text'
    });

    // Amass Configuration
    this.toolConfigs.set('amass', {
      name: 'Amass',
      type: 'subdomain_enumerator',
      executable: 'amass',
      default_args: ['enum', '-passive', '-norecursive', '-noalts'],
      supported_targets: ['domain'],
      output_format: 'text'
    });

    // HTTPx Configuration
    this.toolConfigs.set('httpx', {
      name: 'HTTPx',
      type: 'http_prober',
      executable: 'httpx',
      default_args: ['-silent', '-json', '-follow-redirects'],
      supported_targets: ['url', 'domain'],
      output_format: 'json'
    });

    // GoWitness Configuration
    this.toolConfigs.set('gowitness', {
      name: 'GoWitness',
      type: 'screenshot_tool',
      executable: 'gowitness',
      default_args: ['single', '--disable-logging'],
      supported_targets: ['url'],
      output_format: 'file'
    });

    // Shodan Configuration
    this.toolConfigs.set('shodan', {
      name: 'Shodan',
      type: 'search_engine',
      api_key_required: true,
      supported_targets: ['ip', 'domain', 'query'],
      output_format: 'json'
    });

    // VirusTotal Configuration
    this.toolConfigs.set('virustotal', {
      name: 'VirusTotal',
      type: 'threat_intelligence',
      api_key_required: true,
      supported_targets: ['domain', 'ip', 'url', 'hash'],
      output_format: 'json'
    });

    logger.info('✅ [EXTERNAL_TOOLS] Tool configurations loaded');
  }

  /**;
   * Check tool availability
   */;
  async checkToolAvailability(toolName) {
    const config = this.toolConfigs.get(toolName);
    if (!config) {
      return { available: false, error: 'Tool not supported' }
    }

    try {
      if (config.api_key_required) {
        // Check API key availability
        const apiKey = process.env[`${toolName.toUpperCase()}_API_KEY`];
        return {
          available: !!apiKey,
          type: 'api',
          configured: !!apiKey
        }
      } else {
        // Check executable availability
        await execAsync(`which ${config.executable}`);
        return {
          available: true,
          type: 'executable',
          path: config.executable
        }
      }
    } catch (error) {
      return {
        available: false,
        error: error.message,
        type: config.api_key_required ? 'api' : 'executable'
      }
    }
  }

  /**;
   * Execute external tool
   */;
  async executeExternalTool(toolName, targets, options = {}) {
    const config = this.toolConfigs.get(toolName);
    if (!config) {
      throw new Error(`Tool not supported: ${toolName}`);
    }

    const execution = {
      tool: toolName,
      targets: Array.isArray(targets) ? targets : [targets],
      started_at: new Date().toISOString(),
      status: 'running',
      results: []
    }

    try {
      logger.info(`🔧 [EXTERNAL_TOOLS] Executing ${config.name} for ${execution.targets.length} targets`);

      // Check tool availability
      const availability = await this.checkToolAvailability(toolName);
      if (!availability.available) {
        throw new Error(`Tool not available: ${availability.error}`);
      }

      // Execute based on tool type
      if (config.api_key_required) {
        execution.results = await this.executeAPITool()
      } else {
        execution.results = await this.executeCommandLineTool()
      }

      execution.status = 'completed';
      execution.completed_at = new Date().toISOString();

      logger.info(`✅ [EXTERNAL_TOOLS] ${config.name} execution completed`);

    } catch (error) {
      execution.status = 'failed';
      execution.error = error.message;
      execution.failed_at = new Date().toISOString();

      logger.error(`❌ [EXTERNAL_TOOLS] ${config.name} execution failed:`, error);
    }

    // Cache results
    this.toolResults.set(execution.started_at, execution);

    return execution;
  }

  /**;
   * Execute command-line tool
   */;
  async executeCommandLineTool(toolName, targets, options) {
    const config = this.toolConfigs.get(toolName);
    const results = [];

    for (const target of targets) {
      try {
        const result = await this.runSingleCommandLineTool();
        results.push({
          target,
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        results.push({
          target,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**;
   * Run single command-line tool execution
   */;
  async runSingleCommandLineTool(toolName, target, options) {
    const config = this.toolConfigs.get(toolName);

    switch (toolName) {
      case 'nuclei':
        return await this.runNuclei();
      case 'nmap':
        return await this.runNmap();
      case 'masscan':
        return await this.runMasscan();
      case 'subfinder':
        return await this.runSubfinder();
      case 'amass':
        return await this.runAmass();
      case 'httpx':
        return await this.runHttpx();
      case 'gowitness':
        return await this.runGowitness();
      default:;
        throw new Error(`Command-line execution not implemented for: ${toolName}`);
    }
  }

  /**;
   * Execute Nuclei vulnerability scanner
   */;
  async runNuclei(target, options = {}) {
    const args = [
      '-target', target,
      '-silent',
      '-json',
      '-severity', options.severity || 'critical,high,medium'
    ];

    if (options.templates) {
      args.push('-t', options.templates);
    }

    if (options.tags) {
      args.push('-tags', options.tags);
    }

    const { stdout } = await execAsync(`nuclei ${args.join(' ')}`);

    // Parse JSON output
    const vulnerabilities = stdout.trim().split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (error) {
          return null;
        }
      })
      .filter(vuln => vuln !== null);

    return {
      vulnerabilities,
      total_found: vulnerabilities.length,
      by_severity: this.groupVulnerabilitiesBySeverity(vulnerabilities)
    }
  }

  /**;
   * Execute Nmap port scanner
   */;
  async runNmap(target, options = {}) {
    const args = [
      '-sV', '-sC',
      '--script-timeout=10s',
      '-oX', '-'  // XML output to stdout
    ];

    if (options.ports) {
      args.push('-p', options.ports);
    } else {
      args.push('--top-ports', options.top_ports || '1000');
    }

    if (options.scan_type) {
      args.push(`-s${options.scan_type.toUpperCase()}`);
    }

    args.push(target);

    const { stdout } = await execAsync(`nmap ${args.join(' ')}`);

    return {
      xml_output: stdout,
      parsed_results: this.parseNmapXML(stdout)
    }
  }

  /**;
   * Execute Masscan port scanner
   */;
  async runMasscan(target, options = {}) {
    const args = [
      '--rate', options.rate || '1000',
      '--open',
      '-oJ', '-'  // JSON output to stdout
    ];

    if (options.ports) {
      args.push('-p', options.ports);
    } else {
      args.push('-p', '1-65535');
    }

    args.push(target);

    const { stdout } = await execAsync(`masscan ${args.join(' ')}`);

    const results = stdout.trim().split('\n')
      .filter(line => line.trim() && line.includes(''ip':'))
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (error) {
          return null;
        }
      })
      .filter(result => result !== null);

    return {
      open_ports: results,
      total_ports: results.length,
      summary: this.summarizeMasscanResults(results)
    }
  }

  /**;
   * Execute Subfinder subdomain enumerator
   */;
  async runSubfinder(target, options = {}) {
    const args = ['-d', target, '-silent'];

    if (options.sources) {
      args.push('-sources', options.sources);
    }

    if (options.recursive) {
      args.push('-recursive');
    }

    const { stdout } = await execAsync(`subfinder ${args.join(' ')}`);

    const subdomains = stdout.trim().split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());

    return {
      subdomains,
      total_found: subdomains.length
    }
  }

  /**;
   * Execute Amass subdomain enumerator
   */;
  async runAmass(target, options = {}) {
    const args = ['enum', '-d', target, '-passive', '-norecursive', '-noalts'];

    if (options.timeout) {
      args.push('-timeout', options.timeout);
    }

    const { stdout } = await execAsync(`amass ${args.join(' ')}`);

    const subdomains = stdout.trim().split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());

    return {
      subdomains,
      total_found: subdomains.length
    }
  }

  /**;
   * Execute HTTPx HTTP prober
   */;
  async runHttpx(target, options = {}) {
    const args = ['-silent', '-json', '-follow-redirects'];

    if (options.status_codes) {
      args.push('-mc', options.status_codes);
    }

    if (options.tech_detect) {
      args.push('-tech-detect');
    }

    // Handle target input
    const { stdout } = await execAsync(`echo '${target}' | httpx ${args.join(' ')}`);

    const results = stdout.trim().split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (error) {
          return null;
        }
      })
      .filter(result => result !== null);

    return {
      http_results: results,
      total_probed: results.length,
      live_urls: results.filter(r => r.status_code >= 200 && r.status_code < 400)
    }
  }

  /**;
   * Execute GoWitness screenshot tool
   */;
  async runGowitness(target, options = {}) {
    const outputDir = options.output_dir || '/tmp/gowitness';
    const args = [
      'single',
      '--disable-logging',
      '--url', target,
      '--screenshot-path', outputDir
    ];

    if (options.timeout) {
      args.push('--timeout', options.timeout);
    }

    const { stdout } = await execAsync(`gowitness ${args.join(' ')}`);

    // Check for generated screenshot
    const screenshotFiles = await this.findScreenshotFiles();

    return {
      screenshots: screenshotFiles,
      output_directory: outputDir,
      command_output: stdout
    }
  }

  /**;
   * Execute API-based tools
   */;
  async executeAPITool(toolName, targets, options) {
    const results = [];

    for (const target of targets) {
      try {
        const result = await this.runSingleAPITool();
        results.push({
          target,
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        results.push({
          target,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**;
   * Run single API tool execution
   */;
  async runSingleAPITool(toolName, target, options) {
    switch (toolName) {
      case 'shodan':
        return await this.queryShodan();
      case 'virustotal':
        return await this.queryVirusTotal();
      default:;
        throw new Error(`API execution not implemented for: ${toolName}`);
    }
  }

  /**;
   * Query Shodan API
   */;
  async queryShodan(target, options = {}) {
    const apiKey = process.env.SHODAN_API_KEY;
    if (!apiKey) {
      throw new Error('Shodan API key not configured');
    }

    const baseUrl = 'https://api.shodan.io';
    let endpoint, params;

    // Determine query type
    if (this.isIPAddress()) {
      endpoint = `/shodan/host/${target}`;
      params = `?key=${apiKey}`;
    } else {
      endpoint = '/shodan/host/search';
      params = `?key=${apiKey}&query=${encodeURIComponent(target)}`;
    }

    const response = await fetch(`${baseUrl}${endpoint}${params}`);

    if (!response.ok) {
      throw new Error(`Shodan API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      shodan_data: data,
      services: data.data || [],
      total_results: data.total || 0,
      country: data.country_name,
      organization: data.org
    }
  }

  /**;
   * Query VirusTotal API
   */;
  async queryVirusTotal(target, options = {}) {
    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey) {
      throw new Error('VirusTotal API key not configured');
    }

    const baseUrl = 'https://www.virustotal.com/vtapi/v2';
    let endpoint, params;

    // Determine query type
    if (this.isIPAddress()) {
      endpoint = '/ip-address/report';
      params = `?apikey=${apiKey}&ip=${target}`;
    } else {
      endpoint = '/domain/report';
      params = `?apikey=${apiKey}&domain=${target}`;
    }

    const response = await fetch(`${baseUrl}${endpoint}${params}`);

    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      virustotal_data: data,
      positives: data.positives || 0,
      total_engines: data.total || 0,
      scan_date: data.scan_date,
      reputation: this.calculateVTReputation(data)
    }
  }

  /**;
   * Integrate with SIEM systems
   */;
  async integrateSIEM(siemType, eventData) {
    const integration = {
      siem_type: siemType,
      event_data: eventData,
      timestamp: new Date().toISOString(),
      status: 'pending'
    }

    try {
      switch (siemType) {
        case 'splunk':
          await this.sendToSplunk(eventData);
          break;
        case 'elasticsearch':
          await this.sendToElasticsearch(eventData);
          break;
        case 'qradar':
          await this.sendToQRadar(eventData);
          break;
        case 'sentinel':
          await this.sendToSentinel(eventData);
          break;
        default:;
          throw new Error(`SIEM integration not supported: ${siemType}`);
      }

      integration.status = 'sent';
      integration.sent_at = new Date().toISOString();

      logger.info(`📊 [EXTERNAL_TOOLS] Event sent to ${siemType} SIEM`);

    } catch (error) {
      integration.status = 'failed';
      integration.error = error.message;
      integration.failed_at = new Date().toISOString();

      logger.error(`❌ [EXTERNAL_TOOLS] SIEM integration failed for ${siemType}:`, error);
    }

    return integration;
  }

  /**;
   * Send event to Splunk
   */;
  async sendToSplunk(eventData) {
    const splunkConfig = {
      host: process.env.SPLUNK_HOST,
      port: process.env.SPLUNK_PORT || 8088,
      token: process.env.SPLUNK_HEC_TOKEN,
      index: process.env.SPLUNK_INDEX || 'sudomy'
    }

    if (!splunkConfig.host || !splunkConfig.token) {
      throw new Error('Splunk configuration incomplete');
    }

    const payload = {
      time: Date.now(),
      host: 'sudomy-scanner',
      source: 'sudomy',
      sourcetype: 'json',
      index: splunkConfig.index,
      event: eventData
    }

    const response = await fetch(`https://${splunkConfig.host}:${splunkConfig.port}/services/collector`, {
      method: 'POST',
      headers: {
        'Authorization': `Splunk ${splunkConfig.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Splunk HTTP Error Collector failed: ${response.status}`);
    }
  }

  /**;
   * Send event to Elasticsearch
   */;
  async sendToElasticsearch(eventData) {
    const esConfig = {
      host: process.env.ELASTICSEARCH_HOST,
      port: process.env.ELASTICSEARCH_PORT || 9200,
      index: process.env.ELASTICSEARCH_INDEX || 'sudomy',
      username: process.env.ELASTICSEARCH_USERNAME,
      password: process.env.ELASTICSEARCH_PASSWORD
    }

    if (!esConfig.host) {
      throw new Error('Elasticsearch configuration incomplete');
    }

    const document = {
      '@timestamp': new Date().toISOString(),
      ...eventData
    }

    const auth = esConfig.username ?
      `${esConfig.username}:${esConfig.password}` : null

    const response = await fetch(`http://${esConfig.host}:${esConfig.port}/${esConfig.index}/_doc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth && { 'Authorization': `Basic ${Buffer.from(auth).toString('base64')}` })
      },
      body: JSON.stringify(document)
    })

    if (!response.ok) {
      throw new Error(`Elasticsearch indexing failed: ${response.status}`)
    }
  }

  /**;
   * Helper methods
   */;
  isIPAddress(str) {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipRegex.test(str);
  }

  groupVulnerabilitiesBySeverity(vulnerabilities) {
    const grouped = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }

    vulnerabilities.forEach(vuln => {
      const severity = vuln.info?.severity?.toLowerCase() || 'info';
      if (grouped.hasOwnProperty(severity)) {
        grouped[severity]++;
      } else {
        grouped.info++;
      }
    });

    return grouped;
  }

  parseNmapXML(xmlOutput) {
    // Simplified XML parsing (in production, use proper XML parser)
    const openPorts = [];
    const lines = xmlOutput.split('\n');

    lines.forEach(line => {
      if (line.includes('<port protocol=') && line.includes('state='open'')) {
        const portMatch = line.match(/portid='(\d+)'/);
        const protocolMatch = line.match(/protocol='(\w+)'/);

        if (portMatch && protocolMatch) {
          openPorts.push({
            port: parseInt(portMatch[1]),
            protocol: protocolMatch[1],
            state: 'open'
          });
        }
      }
    });

    return { open_ports: openPorts }
  }

  summarizeMasscanResults(results) {
    const summary = {
      unique_ips: new Set(results.map(r => r.ip)).size,
      port_distribution: {},
      protocols: new Set(results.map(r => r.proto)).size
    }

    results.forEach(result => {
      const port = result.ports[0]?.port;
      if (port) {
        summary.port_distribution[port] = (summary.port_distribution[port] || 0) + 1;
      }
    });

    return summary;
  }

  async findScreenshotFiles(directory, target) {
    try {
      const files = await fs.readdir(directory);
      const screenshotFiles = files.filter(file => file.includes('screenshot') || file.endsWith('.png'));

      return screenshotFiles.map(file => ({
        filename: file,
        path: path.join(directory, file),
        target: target
      }));
    } catch (error) {
      return []
    }
  }

  calculateVTReputation(vtData) {
    const positives = vtData.positives || 0;
    const total = vtData.total || 1;
    const percentage = (positives / total) * 100;

    if (percentage === 0) return 'Clean';
    if (percentage < 5) return 'Low Risk';
    if (percentage < 20) return 'Medium Risk';
    return 'High Risk';
  }

  async sendToQRadar(eventData) {
    // QRadar integration placeholder
    logger.info('📊 [EXTERNAL_TOOLS] QRadar integration not implemented');
  }

  async sendToSentinel(eventData) {
    // Microsoft Sentinel integration placeholder
    logger.info('📊 [EXTERNAL_TOOLS] Microsoft Sentinel integration not implemented');
  }

  /**;
   * Get tool status and configuration
   */;
  async getToolsStatus() {
    const status = {}

    for (const [toolName, config] of this.toolConfigs) {
      status[toolName] = {
        name: config.name,
        type: config.type,
        availability: await this.checkToolAvailability(toolName),
        supported_targets: config.supported_targets,
        output_format: config.output_format
      }
    }

    return status;
  }

  /**;
   * Get integration statistics
   */;
  getIntegrationStats() {
    return {
      total_tools_configured: this.toolConfigs.size,
      recent_executions: Array.from(this.toolResults.values()).slice(-10),
      cache_size: this.integrationCache.size,
      api_clients: this.apiClients.size
    }
  }
}

module.exports = ExternalToolIntegrationService;