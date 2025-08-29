const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['web2', 'web3', 'hybrid'],
    default: 'web2'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'scanning'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    ip: String,
    ports: [Number],
    technologies: [String],
    contracts: [{
      address: String,
      network: String,
      type: String
    }]
  },
  lastScanned: {
    type: Date
  },
  scanCount: {
    type: Number,
    default: 0
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
targetSchema.index({ owner: 1, status: 1 });
targetSchema.index({ type: 1 });
targetSchema.index({ riskScore: -1 });

module.exports = mongoose.model('Target', targetSchema);