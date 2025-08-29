const express = require('express');
const router = express.Router();
const BugBountyAutomationEngine = require('../services/BugBountyAutomationEngine');
const BugBountyPlatformIntegration = require('../services/BugBountyPlatformIntegration');
const PersonalBugBountyEngine = require('../personal/PersonalBugBountyEngine');
const logger = require('../utils/productionLogger');

// Initialize engines
const bountyEngine = new BugBountyAutomationEngine();
const platformIntegration = new BugBountyPlatformIntegration();
const personalEngine = new PersonalBugBountyEngine();

/**;
 * Main Bug Bounty Scan Endpoint
 * POST /api/bugbounty/scan
 */;
router.post('/scan', async (req, res) => {
  try {
    const { target, scanTypes = ['vulnerability', 'api_security'], options = {} } = req.body;

    if (!target) {
      return res.status(400).json({
        success: false,
        error: 'Target is required'
      });
    }

    logger.info(`🎯 [BUG-BOUNTY] Starting automated scan for: ${target}`);

    // Create a mock program for the scan
    const mockProgram = {
      id: `program_${Date.now()}`,
      name: `Auto-scan for ${target}`,
      platform: 'automated',
      scope: [target],
      rewards: { critical: 5000, high: 2000, medium: 500, low: 100 }
    }

    // Start the automated bug bounty scan
    const campaign = await bountyEngine.executeBugHuntingCampaign(mockProgram, [target], {
      scanTypes,
      ...options,
      automated: true,
      bugBountyMode: true
    })

    res.json({
      success: true,
      data: {
        scanId: campaign.id,
        target: target,
        status: 'initiated',
        scanTypes: scanTypes,
        estimatedDuration: '15-30 minutes',
        progress: 0,
        findings: campaign.findings || [],
        exploits: campaign.exploits || [],
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('❌ [BUG-BOUNTY] Scan failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**;
 * Get Bug Bounty Scan Status
 * GET /api/bugbounty/scan/:scanId/status
 */;
router.get('/scan/:scanId/status', async (req, res) => {
  try {
    const { scanId } = req.params;

    // Get campaign status
    const campaign = bountyEngine.activeCampaigns.get(scanId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found'
      });
    }

    res.json({
      success: true,
      data: {
        scanId: scanId,
        status: campaign.status,
        progress: campaign.progress || 0,
        findings: campaign.findings || [],
        exploits: campaign.exploits || [],
        currentPhase: campaign.currentPhase,
        phases: campaign.phases
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**;
 * Execute Automated Bug Bounty Workflow
 * POST /api/bugbounty/execute
 */;
router.post('/execute', async (req, res) => {
  try {
    const { target, workflow = 'comprehensive', options = {} } = req.body;

    logger.info(`🚀 [BUG-BOUNTY] Executing ${workflow} workflow for: ${target}`);

    const executionResult = await personalEngine.executePersonalWorkflow(target, {
      workflow,
      ...options
    })

    res.json({
      success: true,
      data: executionResult
    });
  } catch (error) {
    logger.error('❌ [BUG-BOUNTY] Workflow execution failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start automated bug bounty campaign
router.post('/campaign/start', async (req, res) => {
  try {
    const { program, targets, config = {} } = req.body;

    if (!program || !targets) {
      return res.status(400).json({
        success: false,
        error: 'Program and targets are required'
      });
    }

    logger.info(`🚀 [BOUNTY-API] Starting campaign for program: ${program.name}`);

    const campaign = await bountyEngine.executeBugHuntingCampaign(program, targets);

    res.json({
      success: true,
      campaignId: campaign.id,
      message: `Bug bounty campaign started for ${program.name}`,
      campaign: {
        id: campaign.id,
        status: campaign.status,
        phases: campaign.phases,
        findings: campaign.findings?.length || 0,
        exploits: campaign.exploits?.length || 0
      }
    });

  } catch (error) {
    logger.error('❌ [BOUNTY-API] Error starting campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Monitor bug bounty programs
router.get('/programs/monitor', async (req, res) => {
  try {
    const programs = await bountyEngine.monitorBugBountyPrograms();

    res.json({
      success: true,
      programs: programs,
      count: programs.length,
      message: 'Bug bounty programs monitored successfully'
    });

  } catch (error) {
    logger.error('❌ [BOUNTY-API] Error monitoring programs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Discover targets for a program
router.post('/targets/discover', async (req, res) => {
  try {
    const { program } = req.body;

    if (!program) {
      return res.status(400).json({
        success: false,
        error: 'Program is required'
      });
    }

    const discovery = await bountyEngine.discoverAndValidateTargets(program);

    res.json({
      success: true,
      discovery: discovery,
      assets: discovery.assets?.length || 0,
      message: `Target discovery completed for ${program.name}`
    });

  } catch (error) {
    logger.error('❌ [BOUNTY-API] Error discovering targets:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get pending submissions for review
router.get('/submissions/pending', async (req, res) => {
  try {
    const submissions = bountyEngine.getPendingSubmissions();

    res.json({
      success: true,
      submissions: submissions,
      count: submissions.length,
      totalEstimatedValue: submissions.reduce((sum, s) => sum + (s.estimatedValue || 0), 0)
    });

  } catch (error) {
    logger.error('❌ [BOUNTY-API] Error getting submissions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Approve and submit bug report
router.post('/submissions/:submissionId/approve', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { reviewNotes } = req.body;

    const result = await bountyEngine.approveAndSubmit(submissionId, reviewNotes);

    res.json({
      success: true,
      submission: result,
      message: 'Bug report approved and submitted successfully'
    });

  } catch (error) {
    logger.error('❌ [BOUNTY-API] Error approving submission:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get campaign status
router.get('/campaign/:campaignId/status', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = bountyEngine.campaigns.get(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      campaign: {
        id: campaign.id,
        status: campaign.status,
        phases: campaign.phases,
        progress: this.calculateCampaignProgress(campaign.phases),
        findings: campaign.findings?.length || 0,
        exploits: campaign.exploits?.length || 0,
        submissions: campaign.submissions?.length || 0
      }
    });

  } catch (error) {
    logger.error('❌ [BOUNTY-API] Error getting campaign status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get bug bounty statistics
router.get('/stats', async (req, res) => {
  try {
    const campaigns = Array.from(bountyEngine.campaigns.values());
    const submissions = Array.from(bountyEngine.submissions.values());

    const stats = {
      campaigns: {
        total: campaigns.length,
        active: campaigns.filter(c => c.status === 'running').length,
        completed: campaigns.filter(c => c.status === 'completed').length,
        failed: campaigns.filter(c => c.status === 'failed').length
      },
      findings: {
        total: campaigns.reduce((sum, c) => sum + (c.findings?.length || 0), 0),
        exploitable: campaigns.reduce((sum, c) => sum + (c.exploits?.length || 0), 0),
        validated: campaigns.reduce((sum, c) => sum + (c.validatedFindings?.length || 0), 0)
      },
      submissions: {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'pending_review').length,
        approved: submissions.filter(s => s.status === 'approved').length,
        submitted: submissions.filter(s => s.status === 'submitted').length,
        estimatedValue: submissions.reduce((sum, s) => sum + (s.estimatedValue || 0), 0)
      },
      success_rate: campaigns.length > 0 ?
        Math.round((campaigns.filter(c => c.status === 'completed').length / campaigns.length) * 100) : 0
    }

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    logger.error('❌ [BOUNTY-API] Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// AI vulnerability discovery endpoint
router.post('/ai/discover', async (req, res) => {
  try {
    const { target, context = {} } = req.body;

    if (!target) {
      return res.status(400).json({
        success: false,
        error: 'Target is required'
      });
    }

    const vulnerabilities = await bountyEngine.aiEngine.discoverVulnerabilities(target, context);

    res.json({
      success: true,
      target: target,
      vulnerabilities: vulnerabilities,
      count: vulnerabilities.length,
      message: 'AI vulnerability discovery completed'
    });

  } catch (error) {
    logger.error('❌ [BOUNTY-API] Error in AI discovery:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate exploit for vulnerability
router.post('/ai/exploit', async (req, res) => {
  try {
    const { vulnerability, target } = req.body;

    if (!vulnerability || !target) {
      return res.status(400).json({
        success: false,
        error: 'Vulnerability and target are required'
      });
    }

    const exploit = await bountyEngine.aiEngine.generateExploit(vulnerability, target);

    res.json({
      success: true,
      exploit: exploit,
      message: 'Exploit generated successfully'
    });

  } catch (error) {
    logger.error('❌ [BOUNTY-API] Error generating exploit:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Submit vulnerability report to bug bounty platform
router.post('/submit', async (req, res) => {
  try {
    const { platform, reportData } = req.body;

    if (!platform || !reportData) {
      return res.status(400).json({
        success: false,
        error: 'Platform and report data are required'
      });
    }

    logger.info(`📤 [BOUNTY-API] Submitting report to ${platform}`);

    const submission = await platformIntegration.submitReport(platform, reportData);

    res.json({
      success: true,
      data: {
        submissionId: submission.id,
        platform: submission.platform,
        status: submission.status,
        platformId: submission.platformId,
        platformUrl: submission.platformUrl,
        submittedAt: submission.submittedAt
      }
    });

  } catch (error) {
    logger.error('❌ [BOUNTY-API] Submission failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all submissions with filtering
router.get('/submissions', async (req, res) => {
  try {
    const { platform, status, dateFrom, dateTo } = req.query;

    const filters = {}
    if (platform) filters.platform = platform;
    if (status) filters.status = status;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    const submissions = platformIntegration.getSubmissions(filters);

    res.json({
      success: true,
      data: {
        submissions: submissions,
        total: submissions.length
      }
    });

  } catch (error) {
    logger.error('❌ [BOUNTY-API] Failed to get submissions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get earnings summary and statistics
router.get('/earnings', async (req, res) => {
  try {
    const summary = platformIntegration.getEarningsSummary();

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    logger.error('❌ [BOUNTY-API] Failed to get earnings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get personal bug bounty dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const dashboard = await personalEngine.getPersonalDashboard();
    const earnings = platformIntegration.getEarningsSummary();

    // Combine personal engine data with platform earnings
    dashboard.earnings = earnings;

    res.json({
      success: true,
      data: dashboard
    });

  } catch (error) {
    logger.error('❌ [BOUNTY-API] Failed to get dashboard:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute personal bug bounty workflow
router.post('/workflow/personal', async (req, res) => {
  try {
    const { target, options = {} } = req.body;

    if (!target) {
      return res.status(400).json({
        success: false,
        error: 'Target is required'
      });
    }

    logger.info(`🚀 [BOUNTY-API] Starting personal workflow for: ${target}`);

    // Start workflow asynchronously
    const workflowPromise = personalEngine.executePersonalWorkflow(target, options);

    // Return immediately with workflow ID
    const workflowId = `personal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      success: true,
      data: {
        workflowId: workflowId,
        target: target,
        status: 'started',
        message: 'Personal bug bounty workflow started'
      }
    });

    // Execute workflow in background
    try {
      const result = await workflowPromise;
      logger.info(`✅ [BOUNTY-API] Personal workflow completed: ${result.id}`);
    } catch (error) {
      logger.error(`❌ [BOUNTY-API] Personal workflow failed: ${error.message}`);
    }

  } catch (error) {
    logger.error('❌ [BOUNTY-API] Failed to start personal workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get daily target recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const { availableTime = 240 } = req.query; // Default 4 hours

    const recommendations = await personalEngine.getDailyRecommendations(parseInt(availableTime));

    res.json({
      success: true,
      data: {
        recommendations: recommendations,
        availableTime: availableTime,
        totalEstimatedTime: recommendations.reduce((sum, r) => sum + r.estimatedTime, 0),
        totalBountyPotential: recommendations.reduce((sum, r) => sum + r.bountyPotential, 0)
      }
    });

  } catch (error) {
    logger.error('❌ [BOUNTY-API] Failed to get recommendations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Retry failed submission
router.post('/submissions/:submissionId/retry', async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await platformIntegration.retrySubmission(submissionId);

    res.json({
      success: true,
      data: submission
    });

  } catch (error) {
    logger.error('❌ [BOUNTY-API] Failed to retry submission:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get submission details
router.get('/submissions/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = platformIntegration.submissions.get(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    res.json({
      success: true,
      data: submission
    });

  } catch (error) {
    logger.error('❌ [BOUNTY-API] Failed to get submission:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Immunefi PoC Generation
router.post('/immunefi/generate-poc', async (req, res) => {
  try {
    const ImmuneFiPoCGenerator = require('../../setup-immunefi-poc');
    const generator = new ImmuneFiPoCGenerator();

    const {
      name,
      type,
      severity,
      targetContract,
      network,
      description,
      impact,
      mitigation,
      vulnerabilities,
      analysisResults
    } = req.body;

    // Validate required fields
    if (!name || !type || !severity || !targetContract) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, type, severity, targetContract'
      });
    }

    logger.info('🛡️ [IMMUNEFI] Generating comprehensive PoC for:', name);
    logger.info('📊 [IMMUNEFI] Vulnerabilities to include:', vulnerabilities?.length || 1);

    // Generate PoC structure with comprehensive data
    const pocData = {
      name,
      type,
      severity,
      targetContract,
      network: network || 'ethereum',
      description,
      impact,
      mitigation,
      vulnerabilities: vulnerabilities || [],
      analysisResults: analysisResults || null
    }

    // Generate the comprehensive PoC
    const pocResult = await generator.generatePoC(pocData);

    // Create comprehensive report structure
    const comprehensiveReport = {
      metadata: {
        generatedAt: new Date().toISOString(),
        vulnerabilityData: pocData,
        projectName: `immunefi-poc-${name.toLowerCase().replace(/\s+/g, '-')}`,
        immunefiCompliant: true,
        totalVulnerabilities: vulnerabilities?.length || 1,
        reportType: 'Comprehensive ImmuneFi PoC'
      },
      vulnerabilitySummary: {
        primaryVulnerability: {
          name,
          type,
          severity,
          description,
          impact,
          mitigation
        },
        allVulnerabilities: vulnerabilities || [],
        riskAssessment: {
          overallRisk: severity,
          financialImpact: severity === 'critical' ? '$500K+' :
                          severity === 'high' ? '$50K-$500K' :
                          severity === 'medium' ? '$5K-$50K' : '$1K-$5K',
          exploitComplexity: type === 'reentrancy' ? 'Low' :
                           type === 'flashloan' ? 'Medium' : 'Medium'
        }
      },
      pocFiles: {
        foundryConfig: pocResult.foundryConfig,
        envExample: pocResult.envExample,
        exploitContract: pocResult.exploitContract,
        targetContract: pocResult.targetContract,
        interface: pocResult.interface,
        testContract: pocResult.testContract,
        deployScript: pocResult.deployScript,
        readme: pocResult.readme,
        gitignore: generator.getGitignore()
      },
      submissionPackage: {
        title: `${name} - ImmuneFi Bug Bounty Submission`,
        summary: `Comprehensive PoC demonstrating ${type} vulnerability in smart contract ${targetContract}`,
        severity: severity,
        bountyEstimate: severity === 'critical' ? '$100K-$1M' :
                       severity === 'high' ? '$25K-$100K' :
                       severity === 'medium' ? '$5K-$25K' : '$1K-$5K',
        filesIncluded: [
          'foundry.toml - Foundry configuration',
          'src/Exploit.sol - Main exploit contract',
          'src/Target.sol - Vulnerable target contract',
          'src/interfaces/ITarget.sol - Contract interface',
          'test/ExploitTest.t.sol - Comprehensive test suite',
          'script/Deploy.s.sol - Deployment script',
          'README.md - Professional documentation',
          '.env.example - Environment configuration'
        ],
        testingInstructions: [
          'Install Foundry: curl -L https://foundry.paradigm.xyz | bash',
          'Clone the PoC repository',
          'Run: forge install',
          'Copy: cp .env.example .env',
          'Configure RPC URLs in .env file',
          'Execute tests: forge test -vvv',
          'Deploy on testnet: forge script script/Deploy.s.sol'
        ]
      }
    }

    logger.info('✅ [IMMUNEFI] PoC generated successfully with', Object.keys(pocResult.pocFiles || {}).length, 'files');

    res.json({
      success: true,
      data: comprehensiveReport,
      message: 'Comprehensive Immunefi PoC generated successfully'
    });

  } catch (error) {
    logger.error('❌ [IMMUNEFI] Error generating PoC:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PoC',
      details: error.message
    });
  }
});

// Generate PoC from analysis results
router.post('/immunefi/generate-from-analysis', async (req, res) => {
  try {
    const ImmuneFiPoCGenerator = require('../../setup-immunefi-poc');
    const generator = new ImmuneFiPoCGenerator();

    const { analysisResults } = req.body;

    if (!analysisResults || !analysisResults.results?.vulnerabilities) {
      return res.status(400).json({
        success: false,
        error: 'Analysis results with vulnerabilities required'
      });
    }

    logger.info('🔍 [IMMUNEFI] Generating PoC from analysis results');
    logger.info('📊 [IMMUNEFI] Found', analysisResults.results.vulnerabilities.length, 'vulnerabilities');

    // Generate comprehensive PoC from analysis
    const pocResult = await generator.generateComprehensivePoC(analysisResults);

    res.json({
      success: true,
      data: pocResult,
      message: 'PoC generated from analysis results successfully'
    });

  } catch (error) {
    logger.error('❌ [IMMUNEFI] Error generating PoC from analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PoC from analysis',
      details: error.message
    });
  }
});

// Get Immunefi PoC templates
router.get('/immunefi/templates', async (req, res) => {
  try {
    const templates = {
      vulnerabilityTypes: [
        { value: 'reentrancy', label: 'Reentrancy Attack', description: 'External calls before state updates' },
        { value: 'flashloan', label: 'Flash Loan Attack', description: 'Exploiting flash loan mechanisms' },
        { value: 'price-manipulation', label: 'Price Manipulation', description: 'Oracle or AMM price manipulation' },
        { value: 'access-control', label: 'Access Control', description: 'Unauthorized function access' },
        { value: 'integer-overflow', label: 'Integer Overflow', description: 'Arithmetic overflow/underflow' },
        { value: 'front-running', label: 'Front Running', description: 'MEV and transaction ordering' },
        { value: 'sandwich-attack', label: 'Sandwich Attack', description: 'MEV sandwich attacks' },
        { value: 'governance-attack', label: 'Governance Attack', description: 'Governance mechanism exploitation' }
      ],
      severityLevels: [
        { value: 'critical', label: 'Critical', bountyRange: '$50K - $1M+' },
        { value: 'high', label: 'High', bountyRange: '$10K - $50K' },
        { value: 'medium', label: 'Medium', bountyRange: '$1K - $10K' },
        { value: 'low', label: 'Low', bountyRange: '$100 - $1K' }
      ],
      networks: [
        { value: 'ethereum', label: 'Ethereum', chainId: 1 },
        { value: 'polygon', label: 'Polygon', chainId: 137 },
        { value: 'arbitrum', label: 'Arbitrum', chainId: 42161 },
        { value: 'optimism', label: 'Optimism', chainId: 10 },
        { value: 'avalanche', label: 'Avalanche', chainId: 43114 },
        { value: 'bsc', label: 'BSC', chainId: 56 }
      ]
    };

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get templates'
    });
  }
});

module.exports = router;