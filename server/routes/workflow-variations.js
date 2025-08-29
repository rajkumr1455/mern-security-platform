/**
 * Workflow Variations API Routes
 * Handles workflow templates, custom workflows, and execution
 */

const express = require('express');
const logger = require('../utils/logger');
const router = express.Router();
const WorkflowTemplateService = require('../services/WorkflowTemplateService');
const WorkflowExecutionEngine = require('../services/WorkflowExecutionEngine');

// Initialize services
const templateService = new WorkflowTemplateService();
const executionEngine = new WorkflowExecutionEngine();

/**
 * GET /api/workflow-variations/templates
 * Get all available workflow templates
 */
router.get('/templates', async (req, res) => {
  try {
    const { category, difficulty, tags } = req.query;
    let templates = templateService.getAllTemplates();

    // Apply filters
    if (category && category !== 'all') {
      templates = templateService.getTemplatesByCategory(category);
    }

    if (difficulty && difficulty !== 'all') {
      templates = templateService.getTemplatesByDifficulty(difficulty);
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      templates = templateService.searchTemplatesByTags(tagArray);
    }

    res.json({
      success: true,
      templates,
      total: templates.length,
      categories: [
        'reconnaissance',
        'web_security',
        'api_security',
        'bug_bounty',
        'web3',
        'devops',
        'compliance'
      ],
      difficulties: ['beginner', 'intermediate', 'advanced', 'expert']
    });
  } catch (error) {
    logger.error('Error fetching workflow templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflow templates'
    });
  }
});

/**;
 * GET /api/workflow-variations/templates/:templateId
 * Get specific workflow template
 */;
router.get('/templates/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = templateService.getTemplate(templateId);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    res.json({
      success: true,
      template
    });
  } catch (error) {
    logger.error('Error fetching workflow template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflow template'
    });
  }
});

/**;
 * POST /api/workflow-variations/templates/:templateId/create-workflow
 * Create workflow from template
 */;
router.post('/templates/:templateId/create-workflow', async (req, res) => {
  try {
    const { templateId } = req.params;
    const { target, customConfig = {}, workflowName, description } = req.body;

    if (!target) {
      return res.status(400).json({
        success: false,
        error: 'Target is required'
      });
    }

    // Create workflow from template
    const workflow = templateService.createWorkflowFromTemplate(templateId, {
      name: workflowName,
      description,
      ...customConfig
    })

    // Start execution
    const executionResult = await executionEngine.executeWorkflowFromTemplate(
      templateId,
      target,
      customConfig
    );

    res.json({
      success: true,
      workflow,
      execution: executionResult
    });
  } catch (error) {
    logger.error('Error creating workflow from template:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create workflow from template'
    });
  }
});

/**;
 * POST /api/workflow-variations/custom/create
 * Create and execute custom workflow
 */;
router.post('/custom/create', async (req, res) => {
  try {
    const { workflow, target, options = {} } = req.body;

    if (!workflow || !workflow.steps || workflow.steps.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Workflow with steps is required'
      });
    }

    if (!target) {
      return res.status(400).json({
        success: false,
        error: 'Target is required'
      });
    }

    // Validate workflow
    templateService.validateTemplate(workflow);

    // Execute custom workflow
    const executionResult = await executionEngine.executeWorkflow(
      workflow,
      target,
      options
    );

    res.json({
      success: true,
      workflow,
      execution: executionResult
    });
  } catch (error) {
    logger.error('Error creating custom workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create custom workflow'
    });
  }
});

/**;
 * GET /api/workflow-variations/executions/:executionId/status
 * Get workflow execution status
 */;
router.get('/executions/:executionId/status', async (req, res) => {
  try {
    const { executionId } = req.params;
    const status = executionEngine.getExecutionStatus(executionId);

    res.json(status);
  } catch (error) {
    logger.error('Error fetching execution status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch execution status'
    });
  }
});

/**;
 * GET /api/workflow-variations/modules
 * Get available workflow modules for custom builder
 */;
router.get('/modules', async (req, res) => {
  try {
    const modules = [
      {
        id: 'subdomain_discovery',
        name: 'Subdomain Discovery',
        category: 'reconnaissance',
        description: 'Discover subdomains using multiple techniques',
        estimatedTime: '5-15 minutes',
        inputs: ['domain'],
        outputs: ['subdomains_list', 'dns_records'],
        configSchema: {
          tools: {
            type: 'array',
            options: ['sublist3r', 'amass', 'subfinder', 'assetfinder'],
            default: ['subfinder', 'amass']
          },
          timeout: {
            type: 'number',
            min: 60,
            max: 3600,
            default: 300
          },
          passive_only: {
            type: 'boolean',
            default: false
          }
        }
      },
      {
        id: 'port_scanning',
        name: 'Port Scanning',
        category: 'reconnaissance',
        description: 'Scan for open ports and services',
        estimatedTime: '10-30 minutes',
        inputs: ['target_list'],
        outputs: ['open_ports', 'service_fingerprints'],
        configSchema: {
          scan_type: {
            type: 'select',
            options: ['tcp_connect', 'tcp_syn', 'udp'],
            default: 'tcp_connect'
          },
          ports: {
            type: 'select',
            options: ['top_100', 'top_1000', 'all', 'custom'],
            default: 'top_1000'
          },
          timing: {
            type: 'select',
            options: ['paranoid', 'sneaky', 'polite', 'normal', 'aggressive'],
            default: 'normal'
          }
        }
      },
      {
        id: 'vulnerability_scanning',
        name: 'Vulnerability Scanning',
        category: 'scanning',
        description: 'Automated vulnerability detection',
        estimatedTime: '20-60 minutes',
        inputs: ['target_list', 'open_ports'],
        outputs: ['vulnerabilities', 'risk_assessment'],
        configSchema: {
          scan_intensity: {
            type: 'select',
            options: ['light', 'normal', 'intensive'],
            default: 'normal'
          },
          vulnerability_types: {
            type: 'array',
            options: ['web', 'network', 'ssl', 'database'],
            default: ['web', 'network']
          }
        }
      },
      {
        id: 'web_crawling',
        name: 'Web Application Crawling',
        category: 'web_testing',
        description: 'Crawl and map web application structure',
        estimatedTime: '15-45 minutes',
        inputs: ['web_targets'],
        outputs: ['url_map', 'forms', 'parameters'],
        configSchema: {
          max_depth: {
            type: 'number',
            min: 1,
            max: 10,
            default: 3
          },
          javascript_rendering: {
            type: 'boolean',
            default: false
          },
          rate_limit: {
            type: 'select',
            options: ['slow', 'moderate', 'fast'],
            default: 'moderate'
          }
        }
      },
      {
        id: 'api_discovery',
        name: 'API Discovery',
        category: 'api_testing',
        description: 'Discover and enumerate API endpoints',
        estimatedTime: '10-30 minutes',
        inputs: ['web_targets'],
        outputs: ['api_endpoints', 'swagger_specs'],
        configSchema: {
          discovery_methods: {
            type: 'array',
            options: ['directory_bruteforce', 'swagger_discovery', 'robots_txt'],
            default: ['directory_bruteforce', 'swagger_discovery']
          }
        }
      },
      {
        id: 'sql_injection_testing',
        name: 'SQL Injection Testing',
        category: 'web_testing',
        description: 'Test for SQL injection vulnerabilities',
        estimatedTime: '30-90 minutes',
        inputs: ['forms', 'parameters'],
        outputs: ['sql_vulnerabilities', 'injection_points'],
        configSchema: {
          injection_types: {
            type: 'array',
            options: ['union', 'boolean', 'time_based', 'error_based'],
            default: ['union', 'boolean']
          },
          database_types: {
            type: 'array',
            options: ['mysql', 'postgresql', 'mssql', 'oracle'],
            default: ['mysql', 'postgresql']
          }
        }
      },
      {
        id: 'web3_analysis',
        name: 'Web3 Security Analysis',
        category: 'web3',
        description: 'Analyze Web3 applications and smart contracts',
        estimatedTime: '60-180 minutes',
        inputs: ['contract_addresses', 'web3_endpoints'],
        outputs: ['contract_vulnerabilities', 'defi_risks'],
        configSchema: {
          blockchain_networks: {
            type: 'array',
            options: ['ethereum', 'bsc', 'polygon', 'arbitrum'],
            default: ['ethereum']
          },
          analysis_tools: {
            type: 'array',
            options: ['slither', 'mythril', 'securify'],
            default: ['slither']
          }
        }
      },
      {
        id: 'report_generation',
        name: 'Report Generation',
        category: 'reporting',
        description: 'Generate comprehensive security reports',
        estimatedTime: '5-15 minutes',
        inputs: ['vulnerabilities', 'risk_assessment'],
        outputs: ['security_report', 'executive_summary'],
        configSchema: {
          report_format: {
            type: 'select',
            options: ['executive', 'technical', 'comprehensive'],
            default: 'comprehensive'
          },
          export_formats: {
            type: 'array',
            options: ['pdf', 'html', 'json', 'csv'],
            default: ['pdf', 'html']
          }
        }
      }
    ];

    const categories = [
      { id: 'reconnaissance', name: 'Reconnaissance', color: '#4CAF50' },
      { id: 'scanning', name: 'Scanning', color: '#2196F3' },
      { id: 'web_testing', name: 'Web Testing', color: '#FF9800' },
      { id: 'api_testing', name: 'API Testing', color: '#9C27B0' },
      { id: 'web3', name: 'Web3', color: '#3F51B5' },
      { id: 'reporting', name: 'Reporting', color: '#009688' }
    ];

    res.json({
      success: true,
      modules,
      categories
    });
  } catch (error) {
    logger.error('Error fetching workflow modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflow modules'
    });
  }
});

/**;
 * POST /api/workflow-variations/templates/validate
 * Validate custom workflow template
 */;
router.post('/templates/validate', async (req, res) => {
  try {
    const { template } = req.body;

    if (!template) {
      return res.status(400).json({
        success: false,
        error: 'Template is required'
      });
    }

    // Validate template
    const isValid = templateService.validateTemplate(template);

    res.json({
      success: true,
      valid: isValid,
      message: 'Template is valid'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      valid: false,
      error: error.message
    });
  }
});

/**;
 * GET /api/workflow-variations/popular
 * Get popular workflow templates based on usage
 */;
router.get('/popular', async (req, res) => {
  try {
    const templates = templateService.getAllTemplates();

    // Mock popularity data - in production, this would come from usage analytics
    const popularTemplates = templates
      .map(template => ({
        ...template,
        popularity: Math.floor(Math.random() * 40) + 60, // 60-100%
        usageCount: Math.floor(Math.random() * 500) + 100,
        lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10)

    res.json({
      success: true,
      templates: popularTemplates
    });
  } catch (error) {
    logger.error('Error fetching popular templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular templates'
    });
  }
});

/**;
 * WebSocket event handlers for real-time execution updates
 */;
const setupWebSocketHandlers = (io) => {
  // Listen for execution events
  executionEngine.on('execution_started', (data) => {
    io.emit('workflow_execution_started', data);
  });

  executionEngine.on('step_started', (data) => {
    io.emit('workflow_step_started', data);
  });

  executionEngine.on('step_completed', (data) => {
    io.emit('workflow_step_completed', data);
  });

  executionEngine.on('step_failed', (data) => {
    io.emit('workflow_step_failed', data);
  });

  executionEngine.on('execution_completed', (data) => {
    io.emit('workflow_execution_completed', data);
  });

  executionEngine.on('execution_failed', (data) => {
    io.emit('workflow_execution_failed', data);
  });
}

module.exports = { router, setupWebSocketHandlers }