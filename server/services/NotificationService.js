/**;
 * Notification Service
 * Phase 3: Advanced Integrations - Email, Slack, Webhooks
 */;

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
// Note: @slack/webhook might not be available, using fetch instead for webhooks
// const { WebhookClient } = require('@slack/webhook');

class NotificationService {
  constructor() {
    this.emailTransporter = null;
    this.slackClients = new Map();
    this.webhookEndpoints = new Map();
    this.notificationHistory = [];
    this.templates = new Map();

    // Initialize notification channels
    this.initializeNotificationChannels();
    this.loadNotificationTemplates()
  }

  /**;
   * Initialize notification channels
   */;
  initializeNotificationChannels() {
    logger.info('📧 [NOTIFICATIONS] Initializing notification channels...')

    // Initialize email transporter
    this.initializeEmailTransporter()

    logger.info('✅ [NOTIFICATIONS] Notification channels initialized')
  }

  /**;
   * Initialize email transporter
   */;
  initializeEmailTransporter() {
    // In production, use actual SMTP configuration
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'notifications@example.com',
        pass: process.env.SMTP_PASS || 'password'
      }
    });

    logger.info('📧 [NOTIFICATIONS] Email transporter initialized');
  }

  /**;
   * Load notification templates
   */;
  loadNotificationTemplates() {
    // Email templates
    this.templates.set('email_scan_complete', {
      subject: '✅ Sudomy Scan Complete - {{target}}',
      html: `
        <h2>🔍 Sudomy Scan Complete</h2>
        <p><strong>Target:</strong> {{target}}</p>
        <p><strong>Scan ID:</strong> {{scan_id}}</p>
        <p><strong>Completed:</strong> {{completed_at}}</p>

        <h3>📊 Summary</h3>
        <ul>;
          <li><strong>Subdomains Found:</strong> {{total_subdomains}}</li>
          <li><strong>Active Services:</strong> {{active_subdomains}}</li>
          <li><strong>Security Score:</strong> {{security_score}}%</li>
          <li><strong>Risk Level:</strong> {{risk_level}}</li>
        </ul>;

        <h3>🚨 Vulnerabilities</h3>
        <ul>;
          <li><strong>Critical:</strong> {{critical_issues}}</li>
          <li><strong>High:</strong> {{high_issues}}</li>
          <li><strong>Medium:</strong> {{medium_issues}}</li>
          <li><strong>Low:</strong> {{low_issues}}</li>
        </ul>;

        <p><a href='{{dashboard_url}}'>View Full Report</a></p>
      `;
    });

    this.templates.set('email_vulnerability_alert', {
      subject: '🚨 Critical Vulnerability Detected - {{target}}',
      html: `
        <h2>🚨 Critical Vulnerability Alert</h2>
        <p><strong>Target:</strong> {{target}}</p>
        <p><strong>Severity:</strong> <span style='color: red;'>{{severity}}</span></p>
        <p><strong>Detected:</strong> {{detected_at}}</p>

        <h3>📋 Details</h3>
        <p>{{vulnerability_description}}</p>

        <h3>💡 Recommendation</h3>
        <p>{{recommendation}}</p>

        <p><strong>Immediate Action Required!</strong></p>
        <p><a href='{{dashboard_url}}'>View Details</a></p>
      `;
    });

    this.templates.set('email_threat_detected', {
      subject: '⚠️ Threat Intelligence Alert - {{target}}',
      html: `
        <h2>⚠️ Threat Intelligence Alert</h2>
        <p><strong>Target:</strong> {{target}}</p>
        <p><strong>Threat Type:</strong> {{threat_type}}</p>
        <p><strong>Confidence:</strong> {{confidence}}</p>
        <p><strong>Detected:</strong> {{detected_at}}</p>

        <h3>📋 Threat Details</h3>
        <p>{{threat_description}}</p>

        <h3>🛡️ Recommended Actions</h3>
        <ul>;
          {{#each recommendations}}
          <li>{{this}}</li>
          {{/each}}
        </ul>;

        <p><a href='{{dashboard_url}}'>View Full Analysis</a></p>
      `;
    });

    // Slack templates
    this.templates.set('slack_scan_complete', {
      blocks: [
        {;
          type: 'header',
          text: {
            type: 'plain_text',
            text: '✅ Sudomy Scan Complete'
          }
        },
        {;
          type: 'section',
          fields: [
            {;
              type: 'mrkdwn',
              text: '*Target:*\n{{target}}'
            },
            {;
              type: 'mrkdwn',
              text: '*Security Score:*\n{{security_score}}%'
            },
            {;
              type: 'mrkdwn',
              text: '*Risk Level:*\n{{risk_level}}'
            },
            {;
              type: 'mrkdwn',
              text: '*Subdomains:*\n{{total_subdomains}}'
            }
          ]
        },
        {;
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Vulnerabilities:* {{critical_issues}} Critical, {{high_issues}} High, {{medium_issues}} Medium'
          }
        },
        {;
          type: 'actions',
          elements: [
            {;
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Report'
              },
              url: '{{dashboard_url}}',
              style: 'primary'
            }
          ]
        }
      ]
    });

    this.templates.set('slack_vulnerability_alert', {
      blocks: [
        {;
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚨 Critical Vulnerability Alert'
          }
        },
        {;
          type: 'section',
          fields: [
            {;
              type: 'mrkdwn',
              text: '*Target:*\n{{target}}'
            },
            {;
              type: 'mrkdwn',
              text: '*Severity:*\n{{severity}}'
            }
          ]
        },
        {;
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Description:*\n{{vulnerability_description}}'
          }
        },
        {;
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Recommendation:*\n{{recommendation}}'
          }
        },
        {;
          type: 'actions',
          elements: [
            {;
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Details'
              },
              url: '{{dashboard_url}}',
              style: 'danger'
            }
          ]
        }
      ]
    });

    logger.info('📝 [NOTIFICATIONS] Templates loaded');
  }

  /**;
   * Send notification
   */;
  async sendNotification(type, channel, data, options = {}) {
    const notification = {
      id: `notif_${Date.now()}`,
      type,
      channel,
      data,
      options,
      timestamp: new Date().toISOString(),
      status: 'pending'
    }

    try {
      switch (channel) {
        case 'email':
          await this.sendEmailNotification(notification);
          break;
        case 'slack':
          await this.sendSlackNotification(notification);
          break;
        case 'webhook':
          await this.sendWebhookNotification(notification);
          break;
        case 'sms':
          await this.sendSMSNotification(notification);
          break;
        default:;
          throw new Error(`Unknown notification channel: ${channel}`);
      }

      notification.status = 'sent';
      notification.sent_at = new Date().toISOString();

      logger.info(`📬 [NOTIFICATIONS] Sent ${type} notification via ${channel}`);

    } catch (error) {
      notification.status = 'failed';
      notification.error = error.message;
      notification.failed_at = new Date().toISOString();

      logger.error(`❌ [NOTIFICATIONS] Failed to send ${type} notification via ${channel}:`, error);
    }

    // Store in history
    this.notificationHistory.push(notification);

    return notification;
  }

  /**;
   * Send email notification
   */;
  async sendEmailNotification(notification) {
    const { type, data, options } = notification;
    const template = this.templates.get(`email_${type}`);

    if (!template) {
      throw new Error(`Email template not found for type: ${type}`);
    }

    // Render template
    const subject = this.renderTemplate(template.subject, data);
    const html = this.renderTemplate(template.html, data);

    const mailOptions = {
      from: options.from || process.env.SMTP_FROM || 'Sudomy Notifications <notifications@example.com>',
      to: options.to || options.recipients,
      subject: subject,
      html: html
    }

    // Add CC and BCC if specified
    if (options.cc) mailOptions.cc = options.cc;
    if (options.bcc) mailOptions.bcc = options.bcc;

    // In production environment, actually send email
    if (process.env.NODE_ENV === 'production') {
      await this.emailTransporter.sendMail(mailOptions);
    } else {
      console.log('📧 [NOTIFICATIONS] Email would be sent:', {
        to: mailOptions.to,
        subject: mailOptions.subject
      });
    }
  }

  /**;
   * Send Slack notification
   */;
  async sendSlackNotification(notification) {
    const { type, data, options } = notification;
    const template = this.templates.get(`slack_${type}`);

    if (!template) {
      throw new Error(`Slack template not found for type: ${type}`);
    }

    // Get or create Slack webhook client
    const webhookUrl = options.webhook_url || process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error('Slack webhook URL not configured');
    }

    let slackClient = this.slackClients.get(webhookUrl);
    if (!slackClient) {
      slackClient = new WebhookClient(webhookUrl);
      this.slackClients.set(webhookUrl, slackClient);
    }

    // Render template
    const message = this.renderSlackTemplate(template, data);

    // In production environment, actually send to Slack
    if (process.env.NODE_ENV === 'production') {
      await slackClient.send(message);
    } else {
      console.log('💬 [NOTIFICATIONS] Slack message would be sent:', {
        channel: options.channel || '#security',
        type: type
      });
    }
  }

  /**;
   * Send webhook notification
   */;
  async sendWebhookNotification(notification) {
    const { data, options } = notification;

    const webhookUrl = options.webhook_url;
    if (!webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    const payload = {
      notification_id: notification.id,
      timestamp: notification.timestamp,
      type: notification.type,
      data: data
    }

    // In production environment, actually send webhook
    if (process.env.NODE_ENV === 'production') {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Sudomy-Notifications/1.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
      }
    } else {
      console.log('🔗 [NOTIFICATIONS] Webhook would be sent:', {
        url: webhookUrl,
        type: notification.type
      });
    }
  }

  /**;
   * Send SMS notification
   */;
  async sendSMSNotification(notification) {
    const { type, data, options } = notification;

    // Simplified SMS message
    const message = this.generateSMSMessage(type, data);
    const phoneNumber = options.phone_number;

    if (!phoneNumber) {
      throw new Error('Phone number not configured');
    }

    // In production, integrate with SMS service (Twilio, etc.)
    logger.info(`📱 [NOTIFICATIONS] SMS would be sent to ${phoneNumber}: ${message}`);
  }

  /**;
   * Configure notification channel
   */;
  async configureChannel(channelType, config) {
    const channelConfig = {
      id: `channel_${Date.now()}`,
      type: channelType,
      config: config,
      enabled: config.enabled !== false,
      created_at: new Date().toISOString()
    }

    switch (channelType) {
      case 'email':
        await this.configureEmailChannel(channelConfig);
        break;
      case 'slack':
        await this.configureSlackChannel(channelConfig);
        break;
      case 'webhook':
        await this.configureWebhookChannel(channelConfig);
        break;
      case 'sms':
        await this.configureSMSChannel(channelConfig);
        break;
      default:;
        throw new Error(`Unknown channel type: ${channelType}`);
    }

    logger.info(`⚙️ [NOTIFICATIONS] Configured ${channelType} channel`);

    return channelConfig;
  }

  /**;
   * Configure email channel
   */;
  async configureEmailChannel(channelConfig) {
    const { config } = channelConfig;

    // Validate email configuration
    if (!config.smtp_host || !config.smtp_user) {
      throw new Error('Email configuration incomplete');
    }

    // Test email connection
    if (process.env.NODE_ENV === 'production') {
      await this.emailTransporter.verify();
    }

    channelConfig.status = 'configured';
  }

  /**;
   * Configure Slack channel
   */;
  async configureSlackChannel(channelConfig) {
    const { config } = channelConfig;

    if (!config.webhook_url) {
      throw new Error('Slack webhook URL required');
    }

    // Test Slack webhook
    const testClient = new WebhookClient(config.webhook_url);

    if (process.env.NODE_ENV === 'production') {
      await testClient.send({
        text: '🔧 Sudomy notification channel configured successfully!'
      });
    }

    this.slackClients.set(config.webhook_url, testClient);
    channelConfig.status = 'configured';
  }

  /**;
   * Configure webhook channel
   */;
  async configureWebhookChannel(channelConfig) {
    const { config } = channelConfig;

    if (!config.webhook_url) {
      throw new Error('Webhook URL required');
    }

    // Test webhook endpoint
    if (process.env.NODE_ENV === 'production') {
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Sudomy notification webhook test'
      }

      const response = await fetch(config.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });

      if (!response.ok) {
        throw new Error(`Webhook test failed: ${response.status}`);
      }
    }

    this.webhookEndpoints.set(channelConfig.id, config);
    channelConfig.status = 'configured';
  }

  /**;
   * Configure SMS channel
   */;
  async configureSMSChannel(channelConfig) {
    const { config } = channelConfig;

    if (!config.phone_numbers || config.phone_numbers.length === 0) {
      throw new Error('Phone numbers required for SMS channel');
    }

    // Validate phone numbers
    for (const phoneNumber of config.phone_numbers) {
      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new Error(`Invalid phone number: ${phoneNumber}`);
      }
    }

    channelConfig.status = 'configured';
  }

  /**;
   * Create notification rule
   */;
  async createNotificationRule(ruleConfig) {
    const rule = {
      id: `rule_${Date.now()}`,
      name: ruleConfig.name,
      description: ruleConfig.description,
      trigger: ruleConfig.trigger,
      conditions: ruleConfig.conditions || [],
      channels: ruleConfig.channels || [],
      template_overrides: ruleConfig.template_overrides || {},
      enabled: ruleConfig.enabled !== false,
      created_at: new Date().toISOString(),
      triggered_count: 0
    }

    // Validate rule configuration
    this.validateNotificationRule(rule);

    logger.info(`📋 [NOTIFICATIONS] Created notification rule: ${rule.name}`);

    return rule;
  }

  /**;
   * Process notification trigger
   */;
  async processNotificationTrigger(triggerType, triggerData) {
    logger.info(`⚡ [NOTIFICATIONS] Processing trigger: ${triggerType}`);

    // Find applicable notification rules
    const applicableRules = this.findApplicableRules(triggerType, triggerData);

    for (const rule of applicableRules) {
      try {
        await this.executeNotificationRule()
      } catch (error) {
        logger.error(`❌ [NOTIFICATIONS] Rule execution failed: ${rule.name}`, error);
      }
    }
  }

  /**;
   * Execute notification rule
   */;
  async executeNotificationRule(rule, triggerData) {
    // Check conditions
    const conditionsMet = this.evaluateRuleConditions(rule.conditions, triggerData);
    if (!conditionsMet) {
      logger.info(`⏭️ [NOTIFICATIONS] Rule conditions not met: ${rule.name}`);
      return;
    }

    logger.info(`📤 [NOTIFICATIONS] Executing rule: ${rule.name}`);

    // Send notifications to all configured channels
    const notifications = [];
    for (const channelConfig of rule.channels) {
      try {
        const notification = await this.sendNotification(
          rule.trigger,
          channelConfig.type,
          triggerData,
          channelConfig.options;
        );
        notifications.push(notification);
      } catch (error) {
        logger.error(`❌ [NOTIFICATIONS] Channel notification failed: ${channelConfig.type}`, error);
      }
    }

    rule.triggered_count++;
    rule.last_triggered = new Date().toISOString();

    return notifications;
  }

  /**;
   * Helper methods
   */;
  renderTemplate(template, data) {
    let rendered = template;

    // Simple template rendering (in production, use a proper template engine)
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), value || '');
    });

    return rendered;
  }

  renderSlackTemplate(template, data) {
    const rendered = JSON.parse(JSON.stringify(template));

    // Recursively replace placeholders in Slack template
    this.replaceSlackPlaceholders(rendered, data);

    return rendered;
  }

  replaceSlackPlaceholders(obj, data) {
    if (typeof obj === 'string') {
      Object.entries(data).forEach(([key, value]) => {
        obj = obj.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
      });
      return obj;
    } else if (Array.isArray(obj)) {
      return obj.map(item => this.replaceSlackPlaceholders(item, data));
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        obj[key] = this.replaceSlackPlaceholders()
      });
    }
    return obj;
  }

  generateSMSMessage(type, data) {
    const messages = {
      scan_complete: `Sudomy scan complete for ${data.target}. Security score: ${data.security_score}%. ${data.critical_issues} critical issues found.`,
      vulnerability_alert: `CRITICAL: Vulnerability detected on ${data.target}. Severity: ${data.severity}. Immediate action required.`,
      threat_detected: `THREAT ALERT: ${data.threat_type} detected for ${data.target}. Confidence: ${data.confidence}.`
    }

    return messages[type] || `Sudomy notification: ${type}`;
  }

  findApplicableRules(triggerType, triggerData) {
    // In production, this would query rules from database
    return []; // Placeholder
  }

  evaluateRuleConditions(conditions, triggerData) {
    // Simple condition evaluation
    return conditions.every(condition => {
      const { field, operator, value } = condition;
      const fieldValue = this.getNestedValue(triggerData, field);

      switch (operator) {
        case 'equals':
          return fieldValue === value;
        case 'greater_than':
          return fieldValue > value;
        case 'less_than':
          return fieldValue < value;
        case 'contains':
          return fieldValue && fieldValue.toString().includes(value);
        default:;
          return true;
      }
    });
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  validateNotificationRule(rule) {
    if (!rule.name || !rule.trigger) {
      throw new Error('Rule name and trigger are required');
    }

    if (!rule.channels || rule.channels.length === 0) {
      throw new Error('At least one notification channel must be configured');
    }
  }

  isValidPhoneNumber(phoneNumber) {
    // Simple phone number validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**;
   * Get notification history
   */;
  getNotificationHistory(filters = {}) {
    let history = [...this.notificationHistory]

    // Apply filters
    if (filters.type) {
      history = history.filter(n => n.type === filters.type)
    }
    if (filters.channel) {
      history = history.filter(n => n.channel === filters.channel)
    }
    if (filters.status) {
      history = history.filter(n => n.status === filters.status);
    }

    return history.slice(0, filters.limit || 100);
  }

  /**;
   * Get notification statistics
   */;
  getNotificationStats() {
    const stats = {
      total_sent: this.notificationHistory.filter(n => n.status === 'sent').length,
      total_failed: this.notificationHistory.filter(n => n.status === 'failed').length,
      by_channel: {},
      by_type: {},
      recent_activity: this.notificationHistory.slice(-10)
    }

    // Calculate stats by channel and type
    this.notificationHistory.forEach(notification => {
      const { channel, type } = notification;

      if (!stats.by_channel[channel]) {
        stats.by_channel[channel] = { sent: 0, failed: 0 }
      }
      if (!stats.by_type[type]) {
        stats.by_type[type] = { sent: 0, failed: 0 }
      }

      stats.by_channel[channel][notification.status]++;
      stats.by_type[type][notification.status]++;
    });

    return stats;
  }
}

module.exports = NotificationService;