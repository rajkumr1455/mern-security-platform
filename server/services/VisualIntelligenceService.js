/**;
 * Visual Intelligence and Screenshot Analysis Service
 * Phase 2: Medium Priority Implementation
 */;

const puppeteer = require('puppeteer');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class VisualIntelligenceService {
  constructor() {
    this.screenshotDir = path.join(__dirname, '../screenshots');
    this.browser = null;
    this.screenshotQueue = [];
    this.processingQueue = false;
  }

  /**;
   * Initialize browser instance
   */;
  async initializeBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ]
      });
    }
    return this.browser;
  }

  /**;
   * Capture screenshots for multiple URLs
   */;
  async captureScreenshots(urls, options = {}) {
    const results = {
      timestamp: new Date().toISOString(),
      total_urls: urls.length,
      screenshots: [],
      analysis: {},
      errors: []
    }

    try {
      // Ensure screenshot directory exists
      await fs.mkdir(this.screenshotDir, { recursive: true });

      // Initialize browser
      await this.initializeBrowser();

      // Process URLs in batches to avoid overwhelming the system
      const batchSize = 5;
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        const batchResults = await this.processBatch(batch, options);
        results.screenshots.push(...batchResults.screenshots)
        results.errors.push(...batchResults.errors)
      }

      // Perform visual analysis
      if (results.screenshots.length > 0) {
        results.analysis = await this.performVisualAnalysis()
      }

      return results
    } catch (error) {
      logger.error('Screenshot capture error:', error);
      results.error = error.message;
      return results;
    }
  }

  /**;
   * Process a batch of URLs
   */;
  async processBatch(urls, options) {
    const results = {
      screenshots: [],
      errors: []
    }

    const promises = urls.map(url => this.captureScreenshot(url, options));
    const batchResults = await Promise.allSettled(promises);

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.screenshots.push(result.value);
      } else {
        results.errors.push({
          url: urls[index],
          error: result.reason.message
        });
      }
    });

    return results;
  }

  /**;
   * Capture screenshot for a single URL
   */;
  async captureScreenshot(url, options = {}) {
    const {
      viewport = { width: 1920, height: 1080 },
      timeout = 30000,
      waitFor = 'networkidle2',
      fullPage = true
    } = options;

    try {
      const page = await this.browser.newPage();

      // Set viewport
      await page.setViewport(viewport);

      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      // Navigate to URL
      const response = await page.goto(url, {
        waitUntil: waitFor,
        timeout;
      });

      // Generate filename
      const urlHash = crypto.createHash('md5').update(url).digest('hex');
      const timestamp = Date.now();
      const filename = `screenshot_${urlHash}_${timestamp}.png`;
      const filepath = path.join(this.screenshotDir, filename);

      // Capture screenshot
      await page.screenshot({
        path: filepath,
        fullPage,
        type: 'png'
      });

      // Get page info
      const pageInfo = await this.extractPageInfo(page);

      await page.close();

      return {
        url,
        filename,
        filepath,
        status_code: response.status(),
        timestamp: new Date().toISOString(),
        page_info: pageInfo,
        file_size: await this.getFileSize(filepath)
      }

    } catch (error) {
      throw new Error(`Screenshot failed for ${url}: ${error.message}`);
    }
  }

  /**;
   * Extract page information
   */;
  async extractPageInfo(page) {
    try {
      return await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          has_forms: document.forms.length > 0,
          has_images: document.images.length,
          has_links: document.links.length,
          technologies: this.detectTechnologies(),
          meta_info: this.extractMetaInfo()
        }
      });
    } catch (error) {
      return {
        title: 'Unknown',
        error: error.message
      }
    }
  }

  /**;
   * Get file size
   */;
  async getFileSize(filepath) {
    try {
      const stats = await fs.stat(filepath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  /**;
   * Perform visual analysis on screenshots
   */;
  async performVisualAnalysis(screenshots) {
    const analysis = {
      similarity_analysis: {},
      technology_fingerprinting: {},
      visual_patterns: {},
      anomaly_detection: {},
      content_analysis: {}
    }

    try {
      // Visual similarity analysis
      analysis.similarity_analysis = await this.analyzeSimilarity(screenshots);

      // Technology fingerprinting from screenshots
      analysis.technology_fingerprinting = await this.fingerprintTechnologies(screenshots);

      // Visual pattern detection
      analysis.visual_patterns = await this.detectVisualPatterns(screenshots);

      // Anomaly detection
      analysis.anomaly_detection = await this.detectAnomalies(screenshots);

      // Content analysis
      analysis.content_analysis = await this.analyzeContent()

    } catch (error) {
      analysis.error = error.message;
    }

    return analysis;
  }

  /**;
   * Analyze visual similarity between screenshots
   */;
  async analyzeSimilarity(screenshots) {
    const similarity = {
      groups: [],
      unique_designs: 0,
      similarity_matrix: {},
      identical_pages: []
    }

    try {
      // Simple similarity analysis based on page info
      const groups = new Map();

      screenshots.forEach((screenshot, index) => {
        const key = this.generateSimilarityKey(screenshot);
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key).push({
          index,
          url: screenshot.url,
          screenshot: screenshot.filename
        });
      });

      // Convert to array format
      similarity.groups = Array.from(groups.entries()).map(([key, items]) => ({
        similarity_key: key,
        count: items.length,
        urls: items
      }));

      similarity.unique_designs = similarity.groups.length;

      // Find identical pages (more than one URL with same key)
      similarity.identical_pages = similarity.groups
        .filter(group => group.count > 1)
        .map(group => ({
          urls: group.urls.map(item => item.url),
          count: group.count
        }));

    } catch (error) {
      similarity.error = error.message;
    }

    return similarity;
  }

  /**;
   * Generate similarity key based on page characteristics
   */;
  generateSimilarityKey(screenshot) {
    const pageInfo = screenshot.page_info || {}

    // Create a simple key based on page characteristics
    const characteristics = [
      pageInfo.title?.substring(0, 20) || 'unknown',
      pageInfo.has_forms ? 'forms' : 'no-forms',
      pageInfo.has_images > 10 ? 'many-images' : 'few-images',
      pageInfo.has_links > 20 ? 'many-links' : 'few-links'
    ];

    return crypto.createHash('md5')
      .update(characteristics.join('|'));
      .digest('hex');
      .substring(0, 8);
  }

  /**;
   * Technology fingerprinting from visual elements
   */;
  async fingerprintTechnologies(screenshots) {
    const fingerprinting = {
      detected_technologies: {},
      frameworks: {},
      cms_systems: {},
      patterns: {}
    }

    screenshots.forEach(screenshot => {
      const pageInfo = screenshot.page_info || {}
      const url = screenshot.url;

      // Analyze technologies from page info
      if (pageInfo.technologies) {
        Object.entries(pageInfo.technologies).forEach(([tech, confidence]) => {
          if (!fingerprinting.detected_technologies[tech]) {
            fingerprinting.detected_technologies[tech] = []
          }
          fingerprinting.detected_technologies[tech].push({
            url,
            confidence,
            screenshot: screenshot.filename
          });
        });
      }

      // Detect patterns from title and meta info
      const title = pageInfo.title?.toLowerCase() || '';

      // WordPress detection
      if (title.includes('wordpress') || pageInfo.meta_info?.generator?.includes('WordPress')) {
        this.addTechDetection()
      }

      // React detection (simplified)
      if (pageInfo.meta_info?.viewport || title.includes('react')) {
        this.addTechDetection()
      }

      // Bootstrap detection
      if (pageInfo.has_images > 5 && pageInfo.has_links > 10) {
        this.addTechDetection()
      }
    });

    return fingerprinting;
  }

  addTechDetection(category, tech, url, screenshot) {
    if (!category[tech]) {
      category[tech] = []
    }
    category[tech].push({ url, screenshot });
  }

  /**;
   * Detect visual patterns across screenshots
   */;
  async detectVisualPatterns(screenshots) {
    const patterns = {
      login_pages: [],
      admin_interfaces: [],
      error_pages: [],
      landing_pages: [],
      api_documentation: []
    }

    screenshots.forEach(screenshot => {
      const pageInfo = screenshot.page_info || {}
      const title = pageInfo.title?.toLowerCase() || '';
      const url = screenshot.url.toLowerCase();

      // Login page detection
      if (title.includes('login') || title.includes('sign in') || url.includes('login') || pageInfo.has_forms) {
        patterns.login_pages.push({
          url: screenshot.url,
          screenshot: screenshot.filename,
          confidence: this.calculateLoginConfidence(pageInfo, url)
        });
      }

      // Admin interface detection
      if (title.includes('admin') || title.includes('dashboard') || url.includes('admin')) {
        patterns.admin_interfaces.push({
          url: screenshot.url,
          screenshot: screenshot.filename,
          confidence: this.calculateAdminConfidence(pageInfo, url)
        });
      }

      // Error page detection
      if (title.includes('error') || title.includes('404') || title.includes('not found')) {
        patterns.error_pages.push({
          url: screenshot.url,
          screenshot: screenshot.filename,
          error_type: this.detectErrorType(title, pageInfo)
        });
      }

      // API documentation detection
      if (title.includes('api') || title.includes('documentation') || title.includes('docs')) {
        patterns.api_documentation.push({
          url: screenshot.url,
          screenshot: screenshot.filename,
          doc_type: this.detectDocType(title, pageInfo)
        });
      }

      // Landing page detection (pages with many images and links)
      if (pageInfo.has_images > 5 && pageInfo.has_links > 15 && !url.includes('admin')) {
        patterns.landing_pages.push({
          url: screenshot.url,
          screenshot: screenshot.filename,
          elements: {
            images: pageInfo.has_images,
            links: pageInfo.has_links
          }
        });
      }
    });

    return patterns;
  }

  calculateLoginConfidence(pageInfo, url) {
    let confidence = 0;
    if (url.includes('login')) confidence += 40;
    if (pageInfo.title?.toLowerCase().includes('login')) confidence += 30;
    if (pageInfo.has_forms) confidence += 20;
    if (pageInfo.title?.toLowerCase().includes('sign')) confidence += 10;
    return Math.min(confidence, 100);
  }

  calculateAdminConfidence(pageInfo, url) {
    let confidence = 0;
    if (url.includes('admin')) confidence += 50;
    if (pageInfo.title?.toLowerCase().includes('admin')) confidence += 30;
    if (pageInfo.title?.toLowerCase().includes('dashboard')) confidence += 20;
    return Math.min(confidence, 100);
  }

  detectErrorType(title, pageInfo) {
    if (title.includes('404')) return '404 Not Found';
    if (title.includes('403')) return '403 Forbidden';
    if (title.includes('500')) return '500 Internal Server Error';
    if (title.includes('error')) return 'Generic Error';
    return 'Unknown Error';
  }

  detectDocType(title, pageInfo) {
    if (title.includes('api')) return 'API Documentation';
    if (title.includes('swagger')) return 'Swagger API';
    if (title.includes('docs')) return 'General Documentation';
    return 'Unknown Documentation';
  }

  /**;
   * Detect anomalies in screenshots
   */;
  async detectAnomalies(screenshots) {
    const anomalies = {
      suspicious_pages: [],
      potential_phishing: [],
      unusual_patterns: [],
      security_concerns: []
    }

    screenshots.forEach(screenshot => {
      const pageInfo = screenshot.page_info || {}
      const url = screenshot.url;

      // Detect suspicious pages
      if (this.isSuspiciousPage(pageInfo, url)) {
        anomalies.suspicious_pages.push({
          url,
          screenshot: screenshot.filename,
          reasons: this.getSuspiciousReasons(pageInfo, url)
        });
      }

      // Detect potential phishing
      if (this.isPotentialPhishing(pageInfo, url)) {
        anomalies.potential_phishing.push({
          url,
          screenshot: screenshot.filename,
          indicators: this.getPhishingIndicators(pageInfo, url)
        });
      }

      // Detect unusual patterns
      const unusualness = this.detectUnusualness(pageInfo, url);
      if (unusualness.score > 50) {
        anomalies.unusual_patterns.push({
          url,
          screenshot: screenshot.filename,
          unusualness_score: unusualness.score,
          reasons: unusualness.reasons
        });
      }
    });

    return anomalies;
  }

  isSuspiciousPage(pageInfo, url) {
    // Simple heuristics for suspicious pages
    const title = pageInfo.title?.toLowerCase() || '';

    return (
      title.includes('phishing') ||
      title.includes('malware') ||
      url.includes('suspicious') ||
      (pageInfo.has_forms && pageInfo.title?.includes('verify'))
    );
  }

  getSuspiciousReasons(pageInfo, url) {
    const reasons = [];
    const title = pageInfo.title?.toLowerCase() || '';

    if (title.includes('phishing')) reasons.push('Title contains phishing keywords');
    if (title.includes('malware')) reasons.push('Title contains malware keywords');
    if (url.includes('suspicious')) reasons.push('URL contains suspicious keywords');
    if (pageInfo.has_forms && title.includes('verify')) {
      reasons.push('Verification form detected');
    }

    return reasons;
  }

  isPotentialPhishing(pageInfo, url) {
    const title = pageInfo.title?.toLowerCase() || '';

    // Look for common phishing indicators
    return (
      (title.includes('verify') && pageInfo.has_forms) ||
      (title.includes('security') && title.includes('alert')) ||
      (title.includes('suspended') && pageInfo.has_forms)
    );
  }

  getPhishingIndicators(pageInfo, url) {
    const indicators = [];
    const title = pageInfo.title?.toLowerCase() || '';

    if (title.includes('verify') && pageInfo.has_forms) {
      indicators.push('Verification form with suspicious title');
    }
    if (title.includes('security') && title.includes('alert')) {
      indicators.push('Security alert pattern');
    }
    if (title.includes('suspended')) {
      indicators.push('Account suspension claim');
    }

    return indicators;
  }

  detectUnusualness(pageInfo, url) {
    let score = 0;
    const reasons = [];

    // Very few or too many elements can be unusual
    if (pageInfo.has_images === 0) {
      score += 20;
      reasons.push('No images detected');
    }
    if (pageInfo.has_links === 0) {
      score += 30;
      reasons.push('No links detected');
    }
    if (pageInfo.has_images > 100) {
      score += 25;
      reasons.push('Unusually high number of images');
    }

    // Very short or very long titles
    const titleLength = pageInfo.title?.length || 0;
    if (titleLength < 5) {
      score += 15;
      reasons.push('Unusually short title');
    }
    if (titleLength > 100) {
      score += 15;
      reasons.push('Unusually long title');
    }

    return { score, reasons }
  }

  /**;
   * Analyze content from screenshots
   */;
  async analyzeContent(screenshots) {
    const analysis = {
      content_types: {},
      language_detection: {},
      form_analysis: {},
      security_elements: {}
    }

    screenshots.forEach(screenshot => {
      const pageInfo = screenshot.page_info || {}
      const url = screenshot.url;

      // Content type analysis
      const contentType = this.determineContentType(pageInfo, url);
      if (!analysis.content_types[contentType]) {
        analysis.content_types[contentType] = []
      }
      analysis.content_types[contentType].push({
        url,
        screenshot: screenshot.filename
      });

      // Form analysis
      if (pageInfo.has_forms) {
        if (!analysis.form_analysis.pages_with_forms) {
          analysis.form_analysis.pages_with_forms = []
        }
        analysis.form_analysis.pages_with_forms.push({
          url,
          screenshot: screenshot.filename,
          form_indicators: this.analyzeFormIndicators(pageInfo)
        });
      }

      // Security elements
      const securityElements = this.detectSecurityElements(pageInfo, url);
      if (securityElements.length > 0) {
        if (!analysis.security_elements.pages_with_security) {
          analysis.security_elements.pages_with_security = []
        }
        analysis.security_elements.pages_with_security.push({
          url,
          screenshot: screenshot.filename,
          elements: securityElements
        });
      }
    });

    return analysis;
  }

  determineContentType(pageInfo, url) {
    const title = pageInfo.title?.toLowerCase() || '';

    if (title.includes('api') || url.includes('api')) return 'API';
    if (title.includes('admin') || url.includes('admin')) return 'Admin Interface';
    if (title.includes('blog') || url.includes('blog')) return 'Blog';
    if (pageInfo.has_forms) return 'Form Page';
    if (pageInfo.has_images > 10) return 'Media Rich';
    return 'Standard Web Page';
  }

  analyzeFormIndicators(pageInfo) {
    const indicators = [];

    if (pageInfo.title?.toLowerCase().includes('login')) {
      indicators.push('Login form');
    }
    if (pageInfo.title?.toLowerCase().includes('contact')) {
      indicators.push('Contact form');
    }
    if (pageInfo.title?.toLowerCase().includes('register')) {
      indicators.push('Registration form');
    }

    return indicators;
  }

  detectSecurityElements(pageInfo, url) {
    const elements = [];

    if (url.startsWith('https://')) {
      elements.push('HTTPS enabled');
    }
    if (pageInfo.title?.toLowerCase().includes('secure')) {
      elements.push('Security-focused page');
    }
    if (pageInfo.meta_info?.security) {
      elements.push('Security meta tags');
    }

    return elements;
  }

  /**;
   * Cleanup browser instance
   */;
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**;
   * Get screenshot file
   */;
  async getScreenshot(filename) {
    try {
      const filepath = path.join(this.screenshotDir, filename);
      return await fs.readFile(filepath);
    } catch (error) {
      throw new Error(`Screenshot not found: ${filename}`);
    }
  }

  /**;
   * Delete old screenshots
   */;
  async cleanupOldScreenshots(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    try {
      const files = await fs.readdir(this.screenshotDir);
      const now = Date.now();

      for (const file of files) {
        const filepath = path.join(this.screenshotDir, file);
        const stats = await fs.stat(filepath);

        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filepath);
        }
      }
    } catch (error) {
      logger.error('Screenshot cleanup error:', error);
    }
  }
}

module.exports = VisualIntelligenceService;