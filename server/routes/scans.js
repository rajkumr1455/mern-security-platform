const Scan = require('../models/Scan');
const Target = require('../models/Target');
const express = require('express');
const logger = require('../utils/logger');
const { body, validationResult } = require('express-validator');


const router = express.Router();

// Store active scans in memory (in production, use database)
let activeScans = []
let scanIdCounter = 1;

// Start Web2 scan
router.post('/web2', async (req, res) => {
  try {
    const { targetId, scanTypes, options = {} } = req.body;

    if (!targetId || !scanTypes || !Array.isArray(scanTypes)) {
      return res.status(400).json({
        success: false,
        error: 'Target ID and scan types are required'
      });
    }

    // Create new scan
    const scanId = scanIdCounter++;
    const newScan = {
      id: scanId,
      targetId,
      target: `target-${targetId}`, // In production, fetch from targets table
      scanTypes,
      options,
      status: 'running',
      startTime: new Date().toISOString(),
      endTime: null,
      vulnerabilities: { high: 0, medium: 0, low: 0 },
      progress: 0
    }

    activeScans.push(newScan);

    // Simulate scan progress
    setTimeout(() => {
      const scan = activeScans.find(s => s.id === scanId);
      if (scan) {
        scan.progress = 50;
        scan.vulnerabilities = { high: 1, medium: 2, low: 1 }
      }
    }, 5000);

    // Complete scan after 15 seconds
    setTimeout(() => {
      const scan = activeScans.find(s => s.id === scanId);
      if (scan) {
        scan.status = 'completed';
        scan.endTime = new Date().toISOString();
        scan.progress = 100;
        scan.vulnerabilities = { high: 2, medium: 3, low: 4 }
      }
    }, 15000);

    res.json({
      success: true,
      scanId,
      message: 'Web2 scan started successfully',
      scan: newScan
    });
  } catch (error) {
    logger.error('Failed to start Web2 scan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start Web2 scan'
    });
  }
});

// Get all scans
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let scans = activeScans;

    if (type === 'web2') {
      scans = activeScans.filter(scan => scan.scanTypes.some(t =>
        ['vulnerability', 'api_security', 'fuzzing', 'exploitation'].includes(t)
      ));
    }

    res.json({
      success: true,
      scans,
      total: scans.length
    });
  } catch (error) {
    logger.error('Failed to fetch scans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scans'
    });
  }
});

// Get scan by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const scan = activeScans.find(s => s.id === parseInt(id));

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found'
      });
    }

    res.json({
      success: true,
      scan
    });
  } catch (error) {
    logger.error('Failed to fetch scan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scan'
    });
  }
});

// Get available Web2 scan modules
router.get('/web2/modules', async (req, res) => {
  try {
    const modules = [
      {
        id: 'vulnerability',
        name: 'Advanced Vulnerability Scanner',
        description: 'Comprehensive vulnerability detection with automated exploitation testing',
        category: 'Security Testing',
        enabled: true,
        tools: ['SQLMap', 'XSStrike', 'Nuclei', 'Nikto', 'OWASP ZAP', 'Burp Suite'],
        estimatedTime: '30-90 minutes',
        subModules: [
          { id: 'sqli', name: 'SQL Injection', description: 'Advanced SQLi detection with automated exploitation', tools: ['SQLMap', 'NoSQLMap'] },
          { id: 'xss', name: 'Cross-Site Scripting', description: 'DOM, Reflected, and Stored XSS detection', tools: ['XSStrike', 'DOMPurify', 'XSSHunter'] },
          { id: 'csrf', name: 'CSRF Protection', description: 'CSRF token validation and bypass testing', tools: ['CSRFTester', 'Burp CSRF PoC'] },
          { id: 'lfi', name: 'Local File Inclusion', description: 'LFI/RFI detection with path traversal', tools: ['LFISuite', 'Kadimus'] },
          { id: 'rce', name: 'Remote Code Execution', description: 'Command injection and RCE testing', tools: ['Commix', 'RCE Scanner'] },
          { id: 'ssrf', name: 'Server-Side Request Forgery', description: 'SSRF detection and exploitation', tools: ['SSRFmap', 'Gopherus'] },
          { id: 'xxe', name: 'XML External Entity', description: 'XXE injection vulnerability testing', tools: ['XXEinjector', 'XML Bomb'] },
          { id: 'ssti', name: 'Server-Side Template Injection', description: 'Template injection detection', tools: ['Tplmap', 'SSTImap'] },
          { id: 'deserialization', name: 'Insecure Deserialization', description: 'Object deserialization vulnerabilities', tools: ['ysoserial', 'Java-Deserialization-Cheat-Sheet'] }
        ]
      },
      {
        id: 'api_security',
        name: 'Advanced API Security Scanner',
        description: 'Comprehensive REST/GraphQL API security testing with automated authentication bypass',
        category: 'API Testing',
        enabled: true,
        tools: ['Postman', 'Insomnia', 'OWASP ZAP', 'Burp Suite', 'GraphQL Voyager', 'Arjun'],
        estimatedTime: '20-60 minutes',
        subModules: [
          { id: 'auth_bypass', name: 'Authentication Bypass', description: 'JWT manipulation, OAuth flaws, session hijacking', tools: ['JWT_Tool', 'OAuth2 Scanner'] },
          { id: 'rate_limiting', name: 'Rate Limiting & DoS', description: 'Rate limit bypass and DoS testing', tools: ['Slowloris', 'Rate Limit Bypass'] },
          { id: 'input_validation', name: 'Input Validation', description: 'Parameter pollution, type confusion, schema validation', tools: ['Param Miner', 'JSON Fuzzer'] },
          { id: 'cors', name: 'CORS & Security Headers', description: 'CORS misconfiguration and security header analysis', tools: ['CORS Scanner', 'Security Headers'] },
          { id: 'graphql', name: 'GraphQL Security', description: 'GraphQL introspection, query complexity, injection', tools: ['GraphQL Voyager', 'InQL'] },
          { id: 'api_versioning', name: 'API Versioning', description: 'Version enumeration and legacy API testing', tools: ['API Version Scanner'] }
        ]
      },
      {
        id: 'fuzzing',
        name: 'Advanced Web Application Fuzzer',
        description: 'Intelligent fuzzing with ML-based payload generation and mutation testing',
        category: 'Dynamic Testing',
        enabled: true,
        tools: ['Ffuf', 'Wfuzz', 'Gobuster', 'Feroxbuster', 'Radamsa', 'AFL++'],
        estimatedTime: '45-120 minutes',
        subModules: [
          { id: 'parameter_discovery', name: 'Parameter Discovery', description: 'Hidden parameter enumeration with wordlists and ML', tools: ['Arjun', 'ParamSpider', 'x8'] },
          { id: 'directory_traversal', name: 'Directory Traversal', description: 'Path traversal with encoding bypass techniques', tools: ['DotDotPwn', 'Path Traversal Scanner'] },
          { id: 'file_upload', name: 'File Upload Security', description: 'Upload bypass, polyglot files, malicious uploads', tools: ['Upload Scanner', 'Fuxploider'] },
          { id: 'input_fuzzing', name: 'Input Fuzzing', description: 'Format string, buffer overflow, injection fuzzing', tools: ['Radamsa', 'Peach Fuzzer'] },
          { id: 'protocol_fuzzing', name: 'Protocol Fuzzing', description: 'HTTP/2, WebSocket, custom protocol fuzzing', tools: ['Boofuzz', 'Sulley'] },
          { id: 'mutation_testing', name: 'Mutation Testing', description: 'Genetic algorithm-based payload mutation', tools: ['AFL++', 'LibFuzzer'] }
        ]
      },
      {
        id: 'exploitation',
        name: 'Advanced Exploitation Framework',
        description: 'Safe exploitation testing with automated payload generation and post-exploitation',
        category: 'Exploitation',
        enabled: true,
        tools: ['Metasploit', 'ExploitDB', 'Nuclei', 'Custom Exploits', 'Empire', 'Cobalt Strike'],
        estimatedTime: '60-180 minutes',
        subModules: [
          { id: 'payload_generation', name: 'Advanced Payload Generation', description: 'Custom payloads, encoding, obfuscation techniques', tools: ['MSFvenom', 'Veil', 'Shellter'] },
          { id: 'privilege_escalation', name: 'Privilege Escalation', description: 'Local and remote privilege escalation testing', tools: ['LinPEAS', 'WinPEAS', 'GTFOBins'] },
          { id: 'lateral_movement', name: 'Lateral Movement', description: 'Network pivoting and lateral movement simulation', tools: ['BloodHound', 'CrackMapExec', 'Impacket'] },
          { id: 'persistence', name: 'Persistence Mechanisms', description: 'Backdoor installation and persistence testing', tools: ['Empire', 'PowerShell Empire', 'Metasploit'] },
          { id: 'data_exfiltration', name: 'Data Exfiltration', description: 'Covert channel testing and data extraction', tools: ['DNSExfiltrator', 'PyExfil'] },
          { id: 'av_evasion', name: 'AV Evasion', description: 'Antivirus evasion and steganography techniques', tools: ['Veil', 'Phantom-Evasion', 'TheFatRat'] }
        ]
      },
      {
        id: 'mobile_security',
        name: 'Mobile Application Security',
        description: 'iOS and Android application security testing',
        category: 'Mobile Testing',
        enabled: true,
        tools: ['MobSF', 'Frida', 'Objection', 'APKTool', 'Class-dump', 'Hopper'],
        estimatedTime: '90-240 minutes',
        subModules: [
          { id: 'static_analysis', name: 'Static Code Analysis', description: 'Source code and binary analysis for mobile apps', tools: ['MobSF', 'QARK', 'Semgrep'] },
          { id: 'dynamic_analysis', name: 'Dynamic Analysis', description: 'Runtime analysis and behavior monitoring', tools: ['Frida', 'Objection', 'Xposed'] },
          { id: 'network_analysis', name: 'Network Communication', description: 'SSL pinning bypass, traffic analysis', tools: ['Burp Suite', 'OWASP ZAP', 'mitmproxy'] },
          { id: 'data_storage', name: 'Data Storage Security', description: 'Local storage, keychain, database security', tools: ['SQLite Browser', 'Keychain Dumper'] }
        ]
      },
      {
        id: 'cloud_security',
        name: 'Cloud Security Assessment',
        description: 'AWS, Azure, GCP security configuration and vulnerability assessment',
        category: 'Cloud Testing',
        enabled: true,
        tools: ['ScoutSuite', 'Prowler', 'CloudMapper', 'Pacu', 'CloudSploit', 'Trivy'],
        estimatedTime: '60-180 minutes',
        subModules: [
          { id: 'aws_security', name: 'AWS Security Assessment', description: 'S3 buckets, IAM, EC2, Lambda security testing', tools: ['ScoutSuite', 'Prowler', 'Pacu'] },
          { id: 'azure_security', name: 'Azure Security Assessment', description: 'Azure AD, storage accounts, virtual machines', tools: ['ScoutSuite', 'MicroBurst', 'PowerZure'] },
          { id: 'gcp_security', name: 'GCP Security Assessment', description: 'Google Cloud Platform security configuration', tools: ['ScoutSuite', 'GCP Scanner'] },
          { id: 'container_security', name: 'Container Security', description: 'Docker, Kubernetes security assessment', tools: ['Trivy', 'Clair', 'Anchore'] }
        ]
      }
    ]

    res.json({
      success: true,
      modules,
      total: modules.length
    });
  } catch (error) {
    logger.error('Failed to fetch Web2 modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Web2 modules'
    });
  }
});

// Get all scans for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, target } = req.query;

    const query = { owner: req.user.id }

    if (status) query.status = status;
    if (type) query.type = type;
    if (target) query.target = target;

    const scans = await Scan.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('target', 'name url type')
      .populate('owner', 'username email');

    const total = await Scan.countDocuments(query);

    res.json({
      success: true,
      scans,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Failed to fetch scans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scans'
    });
  }
});

// Get active scans
router.get('/active', async (req, res) => {
  try {
    const activeScans = await Scan.find({
      owner: req.user.id,
      status: { $in: ['running', 'pending'] }
    })
    .populate('target', 'name url type')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      scans: activeScans,
      count: activeScans.length
    });
  } catch (error) {
    logger.error('Failed to fetch active scans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active scans'
    });
  }
});

// Get a specific scan
router.get('/:id', async (req, res) => {
  try {
    const scan = await Scan.findOne({
      _id: req.params.id,
      owner: req.user.id
    })
    .populate('target', 'name url type')
    .populate('owner', 'username email');

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found'
      });
    }

    res.json({
      success: true,
      scan
    });
  } catch (error) {
    logger.error('Failed to fetch scan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scan'
    });
  }
});

// Start a new reconnaissance scan
router.post('/recon', [
  body('targetId').isMongoId().withMessage('Valid target ID is required'),
  body('modules').isArray({ min: 1 }).withMessage('At least one module is required'),
  body('modules.*').isIn(['subdomain', 'ports', 'api', 'web3']).withMessage('Invalid module')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { targetId, modules, options = {} } = req.body;

    // Verify target exists and belongs to user
    const target = await Target.findOne({
      _id: targetId,
      owner: req.user.id
    });

    if (!target) {
      return res.status(404).json({
        success: false,
        error: 'Target not found'
      });
    }

    // Start reconnaissance scan
    const scanOrchestrator = req.app.locals.scanOrchestrator;
    const result = await scanOrchestrator.startReconScan(
      targetId,
      { modules, options },
      req.user.id
    );

    res.status(201).json({
      success: true,
      ...result
    })

  } catch (error) {
    logger.error('Failed to start recon scan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start reconnaissance scan'
    });
  }
});

// Start a new Web2 security scan
router.post('/web2', [
  body('targetId').isMongoId().withMessage('Valid target ID is required'),
  body('scanTypes').isArray({ min: 1 }).withMessage('At least one scan type is required'),
  body('scanTypes.*').isIn(['vulnerability', 'api_security', 'fuzzing', 'exploitation']).withMessage('Invalid scan type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { targetId, scanTypes, options = {} } = req.body;

    // Verify target exists and belongs to user
    const target = await Target.findOne({
      _id: targetId,
      owner: req.user.id
    });

    if (!target) {
      return res.status(404).json({
        success: false,
        error: 'Target not found'
      });
    }

    // Start Web2 scan
    const scanOrchestrator = req.app.locals.scanOrchestrator;
    const result = await scanOrchestrator.startWeb2Scan(
      targetId,
      { scanTypes, options },
      req.user.id
    );

    res.status(201).json({
      success: true,
      ...result
    })

  } catch (error) {
    logger.error('Failed to start Web2 scan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start Web2 security scan'
    });
  }
});

// Start a new Web3 analysis
router.post('/web3', [
  body('targetId').isMongoId().withMessage('Valid target ID is required'),
  body('analysisTypes').isArray({ min: 1 }).withMessage('At least one analysis type is required'),
  body('analysisTypes.*').isIn(['defi_analysis', 'contract_fuzzing', 'monitoring', 'external_tools']).withMessage('Invalid analysis type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { targetId, analysisTypes, options = {} } = req.body;

    // Verify target exists and belongs to user
    const target = await Target.findOne({
      _id: targetId,
      owner: req.user.id
    });

    if (!target) {
      return res.status(404).json({
        success: false,
        error: 'Target not found'
      });
    }

    // Start Web3 analysis
    const scanOrchestrator = req.app.locals.scanOrchestrator;
    const result = await scanOrchestrator.startWeb3Analysis(
      targetId,
      { analysisTypes, options },
      req.user.id
    );

    res.status(201).json({
      success: true,
      ...result
    })

  } catch (error) {
    logger.error('Failed to start Web3 analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start Web3 analysis'
    });
  }
});

// Stop a running scan
router.post('/:id/stop', async (req, res) => {
  try {
    const scan = await Scan.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found'
      });
    }

    if (!['running', 'pending'].includes(scan.status)) {
      return res.status(400).json({
        success: false,
        error: 'Scan is not running'
      });
    }

    // Stop the scan
    const scanOrchestrator = req.app.locals.scanOrchestrator;
    const stopped = await scanOrchestrator.stopScan(scan._id);

    if (stopped) {
      scan.status = 'cancelled';
      scan.endTime = new Date();
      await scan.save();

      res.json({
        success: true,
        message: 'Scan stopped successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to stop scan'
      });
    }

  } catch (error) {
    logger.error('Failed to stop scan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop scan'
    });
  }
});

// Delete a scan
router.delete('/:id', async (req, res) => {
  try {
    const scan = await Scan.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found'
      });
    }

    if (['running', 'pending'].includes(scan.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete running scan'
      });
    }

    await Scan.findByIdAndDelete(scan._id);

    res.json({
      success: true,
      message: 'Scan deleted successfully'
    });

  } catch (error) {
    logger.error('Failed to delete scan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete scan'
    });
  }
});

// Get scan statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalScans, completedScans, runningScans, failedScans, vulnerabilityStats] = await Promise.all([
      Scan.countDocuments({ owner: req.user.id }),
      Scan.countDocuments({ owner: req.user.id, status: 'completed' }),
      Scan.countDocuments({ owner: req.user.id, status: { $in: ['running', 'pending'] } }),
      Scan.countDocuments({ owner: req.user.id, status: 'failed' }),
      Scan.aggregate([
        { $match: { owner: req.user.id, status: 'completed' } },
        { $group: {
          _id: null,
          totalVulnerabilities: { $sum: '$results.summary.totalFindings' },
          criticalCount: { $sum: '$results.summary.criticalCount' },
          highCount: { $sum: '$results.summary.highCount' },
          mediumCount: { $sum: '$results.summary.mediumCount' },
          lowCount: { $sum: '$results.summary.lowCount' }
        }}
      ])
    ])

    const stats = {
      scans: {
        total: totalScans,
        completed: completedScans,
        running: runningScans,
        failed: failedScans,
        successRate: totalScans > 0 ? Math.round((completedScans / totalScans) * 100) : 0
      },
      vulnerabilities: vulnerabilityStats[0] || {
        totalVulnerabilities: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0
      }
    }

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    logger.error('Failed to fetch scan stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scan statistics'
    });
  }
});

module.exports = router;