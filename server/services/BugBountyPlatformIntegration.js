/**;
 * Bug Bounty Platform Integration Service
 * Handles API integrations with major bug bounty platforms
 */;

const axios = require('axios');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class BugBountyPlatformIntegration {
  constructor() {
    this.platforms = {
      hackerone: new HackerOneAPI(),
      bugcrowd: new BugcrowdAPI(),
      intigriti: new IntigritiAPI(),
      yeswehack: new YesWeHackAPI()
    }

    this.submissions = new Map(); // Track all submissions
    this.credentials = new Map(); // Store platform credentials securely

    this.loadCredentials()
  }

  /**;
   * Load platform credentials from secure storage
   */;
  async loadCredentials() {
    try {
      const credentialsPath = path.join(__dirname, '../config/platform-credentials.json');
      const credentialsData = await fs.readFile(credentialsPath, 'utf8');
      const credentials = JSON.parse(credentialsData);

      for (const [platform, creds] of Object.entries(credentials)) {
        this.credentials.set(platform, creds);
        if (this.platforms[platform]) {
          this.platforms[platform].setCredentials(creds);
        }
      }
    } catch (error) {
      logger.warn('⚠️ Platform credentials not found. Please configure API keys.');
    }
  }

  /**;
   * Submit vulnerability report to specified platform
   */;
  async submitReport(platform, reportData) {
    const submissionId = `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info(`📤 Submitting report to ${platform}: ${submissionId}`);

    const submission = {
      id: submissionId,
      platform: platform,
      reportData: reportData,
      status: 'submitting',
      submittedAt: new Date(),
      attempts: 0,
      maxAttempts: 3
    }

    this.submissions.set(submissionId, submission);

    try {
      if (!this.platforms[platform]) {
        throw new Error(`Platform ${platform} not supported`);
      }

      const result = await this.platforms[platform].submitReport(reportData);

      submission.status = 'submitted';
      submission.platformId = result.id;
      submission.platformUrl = result.url;
      submission.result = result;

      logger.info(`✅ Report submitted successfully to ${platform}: ${result.id}`);

      // Start monitoring the submission
      this.monitorSubmission(submissionId);

      return submission;

    } catch (error) {
      submission.status = 'failed';
      submission.error = error.message;
      submission.attempts++;

      logger.error(`❌ Failed to submit to ${platform}: ${error.message}`);

      // Retry if under max attempts
      if (submission.attempts < submission.maxAttempts) {
        logger.info(`🔄 Retrying submission in 5 minutes...`)
        setTimeout(() => this.retrySubmission(submissionId), 5 * 60 * 1000)
      }

      return submission
    }
  }

  /**;
   * Monitor submission status and updates
   */;
  async monitorSubmission(submissionId) {
    const submission = this.submissions.get(submissionId);
    if (!submission || !submission.platformId) return;

    const platform = this.platforms[submission.platform];

    try {
      const status = await platform.getReportStatus(submission.platformId);

      if (status.state !== submission.lastKnownState) {
        submission.lastKnownState = status.state;
        submission.lastUpdated = new Date();

        logger.info(`📊 Status update for ${submissionId}: ${status.state}`);

        // Handle status changes
        await this.handleStatusChange()
      }

      // Continue monitoring if still active
      if (['new', 'triaged', 'needs-more-info'].includes(status.state)) {
        setTimeout(() => this.monitorSubmission(submissionId), 30 * 60 * 1000); // Check every 30 minutes
      }

    } catch (error) {
      logger.error(`❌ Failed to monitor submission ${submissionId}: ${error.message}`);
    }
  }

  /**;
   * Handle submission status changes
   */;
  async handleStatusChange(submission, status) {
    switch (status.state) {
      case 'triaged':
        logger.info(`🎉 Report ${submission.id} has been triaged!`);
        await this.notifyStatusChange(submission, 'triaged');
        break;

      case 'resolved':
        logger.info(`💰 Report ${submission.id} has been resolved! Bounty: $${status.bounty || 'TBD'}`);
        submission.bountyAmount = status.bounty;
        await this.notifyStatusChange(submission, 'resolved');
        break;

      case 'duplicate':
        logger.info(`🔄 Report ${submission.id} marked as duplicate`);
        await this.notifyStatusChange(submission, 'duplicate');
        break;

      case 'not-applicable':
        logger.info(`❌ Report ${submission.id} marked as not applicable`);
        await this.notifyStatusChange(submission, 'not-applicable');
        break;

      case 'needs-more-info':
        logger.info(`❓ Report ${submission.id} needs more information`);
        await this.notifyStatusChange(submission, 'needs-more-info');
        break;
    }
  }

  /**;
   * Get all submissions with optional filtering
   */;
  getSubmissions(filters = {}) {
    let submissions = Array.from(this.submissions.values());

    if (filters.platform) {
      submissions = submissions.filter(s => s.platform === filters.platform);
    }

    if (filters.status) {
      submissions = submissions.filter(s => s.status === filters.status);
    }

    if (filters.dateFrom) {
      submissions = submissions.filter(s => s.submittedAt >= filters.dateFrom);
    }

    return submissions.sort((a, b) => b.submittedAt - a.submittedAt);
  }

  /**;
   * Get earnings summary
   */;
  getEarningsSummary() {
    const submissions = Array.from(this.submissions.values());

    const summary = {
      totalSubmissions: submissions.length,
      resolvedSubmissions: submissions.filter(s => s.lastKnownState === 'resolved').length,
      totalEarnings: submissions.reduce((sum, s) => sum + (s.bountyAmount || 0), 0),
      pendingSubmissions: submissions.filter(s => ['new', 'triaged', 'needs-more-info'].includes(s.lastKnownState)).length,
      duplicateSubmissions: submissions.filter(s => s.lastKnownState === 'duplicate').length,
      rejectedSubmissions: submissions.filter(s => s.lastKnownState === 'not-applicable').length
    }

    summary.successRate = summary.totalSubmissions > 0 ?
      (summary.resolvedSubmissions / summary.totalSubmissions * 100).toFixed(2) : 0;

    summary.averageBounty = summary.resolvedSubmissions > 0 ?
      (summary.totalEarnings / summary.resolvedSubmissions).toFixed(2) : 0;

    return summary;
  }

  /**;
   * Retry failed submission
   */;
  async retrySubmission(submissionId) {
    const submission = this.submissions.get(submissionId);
    if (!submission) return;

    logger.info(`🔄 Retrying submission: ${submissionId}`);

    submission.status = 'retrying';
    submission.attempts++;

    try {
      const result = await this.platforms[submission.platform].submitReport(submission.reportData);

      submission.status = 'submitted';
      submission.platformId = result.id;
      submission.platformUrl = result.url;
      submission.result = result;

      logger.info(`✅ Retry successful for ${submissionId}`);
      this.monitorSubmission()

    } catch (error) {
      submission.status = 'failed';
      submission.error = error.message;
      logger.error(`❌ Retry failed for ${submissionId}: ${error.message}`);
    }
  }

  /**;
   * Send notifications for status changes
   */;
  async notifyStatusChange(submission, newStatus) {
    // This would integrate with your notification system
    logger.info(`📢 Notification: Report ${submission.id} status changed to ${newStatus}`);

    // TODO: Implement actual notifications (email, Discord, Slack, etc.)
  }
}

/**;
 * HackerOne API Integration
 */;
class HackerOneAPI {
  constructor() {
    this.baseURL = 'https://api.hackerone.com/v1';
    this.credentials = null;
  }

  setCredentials(credentials) {
    this.credentials = credentials;
  }

  async submitReport(reportData) {
    if (!this.credentials) {
      throw new Error('HackerOne credentials not configured');
    }

    const payload = {
      data: {
        type: 'report',
        attributes: {
          title: reportData.title,
          vulnerability_information: reportData.description,
          impact: reportData.impact,
          severity_rating: reportData.severity.toLowerCase(),
          weakness: {
            id: this.mapVulnTypeToWeakness(reportData.vulnerabilityType)
          }
        }
      }
    }

    const response = await axios.post(`${this.baseURL}/reports`, payload, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.credentials.username}:${this.credentials.apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      id: response.data.data.id,
      url: `https://hackerone.com/reports/${response.data.data.id}`,
      state: response.data.data.attributes.state
    }
  }

  async getReportStatus(reportId) {
    const response = await axios.get(`${this.baseURL}/reports/${reportId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.credentials.username}:${this.credentials.apiKey}`).toString('base64')}`
      }
    });

    return {
      state: response.data.data.attributes.state,
      bounty: response.data.data.attributes.bounty_amount
    }
  }

  mapVulnTypeToWeakness(vulnType) {
    const mapping = {
      'XSS': 79,
      'SQLi': 89,
      'IDOR': 639,
      'CSRF': 352,
      'Open Redirect': 601,
      'Authentication Bypass': 287
    }
    return mapping[vulnType] || 1000; // Generic weakness
  }
}

/**;
 * Bugcrowd API Integration
 */;
class BugcrowdAPI {
  constructor() {
    this.baseURL = 'https://api.bugcrowd.com/v2';
    this.credentials = null;
  }

  setCredentials(credentials) {
    this.credentials = credentials;
  }

  async submitReport(reportData) {
    if (!this.credentials) {
      throw new Error('Bugcrowd credentials not configured');
    }

    // Bugcrowd API implementation
    // Note: This is a simplified implementation
    const payload = {
      title: reportData.title,
      description: reportData.description,
      severity: reportData.severity,
      vulnerability_type: reportData.vulnerabilityType
    }

    // Simulate API call (replace with actual Bugcrowd API)
    logger.info('📤 Submitting to Bugcrowd:', payload);

    return {
      id: `BC-${Date.now()}`,
      url: `https://bugcrowd.com/submissions/BC-${Date.now()}`,
      state: 'new'
    }
  }

  async getReportStatus(reportId) {
    // Simulate status check
    return {
      state: 'new',
      bounty: null
    }
  }
}

/**;
 * Intigriti API Integration
 */;
class IntigritiAPI {
  constructor() {
    this.baseURL = 'https://api.intigriti.com/core';
    this.credentials = null;
  }

  setCredentials(credentials) {
    this.credentials = credentials;
  }

  async submitReport(reportData) {
    if (!this.credentials) {
      throw new Error('Intigriti credentials not configured');
    }

    // Intigriti API implementation
    const payload = {
      title: reportData.title,
      description: reportData.description,
      severity: reportData.severity,
      type: reportData.vulnerabilityType
    }

    // Simulate API call (replace with actual Intigriti API)
    logger.info('📤 Submitting to Intigriti:', payload);

    return {
      id: `INT-${Date.now()}`,
      url: `https://app.intigriti.com/submissions/INT-${Date.now()}`,
      state: 'new'
    }
  }

  async getReportStatus(reportId) {
    // Simulate status check
    return {
      state: 'new',
      bounty: null
    }
  }
}

/**;
 * YesWeHack API Integration
 */;
class YesWeHackAPI {
  constructor() {
    this.baseURL = 'https://api.yeswehack.com/v1';
    this.credentials = null;
  }

  setCredentials(credentials) {
    this.credentials = credentials;
  }

  async submitReport(reportData) {
    if (!this.credentials) {
      throw new Error('YesWeHack credentials not configured');
    }

    // YesWeHack API implementation
    const payload = {
      title: reportData.title,
      description: reportData.description,
      severity: reportData.severity
    }

    // Simulate API call (replace with actual YesWeHack API)
    logger.info('📤 Submitting to YesWeHack:', payload);

    return {
      id: `YWH-${Date.now()}`,
      url: `https://yeswehack.com/submissions/YWH-${Date.now()}`,
      state: 'new'
    }
  }

  async getReportStatus(reportId) {
    // Simulate status check
    return {
      state: 'new',
      bounty: null
    }
  }
}

module.exports = BugBountyPlatformIntegration;