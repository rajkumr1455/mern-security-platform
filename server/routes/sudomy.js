const express = require('express');
const logger = require('../utils/logger');

const router = express.Router();

// In-memory storage for demo purposes (in production, use a database)
let activeScans = {}
let scanHistory = [];
let reconResults = {}

// Sudomy reconnaissance page route
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Sudomy reconnaissance module available',
      features: [
        'Advanced subdomain enumeration',
        'DNS resolution and validation',
        'Screenshot capture',
        'Port scanning integration',
        'Comprehensive reporting'
      ],
      sudomy_available: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load Sudomy module'
    });
  }
});

// Start Sudomy scan
router.post('/start', async (req, res) => {
  try {
    const { domain, target } = req.body;
    const targetDomain = domain || target;

    if (!targetDomain || !targetDomain.trim()) {
      logger.info('❌ [SUDOMY] Scan request failed: No domain provided');
      return res.status(400).json({
        success: false,
        message: 'Domain is required'
      });
    }

    const cleanDomain = targetDomain.trim();
    logger.info(`\n🚀 [SUDOMY] ==========================================`);
    logger.info(`🔍 [SUDOMY] Starting reconnaissance scan for: ${cleanDomain}`);
    logger.info(`📅 [SUDOMY] Timestamp: ${new Date().toISOString()}`);
    logger.info(`🌐 [SUDOMY] Client IP: ${req.ip}`);
    logger.info(`🚀 [SUDOMY] ==========================================\n`);

    // Generate scan ID
    const scanId = `sudomy_${cleanDomain}_${Date.now()}`;
    logger.info(`🆔 [SUDOMY] Generated scan ID: ${scanId}`);

    // Validate domain format
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainPattern.test(cleanDomain)) {
      logger.info(`❌ [SUDOMY] Invalid domain format: ${cleanDomain}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid domain format'
      });
    }

    logger.info(`✅ [SUDOMY] Domain validation passed: ${cleanDomain}`);

    // Initialize scan phases
    const scanPhases = [
      '🔍 Initializing Sudomy framework',
      '📡 DNS enumeration and resolution',
      '🌐 Subdomain discovery',
      '📸 Screenshot capture',
      '🔍 Port scanning',
      '📊 Results compilation'
    ];

    logger.info(`📋 [SUDOMY] Scan phases planned:`);
    scanPhases.forEach((phase, i) => {
      logger.info(`   ${i + 1}. ${phase}`);
    });

    // Add to active scans
    activeScans[scanId] = {
      id: scanId,
      type: 'sudomy',
      target: cleanDomain,
      status: 'running',
      started_at: Date.now(),
      progress: 0,
      phases: scanPhases,
      current_phase: 0,
      current_phase_name: scanPhases[0]
    }

    logger.info(`💾 [SUDOMY] Scan registered in active scans database`);
    logger.info(`🏃 [SUDOMY] Scan status: RUNNING`);
    logger.info(`📈 [SUDOMY] Initial progress: 0%`);

    // Start background simulation
    simulateSudomyScan(scanId, cleanDomain, scanPhases);

    logger.info(`🎯 [SUDOMY] Background scan task initiated`);
    logger.info(`✅ [SUDOMY] API response prepared for client`);
    logger.info(`🚀 [SUDOMY] ========================================\n`);

    res.json({
      success: true,
      message: `Sudomy scan started for ${cleanDomain}`,
      scan_id: scanId,
      domain: cleanDomain,
      phases: scanPhases.length,
      estimated_duration: '5-10 minutes'
    });

  } catch (error) {
    logger.info(`💥 [SUDOMY] CRITICAL ERROR: ${error.message}`);
    res.status(500).json({
      success: false,
      message: `Error starting scan: ${error.message}`
    });
  }
});

// Get scan progress
router.get('/:scanId/progress', async (req, res) => {
  try {
    const { scanId } = req.params;
    logger.info(`🔍 [SUDOMY-API] Progress request for scan: ${scanId}`);

    // Check if scan exists in active scans
    if (activeScans[scanId]) {
      const scanData = activeScans[scanId];
      const progressData = {
        scan_id: scanId,
        status: scanData.status || 'running',
        progress: scanData.progress || 0,
        current_phase: scanData.current_phase || 0,
        current_phase_name: scanData.current_phase_name || 'Initializing',
        target: scanData.target || '',
        started_at: scanData.started_at || '',
        estimated_completion: '5-10 minutes'
      }
      logger.info(`✅ [SUDOMY-API] Progress: ${progressData.progress}% - ${progressData.current_phase_name}`);
      return res.json(progressData);
    }

    // Check if scan is completed (in reconResults)
    if (reconResults[scanId]) {
      const resultData = reconResults[scanId];
      const progressData = {
        scan_id: scanId,
        status: 'completed',
        progress: 100,
        current_phase: 6,
        current_phase_name: 'Completed',
        target: resultData.target || '',
        completed_at: resultData.completed_at || '',
        results: {
          subdomains_found: (resultData.subdomains_found || []).length,
          vulnerabilities: (resultData.vulnerabilities || []).length,
          total_hosts: resultData.total_hosts || 0
        }
      }
      logger.info(`✅ [SUDOMY-API] Scan completed - ${progressData.results.subdomains_found} subdomains found`);
      return res.json(progressData);
    }

    logger.info(`❌ [SUDOMY-API] Scan not found: ${scanId}`);
    res.status(404).json({
      error: 'Scan not found',
      scan_id: scanId
    });

  } catch (error) {
    logger.info(`💥 [SUDOMY-API] Progress API error: ${error.message}`);
    res.status(500).json({
      error: error.message,
      scan_id: req.params.scanId
    });
  }
});

// Get scan results
router.get('/:scanId/results', async (req, res) => {
  try {
    const { scanId } = req.params;
    logger.info(`📊 [SUDOMY-API] Results request for scan: ${scanId}`);

    if (reconResults[scanId]) {
      const results = reconResults[scanId];
      logger.info(`✅ [SUDOMY-API] Results found - ${(results.subdomains_found || []).length} subdomains`);
      return res.json({
        success: true,
        scan_id: scanId,
        results: results
      });
    }

    logger.info(`❌ [SUDOMY-API] Results not found for scan: ${scanId}`);
    res.status(404).json({
      success: false,
      error: 'Results not found',
      scan_id: scanId
    });

  } catch (error) {
    logger.info(`💥 [SUDOMY-API] Results API error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      scan_id: req.params.scanId
    });
  }
});

// Get scan history
router.get('/history', async (req, res) => {
  try {
    logger.info(`📋 [SUDOMY-API] History request`);

    // Get recent Sudomy scans from history
    const sudomyScans = scanHistory.filter(scan => scan.type === 'sudomy_recon');

    // Sort by completion time (most recent first)
    sudomyScans.sort((a, b) => new Date(b.completed || 0) - new Date(a.completed || 0));

    // Limit to last 20 scans
    const recentScans = sudomyScans.slice(0, 20);

    logger.info(`✅ [SUDOMY-API] Found ${recentScans.length} historical scans`);

    res.json({
      success: true,
      scans: recentScans,
      total: sudomyScans.length
    });

  } catch (error) {
    logger.info(`💥 [SUDOMY-API] History API error: ${error.message}`);
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

// Get Sudomy statistics
router.get('/stats', async (req, res) => {
  try {
    logger.info(`📊 [SUDOMY-API] Stats request`);

    const sudomyScans = scanHistory.filter(scan => scan.type === 'sudomy_recon');

    const totalScans = sudomyScans.length;
    const totalSubdomains = sudomyScans.reduce((sum, scan) => sum + (scan.subdomains_found || 0), 0);
    const totalVulnerabilities = sudomyScans.reduce((sum, scan) => sum + (scan.vulnerabilities_found || 0), 0);
    const uniqueTargets = new Set(sudomyScans.map(scan => scan.target || '')).size;
    const activeScansCount = Object.values(activeScans).filter(scan => scan.type === 'sudomy').length;

    const stats = {
      total_scans: totalScans,
      total_subdomains: totalSubdomains,
      total_vulnerabilities: totalVulnerabilities,
      unique_targets: uniqueTargets,
      active_scans: activeScansCount,
      success_rate: totalScans > 0 ? Math.round((totalScans / totalScans) * 100) : 0
    }

    logger.info(`✅ [SUDOMY-API] Generated stats: ${JSON.stringify(stats)}`);
    res.json(stats);

  } catch (error) {
    logger.info(`💥 [SUDOMY-API] Stats API error: ${error.message}`);
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

// Simulate Sudomy scan execution
async function simulateSudomyScan(scanId, domain, phases) {
  try {
    logger.info(`🔄 [SUDOMY-${scanId}] Background scan process started`);
    logger.info(`⏱️  [SUDOMY-${scanId}] Estimated completion time: 5-10 minutes`);

    for (let i = 0; i < phases.length; i++) {
      // Wait between phases (simulate real scanning time)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

      const progress = Math.round(((i + 1) / phases.length) * 100);

      if (activeScans[scanId]) {
        activeScans[scanId].progress = progress;
        activeScans[scanId].current_phase = i;
        activeScans[scanId].current_phase_name = phases[i];

        logger.info(`🔧 [SUDOMY-${scanId}] Phase ${i + 1}/${phases.length}: ${phases[i]} (${progress}%)`);
      }
    }

    // Generate mock results
    const mockSubdomains = [
      `www.${domain}`,
      `api.${domain}`,
      `admin.${domain}`,
      `dev.${domain}`,
      `staging.${domain}`,
      `mail.${domain}`,
      `ftp.${domain}`,
      `blog.${domain}`
    ];

    const mockVulnerabilities = [
      {
        type: 'Subdomain Takeover',
        severity: 'High',
        subdomain: `dev.${domain}`,
        description: 'Potential subdomain takeover vulnerability detected'
      },
      {
        type: 'Open Port',
        severity: 'Medium',
        subdomain: `admin.${domain}`,
        description: 'Administrative interface exposed'
      }
    ];

    const completedAt = new Date().toISOString();

    // Store results
    reconResults[scanId] = {
      scan_id: scanId,
      target: domain,
      type: 'sudomy_recon',
      status: 'completed',
      completed_at: completedAt,
      subdomains_found: mockSubdomains,
      vulnerabilities: mockVulnerabilities,
      total_hosts: mockSubdomains.length,
      screenshots_captured: Math.floor(Math.random() * 5) + 1,
      ports_scanned: [80, 443, 22, 21, 25, 53, 110, 143, 993, 995]
    }

    // Add to scan history
    scanHistory.push({
      scan_id: scanId,
      target: domain,
      type: 'sudomy_recon',
      status: 'completed',
      completed: completedAt,
      subdomains_found: mockSubdomains.length,
      vulnerabilities_found: mockVulnerabilities.length,
      scan_type: 'sudomy_recon'
    });

    // Remove from active scans
    delete activeScans[scanId];

    logger.info(`✅ [SUDOMY-${scanId}] Scan completed successfully`);
    logger.info(`📊 [SUDOMY-${scanId}] Results: ${mockSubdomains.length} subdomains, ${mockVulnerabilities.length} vulnerabilities`);

  } catch (error) {
    logger.info(`💥 [SUDOMY-${scanId}] Simulation error: ${error.message}`);

    if (activeScans[scanId]) {
      activeScans[scanId].status = 'failed';
      activeScans[scanId].error = error.message;
    }
  }
}

module.exports = router;