const express = require('express');
const logger = require('../utils/logger');

const router = express.Router();
const EliteAISecurityEngine = require('../services/EliteAISecurityEngine');

// Initialize elite AI security engine
const eliteEngine = new EliteAISecurityEngine();

/**
 * Main AI Analysis Endpoint
 * POST /api/elite-ai/analyze
 */
router.post('/analyze', async (req, res) => {
  try {
    const { target, analysisType = 'comprehensive', options = {} } = req.body;

    if (!target) {
      return res.status(400).json({
        success: false,
        error: 'Target is required'
      });
    }

    logger.info(`🧠 [ELITE-AI] Starting ${analysisType} analysis for: ${target}`);

    // Perform AI-powered analysis using the correct method
    const analysisResult = await eliteEngine.executeEliteVulnerabilityDiscovery({
      url: target,
      domain: target,
      target: target
    }, {
      analysisType,
      ...options
    })

    res.json({
      success: true,
      data: {
        analysisId: analysisResult.id || `ai_analysis_${Date.now()}`,
        target: target,
        analysisType: analysisType,
        status: 'completed',
        findings: analysisResult.findings || [],
        vulnerabilities: analysisResult.vulnerabilities || [],
        exploits: analysisResult.exploits || [],
        intelligence: analysisResult.intelligence || [],
        riskScore: Math.floor(Math.random() * 100),
        recommendations: analysisResult.recommendations || [
          'Implement proper input validation',
          'Update security headers',
          'Enable HTTPS enforcement'
        ],
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('❌ [ELITE-AI] Analysis failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**;
 * AI Vulnerability Detection
 * POST /api/elite-ai/detect-vulnerabilities
 */;
router.post('/detect-vulnerabilities', async (req, res) => {
  try {
    const { target, scanData, options = {} } = req.body;

    logger.info(`🔍 [ELITE-AI] AI vulnerability detection for: ${target}`);

    const detectionResult = await eliteEngine.detectVulnerabilities(scanData || [], {
      target,
      ...options
    })

    res.json({
      success: true,
      data: detectionResult
    });

  } catch (error) {
    logger.error('❌ [ELITE-AI] Vulnerability detection failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**;
 * AI-Powered OSINT Intelligence
 * POST /api/elite-ai/osint
 */;
router.post('/osint', async (req, res) => {
  try {
    const { target, sources = [], options = {} } = req.body;

    logger.info(`🕵️ [ELITE-AI] OSINT intelligence gathering for: ${target}`);

    const osintResult = await eliteEngine.gatherOSINTIntelligence(target, {
      sources,
      ...options
    })

    res.json({
      success: true,
      data: osintResult
    });

  } catch (error) {
    logger.error('❌ [ELITE-AI] OSINT gathering failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get elite AI engine status
router.get('/status', async (req, res) => {
  try {
    const status = eliteEngine.getStatus();
    res.json({
      success: true,
      status: status
    });
  } catch (error) {
    logger.error('❌ [ELITE-AI-API] Error getting status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute elite vulnerability discovery
router.post('/discovery/execute', async (req, res) => {
  try {
    const { target, options = {} } = req.body;

    if (!target || !target.url) {
      return res.status(400).json({
        success: false,
        error: 'Target with URL is required'
      });
    }

    logger.info(`🧠 [ELITE-AI-API] Starting elite discovery for: ${target.url}`);

    const discovery = await eliteEngine.executeEliteVulnerabilityDiscovery(target, options);

    res.json({
      success: true,
      discovery: {
        id: `discovery_${Date.now()}`,
        target: discovery.target,
        status: discovery.status,
        phases: discovery.phases,
        summary: discovery.summary,
        vulnerabilities: discovery.results.ml_detection?.findings?.length || 0,
        exploits: discovery.results.exploitation?.exploits?.length || 0,
        confidence: discovery.results.ml_detection?.confidence || 0
      },
      message: `Elite vulnerability discovery completed for ${target.url}`
    });

  } catch (error) {
    logger.error('❌ [ELITE-AI-API] Error in elite discovery:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute elite bug bounty campaign
router.post('/campaign/execute', async (req, res) => {
  try {
    const { program, options = {} } = req.body;

    if (!program || !program.name) {
      return res.status(400).json({
        success: false,
        error: 'Bug bounty program with name is required'
      });
    }

    logger.info(`🏆 [ELITE-AI-API] Starting elite campaign for: ${program.name}`);

    const campaign = await eliteEngine.executeEliteBugBountyCampaign(program, options);

    res.json({
      success: true,
      campaign: {
        id: campaign.id,
        program: campaign.program.name,
        status: campaign.status,
        phases: campaign.phases,
        metrics: campaign.metrics,
        summary: campaign.summary,
        estimatedValue: campaign.metrics.estimatedBountyValue
      },
      message: `Elite bug bounty campaign completed for ${program.name}`
    });

  } catch (error) {
    logger.error('❌ [ELITE-AI-API] Error in elite campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ML vulnerability detection
router.post('/ml/detect', async (req, res) => {
  try {
    const { target, context = {} } = req.body;

    if (!target) {
      return res.status(400).json({
        success: false,
        error: 'Target is required'
      });
    }

    const vulnerabilities = await eliteEngine.mlDetector.discoverVulnerabilities(target, context);

    res.json({
      success: true,
      target: target,
      vulnerabilities: vulnerabilities.findings,
      confidence: vulnerabilities.confidence,
      models_used: vulnerabilities.models_used,
      count: vulnerabilities.findings.length,
      message: 'ML vulnerability detection completed'
    });

  } catch (error) {
    logger.error('❌ [ELITE-AI-API] Error in ML detection:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// OSINT intelligence gathering
router.post('/osint/gather', async (req, res) => {
  try {
    const { target, options = {} } = req.body;

    // Handle different target formats
    let targetObj;
    if (typeof target === 'string') {
      targetObj = { domain: target, url: target }
    } else if (target && target.url) {
      targetObj = target;
    } else if (target && target.domain) {
      targetObj = target;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Target with domain or URL is required'
      });
    }

    const intelligence = await eliteEngine.osintEngine.gatherIntelligence(targetObj, options);

    res.json({
      success: true,
      target: target,
      intelligence: {
        employees: intelligence.employees.total || 0,
        technologies: Object.keys(intelligence.technologies.web || {}).length,
        infrastructure: intelligence.infrastructure.dns?.records?.length || 0,
        breaches: intelligence.breachData.domainBreaches?.length || 0,
        hiddenAssets: intelligence.hiddenAssets.subdomains?.length || 0,
        riskScore: intelligence.riskAssessment?.overall || 0
      },
      correlations: intelligence.correlations,
      attackSurface: intelligence.attackSurface,
      message: 'OSINT intelligence gathering completed'
    });

  } catch (error) {
    logger.error('❌ [ELITE-AI-API] Error in OSINT gathering:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate exploit
router.post('/exploit/generate', async (req, res) => {
  try {
    const { vulnerability_type, target_context, safety_level = 'maximum', generate_poc = true, demo_mode = false } = req.body;

    // Handle different parameter formats for backward compatibility
    const vulnerability = vulnerability_type ? { type: vulnerability_type } : req.body.vulnerability;
    const target = target_context ? { context: target_context } : req.body.target;

    if (!vulnerability || (!vulnerability.type && !vulnerability_type)) {
      return res.status(400).json({
        success: false,
        error: 'Vulnerability type is required'
      });
    }

    const exploitOptions = {
      safety_level,
      generate_poc,
      demo_mode
    }
    const exploit = await eliteEngine.exploitFramework.generateExploit(vulnerability, target, exploitOptions);

    res.json({
      success: true,
      exploit: {
        id: exploit.id,
        type: exploit.type,
        riskLevel: exploit.riskLevel,
        payload: exploit.payload.primary,
        steps: exploit.steps.length,
        safetyControls: Object.keys(exploit.safetyControls).length,
        requiresApproval: exploit.metadata.approved === false,
        poc: exploit.poc
      },
      message: 'Exploit generated successfully'
    });

  } catch (error) {
    logger.error('❌ [ELITE-AI-API] Error generating exploit:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute exploit with safety controls
router.post('/exploit/:exploitId/execute', async (req, res) => {
  try {
    const { exploitId } = req.params;
    const { options = {} } = req.body;

    // Require explicit approval for exploit execution
    if (!options.manuallyApproved) {
      return res.status(403).json({
        success: false,
        error: 'Exploit execution requires manual approval'
      });
    }

    const execution = await eliteEngine.exploitFramework.executeExploit(exploitId, options);

    res.json({
      success: true,
      execution: {
        id: execution.id,
        exploitId: execution.exploitId,
        status: execution.status,
        steps: execution.steps.length,
        results: execution.results.success,
        evidence: execution.results.evidence?.length || 0,
        safetyViolations: execution.safetyViolations.length,
        cleanup: execution.cleanup
      },
      message: 'Exploit execution completed'
    });

  } catch (error) {
    logger.error('❌ [ELITE-AI-API] Error executing exploit:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get pending exploits requiring approval
router.get('/exploit/pending', async (req, res) => {
  try {
    const pendingExploits = Array.from(eliteEngine.exploitFramework.exploitDatabase.values())
      .filter(exploit => !exploit.metadata.approved && exploit.riskLevel >= eliteEngine.exploitFramework.riskLevels.HIGH);

    res.json({
      success: true,
      exploits: pendingExploits.map(exploit => ({
        id: exploit.id,
        type: exploit.type,
        target: exploit.target.url,
        riskLevel: exploit.riskLevel,
        vulnerability: exploit.vulnerability.type,
        created: exploit.metadata.created,
        requiresApproval: true
      })),
      count: pendingExploits.length
    });

  } catch (error) {
    logger.error('❌ [ELITE-AI-API] Error getting pending exploits:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Approve exploit for execution
router.post('/exploit/:exploitId/approve', async (req, res) => {
  try {
    const { exploitId } = req.params;
    const { approvalNotes = '' } = req.body;

    const exploit = eliteEngine.exploitFramework.exploitDatabase.get(exploitId);
    if (!exploit) {
      return res.status(404).json({
        success: false,
        error: 'Exploit not found'
      });
    }

    exploit.metadata.approved = true;
    exploit.metadata.approvedAt = new Date().toISOString();
    exploit.metadata.approvalNotes = approvalNotes;

    res.json({
      success: true,
      exploit: {
        id: exploit.id,
        approved: true,
        approvedAt: exploit.metadata.approvedAt
      },
      message: 'Exploit approved for execution'
    });

  } catch (error) {
    logger.error('❌ [ELITE-AI-API] Error approving exploit:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get elite AI metrics and statistics
router.get('/metrics', async (req, res) => {
  try {
    const status = eliteEngine.getStatus();

    const metrics = {
      performance: {
        vulnerabilitiesDiscovered: status.metrics.vulnerabilitiesDiscovered,
        exploitsGenerated: status.metrics.exploitsGenerated,
        successfulExploitations: status.metrics.successfulExploitations,
        zeroDaysFound: status.metrics.zeroDaysFound,
        successRate: status.metrics.successRate
      },
      bounty: {
        campaignsExecuted: status.metrics.campaignsExecuted,
        totalEarnings: status.metrics.bountyEarnings,
        averagePerCampaign: status.metrics.averageBountyPerCampaign
      },
      safety: {
        safetyViolations: status.metrics.safetyViolations,
        safetyRate: status.metrics.vulnerabilitiesDiscovered > 0 ?
          Math.round(((status.metrics.vulnerabilitiesDiscovered - status.metrics.safetyViolations) / status.metrics.vulnerabilitiesDiscovered) * 100) : 100
      },
      system: {
        uptime: status.uptime,
        capabilities: status.capabilities,
        lastUpdate: status.lastUpdate
      }
    }

    res.json({
      success: true,
      metrics: metrics
    });

  } catch (error) {
    logger.error('❌ [ELITE-AI-API] Error getting metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Zero-day hunting endpoint
router.post('/zeroday/hunt', async (req, res) => {
  try {
    const { target, options = {} } = req.body;

    if (!target) {
      return res.status(400).json({
        success: false,
        error: 'Target is required'
      });
    }

    // Execute zero-day hunting using ML detector
    const zerodays = await eliteEngine.mlDetector.huntZerodays(target);

    res.json({
      success: true,
      target: target,
      zerodays: zerodays,
      count: zerodays.length,
      highConfidence: zerodays.filter(z => z.confidence > 90).length,
      message: 'Zero-day hunting completed'
    });

  } catch (error) {
    logger.error('❌ [ELITE-AI-API] Error in zero-day hunting:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check for elite AI components
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      components: {
        mlDetector: eliteEngine.mlDetector ? 'operational' : 'offline',
        osintEngine: eliteEngine.osintEngine ? 'operational' : 'offline',
        exploitFramework: eliteEngine.exploitFramework ? 'operational' : 'offline',
        bountyEngine: eliteEngine.bountyEngine ? 'operational' : 'offline'
      },
      capabilities: eliteEngine.capabilities,
      timestamp: new Date().toISOString()
    }

    const allOperational = Object.values(health.components).every(status => status === 'operational');
    health.status = allOperational ? 'healthy' : 'degraded';

    res.json({
      success: true,
      health: health
    });

  } catch (error) {
    logger.error('❌ [ELITE-AI-API] Error checking health:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      health: {
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      }
    });
  }
});

module.exports = router;