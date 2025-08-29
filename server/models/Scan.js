const mongoose = require('mongoose');

const vulnerabilitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  impact: String,
  recommendation: String,
  cve: String,
  cvss: Number,
  location: {
    url: String,
    parameter: String,
    line: Number,
    function: String
  },
  evidence: {
    request: String,
    response: String,
    payload: String,
    screenshot: String
  },
  references: [String],
  verified: {
    type: Boolean,
    default: false
  }
});

const scanSchema = new mongoose.Schema({
  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Target',
    required: true
  },
  type: {
    type: String,
    enum: ['recon', 'web2_scan', 'web3_analysis', 'workflow'],
    required: true
  },
  subtype: {
    type: String,
    enum: [
      // Recon types
      'subdomain_enum', 'port_scan', 'api_discovery', 'web3_discovery',
      // Web2 scan types
      'vulnerability_scan', 'api_security', 'fuzzing', 'exploitation',
      // Web3 analysis types
      'defi_analysis', 'contract_fuzzing', 'monitoring', 'external_tools'
    ]
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  currentPhase: String,
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: Number, // in seconds

  // Configuration
  config: {
    modules: [String],
    scanTypes: [String],
    analysisTypes: [String],
    options: mongoose.Schema.Types.Mixed
  },

  // Results
  results: {
    summary: {
      totalFindings: { type: Number, default: 0 },
      criticalCount: { type: Number, default: 0 },
      highCount: { type: Number, default: 0 },
      mediumCount: { type: Number, default: 0 },
      lowCount: { type: Number, default: 0 },
      infoCount: { type: Number, default: 0 }
    },
    vulnerabilities: [vulnerabilitySchema],
    reconnaissance: {
      subdomains: [String],
      ports: [{
        port: Number,
        service: String,
        version: String,
        state: String
      }],
      apis: [{
        endpoint: String,
        method: String,
        parameters: [String],
        authenticated: Boolean
      }],
      web3Assets: [{
        address: String,
        type: String,
        network: String,
        verified: Boolean
      }]
    },
    web3Analysis: {
      contracts: [{
        address: String,
        name: String,
        compiler: String,
        optimization: Boolean,
        sourceCode: String,
        abi: mongoose.Schema.Types.Mixed
      }],
      defiProtocols: [{
        type: String,
        tvl: Number,
        risks: [String]
      }],
      externalToolsResults: mongoose.Schema.Types.Mixed
    },
    rawData: mongoose.Schema.Types.Mixed
  },

  // Metadata
  logs: [{
    timestamp: { type: Date, default: Date.now },
    level: { type: String, enum: ['info', 'warn', 'error'] },
    message: String,
    data: mongoose.Schema.Types.Mixed
  }],

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
scanSchema.index({ target: 1, status: 1 });
scanSchema.index({ owner: 1, createdAt: -1 });
scanSchema.index({ type: 1, subtype: 1 });
scanSchema.index({ status: 1, startTime: -1 });

// Virtual for duration calculation
scanSchema.virtual('calculatedDuration').get(function() {
  if (this.endTime && this.startTime) {
    return Math.floor((this.endTime - this.startTime) / 1000);
  }
  return null;
});

// Pre-save middleware to calculate duration
scanSchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  next();
});

module.exports = mongoose.model('Scan', scanSchema);