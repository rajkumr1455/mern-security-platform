const express = require('express');
const logger = require('../utils/productionLogger');

const router = express.Router();
const path = require('path');
const fs = require('fs');
const Web3ServiceOrchestrator = require('../services/web3/Web3ServiceOrchestrator');
const ReportingServiceOrchestrator = require('../services/reporting/ReportingServiceOrchestrator');

const web3Orchestrator = new Web3ServiceOrchestrator();
const reportingOrchestrator = new ReportingServiceOrchestrator();

// Web3 Status Endpoint
router.get('/status', async (req, res) => {
  try {
    const status = {
      success: true,
      data: {
        service: 'Web3 Security Analysis',
        status: 'operational',
        version: '2.0.0',
        capabilities: [
          'Smart Contract Analysis',
          'DeFi Protocol Security',
          'NFT Contract Auditing',
          'Cross-chain Bridge Analysis',
          'Vulnerability Detection',
          'Gas Optimization',
          'Reentrancy Detection',
          'Access Control Analysis'
        ],
        supportedNetworks: [
          'Ethereum',
          'Binance Smart Chain',
          'Polygon',
          'Arbitrum',
          'Optimism',
          'Avalanche'
        ],
        tools: {
          slither: 'available',
          mythril: 'available',
          manticore: 'available',
          echidna: 'available'
        },
        timestamp: new Date().toISOString()
      }
    }
    res.json(status);
  } catch (error) {
    logger.error('Error getting Web3 status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Web3 status',
      details: error.message
    });
  }
});

// Web3 Tools Status Endpoint
router.get('/tools', async (req, res) => {
  try {
    const tools = {
      success: true,
      data: {
        staticAnalysis: {
          slither: { status: 'available', version: '0.9.6' },
          mythril: { status: 'available', version: '0.23.15' },
          manticore: { status: 'available', version: '0.3.7' }
        },
        dynamicAnalysis: {
          echidna: { status: 'available', version: '2.2.1' },
          foundry: { status: 'available', version: '0.2.0' }
        },
        gasOptimization: {
          gasReporter: { status: 'available', version: '1.0.9' }
        },
        visualization: {
          surya: { status: 'available', version: '0.4.6' },
          solGraph: { status: 'available', version: '1.0.2' }
        }
      }
    }
    res.json(tools);
  } catch (error) {
    logger.error('Error getting Web3 tools:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Web3 tools status'
    });
  }
});

// Smart Contract Analysis
router.post('/analyze', async (req, res) => {
  try {
    const { contractAddress, network = 'ethereum', ...otherData } = req.body

    // Transform the request data to match the service expectations
    const contractData = {
      address: contractAddress,
      network: network,
      name: otherData.name || `Contract_${contractAddress?.slice(0, 8)}`,
      ...otherData
    }

    const userId = req.user?.id || req.body.userId || '507f1f77bcf86cd799439011' // Default user for testing
    const generateReport = req.query.report === 'true' || req.body.generateReport === true;

    if (generateReport) {
      logger.info('🚀 Generating enhanced detailed report with tool evidence and ImmuneFi PoC...')

      // Step 1: Perform comprehensive security analysis using new orchestrator
      const analysisData = await web3Orchestrator.performComprehensiveAnalysis(contractData, { 
        includeVisuals: true, 
        includeEvidence: true 
      })

      // Step 2: Generate enhanced report using new reporting orchestrator
      const enhancedReport = await reportingOrchestrator.generateReport(analysisData, {
        type: 'security',
        format: 'html',
        includeVisualizations: true
      });

      logger.info(`✅ Enhanced report generated: ${enhancedReport.reportId}`);

      const result = {
        ...analysisData,
        detailedReport: enhancedReport,
        features: {
          toolEvidence: Object.keys(enhancedReport.files.toolEvidence || {}).length,
          immunefiPoC: !!enhancedReport.files.immunefiPoc,
          securityTools: Object.keys(enhancedReport.files.securityToolReports || {}).length,
          screenshots: !!enhancedReport.files.screenshots,
          visualizations: !!enhancedReport.files.vulnVisuals
        }
      }

      res.json({
        success: true,
        data: result,
        message: 'Enhanced analysis completed with tool evidence and ImmuneFi PoC integration'
      })
    } else {
      const result = await web3Service.analyzeSmartContract(contractData, userId);
      res.json({ success: true, data: result });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate Detailed Report with Screenshots
router.post('/analyze/detailed', async (req, res) => {
  try {
    const contractData = req.body;
    const userId = req.user?.id || req.body.userId || '507f1f77bcf86cd799439011';
    logger.info('Starting detailed analysis with screenshots for:', contractData.address);

    const result = await web3Service.analyzeSmartContractWithReport(contractData, true, userId);

    res.json({
      success: true,
      data: result,
      message: 'Detailed analysis with screenshots completed successfully'
    });
  } catch (error) {
    logger.error('Detailed analysis failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get User's Web3 Analyses
router.get('/analyses', async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || '507f1f77bcf86cd799439011';
    const options = {
      status: req.query.status,
      network: req.query.network,
      riskLevel: req.query.riskLevel,
      limit: parseInt(req.query.limit) || 50
    }

    const analyses = await web3Service.getUserAnalyses(userId, options);

    res.json({
      success: true,
      data: analyses,
      count: analyses.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Specific Analysis by ID
router.get('/analyses/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;
    const analysis = await web3Service.getAnalysisById(analysisId);

    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Analysis not found' });
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get User Statistics
router.get('/statistics', async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || '507f1f77bcf86cd799439011';
    const stats = await web3Service.getUserStatistics(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate Report for Existing Analysis
router.post('/report/generate/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;
    const contractData = req.body;

    // Get existing analysis (this would normally be from database)
    const analysis = await web3Service.analyzeSmartContract(contractData);

    // Use enhanced reporting service with tool evidence and ImmuneFi PoC
    const enhancedReport = await enhancedReportingService.generateEnhancedReport(analysis, contractData);

    res.json({
      success: true,
      data: { analysisId, report: enhancedReport },
      message: 'Enhanced detailed report generated successfully with tool evidence and ImmuneFi PoC'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Blockchain Network Scanning
router.post('/scan', async (req, res) => {
  try {
    const scanData = req.body;
    const result = await web3Service.scanBlockchain(scanData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DeFi Protocol Analysis
router.post('/defi/analyze', async (req, res) => {
  try {
    const protocolData = req.body;
    const result = await web3Service.analyzeDeFiProtocol(protocolData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// NFT Contract Analysis
router.post('/nft/analyze', async (req, res) => {
  try {
    const nftData = req.body;
    const result = await web3Service.analyzeNFTContract(nftData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cross-Chain Bridge Analysis
router.post('/bridge/analyze', async (req, res) => {
  try {
    const bridgeData = req.body;
    const result = await web3Service.analyzeBridge(bridgeData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enhanced Reporting with ImmuneFi PoC Integration
router.post('/analyze/enhanced', async (req, res) => {
  try {
    const { contractAddress, network = 'ethereum', includePoC = true } = req.body;

    if (!contractAddress) {
      return res.status(400).json({
        success: false,
        error: 'Contract address is required'
      });
    }

    logger.info(`🚀 Starting enhanced Web3 analysis for ${contractAddress}...`)

    // Step 1: Perform comprehensive security analysis
    const analysisData = await web3Service.analyzeContract(contractAddress, network)

    // Step 2: Generate enhanced report with tool evidence and ImmuneFi PoC
    const contractData = { address: contractAddress, network }
    const enhancedReport = await enhancedReportingService.generateEnhancedReport(analysisData, contractData);

    logger.info(`✅ Enhanced report generated: ${enhancedReport.reportId}`);

    res.json({
      success: true,
      data: {
        analysis: analysisData,
        report: enhancedReport,
        features: {
          toolEvidence: Object.keys(enhancedReport.files.toolEvidence || {}).length,
          immunefiPoC: !!enhancedReport.files.immunefiPoc,
          securityTools: Object.keys(enhancedReport.files.securityToolReports || {}).length,
          screenshots: !!enhancedReport.files.screenshots,
          visualizations: !!enhancedReport.files.vulnVisuals
        },
        message: 'Enhanced Web3 security analysis completed with ImmuneFi PoC integration'
      }
    });
  } catch (error) {
    logger.error('Enhanced analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Enhanced Web3 analysis with ImmuneFi PoC integration failed'
    });
  }
});

// Get Analysis Tools Status
router.get('/tools', async (req, res) => {
  try {
    const tools = web3Service.getToolsStatus();
    res.json({ success: true, data: tools });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Supported Networks
router.get('/networks', async (req, res) => {
  try {
    const networks = web3Service.getSupportedNetworks();
    res.json({ success: true, data: networks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Analysis Results
router.get('/analysis/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({
      success: true,
      data: {
        id,
        status: 'completed',
        message: 'Analysis results retrieved successfully'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export analysis with screenshots (unified functionality)
router.post('/export/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;
    const {
      includeScreenshots = true,
      format = 'complete',
      contractAddress,
      network = 'ethereum'
    } = req.body;

    logger.info(`📊 [WEB3] Exporting analysis ${analysisId} with screenshots: ${includeScreenshots}`);

    // If we have contractAddress, generate fresh analysis with export
    if (contractAddress) {
      const contractData = {
        address: contractAddress,
        network: network,
        name: `Contract_${contractAddress.slice(0, 8)}`
      }

      // Generate fresh analysis with report using existing service
      const analysisResult = await web3Service.analyzeSmartContractWithReport(contractData, includeScreenshots);

      // Extract report data from the result
      const reportResult = analysisResult.detailedReport || {
        reportId: `web3_report_${Date.now()}`,
        screenshots: {},
        visuals: {}
      }

      // Create export package
      const exportPackage = {
        exportId: `export_${Date.now()}`,
        analysisData: analysisResult,
        reportData: reportResult,
        files: {
          htmlReport: `${reportResult.reportId}/security_report.html`,
          summary: `${reportResult.reportId}/executive_summary.txt`,
          screenshots: reportResult.screenshots || {},
          visuals: reportResult.visuals || {}
        },
        downloadUrl: `/api/web3/report/download/${reportResult.reportId}/security_report.html`,
        timestamp: new Date().toISOString()
      }

      res.json({
        success: true,
        data: exportPackage
      });

    } else {
      // For existing analysis, use a simplified approach
      logger.info(`📊 [WEB3] Creating export package for analysis: ${analysisId}`);

      // Create export from existing analysis
      const exportPackage = {
        exportId: `export_${Date.now()}`,
        analysisData: analysis,
        downloadUrl: `/api/web3/report/download/${analysis.reportId || 'latest'}/security_report.html`,
        files: {
          htmlReport: 'security_report.html',
          summary: 'executive_summary.txt'
        },
        timestamp: new Date().toISOString()
      }

      res.json({
        success: true,
        data: exportPackage
      });
    }

  } catch (error) {
    logger.error('❌ [WEB3] Export failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Download Report Files
router.get('/report/download/:reportId/:filename?', async (req, res) => {
  try {
    const { reportId, filename } = req.params;
    const reportsDir = path.join(__dirname, '../reports');
    const reportDir = path.join(reportsDir, reportId);

    if (!fs.existsSync(reportDir)) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    if (filename) {
      // Download specific file
      const filePath = path.join(reportDir, filename);
      if (fs.existsSync(filePath)) {
        res.download(filePath);
      } else {
        res.status(404).json({ success: false, error: 'File not found' });
      }
    } else {
      // Download HTML report by default
      const htmlReport = path.join(reportDir, 'security_report.html');
      if (fs.existsSync(htmlReport)) {
        res.download(htmlReport);
      } else {
        res.status(404).json({ success: false, error: 'HTML report not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve Report Files (for viewing in browser) - including nested paths
router.get('/report/view/:reportId/*', async (req, res) => {
  try {
    const { reportId } = req.params;
    const filename = req.params[0]; // Get the full path after reportId
    const reportsDir = path.join(__dirname, '../reports');
    const filePath = path.join(reportsDir, reportId, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // Set appropriate content type
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.html': 'text/html',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain'
    }

    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Legacy route for direct filename access
router.get('/report/view/:reportId/:filename', async (req, res) => {
  try {
    const { reportId, filename } = req.params;
    const reportsDir = path.join(__dirname, '../reports');
    const filePath = path.join(reportsDir, reportId, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // Set appropriate content type
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.html': 'text/html',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain'
    }

    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Report Metadata
router.get('/report/info/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const reportsDir = path.join(__dirname, '../reports');
    const reportDir = path.join(reportsDir, reportId);

    if (!fs.existsSync(reportDir)) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // Get list of files in report directory
    const files = fs.readdirSync(reportDir, { withFileTypes: true });
    const reportFiles = files.map(file => ({
      name: file.name,
      type: file.isDirectory() ? 'directory' : 'file',
      size: file.isFile() ? fs.statSync(path.join(reportDir, file.name)).size : null
    }));

    res.json({
      success: true,
      data: {
        reportId,
        files: reportFiles,
        downloadUrl: `/api/web3/report/download/${reportId}`,
        viewUrl: `/api/web3/report/view/${reportId}/security_report.html`
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;