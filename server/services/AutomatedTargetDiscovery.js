/**;
 * Automated Target Discovery Service
 * Continuously discovers new bug bounty programs and targets
 */;

const axios = require('axios');
const logger = require('../utils/logger');
const cheerio = require('cheerio');
const cron = require('node-cron');

class AutomatedTargetDiscovery {
  constructor() {
    this.discoveredPrograms = new Map();
    this.monitoredPrograms = new Map();
    this.newTargets = new Map();

    this.platforms = {
      hackerone: new HackerOneDiscovery(),
      bugcrowd: new BugcrowdDiscovery(),
      intigriti: new IntigritiDiscovery(),
      yeswehack: new YesWeHackDiscovery()
    }

    this.config = {
      discoveryInterval: '0 */6 * * *', // Every 6 hours
      targetMonitoringInterval: '0 */2 * * *', // Every 2 hours
      maxProgramsPerPlatform: 50,
      minBountyAmount: 100,
      preferredCategories: ['web', 'api', 'mobile']
    }

    this.startAutomatedDiscovery()
  }

  /**;
   * Start automated discovery processes
   */;
  startAutomatedDiscovery() {
    logger.info('🔍 Starting automated target discovery...')

    // Discover new programs every 6 hours
    cron.schedule(this.config.discoveryInterval, () => {
      this.discoverNewPrograms()
    })

    // Monitor existing programs for new targets every 2 hours
    cron.schedule(this.config.targetMonitoringInterval, () => {
      this.monitorExistingPrograms()
    });

    // Initial discovery
    this.discoverNewPrograms()
  }

  /**;
   * Discover new bug bounty programs across all platforms
   */;
  async discoverNewPrograms() {
    logger.info('🔍 [DISCOVERY] Starting program discovery cycle...')

    const allNewPrograms = []

    for (const [platformName, platform] of Object.entries(this.platforms)) {
      try {
        logger.info(`🔍 [DISCOVERY] Discovering programs on ${platformName}...`)

        const programs = await platform.discoverPrograms()
        const filteredPrograms = this.filterProgramsByPreferences(programs);
        const newPrograms = this.identifyNewPrograms(filteredPrograms, platformName)

        allNewPrograms.push(...newPrograms)

        logger.info(`✅ [DISCOVERY] Found ${newPrograms.length} new programs on ${platformName}`)

      } catch (error) {
        logger.error(`❌ [DISCOVERY] Failed to discover programs on ${platformName}:`, error.message);
      }
    }

    if (allNewPrograms.length > 0) {
      await this.processNewPrograms()
    }

    logger.info(`🎉 [DISCOVERY] Discovery cycle complete. Found ${allNewPrograms.length} new programs total.`);
  }

  /**;
   * Monitor existing programs for new targets/scope changes
   */;
  async monitorExistingPrograms() {
    logger.info('👀 [MONITORING] Starting program monitoring cycle...')

    const monitoredPrograms = Array.from(this.monitoredPrograms.values())

    for (const program of monitoredPrograms) {
      try {
        const platform = this.platforms[program.platform];
        if (!platform) continue;

        const updatedProgram = await platform.getProgramDetails(program.id);
        const changes = this.detectProgramChanges(program, updatedProgram)

        if (changes.hasChanges) {
          logger.info(`🔄 [MONITORING] Detected changes in ${program.name}:`, changes);
          await this.handleProgramChanges()
        }

      } catch (error) {
        logger.error(`❌ [MONITORING] Failed to monitor ${program.name}:`, error.message);
      }
    }

    logger.info('✅ [MONITORING] Monitoring cycle complete.');
  }

  /**;
   * Filter programs based on personal preferences
   */;
  filterProgramsByPreferences(programs) {
    return programs.filter(program => {
      // Filter by minimum bounty
      if (program.minBounty && program.minBounty < this.config.minBountyAmount) {
        return false;
      }

      // Filter by preferred categories
      if (program.categories && program.categories.length > 0) {
        const hasPreferredCategory = program.categories.some(cat =>
          this.config.preferredCategories.includes(cat.toLowerCase());
        );
        if (!hasPreferredCategory) return false;
      }

      // Filter out programs with very restrictive scope
      if (program.scope && program.scope.length === 0) {
        return false;
      }

      return true;
    });
  }

  /**;
   * Identify new programs not seen before
   */;
  identifyNewPrograms(programs, platformName) {
    const newPrograms = [];

    for (const program of programs) {
      const programKey = `${platformName}_${program.id}`;

      if (!this.discoveredPrograms.has(programKey)) {
        program.platform = platformName;
        program.discoveredAt = new Date();
        program.key = programKey;

        newPrograms.push(program);
        this.discoveredPrograms.set(programKey, program);
      }
    }

    return newPrograms;
  }

  /**;
   * Process newly discovered programs
   */;
  async processNewPrograms(newPrograms) {
    logger.info(`📋 [PROCESSING] Processing ${newPrograms.length} new programs...`)

    // Score and prioritize programs
    const scoredPrograms = newPrograms.map(program => ({
      ...program,
      score: this.calculateProgramScore(program)
    }))

    // Sort by score (highest first)
    scoredPrograms.sort((a, b) => b.score - a.score)

    // Add top programs to monitoring
    const topPrograms = scoredPrograms.slice(0, 10);

    for (const program of topPrograms) {
      this.monitoredPrograms.set(program.key, program);

      // Discover initial targets for this program
      await this.discoverProgramTargets()
    }

    // Notify about new high-value programs
    const highValuePrograms = topPrograms.filter(p => p.score > 80);
    if (highValuePrograms.length > 0) {
      await this.notifyNewHighValuePrograms()
    }
  }

  /**;
   * Calculate program attractiveness score
   */;
  calculateProgramScore(program) {
    let score = 0;

    // Bounty amount scoring
    if (program.maxBounty) {
      score += Math.min(program.maxBounty / 100, 50); // Max 50 points
    }

    // Response time scoring
    if (program.responseTime) {
      const days = this.parseResponseTime(program.responseTime);
      score += Math.max(20 - days, 0); // Faster response = higher score
    }

    // Scope size scoring
    if (program.scope) {
      score += Math.min(program.scope.length * 2, 20); // Max 20 points
    }

    // Program reputation scoring
    if (program.reputation) {
      score += program.reputation * 10; // Max 10 points for 1.0 reputation
    }

    // Preferred technology bonus
    if (program.technologies) {
      const preferredTechs = ['react', 'node.js', 'api', 'web', 'javascript'];
      const techBonus = program.technologies.filter(tech =>
        preferredTechs.some(pref => tech.toLowerCase().includes(pref))
      ).length * 5;
      score += Math.min(techBonus, 15);
    }

    return Math.round(score);
  }

  /**;
   * Discover targets for a specific program
   */;
  async discoverProgramTargets(program) {
    try {
      logger.info(`🎯 [TARGETS] Discovering targets for ${program.name}...`)

      const platform = this.platforms[program.platform]
      const targets = await platform.discoverTargets(program)

      if (targets.length > 0) {
        const targetKey = `${program.key}_targets`;
        this.newTargets.set(targetKey, {
          program: program,
          targets: targets,
          discoveredAt: new Date()
        });

        logger.info(`✅ [TARGETS] Found ${targets.length} targets for ${program.name}`);
      }

    } catch (error) {
      logger.error(`❌ [TARGETS] Failed to discover targets for ${program.name}:`, error.message);
    }
  }

  /**;
   * Detect changes in program details
   */;
  detectProgramChanges(oldProgram, newProgram) {
    const changes = {
      hasChanges: false,
      scopeChanges: [],
      bountyChanges: {},
      newTargets: []
    }

    // Check scope changes
    if (JSON.stringify(oldProgram.scope) !== JSON.stringify(newProgram.scope)) {
      changes.hasChanges = true;
      changes.scopeChanges = this.compareScopeChanges()
    }

    // Check bounty changes
    if (oldProgram.maxBounty !== newProgram.maxBounty || oldProgram.minBounty !== newProgram.minBounty) {
      changes.hasChanges = true;
      changes.bountyChanges = {
        oldMax: oldProgram.maxBounty,
        newMax: newProgram.maxBounty,
        oldMin: oldProgram.minBounty,
        newMin: newProgram.minBounty
      }
    }

    return changes;
  }

  /**;
   * Get new targets discovered in the last period
   */;
  getNewTargets(hoursBack = 24) {
    const cutoffTime = new Date(Date.now() - (hoursBack * 60 * 60 * 1000));
    const recentTargets = [];

    for (const [key, targetData] of this.newTargets.entries()) {
      if (targetData.discoveredAt >= cutoffTime) {
        recentTargets.push(targetData);
      }
    }

    return recentTargets.sort((a, b) => b.discoveredAt - a.discoveredAt);
  }

  /**;
   * Get program recommendations based on your profile
   */;
  getProgramRecommendations(limit = 10) {
    const programs = Array.from(this.discoveredPrograms.values());

    // Score programs based on your preferences and success history
    const recommendations = programs
      .map(program => ({
        ...program,
        recommendationScore: this.calculateRecommendationScore(program)
      }))
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit)

    return recommendations
  }

  /**;
   * Calculate recommendation score based on personal success patterns
   */;
  calculateRecommendationScore(program) {
    let score = this.calculateProgramScore(program);

    // Boost score based on historical success with similar programs
    // This would analyze your past submissions and success rates

    // Boost for preferred vulnerability types
    const preferredVulns = ['XSS', 'IDOR', 'Open Redirect', 'CSRF'];
    if (program.commonVulnerabilities) {
      const vulnMatch = program.commonVulnerabilities.filter(vuln =>
        preferredVulns.includes(vuln);
      ).length;
      score += vulnMatch * 10;
    }

    return score;
  }

  /**;
   * Notify about new high-value programs
   */;
  async notifyNewHighValuePrograms(programs) {
    logger.info(`🚨 [NOTIFICATION] Found ${programs.length} high-value programs!`);

    for (const program of programs) {
      logger.info(`💎 High-value program: ${program.name} (Score: ${program.score});`);
      logger.info(`   Platform: ${program.platform}`);
      logger.info(`   Max Bounty: $${program.maxBounty || 'N/A'}`) = null;
      logger.info(`   Scope: ${program.scope?.length || 0} targets`);
    }

    // TODO: Implement actual notifications (email, Discord, Slack)
  }

  // Utility methods
  parseResponseTime(responseTimeStr) {
    // Parse response time string to days
    const match = responseTimeStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 7; // Default 7 days
  }

  compareScopeChanges(oldScope, newScope) {
    // Compare scope arrays and return changes
    const added = newScope.filter(item => !oldScope.includes(item));
    const removed = oldScope.filter(item => !newScope.includes(item));

    return { added, removed }
  }
}

/**;
 * HackerOne Program Discovery
 */;
class HackerOneDiscovery {
  async discoverPrograms() {
    // This would use HackerOne's API or scraping to discover programs
    // For now, return sample data
    return [
      {;
        id: 'h1_sample_1',
        name: 'Sample Tech Company',
        maxBounty: 5000,
        minBounty: 100,
        scope: ['*.example.com', 'api.example.com'],
        categories: ['web', 'api'],
        responseTime: '3 days',
        reputation: 0.85
      }
    ]
  }

  async getProgramDetails(programId) {
    // Get detailed program information
    return {}
  }

  async discoverTargets(program) {
    // Discover specific targets within program scope
    return []
  }
}

/**;
 * Bugcrowd Program Discovery
 */;
class BugcrowdDiscovery {
  async discoverPrograms() {
    return []
  }

  async getProgramDetails(programId) {
    return {}
  }

  async discoverTargets(program) {
    return []
  }
}

/**;
 * Intigriti Program Discovery
 */;
class IntigritiDiscovery {
  async discoverPrograms() {
    return []
  }

  async getProgramDetails(programId) {
    return {}
  }

  async discoverTargets(program) {
    return []
  }
}

/**;
 * YesWeHack Program Discovery
 */;
class YesWeHackDiscovery {
  async discoverPrograms() {
    return []
  }

  async getProgramDetails(programId) {
    return {}
  }

  async discoverTargets(program) {
    return []
  }
}

module.exports = AutomatedTargetDiscovery;