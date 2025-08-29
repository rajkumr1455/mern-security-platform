const mongoose = require('mongoose');

const globalScanResultSchema = new mongoose.Schema({
  // Universal Scan Identification
  scanId: { type: String, required: true, unique: true },
  scanType: {
    type: String,
    required: true,
    enum: ['web2', 'web3', 'reconnaissance', 'bugbounty', 'workflow', 'ai_analysis', 'sudomy', 'comprehensive']
  },

  // Target Information
  target: {
    address: { type: String, required: true }, // URL, IP, Contract Address, etc.
    type: { type: String, required: true }, // 'url', 'ip', 'contract', 'domain', etc.
    network: { type: String }, // For Web3: ethereum, polygon, etc.
    name: { type: String },
    description: { type: String }
  },

  // Scan Status and Timing
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  duration: { type: Number }, // in milliseconds

  // Results Summary (Normalized across all scan types)
  summary: {
    securityScore: { type: Number, min: 0, max: 100 },
    riskLevel: { type: String, enum: ['Critical', 'High', 'Medium', 'Low', 'Info'] },
    totalFindings: { type: Number, default: 0 },
    criticalFindings: { type: Number, default: 0 },
    highFindings: { type: Number, default: 0 },
    mediumFindings: { type: Number, default: 0 },
    lowFindings: { type: Number, default: 0 },
    infoFindings: { type: Number, default: 0 }
  },

  // Detailed Results (Flexible structure for different scan types)
  results: {
    // Web2 Specific
    vulnerabilities: [{
      type: String,
      severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low', 'Info'] },
      description: String,
      location: String,
      recommendation: String,
      cve: String,
      cvss: Number
    }],

    // Web3 Specific
    smartContractIssues: [{
      type: String,
      severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'] },
      description: String,
      location: String,
      recommendation: String,
      confidence: Number,
      cwe: String
    }],

    // Reconnaissance Specific
    subdomains: [String],
    openPorts: [{
      port: Number,
      service: String,
      version: String,
      state: String
    }],
    technologies: [String],

    // Bug Bounty Specific
    bountyFindings: [{
      title: String,
      severity: String,
      impact: String,
      reproduction: String,
      reward: Number
    }],

    // AI Analysis Specific
    aiInsights: [{
      category: String,
      confidence: Number,
      description: String,
      recommendation: String
    }],

    // Generic findings for any scan type
    genericFindings: [{
      category: String,
      type: String,
      severity: String,
      title: String,
      description: String,
      evidence: String,
      recommendation: String,
      references: [String]
    }]
  },

  // Tools and Methods Used
  toolsUsed: [String],
  methodology: String,
  scanParameters: mongoose.Schema.Types.Mixed,

  // Reports and Documentation
  reports: [{
    type: { type: String, enum: ['html', 'pdf', 'json', 'csv', 'xml'] },
    filename: String,
    path: String,
    size: Number,
    generatedAt: { type: Date, default: Date.now },
    downloadUrl: String
  }],

  screenshots: [{
    filename: String,
    path: String,
    description: String,
    tool: String,
    capturedAt: { type: Date, default: Date.now }
  }],

  // User and Organization
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // Tags and Classification
  tags: [String],
  category: String,
  priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium' },

  // Workflow Integration
  workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' },
  parentScanId: { type: String }, // For scans that are part of larger workflows
  childScanIds: [String], // For scans that spawn other scans

  // Compliance and Standards
  compliance: {
    frameworks: [String], // OWASP, NIST, ISO27001, etc.
    requirements: [String],
    status: { type: String, enum: ['compliant', 'non_compliant', 'partial', 'unknown'] }
  },

  // External References
  externalReferences: [{
    type: { type: String, enum: ['cve', 'cwe', 'advisory', 'blog', 'documentation'] },
    id: String,
    url: String,
    description: String
  }],

  // Performance Metrics
  performance: {
    requestsPerSecond: Number,
    totalRequests: Number,
    errorRate: Number,
    averageResponseTime: Number
  }
});

// Indexes for optimal query performance
globalScanResultSchema.index({ userId: 1, createdAt: -1 });
globalScanResultSchema.index({ scanType: 1, status: 1 });
globalScanResultSchema.index({ 'target.address': 1, scanType: 1 });
globalScanResultSchema.index({ 'summary.riskLevel': 1 });
globalScanResultSchema.index({ 'summary.securityScore': 1 });
globalScanResultSchema.index({ workflowId: 1 });
globalScanResultSchema.index({ tags: 1 });
globalScanResultSchema.index({ status: 1, startTime: -1 });

// Compound indexes for common queries
globalScanResultSchema.index({ userId: 1, scanType: 1, status: 1 });
globalScanResultSchema.index({ userId: 1, 'summary.riskLevel': 1, createdAt: -1 });

// Update the updatedAt field before saving
globalScanResultSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Calculate duration if endTime is set
  if (this.endTime && this.startTime) {
    this.duration = this.endTime - this.startTime;
  }

  next();
});

// Virtual for human-readable duration
globalScanResultSchema.virtual('durationFormatted').get(function() {
  if (!this.duration) return 'N/A';

  const seconds = Math.floor(this.duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
});

// Static method to get dashboard statistics
globalScanResultSchema.statics.getDashboardStats = function(userId, timeframe = '30d') {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(timeframe));

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {;
      $group: {
        _id: null,
        totalScans: { $sum: 1 },
        completedScans: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        failedScans: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        averageSecurityScore: { $avg: '$summary.securityScore' },
        totalFindings: { $sum: '$summary.totalFindings' },
        criticalFindings: { $sum: '$summary.criticalFindings' },
        highFindings: { $sum: '$summary.highFindings' },
        scanTypeDistribution: {
          $push: '$scanType'
        },
        riskDistribution: {
          $push: '$summary.riskLevel'
        }
      }
    }
  ]);
}

// Static method to get scan trends
globalScanResultSchema.statics.getScanTrends = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {;
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          scanType: '$scanType'
        },
        count: { $sum: 1 },
        avgSecurityScore: { $avg: '$summary.securityScore' },
        totalFindings: { $sum: '$summary.totalFindings' }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);
}

// Static method to find related scans
globalScanResultSchema.statics.findRelatedScans = function(targetAddress, scanType, userId) {
  return this.find().sort({ createdAt: -1 }).limit(10);
}

// Static method to get top vulnerabilities
globalScanResultSchema.statics.getTopVulnerabilities = function(userId, limit = 10) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'completed' } },
    { $unwind: '$results.vulnerabilities' },
    {;
      $group: {
        _id: '$results.vulnerabilities.type',
        count: { $sum: 1 },
        avgSeverity: { $avg: {
          $switch: {
            branches: [
              { case: { $eq: ['$results.vulnerabilities.severity', 'Critical'] }, then: 4 },
              { case: { $eq: ['$results.vulnerabilities.severity', 'High'] }, then: 3 },
              { case: { $eq: ['$results.vulnerabilities.severity', 'Medium'] }, then: 2 },
              { case: { $eq: ['$results.vulnerabilities.severity', 'Low'] }, then: 1 }
            ],
            default: 0
          }
        }}
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
}

module.exports = mongoose.model('GlobalScanResult', globalScanResultSchema);