const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'analyst', 'viewer'],
    default: 'analyst'
  },
  profile: {
    firstName: String,
    lastName: String,
    organization: String,
    department: String,
    phone: String
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark'
    },
    notifications: {
      email: { type: Boolean, default: true },
      browser: { type: Boolean, default: true },
      scanComplete: { type: Boolean, default: true },
      highSeverityFindings: { type: Boolean, default: true }
    },
    dashboard: {
      defaultView: {
        type: String,
        enum: ['overview', 'targets', 'scans', 'reports'],
        default: 'overview'
      },
      refreshInterval: {
        type: Number,
        default: 30000 // 30 seconds
      }
    }
  },
  apiKeys: [{
    name: String,
    key: String,
    permissions: [String],
    lastUsed: Date,
    createdAt: { type: Date, default: Date.now }
  }],
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
}

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne()
  }

  const updates = { $inc: { loginAttempts: 1 } }

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 } // 2 hours
  }

  return this.updateOne()
}

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne()
}

// Method to generate API key
userSchema.methods.generateApiKey = function(name, permissions = []) {
  const crypto = require('crypto');
  const apiKey = {
    name,
    key: crypto.randomBytes(32).toString('hex'),
    permissions,
    createdAt: new Date()
  }

  this.apiKeys.push(apiKey);
  return apiKey;
}

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.loginAttempts;
  delete user.lockUntil;
  return user;
}

module.exports = mongoose.model('User', userSchema);