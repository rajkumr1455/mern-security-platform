#!/usr/bin/env node

/**;
 * Bug Bounty Automation Platform Setup Script
 * Sets up your personal bug bounty automation environment
 */;

const fs = require('fs').promises;
const logger = require('../utils/logger');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function setupBugBountyAutomation() {
  console.log(`;
🎯 ===============================================
   BUG BOUNTY AUTOMATION PLATFORM SETUP
🎯 ===============================================

Welcome to your personal bug bounty automation setup!
This script will configure your platform for automated
bug hunting across multiple platforms.

`);

  try {
    // Step 1: Personal Configuration
    logger.info('📋 STEP 1: Personal Configuration\n');

    const personalConfig = await setupPersonalConfig();

    // Step 2: Platform Credentials
    logger.info('\n🔐 STEP 2: Platform API Credentials\n');

    const credentials = await setupPlatformCredentials();

    // Step 3: Notification Setup
    logger.info('\n📢 STEP 3: Notification Setup\n');

    const notifications = await setupNotifications();

    // Step 4: Save Configuration
    logger.info('\n💾 STEP 4: Saving Configuration\n');

    await saveConfiguration(personalConfig, credentials, notifications);

    // Step 5: Final Setup
    logger.info('\n🚀 STEP 5: Final Setup\n');

    await finalizeSetup();

    console.log(`;
🎉 ===============================================
   SETUP COMPLETE!
🎉 ===============================================

Your bug bounty automation platform is now configured!

Next steps:
1. Start the platform: npm run dev
2. Open http://localhost:3000
3. Navigate to Bug Bounty Dashboard
4. Start your first automated hunt!

Happy hunting! 🎯
`);

  } catch (error) {
    logger.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function setupPersonalConfig() {
  try {
  logger.info('Let\'s configure your hunting preferences...\n');

  const skillLevel = await question('What\'s your skill level? (beginner/intermediate/advanced/expert): ');
  const riskTolerance = await question('Risk tolerance? (low/medium/high): ');
  const dailyTime = await question('How many hours per day for bug hunting? (default: 4): ') || '4';
  const maxTargets = await question('Maximum daily targets? (default: 5): ') || '5';

  logger.info('\nSelect your preferred vulnerability types (comma-separated);:');
  logger.info('Options: XSS, IDOR, Open Redirect, CSRF, SQLi, Authentication Bypass, RCE, LFI');
  const vulnTypes = await question('Preferred types: ') || 'XSS,IDOR,Open Redirect,CSRF';

  const preferredVulnTypes = vulnTypes.split(',').map(v => v.trim());

  return {
    skillLevel: skillLevel || 'intermediate',
    riskTolerance: riskTolerance || 'medium',
    maxDailyHuntingTime: parseInt(dailyTime) * 60, // Convert to minutes
    maxDailyTargets: parseInt(maxTargets),
    preferredVulnTypes;
  
  } catch (error) {
    logger.error('Error in async function:', error);
    throw error;
  }};
}

async function setupPlatformCredentials() {
  try {
  logger.info('Configure your bug bounty platform API credentials...\n');
  logger.info('⚠️  You can skip any platform and configure it later.\n');

  const credentials = {
  } catch (error) {
    logger.error('Error in async function:', error);
    throw error;
  }};

  // HackerOne
  logger.info('🔹 HackerOne Configuration:');
  const h1Username = await question('HackerOne username (or press Enter to skip): ');
  if (h1Username) {
    const h1ApiKey = await question('HackerOne API key: ');
    credentials.hackerone = {
      username: h1Username,
      apiKey: h1ApiKey,
      enabled: true
    };
  } else {
    credentials.hackerone = { enabled: false };
  }

  // Bugcrowd
  logger.info('\n🔹 Bugcrowd Configuration:');
  const bcEmail = await question('Bugcrowd email (or press Enter to skip): ');
  if (bcEmail) {
    const bcApiKey = await question('Bugcrowd API key: ');
    credentials.bugcrowd = {
      email: bcEmail,
      apiKey: bcApiKey,
      enabled: true
    };
  } else {
    credentials.bugcrowd = { enabled: false };
  }

  // Intigriti
  logger.info('\n🔹 Intigriti Configuration:');
  const intClientId = await question('Intigriti Client ID (or press Enter to skip): ');
  if (intClientId) {
    const intClientSecret = await question('Intigriti Client Secret: ');
    credentials.intigriti = {
      clientId: intClientId,
      clientSecret: intClientSecret,
      enabled: true
    };
  } else {
    credentials.intigriti = { enabled: false };
  }

  // YesWeHack
  logger.info('\n🔹 YesWeHack Configuration:');
  const ywhApiKey = await question('YesWeHack API key (or press Enter to skip): ');
  if (ywhApiKey) {
    credentials.yeswehack = {
      apiKey: ywhApiKey,
      enabled: true
    };
  } else {
    credentials.yeswehack = { enabled: false };
  }

  return credentials;
}

async function setupNotifications() {
  try {
  logger.info('Configure notification preferences...\n');

  const email = await question('Email for notifications: ');
  const discordWebhook = await question('Discord webhook URL (optional): ');
  const slackWebhook = await question('Slack webhook URL (optional): ');

  return {
    email: email || '',
    discord: discordWebhook || '',
    slack: slackWebhook || '',
    highSeverityFindings: true,
    dailyGoalProgress: true,
    weeklyEarningsReport: true,
    newProgramAlerts: true
  
  } catch (error) {
    logger.error('Error in async function:', error);
    throw error;
  }};
}

async function saveConfiguration(personalConfig, credentials, notifications) {
  try {
  logger.info('Saving configuration files...');

  // Update personal config
  const personalConfigPath = path.join(__dirname, 'server/personal/PersonalConfig.js');
  const configContent = await fs.readFile(personalConfigPath, 'utf8');

  let updatedConfig = configContent
    .replace(/skillLevel: '[^']*'/, `skillLevel: '${personalConfig.skillLevel
  } catch (error) {
    logger.error('Error in async function:', error);
    throw error;
  }}'`)
    .replace(/riskTolerance: '[^']*'/, `riskTolerance: '${personalConfig.riskTolerance}'`)
    .replace(/maxDailyHuntingTime: \d+/, `maxDailyHuntingTime: ${personalConfig.maxDailyHuntingTime}`)
    .replace(/maxDailyTargets: \d+/, `maxDailyTargets: ${personalConfig.maxDailyTargets}`);

  // Update preferred vulnerability types
  const vulnTypesStr = personalConfig.preferredVulnTypes.map(v => `'${v}'`).join(',\n      ');
  updatedConfig = updatedConfig.replace(
    /preferredVulnTypes: \[[^\]]*\]/s,
    `preferredVulnTypes: [\n      ${vulnTypesStr}\n    ]`
  );

  // Update notifications
  if (notifications.email) {
    updatedConfig = updatedConfig.replace(
      /email: '[^']*'/,
      `email: '${notifications.email}'`
    );
  }

  await fs.writeFile(personalConfigPath, updatedConfig);

  // Save platform credentials
  const credentialsPath = path.join(__dirname, 'server/config/platform-credentials.json');
  await fs.mkdir(path.dirname(credentialsPath), { recursive: true });
  await fs.writeFile(credentialsPath, JSON.stringify(credentials, null, 2));

  logger.info('✅ Configuration saved successfully!');
}

async function finalizeSetup() {
  try {
  logger.info('Finalizing setup...');

  // Create necessary directories
  const dirs = [
    'server/config',;
    'server/logs',;
    'server/reports',;
    'server/data';
  ];

  for (const dir of dirs) {
    await fs.mkdir(path.join(__dirname, dir), { recursive: true 
  } catch (error) {
    logger.error('Error in async function:', error);
    throw error;
  }});
  }

  // Create .env file if it doesn't exist
  const envPath = path.join(__dirname, 'server/.env');
  try {
    await fs.access(envPath);
  } catch {
    const envContent = `# Bug Bounty Automation Platform Environment Variables
NODE_ENV=development;
PORT=5000;
MONGODB_URI=mongodb://localhost:27017/bugbounty-automation;
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production;
CORS_ORIGIN=http://localhost:3000;

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000;
RATE_LIMIT_MAX_REQUESTS=100;

# Logging
LOG_LEVEL=info;
LOG_FILE=logs/app.log;

# Bug Bounty Platform Settings
AUTO_DISCOVERY_ENABLED=true;
AUTO_SUBMISSION_ENABLED=false;
MAX_CONCURRENT_SCANS=3;
`;
    await fs.writeFile(envPath, envContent);
  }

  logger.info('✅ Setup finalized!');
}

// Run setup if called directly
if (require.main === module) {
  setupBugBountyAutomation().catch(console.error);
}

module.exports = { setupBugBountyAutomation };