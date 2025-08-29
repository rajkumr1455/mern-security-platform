/**;
 * Personal Bug Bounty Configuration
 * Customize this file according to your hunting preferences
 */;

const personalConfig = {
  // Your hunting profile and preferences
  huntingProfile: {
    // Vulnerability types you're best at finding
    preferredVulnTypes: [
      'XSS',
      'IDOR',
      'Open Redirect',
      'CSRF',
      'SQLi',
      'Authentication Bypass'
    ],

    // Vulnerability types to avoid (not your strength)
    avoidVulnTypes: [
      'Binary Exploitation',
      'Cryptography',
      'Hardware Security',
      'Mobile App Security'
    ],

    // Daily hunting limits
    maxDailyTargets: 5,
    maxScanDuration: 30, // minutes per target
    maxDailyHuntingTime: 240, // 4 hours

    // Your optimal hunting schedule
    preferredHuntingHours: {
      start: 9,  // 9 AM
      end: 17,   // 5 PM
      timezone: 'UTC'
    },

    // Your skill level (affects target selection)
    skillLevel: 'intermediate', // beginner, intermediate, advanced, expert

    // Risk tolerance
    riskTolerance: 'medium' // low, medium, high
  },

  // Your favorite bug bounty programs
  favoritePrograms: [
    {;
      name: 'HackerOne Security',
      platform: 'hackerone',
      url: 'https://hackerone.com/security',
      avgBounty: 500,
      responseTime: '2-5 days',
      successRate: 0.15, // Your historical success rate
      priority: 'high'
    },
    {;
      name: 'Bugcrowd',
      platform: 'bugcrowd',
      url: 'https://bugcrowd.com/programs',
      avgBounty: 300,
      responseTime: '3-7 days',
      successRate: 0.12,
      priority: 'medium'
    },
    {;
      name: 'Intigriti',
      platform: 'intigriti',
      url: 'https://app.intigriti.com/programs',
      avgBounty: 400,
      responseTime: '1-3 days',
      successRate: 0.18,
      priority: 'high'
    }
    // Add more programs as you discover them
  ],

  // Personal automation rules
  automation: {
    // Automatically scan new subdomains when discovered
    autoScanNewSubdomains: true,

    // Automatically generate reports for confirmed vulnerabilities
    autoGenerateReports: true,

    // Auto-submit low-risk findings (be careful with this)
    autoSubmitLowRisk: false,

    // Notify you immediately for high-severity findings
    notifyOnHighSeverity: true,

    // Daily target suggestions based on your profile
    dailyTargetSuggestions: true,

    // Auto-save scan results
    autoSaveResults: true,

    // Parallel scanning limits
    maxParallelScans: 3,
    maxParallelRequests: 10
  },

  // Personal goals and targets
  goals: {
    daily: {
      earnings: 100,        // $100/day
      vulnerabilities: 2,   // 2 vulns/day
      targets: 5,          // 5 targets/day
      reports: 1           // 1 report/day
    },
    weekly: {
      earnings: 700,        // $700/week
      vulnerabilities: 10,  // 10 vulns/week
      targets: 25,         // 25 targets/week
      reports: 5           // 5 reports/week
    },
    monthly: {
      earnings: 3000,       // $3000/month
      vulnerabilities: 40,  // 40 vulns/month
      targets: 100,        // 100 targets/month
      reports: 20          // 20 reports/month
    }
  },

  // Notification preferences
  notifications: {
    email: 'your-email@example.com',
    discord: '', // Discord webhook URL
    slack: '',   // Slack webhook URL

    // What to notify about
    highSeverityFindings: true,
    dailyGoalProgress: true,
    weeklyEarningsReport: true,
    newProgramAlerts: true,
    scanCompletionAlerts: false // Only for long scans
  },

  // Tool preferences and configurations
  tools: {
    // Reconnaissance tools
    recon: {
      subdomainEnumeration: ['crt.sh', 'dnsbuffer', 'securitytrails'],
      portScanning: ['nmap', 'masscan'],
      directoryBruteforce: ['gobuster', 'dirb'],
      technologyDetection: ['wappalyzer', 'builtwith']
    },

    // Vulnerability scanning tools
    scanning: {
      webVulnScanners: ['nuclei', 'nikto', 'sqlmap'],
      customPayloads: true,
      aggressiveScanning: false // Be respectful
    },

    // Reporting tools
    reporting: {
      screenshotTool: 'puppeteer',
      reportFormats: ['html', 'markdown', 'pdf'],
      evidenceCollection: true
    }
  },

  // Rate limiting and respectful scanning
  rateLimiting: {
    requestsPerSecond: 5,     // Be respectful
    delayBetweenRequests: 200, // milliseconds
    maxRetries: 3,
    backoffMultiplier: 2
  },

  // Data storage preferences
  storage: {
    saveRawResults: true,
    saveScreenshots: true,
    saveHttpRequests: true,
    dataRetentionDays: 90,

    // Export formats
    exportFormats: ['json', 'csv', 'xml']
  }
}

module.exports = personalConfig;