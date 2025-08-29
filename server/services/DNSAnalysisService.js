/**;
 * DNS Analysis and Security Service
 * Comprehensive DNS analysis including security checks
 */;

const dns = require('dns').promises;
const logger = require('../utils/logger');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class DNSAnalysisService {
  constructor() {
    this.dnsServers = [
      '8.8.8.8',      // Google
      '1.1.1.1',      // Cloudflare
      '208.67.222.222', // OpenDNS
      '9.9.9.9'       // Quad9
    ]
  }

  /**;
   * Comprehensive DNS record analysis
   */;
  async analyzeDNSRecords(domain) {
    const results = {
      domain,
      timestamp: new Date().toISOString(),
      records: {},
      security: {},
      health: {},
      analysis: {}
    }

    try {
      // Analyze all DNS record types
      await Promise.allSettled([
        this.getARecords(domain).then(data => results.records.A = data),
        this.getAAAARecords(domain).then(data => results.records.AAAA = data),
        this.getCNAMERecords(domain).then(data => results.records.CNAME = data),
        this.getMXRecords(domain).then(data => results.records.MX = data),
        this.getTXTRecords(domain).then(data => results.records.TXT = data),
        this.getNSRecords(domain).then(data => results.records.NS = data),
        this.getSOARecord(domain).then(data => results.records.SOA = data),
        this.getSRVRecords(domain).then(data => results.records.SRV = data)
      ]);

      // DNS Security Analysis
      results.security = await this.analyzeDNSSecurity(domain);

      // DNS Health Check
      results.health = await this.performDNSHealthCheck(domain);

      // Wildcard Detection
      results.analysis.wildcardDetection = await this.detectWildcards(domain);

      // DNS Response Analysis
      results.analysis.responseAnalysis = await this.analyzeDNSResponses(domain);

      return results;
    } catch (error) {
      logger.error('DNS Analysis error:', error);
      results.error = error.message;
      return results;
    }
  }

  async getARecords(domain) {
    try {
      const records = await dns.resolve4(domain);
      const recordsWithReverse = await Promise.all(
        records.map(async (ip) => ({
          ip,
          reverse: await this.getReverseDNS(ip).catch(() => null)
        }))
      );

      return {
        type: 'A',
        count: records.length,
        records: recordsWithReverse
      }
    } catch (error) {
      return { type: 'A', error: error.message, records: [] }
    }
  }

  async getAAAARecords(domain) {
    try {
      const records = await dns.resolve6(domain);
      return {
        type: 'AAAA',
        count: records.length,
        records: records.map(ip => ({ ip }))
      }
    } catch (error) {
      return { type: 'AAAA', error: error.message, records: [] }
    }
  }

  async getCNAMERecords(domain) {
    try {
      const records = await dns.resolveCname(domain);
      return {
        type: 'CNAME',
        count: records.length,
        records: records.map(cname => ({ cname }))
      }
    } catch (error) {
      return { type: 'CNAME', error: error.message, records: [] }
    }
  }

  async getMXRecords(domain) {
    try {
      const records = await dns.resolveMx(domain);
      return {
        type: 'MX',
        count: records.length,
        records: records.map(mx => ({
          exchange: mx.exchange,
          priority: mx.priority
        }))
      }
    } catch (error) {
      return { type: 'MX', error: error.message, records: [] }
    }
  }

  async getTXTRecords(domain) {
    try {
      const records = await dns.resolveTxt(domain);
      const flatRecords = records.map(record => record.join(''));

      // Analyze TXT records for security configurations
      const analysis = {
        spf: flatRecords.filter(r => r.includes('v=spf1')),
        dmarc: flatRecords.filter(r => r.includes('v=DMARC1')),
        dkim: flatRecords.filter(r => r.includes('v=DKIM1')),
        verification: flatRecords.filter(r =>
          r.includes('google-site-verification') ||
          r.includes('facebook-domain-verification') ||
          r.includes('MS=');
        ),
        other: flatRecords.filter(r =>
          !r.includes('v=spf1') &&
          !r.includes('v=DMARC1') &&
          !r.includes('v=DKIM1') &&
          !r.includes('google-site-verification') &&
          !r.includes('facebook-domain-verification') &&
          !r.includes('MS=');
        );
      }

      return {
        type: 'TXT',
        count: flatRecords.length,
        records: flatRecords,
        analysis;
      }
    } catch (error) {
      return { type: 'TXT', error: error.message, records: [] }
    }
  }

  async getNSRecords(domain) {
    try {
      const records = await dns.resolveNs(domain);
      return {
        type: 'NS',
        count: records.length,
        records: records.map(ns => ({ nameserver: ns }))
      }
    } catch (error) {
      return { type: 'NS', error: error.message, records: [] }
    }
  }

  async getSOARecord(domain) {
    try {
      const record = await dns.resolveSoa(domain);
      return {
        type: 'SOA',
        record: {
          nsname: record.nsname,
          hostmaster: record.hostmaster,
          serial: record.serial,
          refresh: record.refresh,
          retry: record.retry,
          expire: record.expire,
          minttl: record.minttl
        }
      }
    } catch (error) {
      return { type: 'SOA', error: error.message }
    }
  }

  async getSRVRecords(domain) {
    const services = ['_sip._tcp', '_xmpp-server._tcp', '_xmpp-client._tcp'];
    const results = [];

    for (const service of services) {
      try {
        const records = await dns.resolveSrv(`${service}.${domain}`);
        results.push(...records.map(srv => ({
          service,
          target: srv.name,
          port: srv.port,
          priority: srv.priority,
          weight: srv.weight
        })))
      } catch (error) {
        // Service not found, continue
      }
    }

    return {
      type: 'SRV',
      count: results.length,
      records: results
    }
  }

  async getReverseDNS(ip) {
    try {
      const hostnames = await dns.reverse(ip)
      return hostnames[0]
    } catch (error) {
      return null;
    }
  }

  /**;
   * DNS Security Analysis
   */;
  async analyzeDNSSecurity(domain) {
    const security = {
      dnssec: await this.checkDNSSEC(domain),
      doh: await this.checkDNSOverHTTPS(domain),
      dot: await this.checkDNSOverTLS(domain),
      caa: await this.checkCAARecords(domain),
      vulnerabilities: await this.checkDNSVulnerabilities(domain)
    }

    return security;
  }

  async checkDNSSEC(domain) {
    try {
      const { stdout } = await execAsync(`dig +dnssec ${domain} | grep -i dnssec`);
      return {
        enabled: stdout.length > 0,
        details: stdout.trim()
      }
    } catch (error) {
      return { enabled: false, error: error.message }
    }
  }

  async checkDNSOverHTTPS(domain) {
    try {
      // Check for DoH support
      const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=A`, {
        headers: { 'Accept': 'application/dns-json' }
      });
      return {
        supported: response.ok,
        provider: 'cloudflare'
      }
    } catch (error) {
      return { supported: false, error: error.message }
    }
  }

  async checkDNSOverTLS(domain) {
    // Simplified DoT check
    return {
      supported: false,
      note: 'DoT check requires specialized tools'
    }
  }

  async checkCAARecords(domain) {
    try {
      const { stdout } = await execAsync(`dig CAA ${domain}`);
      const hasCAA = stdout.includes('CAA');
      return {
        configured: hasCAA,
        records: hasCAA ? stdout.match(/CAA\s+\d+\s+.*/g) || [] : []
      }
    } catch (error) {
      return { configured: false, error: error.message }
    }
  }

  async checkDNSVulnerabilities(domain) {
    const vulnerabilities = [];

    try {
      // Check for zone transfer vulnerability
      const { stdout } = await execAsync(`dig AXFR ${domain}`);
      if (stdout.includes('Transfer failed') === false && stdout.includes('XFR size')) {
        vulnerabilities.push({
          type: 'Zone Transfer',
          severity: 'High',
          description: 'DNS zone transfer is allowed',
          mitigation: 'Restrict zone transfers to authorized servers only'
        });
      }
    } catch (error) {
      // Zone transfer properly restricted
    }

    // Check for DNS cache poisoning indicators
    try {
      const responses = await Promise.all(
        this.dnsServers.map(server => this.queryDNSServer(domain, server))
      );

      const uniqueResponses = new Set(responses.map(r => JSON.stringify(r)));
      if (uniqueResponses.size > 1) {
        vulnerabilities.push({
          type: 'Inconsistent DNS Responses',
          severity: 'Medium',
          description: 'Different DNS servers return different results',
          mitigation: 'Investigate DNS configuration consistency'
        });
      }
    } catch (error) {
      // Error in consistency check
    }

    return vulnerabilities;
  }

  async queryDNSServer(domain, server) {
    try {
      const { stdout } = await execAsync(`dig @${server} ${domain} +short`);
      return stdout.trim().split('\n').filter(line => line.length > 0);
    } catch (error) {
      return []
    }
  }

  /**;
   * DNS Health Check
   */;
  async performDNSHealthCheck(domain) {
    const health = {
      availability: {},
      performance: {},
      consistency: {}
    }

    // Check availability across multiple DNS servers
    const availabilityTests = await Promise.allSettled(
      this.dnsServers.map(server => this.testDNSAvailability(domain, server))
    );

    health.availability = {
      total_servers: this.dnsServers.length,
      successful: availabilityTests.filter(test => test.status === 'fulfilled').length,
      results: availabilityTests.map((test, index) => ({
        server: this.dnsServers[index],
        status: test.status,
        response_time: test.value?.responseTime || null,
        error: test.reason?.message || null
      }))
    }

    // Performance analysis
    const responseTimes = health.availability.results
      .filter(r => r.response_time !== null)
      .map(r => r.response_time);

    if (responseTimes.length > 0) {
      health.performance = {
        avg_response_time: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        min_response_time: Math.min(...responseTimes),
        max_response_time: Math.max(...responseTimes),
        performance_rating: this.calculatePerformanceRating(responseTimes)
      }
    }

    return health
  }

  async testDNSAvailability(domain, server) {
    const startTime = Date.now()
    try {
      const { stdout } = await execAsync(`dig @${server} ${domain} +time=5`);
      const responseTime = Date.now() - startTime;
      return {
        success: true,
        responseTime,
        response: stdout
      }
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error.message
      }
    }
  }

  calculatePerformanceRating(responseTimes) {
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    if (avgTime < 50) return 'Excellent';
    if (avgTime < 100) return 'Good';
    if (avgTime < 200) return 'Fair';
    return 'Poor';
  }

  /**;
   * Wildcard Detection
   */;
  async detectWildcards(domain) {
    const randomSubdomains = [
      `random-${Math.random().toString(36).substr(2, 9)}.${domain}`,
      `test-${Math.random().toString(36).substr(2, 9)}.${domain}`,
      `nonexistent-${Math.random().toString(36).substr(2, 9)}.${domain}`
    ];

    const results = await Promise.allSettled(
      randomSubdomains.map(sub => dns.resolve4(sub))
    );

    const resolvedCount = results.filter(r => r.status === 'fulfilled').length;

    return {
      wildcard_detected: resolvedCount > 0,
      confidence: resolvedCount / randomSubdomains.length,
      tested_subdomains: randomSubdomains,
      resolved_count: resolvedCount,
      recommendation: resolvedCount > 0 ?
        'Wildcard DNS detected. Use additional validation for subdomain enumeration.' :
        'No wildcard DNS detected. Standard enumeration should be reliable.'
    }
  }

  /**;
   * DNS Response Analysis
   */;
  async analyzeDNSResponses(domain) {
    const analysis = {
      response_codes: {},
      ttl_analysis: {},
      authority_analysis: {}
    }

    try {
      const { stdout } = await execAsync(`dig ${domain} +trace +additional`);

      // Parse response codes
      const responseCodes = stdout.match(/status: \w+/g) || [];
      analysis.response_codes = {
        codes: responseCodes,
        primary_status: responseCodes[0]?.split(': ')[1] || 'UNKNOWN'
      }

      // TTL Analysis
      const ttlMatches = stdout.match(/\d+\s+IN\s+/g) || [];
      const ttlValues = ttlMatches.map(match => parseInt(match.match(/\d+/)[0]));

      if (ttlValues.length > 0) {
        analysis.ttl_analysis = {
          min_ttl: Math.min(...ttlValues),
          max_ttl: Math.max(...ttlValues),
          avg_ttl: ttlValues.reduce((a, b) => a + b, 0) / ttlValues.length,
          recommendation: this.getTTLRecommendation(ttlValues)
        }
      }

      // Authority Analysis
      const authoritySection = stdout.match(/ AUTHORITY SECTION:(.*?);;/s);
      if (authoritySection) {
        analysis.authority_analysis = {
          has_authority: true,
          authority_records: authoritySection[1].trim().split('\n').filter(line => line.trim())
        }
      }

    } catch (error) {
      analysis.error = error.message;
    }

    return analysis;
  }

  getTTLRecommendation(ttlValues) {
    const avgTTL = ttlValues.reduce((a, b) => a + b, 0) / ttlValues.length;

    if (avgTTL < 300) {
      return 'Very low TTL detected. Good for rapid changes but increases DNS queries.';
    } else if (avgTTL < 3600) {
      return 'Low TTL detected. Balanced approach for moderate change frequency.';
    } else if (avgTTL < 86400) {
      return 'Standard TTL detected. Good balance between caching and flexibility.';
    } else {
      return 'High TTL detected. Excellent for static records but slow to propagate changes.';
    }
  }
}

module.exports = DNSAnalysisService;