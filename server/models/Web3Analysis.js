const mongoose = require('mongoose');

const vulnerabilitySchema = new mongoose.Schema({
  type: { type: String, required: true },
  severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], required: true },
  description: { type: String, required: true },
  location: { type: String },
  recommendation: { type: String },
  confidence: { type: Number, min: 0, max: 100 },
  cwe: { type: String },
  impact: { type: String },
  exploitPoC: {
    title: { type: String },
    description: { type: String },
    solidityCode: { type: String },
    javascriptCode: { type: String },
    transactionTrace: {
      step1: { type: String },
      step2: { type: String },
      step3: { type: String },
      gasUsed: { type: String },
      totalGasCost: { type: String }
    },
    mitigation: { type: String },
    gasAnalysis: {
      attackCost: { type: String },
      profit: { type: String },
      roi: { type: String }
    },
    profitCalculation: {
      averageProfit: { type: String },
      dailyVolume: { type: String },
      estimatedDailyProfit: { type: String }
    },
    impact: { type: String }
  },
  gasAnalysis: {
    exploitCost: { type: String },
    potentialLoss: { type: String },
    gasRequired: { type: String },
    profitability: { type: String }
  },
  complianceViolation: {
    standard: { type: String },
    rule: { type: String },
    severity: { type: String }
  }
});

const gasOptimizationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  location: { type: String },
  savings: { type: String },
  description: { type: String },
  recommendation: { type: String }
});

const defiRiskSchema = new mongoose.Schema({
  type: { type: String, required: true },
  severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'] },
  probability: { type: String, enum: ['High', 'Medium', 'Low'] },
  description: { type: String },
  mitigation: { type: String },
  impact: { type: String }
});

const analysisResultsSchema = new mongoose.Schema({
  vulnerabilities: [vulnerabilitySchema],
  gasOptimization: {
    totalIssues: { type: Number, default: 0 },
    potentialSavings: { type: String },
    optimizations: [gasOptimizationSchema]
  },
  defiAnalysis: {
    totalRisks: { type: Number, default: 0 },
    riskLevel: { type: String },
    risks: [defiRiskSchema],
    riskScore: { type: Number }
  },
  codeQuality: {
    score: { type: Number, min: 0, max: 100 },
    metrics: {
      complexity: { type: Number },
      maintainability: { type: Number },
      testCoverage: { type: Number },
      documentation: { type: Number }
    },
    issues: [String],
    recommendations: [String]
  },
  compliance: {
    standards: mongoose.Schema.Types.Mixed,
    regulations: mongoose.Schema.Types.Mixed,
    score: { type: Number, min: 0, max: 100 }
  },
  securityScore: { type: Number, min: 0, max: 100 }
});

const analysisSummarySchema = new mongoose.Schema({
  totalVulnerabilities: { type: Number, default: 0 },
  criticalVulnerabilities: { type: Number, default: 0 },
  highVulnerabilities: { type: Number, default: 0 },
  gasOptimizationOpportunities: { type: Number, default: 0 },
  defiRisks: { type: Number, default: 0 },
  securityScore: { type: Number, min: 0, max: 100 },
  overallRisk: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'] }
});

const detailedReportSchema = new mongoose.Schema({
  reportId: { type: String, required: true },
  reportDir: { type: String },
  files: {
    htmlReport: { type: String },
    pdfReport: { type: String },
    executiveSummary: { type: String },
    screenshots: mongoose.Schema.Types.Mixed,
    vulnVisuals: mongoose.Schema.Types.Mixed
  },
  downloadUrl: { type: String },
  generatedAt: { type: Date, default: Date.now }
});

const web3AnalysisSchema = new mongoose.Schema({
  // Basic Information
  id: { type: String, required: true, unique: true },
  contractAddress: { type: String, required: true },
  network: { type: String, required: true, default: 'ethereum' },
  contractName: { type: String },
  abi: { type: String },
  sourceCode: { type: String },

  // Analysis Status
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },

  // Analysis Results
  results: analysisResultsSchema,
  summary: analysisSummarySchema,

  // Detailed Report (if generated)
  detailedReport: detailedReportSchema,

  // Metadata
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // Analysis Tools Used
  toolsUsed: [String],
  analysisVersion: { type: String, default: '1.0' },

  // Tags and Categories
  tags: [String],
  category: { type: String, enum: ['DeFi', 'NFT', 'Bridge', 'Token', 'DAO', 'Other'], default: 'Other' }
});

// Indexes for better query performance
web3AnalysisSchema.index({ contractAddress: 1, network: 1 });
web3AnalysisSchema.index({ userId: 1, createdAt: -1 });
web3AnalysisSchema.index({ status: 1 });
web3AnalysisSchema.index({ 'summary.overallRisk': 1 });
web3AnalysisSchema.index({ 'summary.securityScore': 1 });

// Update the updatedAt field before saving
web3AnalysisSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for analysis duration
web3AnalysisSchema.virtual('duration').get(function() {
  if (this.startTime && this.endTime) {
    return this.endTime - this.startTime;
  }
  return null;
});

// Static method to find analyses by user
web3AnalysisSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId }

  if (options.status) {
    query.status = options.status;
  }

  if (options.network) {
    query.network = options.network;
  }

  if (options.riskLevel) {
    query['summary.overallRisk'] = options.riskLevel;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
}

// Static method to get analysis statistics
web3AnalysisSchema.statics.getStatistics = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {;
      $group: {
        _id: null,
        totalAnalyses: { $sum: 1 },
        completedAnalyses: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        averageSecurityScore: { $avg: '$summary.securityScore' },
        totalVulnerabilities: { $sum: '$summary.totalVulnerabilities' },
        criticalVulnerabilities: { $sum: '$summary.criticalVulnerabilities' },
        riskDistribution: {
          $push: '$summary.overallRisk'
        }
      }
    }
  ]);
}

module.exports = mongoose.model('Web3Analysis', web3AnalysisSchema);