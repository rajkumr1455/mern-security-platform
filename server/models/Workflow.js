const mongoose = require('mongoose');

const workflowStepSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['recon', 'scan', 'analysis', 'report'],
    required: true
  },
  config: mongoose.Schema.Types.Mixed,
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'skipped'],
    default: 'pending'
  },
  startTime: Date,
  endTime: Date,
  duration: Number,
  results: mongoose.Schema.Types.Mixed,
  error: String,
  dependencies: [String], // Names of steps this step depends on
  order: {
    type: Number,
    required: true
  }
});

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Target',
    required: true
  },
  template: {
    type: String,
    enum: ['custom', 'quick_recon', 'web_app_assessment', 'web3_audit', 'full_assessment'],
    default: 'custom'
  },
  status: {
    type: String,
    enum: ['draft', 'running', 'completed', 'failed', 'cancelled', 'paused'],
    default: 'draft'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  currentStep: String,

  // Workflow configuration
  config: {
    parallel: {
      type: Boolean,
      default: false
    },
    stopOnError: {
      type: Boolean,
      default: false
    },
    timeout: {
      type: Number,
      default: 3600000 // 1 hour in milliseconds
    },
    notifications: {
      onComplete: { type: Boolean, default: true },
      onError: { type: Boolean, default: true },
      onStepComplete: { type: Boolean, default: false }
    }
  },

  // Workflow steps
  steps: [workflowStepSchema],

  // Execution metadata
  execution: {
    startTime: Date,
    endTime: Date,
    duration: Number,
    totalSteps: { type: Number, default: 0 },
    completedSteps: { type: Number, default: 0 },
    failedSteps: { type: Number, default: 0 },
    skippedSteps: { type: Number, default: 0 }
  },

  // Results aggregation
  results: {
    summary: {
      totalVulnerabilities: { type: Number, default: 0 },
      criticalCount: { type: Number, default: 0 },
      highCount: { type: Number, default: 0 },
      mediumCount: { type: Number, default: 0 },
      lowCount: { type: Number, default: 0 },
      riskScore: { type: Number, default: 0 }
    },
    scans: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scan'
    }],
    reports: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report'
    }],
    artifacts: [{
      name: String,
      type: String,
      path: String,
      size: Number,
      createdAt: { type: Date, default: Date.now }
    }]
  },

  // Scheduling
  schedule: {
    enabled: { type: Boolean, default: false },
    cron: String,
    timezone: { type: String, default: 'UTC' },
    nextRun: Date,
    lastRun: Date
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Collaboration
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer'
    },
    addedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes
workflowSchema.index({ owner: 1, status: 1 });
workflowSchema.index({ target: 1 });
workflowSchema.index({ template: 1 });
workflowSchema.index({ 'schedule.enabled': 1, 'schedule.nextRun': 1 });

// Virtual for completion percentage
workflowSchema.virtual('completionPercentage').get(function() {
  if (this.execution.totalSteps === 0) return 0;
  return Math.round((this.execution.completedSteps / this.execution.totalSteps) * 100);
});

// Pre-save middleware
workflowSchema.pre('save', function(next) {
  // Calculate execution metadata
  this.execution.totalSteps = this.steps.length;
  this.execution.completedSteps = this.steps.filter(step => step.status === 'completed').length;
  this.execution.failedSteps = this.steps.filter(step => step.status === 'failed').length;
  this.execution.skippedSteps = this.steps.filter(step => step.status === 'skipped').length;

  // Calculate progress
  if (this.execution.totalSteps > 0) {
    this.progress = Math.round((this.execution.completedSteps / this.execution.totalSteps) * 100);
  }

  // Calculate duration if completed
  if (this.execution.endTime && this.execution.startTime) {
    this.execution.duration = Math.floor((this.execution.endTime - this.execution.startTime) / 1000);
  }

  next();
});

// Static method to create workflow from template
workflowSchema.statics.createFromTemplate = function(templateName, target, owner, customConfig = {}) {
  const templates = {
    quick_recon: {
      name: 'Quick Reconnaissance',
      description: 'Fast asset discovery and enumeration',
      steps: [
        { name: 'Subdomain Enumeration', type: 'recon', config: { modules: ['subdomain'] }, order: 1 },
        { name: 'Port Scanning', type: 'recon', config: { modules: ['ports'] }, order: 2 }
      ]
    },
    web_app_assessment: {
      name: 'Web Application Assessment',
      description: 'Comprehensive web application security testing',
      steps: [
        { name: 'Reconnaissance', type: 'recon', config: { modules: ['subdomain', 'ports', 'api'] }, order: 1 },
        { name: 'Vulnerability Scanning', type: 'scan', config: { scanTypes: ['vulnerability'] }, order: 2 },
        { name: 'Security Analysis', type: 'analysis', config: { analysisTypes: ['comprehensive'] }, order: 3 },
        { name: 'Report Generation', type: 'report', config: { format: 'comprehensive' }, order: 4 }
      ]
    },
    web3_audit: {
      name: 'Web3 Security Audit',
      description: 'Complete Web3 and DeFi security assessment',
      steps: [
        { name: 'Web3 Discovery', type: 'recon', config: { modules: ['web3'] }, order: 1 },
        { name: 'Smart Contract Analysis', type: 'analysis', config: { analysisTypes: ['contract_fuzzing'] }, order: 2 },
        { name: 'DeFi Protocol Analysis', type: 'analysis', config: { analysisTypes: ['defi_analysis'] }, order: 3 },
        { name: 'Security Report', type: 'report', config: { format: 'web3_audit' }, order: 4 }
      ]
    }
  }

  const template = templates[templateName];
  if (!template) {
    throw new Error(`Template ${templateName} not found`);
  }

  return new this({
    ...template,
    target,
    owner,
    template: templateName,
    config: { ...template.config, ...customConfig }
  })
}

module.exports = mongoose.model('Workflow', workflowSchema);