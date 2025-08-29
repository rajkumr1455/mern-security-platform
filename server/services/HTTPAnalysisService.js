/**;
 * HTTP/HTTPS Deep Analysis Service
 * Comprehensive web technology and security analysis
 */;

const https = require('https');
const logger = require('../utils/logger');
const http = require('http');
const { URL } = require('url');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class HTTPAnalysisService {
  constructor() {
    this.userAgent = 'Sudomy-Enhanced-Scanner/1.0';
    this.timeout = 10000;
  }

  /**;
   * Comprehensive HTTP/HTTPS analysis
   */;
  async analyzeHTTP(url) {
    const results = {
      url,
      timestamp: new Date().toISOString(),
      basic_info: {},
      security_headers: {},
      ssl_analysis: {},
      technology_detection: {},
      response_analysis: {},
      security_assessment: {}
    }

    try {
      // Basic HTTP information
      results.basic_info = await this.getBasicHTTPInfo(url);

      // Security headers analysis
      results.security_headers = await this.analyzeSecurityHeaders(url);

      // SSL/TLS analysis for HTTPS
      if (url.startsWith('https://')) {
        results.ssl_analysis = await this.analyzeSSL()
      }

      // Technology detection
      results.technology_detection = await this.detectTechnologies(url);

      // Response analysis
      results.response_analysis = await this.analyzeHTTPResponse(url);

      // Security assessment
      results.security_assessment = await this.performSecurityAssessment(results);

      return results;
    } catch (error) {
      logger.error('HTTP Analysis error:', error);
      results.error = error.message;
      return results;
    }
  }

  /**;
   * Get basic HTTP information
   */;
  async getBasicHTTPInfo(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHTTPS = urlObj.protocol === 'https:';
      const client = isHTTPS ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHTTPS ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        timeout: this.timeout,
        headers: {
          'User-Agent': this.userAgent
        }
      }

      const req = client.request(options, (res) => {
        const info = {
          status_code: res.statusCode,
          status_message: res.statusMessage,
          http_version: res.httpVersion,
          headers: res.headers,
          protocol: isHTTPS ? 'HTTPS' : 'HTTP',
          response_time: Date.now() - startTime,
          content_length: res.headers['content-length'] || 'Unknown',
          content_type: res.headers['content-type'] || 'Unknown',
          server: res.headers['server'] || 'Unknown',
          last_modified: res.headers['last-modified'] || 'Unknown'
        }

        resolve(info);
      });

      const startTime = Date.now();

      req.on('error', (error) => {
        resolve({;
          error: error.message,
          accessible: false
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({;
          error: 'Request timeout',
          accessible: false
        });
      });

      req.end();
    });
  }

  /**;
   * Analyze security headers
   */;
  async analyzeSecurityHeaders(url) {
    const headers = await this.getFullHeaders(url);

    const securityHeaders = {
      strict_transport_security: {
        present: !!headers['strict-transport-security'],
        value: headers['strict-transport-security'] || null,
        analysis: this.analyzeHSTS(headers['strict-transport-security'])
      },
      content_security_policy: {
        present: !!headers['content-security-policy'],
        value: headers['content-security-policy'] || null,
        analysis: this.analyzeCSP(headers['content-security-policy'])
      },
      x_frame_options: {
        present: !!headers['x-frame-options'],
        value: headers['x-frame-options'] || null,
        analysis: this.analyzeXFrameOptions(headers['x-frame-options'])
      },
      x_content_type_options: {
        present: !!headers['x-content-type-options'],
        value: headers['x-content-type-options'] || null,
        analysis: this.analyzeXContentTypeOptions(headers['x-content-type-options'])
      },
      x_xss_protection: {
        present: !!headers['x-xss-protection'],
        value: headers['x-xss-protection'] || null,
        analysis: this.analyzeXXSSProtection(headers['x-xss-protection'])
      },
      referrer_policy: {
        present: !!headers['referrer-policy'],
        value: headers['referrer-policy'] || null,
        analysis: this.analyzeReferrerPolicy(headers['referrer-policy'])
      },
      permissions_policy: {
        present: !!headers['permissions-policy'],
        value: headers['permissions-policy'] || null,
        analysis: this.analyzePermissionsPolicy(headers['permissions-policy'])
      }
    }

    // Calculate security score
    const totalHeaders = Object.keys(securityHeaders).length;
    const presentHeaders = Object.values(securityHeaders).filter(h => h.present).length;

    securityHeaders.security_score = {
      score: Math.round((presentHeaders / totalHeaders) * 100),
      present_headers: presentHeaders,
      total_headers: totalHeaders,
      rating: this.getSecurityRating(presentHeaders, totalHeaders)
    }

    return securityHeaders;
  }

  async getFullHeaders(url) {
    return new Promise((resolve) => {
      const urlObj = new URL(url);
      const isHTTPS = urlObj.protocol === 'https:';
      const client = isHTTPS ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHTTPS ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        timeout: this.timeout,
        headers: {
          'User-Agent': this.userAgent
        }
      }

      const req = client.request(options, (res) => {
        resolve(res.headers);
      });

      req.on('error', () => {
        resolve({});
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({});
      });

      req.end();
    });
  }

  analyzeHSTS(hstsHeader) {
    if (!hstsHeader) {
      return {
        status: 'Missing',
        risk: 'High',
        recommendation: 'Implement HSTS to prevent protocol downgrade attacks'
      }
    }

    const maxAge = hstsHeader.match(/max-age=(\d+)/);
    const includeSubDomains = hstsHeader.includes('includeSubDomains');
    const preload = hstsHeader.includes('preload');

    return {
      status: 'Present',
      max_age: maxAge ? parseInt(maxAge[1]) : 0,
      include_subdomains: includeSubDomains,
      preload: preload,
      risk: maxAge && parseInt(maxAge[1]) >= 31536000 ? 'Low' : 'Medium',
      recommendation: maxAge && parseInt(maxAge[1]) >= 31536000 ?
        'HSTS properly configured' :
        'Consider increasing max-age to at least 1 year (31536000 seconds)'
    }
  }

  analyzeCSP(cspHeader) {
    if (!cspHeader) {
      return {
        status: 'Missing',
        risk: 'High',
        recommendation: 'Implement Content Security Policy to prevent XSS attacks'
      }
    }

    const directives = cspHeader.split(',').map(d => d.trim());
    const analysis = {
      status: 'Present',
      directives_count: directives.length,
      has_unsafe_inline: cspHeader.includes(''unsafe-inline''),
      has_unsafe_eval: cspHeader.includes(''unsafe-eval''),
      has_default_src: cspHeader.includes('default-src'),
      risk: 'Medium'
    }

    if (analysis.has_unsafe_inline || analysis.has_unsafe_eval) {
      analysis.risk = 'High';
      analysis.recommendation = 'Remove unsafe-inline and unsafe-eval directives';
    } else if (!analysis.has_default_src) {
      analysis.risk = 'Medium';
      analysis.recommendation = 'Consider adding default-src directive';
    } else {
      analysis.risk = 'Low';
      analysis.recommendation = 'CSP appears well configured';
    }

    return analysis;
  }

  analyzeXFrameOptions(xfoHeader) {
    if (!xfoHeader) {
      return {
        status: 'Missing',
        risk: 'Medium',
        recommendation: 'Implement X-Frame-Options to prevent clickjacking'
      }
    }

    const value = xfoHeader.toUpperCase();
    return {
      status: 'Present',
      value: value,
      risk: value === 'DENY' || value === 'SAMEORIGIN' ? 'Low' : 'Medium',
      recommendation: value === 'DENY' || value === 'SAMEORIGIN' ?
        'X-Frame-Options properly configured' :
        'Consider using DENY or SAMEORIGIN'
    }
  }

  analyzeXContentTypeOptions(xctoHeader) {
    return {
      status: xctoHeader ? 'Present' : 'Missing',
      value: xctoHeader || null,
      risk: xctoHeader === 'nosniff' ? 'Low' : 'Medium',
      recommendation: xctoHeader === 'nosniff' ?
        'X-Content-Type-Options properly configured' :
        'Set X-Content-Type-Options to nosniff'
    }
  }

  analyzeXXSSProtection(xxpHeader) {
    if (!xxpHeader) {
      return {
        status: 'Missing',
        risk: 'Medium',
        recommendation: 'Consider setting X-XSS-Protection (though CSP is preferred)'
      }
    }

    return {
      status: 'Present',
      value: xxpHeader,
      risk: xxpHeader.includes('1; mode=block') ? 'Low' : 'Medium',
      recommendation: 'X-XSS-Protection is deprecated, use CSP instead'
    }
  }

  analyzeReferrerPolicy(rpHeader) {
    return {
      status: rpHeader ? 'Present' : 'Missing',
      value: rpHeader || null,
      risk: rpHeader ? 'Low' : 'Low',
      recommendation: rpHeader ?
        'Referrer-Policy configured' :
        'Consider implementing Referrer-Policy for privacy'
    }
  }

  analyzePermissionsPolicy(ppHeader) {
    return {
      status: ppHeader ? 'Present' : 'Missing',
      value: ppHeader || null,
      risk: 'Low',
      recommendation: ppHeader ?
        'Permissions-Policy configured' :
        'Consider implementing Permissions-Policy for enhanced security'
    }
  }

  getSecurityRating(present, total) {
    const percentage = (present / total) * 100;
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Fair';
    return 'Poor';
  }

  /**;
   * SSL/TLS Analysis
   */;
  async analyzeSSL(url) {
    const urlObj = new URL(url);
    const analysis = {
      certificate: {},
      protocols: {},
      ciphers: {},
      vulnerabilities: []
    }

    try {
      // Certificate analysis
      analysis.certificate = await this.analyzeCertificate(urlObj.hostname);

      // Protocol and cipher analysis using OpenSSL
      analysis.protocols = await this.analyzeSSLProtocols(urlObj.hostname);
      analysis.ciphers = await this.analyzeSSLCiphers(urlObj.hostname);

      // Vulnerability checks
      analysis.vulnerabilities = await this.checkSSLVulnerabilities()

    } catch (error) {
      analysis.error = error.message;
    }

    return analysis;
  }

  async analyzeCertificate(hostname) {
    return new Promise((resolve) => {
      const options = {
        hostname,
        port: 443,
        method: 'GET',
        rejectUnauthorized: false
      }

      const req = https.request(options, (res) => {
        const cert = res.socket.getPeerCertificate(true);

        resolve({;
          subject: cert.subject,
          issuer: cert.issuer,
          valid_from: cert.valid_from,
          valid_to: cert.valid_to,
          fingerprint: cert.fingerprint,
          serial_number: cert.serialNumber,
          signature_algorithm: cert.sigalg,
          public_key_algorithm: cert.pubkey?.algorithm || 'Unknown',
          key_length: cert.bits || 'Unknown',
          san: cert.subjectaltname || 'None',
          days_until_expiry: Math.floor((new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24))
        });
      });

      req.on('error', (error) => {
        resolve({ error: error.message });
      });

      req.end();
    });
  }

  async analyzeSSLProtocols(hostname) {
    const protocols = ['ssl3', 'tls1', 'tls1_1', 'tls1_2', 'tls1_3'];
    const results = {}

    for (const protocol of protocols) {
      try {
        const { stdout } = await execAsync(
          `echo | openssl s_client -connect ${hostname}:443 -${protocol} 2>/dev/null | grep 'Protocol'`
        );
        results[protocol] = {
          supported: stdout.includes('Protocol'),
          details: stdout.trim()
        }
      } catch (error) {
        results[protocol] = {
          supported: false,
          error: 'Not supported or connection failed'
        }
      }
    }

    return results;
  }

  async analyzeSSLCiphers(hostname) {
    try {
      const { stdout } = await execAsync(
        `echo | openssl s_client -connect ${hostname}:443 -cipher ALL 2>/dev/null | grep 'Cipher'`
      );

      return {
        cipher_suite: stdout.trim(),
        analysis: this.analyzeCipherSecurity(stdout)
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  analyzeCipherSecurity(cipherInfo) {
    const analysis = {
      strength: 'Unknown',
      recommendations: []
    }

    if (cipherInfo.includes('AES256') || cipherInfo.includes('ChaCha20')) {
      analysis.strength = 'Strong';
    } else if (cipherInfo.includes('AES128')) {
      analysis.strength = 'Good';
    } else if (cipherInfo.includes('3DES') || cipherInfo.includes('RC4')) {
      analysis.strength = 'Weak';
      analysis.recommendations.push('Upgrade to modern cipher suites');
    }

    if (cipherInfo.includes('DHE') || cipherInfo.includes('ECDHE')) {
      analysis.perfect_forward_secrecy = true;
    } else {
      analysis.perfect_forward_secrecy = false;
      analysis.recommendations.push('Enable Perfect Forward Secrecy');
    }

    return analysis;
  }

  async checkSSLVulnerabilities(hostname) {
    const vulnerabilities = [];

    try {
      // Check for common SSL vulnerabilities
      const checks = [
        { name: 'Heartbleed', command: `echo | openssl s_client -connect ${hostname}:443 -tlsextdebug 2>&1 | grep -i heartbeat` },
        { name: 'POODLE', command: `echo | openssl s_client -connect ${hostname}:443 -ssl3 2>&1 | grep -i 'sslv3'` }
      ];

      for (const check of checks) {
        try {
          const { stdout } = await execAsync(check.command);
          if (stdout.trim()) {
            vulnerabilities.push({
              name: check.name,
              severity: check.name === 'Heartbleed' ? 'Critical' : 'High',
              description: `${check.name} vulnerability detected`,
              recommendation: `Disable ${check.name === 'POODLE' ? 'SSLv3' : 'heartbeat extension'}`
            });
          }
        } catch (error) {
          // Vulnerability not present
        }
      }
    } catch (error) {
      vulnerabilities.push({
        name: 'SSL Analysis Error',
        severity: 'Info',
        description: error.message
      });
    }

    return vulnerabilities;
  }

  /**;
   * Technology Detection
   */;
  async detectTechnologies(url) {
    const headers = await this.getFullHeaders(url);
    const body = await this.getPageContent(url);

    const technologies = {
      server: this.detectServer(headers),
      framework: this.detectFramework(headers, body),
      cms: this.detectCMS(headers, body),
      programming_language: this.detectProgrammingLanguage(headers, body),
      javascript_libraries: this.detectJavaScriptLibraries(body),
      analytics: this.detectAnalytics(body),
      security_tools: this.detectSecurityTools(headers)
    }

    return technologies;
  }

  async getPageContent(url) {
    return new Promise((resolve) => {
      const urlObj = new URL(url);
      const isHTTPS = urlObj.protocol === 'https:';
      const client = isHTTPS ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHTTPS ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        timeout: this.timeout,
        headers: {
          'User-Agent': this.userAgent
        }
      }

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('error', () => resolve(''));
      req.on('timeout', () => {
        req.destroy();
        resolve('');
      });

      req.end();
    });
  }

  detectServer(headers) {
    const server = headers['server'] || '';
    const xPoweredBy = headers['x-powered-by'] || '';

    return {
      server: server,
      x_powered_by: xPoweredBy,
      detected: this.parseServerInfo(server, xPoweredBy)
    }
  }

  parseServerInfo(server, xPoweredBy) {
    const detected = [];

    if (server.toLowerCase().includes('nginx')) detected.push('Nginx');
    if (server.toLowerCase().includes('apache')) detected.push('Apache');
    if (server.toLowerCase().includes('iis')) detected.push('IIS');
    if (server.toLowerCase().includes('cloudflare')) detected.push('Cloudflare');

    if (xPoweredBy.toLowerCase().includes('php')) detected.push('PHP');
    if (xPoweredBy.toLowerCase().includes('asp.net')) detected.push('ASP.NET');
    if (xPoweredBy.toLowerCase().includes('express')) detected.push('Express.js');

    return detected;
  }

  detectFramework(headers, body) {
    const frameworks = [];

    // React detection
    if (body.includes('react') || body.includes('React')) {
      frameworks.push('React');
    }

    // Angular detection
    if (body.includes('angular') || body.includes('ng-')) {
      frameworks.push('Angular');
    }

    // Vue.js detection
    if (body.includes('vue') || body.includes('Vue')) {
      frameworks.push('Vue.js');
    }

    // Bootstrap detection
    if (body.includes('bootstrap') || body.includes('Bootstrap')) {
      frameworks.push('Bootstrap');
    }

    return frameworks;
  }

  detectCMS(headers, body) {
    const cms = [];

    if (body.includes('wp-content') || body.includes('wordpress')) {
      cms.push('WordPress');
    }

    if (body.includes('drupal') || headers['x-drupal-cache']) {
      cms.push('Drupal');
    }

    if (body.includes('joomla')) {
      cms.push('Joomla');
    }

    return cms;
  }

  detectProgrammingLanguage(headers, body) {
    const languages = [];

    if (headers['x-powered-by']?.includes('PHP')) languages.push('PHP');
    if (headers['x-powered-by']?.includes('ASP.NET')) languages.push('ASP.NET');
    if (headers['server']?.includes('Express')) languages.push('Node.js');
    if (body.includes('django') || headers['server']?.includes('Django')) languages.push('Python/Django');

    return languages;
  }

  detectJavaScriptLibraries(body) {
    const libraries = [];

    if (body.includes('jquery') || body.includes('jQuery')) libraries.push('jQuery');
    if (body.includes('lodash')) libraries.push('Lodash');
    if (body.includes('axios')) libraries.push('Axios');
    if (body.includes('moment')) libraries.push('Moment.js');

    return libraries;
  }

  detectAnalytics(body) {
    const analytics = [];

    if (body.includes('google-analytics') || body.includes('gtag')) {
      analytics.push('Google Analytics');
    }

    if (body.includes('facebook.com/tr')) {
      analytics.push('Facebook Pixel');
    }

    if (body.includes('hotjar')) {
      analytics.push('Hotjar');
    }

    return analytics;
  }

  detectSecurityTools(headers) {
    const tools = [];

    if (headers['cf-ray']) tools.push('Cloudflare');
    if (headers['x-sucuri-id']) tools.push('Sucuri');
    if (headers['x-mod-pagespeed']) tools.push('PageSpeed');

    return tools;
  }

  /**;
   * Response Analysis
   */;
  async analyzeHTTPResponse(url) {
    const response = await this.getBasicHTTPInfo(url);

    return {
      status_analysis: this.analyzeStatusCode(response.status_code),
      performance_analysis: this.analyzePerformance(response.response_time),
      header_analysis: this.analyzeResponseHeaders(response.headers),
      redirect_analysis: await this.analyzeRedirects(url)
    }
  }

  analyzeStatusCode(statusCode) {
    const analysis = { code: statusCode }

    if (statusCode >= 200 && statusCode < 300) {
      analysis.category = 'Success';
      analysis.risk = 'None';
    } else if (statusCode >= 300 && statusCode < 400) {
      analysis.category = 'Redirection';
      analysis.risk = 'Low';
    } else if (statusCode >= 400 && statusCode < 500) {
      analysis.category = 'Client Error';
      analysis.risk = 'Medium';
    } else if (statusCode >= 500) {
      analysis.category = 'Server Error';
      analysis.risk = 'High';
    }

    return analysis;
  }

  analyzePerformance(responseTime) {
    return {
      response_time_ms: responseTime,
      rating: responseTime < 200 ? 'Excellent' :
              responseTime < 500 ? 'Good' :
              responseTime < 1000 ? 'Fair' : 'Poor'
    }
  }

  analyzeResponseHeaders(headers) {
    return {
      total_headers: Object.keys(headers).length,
      caching_headers: this.analyzeCachingHeaders(headers),
      compression: headers['content-encoding'] || 'None'
    }
  }

  analyzeCachingHeaders(headers) {
    return {
      cache_control: headers['cache-control'] || 'Not set',
      expires: headers['expires'] || 'Not set',
      etag: headers['etag'] || 'Not set',
      last_modified: headers['last-modified'] || 'Not set'
    }
  }

  async analyzeRedirects(url) {
    // This would follow redirects and analyze the chain
    return {
      redirect_chain: [],
      final_url: url,
      redirect_count: 0
    }
  }

  /**;
   * Security Assessment
   */;
  async performSecurityAssessment(results) {
    const assessment = {
      overall_score: 0,
      risk_level: 'Unknown',
      findings: [],
      recommendations: []
    }

    let score = 100;

    // Security headers assessment
    const headerScore = results.security_headers?.security_score?.score || 0;
    score = score * (headerScore / 100);

    if (headerScore < 50) {
      assessment.findings.push({
        category: 'Security Headers',
        severity: 'High',
        description: 'Missing critical security headers'
      });
      assessment.recommendations.push('Implement missing security headers');
    }

    // SSL assessment
    if (results.ssl_analysis?.vulnerabilities?.length > 0) {
      score -= 20;
      assessment.findings.push({
        category: 'SSL/TLS',
        severity: 'High',
        description: 'SSL/TLS vulnerabilities detected'
      });
      assessment.recommendations.push('Fix SSL/TLS configuration issues');
    }

    // Technology assessment
    if (results.technology_detection?.server?.server?.includes('Apache/2.2')) {
      score -= 10;
      assessment.findings.push({
        category: 'Technology',
        severity: 'Medium',
        description: 'Outdated server software detected'
      });
      assessment.recommendations.push('Update server software');
    }

    assessment.overall_score = Math.max(0, Math.round(score));
    assessment.risk_level = assessment.overall_score > 80 ? 'Low' :
                           assessment.overall_score > 60 ? 'Medium' : 'High';

    return assessment;
  }
}

module.exports = HTTPAnalysisService;