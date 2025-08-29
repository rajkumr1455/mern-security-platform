const express = require('express');
const router = express.Router();
const WorkflowOrchestrator = require('../services/WorkflowOrchestrator');
const WorkflowTemplateService = require('../services/WorkflowTemplateService');
const WorkflowExecutionEngine = require('../services/WorkflowExecutionEngine');
const logger = require('../utils/productionLogger');

// Initialize services
const workflowOrchestrator = new WorkflowOrchestrator();
const templateService = new WorkflowTemplateService();
const executionEngine = new WorkflowExecutionEngine();

/**;
 * Get all workflow templates
 * GET /api/workflows/templates
 */;
router.get('/templates', async (req, res) => {
  try {
    const templates = templateService.getAllTemplates();

    res.json({
      success: true,
      templates: templates,
      count: templates.length
    });
  } catch (error) {
    logger.error('❌ [WORKFLOWS] Failed to get templates:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**;
 * Get workflow template by ID
 * GET /api/workflows/templates/:templateId
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
      template: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**;
 * Execute workflow from template
 * POST /api/workflows/execute
 */;
router.post('/execute', async (req, res) => {
  try {
    const { templateId, target, options = {} } = req.body;

    if (!templateId || !target) {
      return res.status(400).json({
        success: false,
        error: 'Template ID and target are required'
      });
    }

    logger.info(`🚀 [WORKFLOWS] Executing template ${templateId} for target: ${target}`);

    // Execute workflow from template
    const result = await executionEngine.executeWorkflowFromTemplate(templateId, target, options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('❌ [WORKFLOWS] Execution failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**;
 * Execute custom workflow
 * POST /api/workflows/execute-custom
 */;
router.post('/execute-custom', async (req, res) => {
  try {
    const { workflow, target, options = {} } = req.body;

    if (!workflow || !target) {
      return res.status(400).json({
        success: false,
        error: 'Workflow definition and target are required'
      });
    }

    logger.info(`🚀 [WORKFLOWS] Executing custom workflow for target: ${target}`);

    // Execute custom workflow
    const result = await executionEngine.executeWorkflow(workflow, target, options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('❌ [WORKFLOWS] Custom execution failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**;
 * Get workflow execution status
 * GET /api/workflows/execution/:executionId/status
 */;
router.get('/execution/:executionId/status', async (req, res) => {
  try {
    const { executionId } = req.params;
    const status = executionEngine.getExecutionStatus(executionId);

    res.json(status);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**;
 * Get templates by category
 * GET /api/workflows/templates/category/:category
 */;
router.get('/templates/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const templates = templateService.getTemplatesByCategory(category);

    res.json({
      success: true,
      templates: templates,
      category: category,
      count: templates.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start integrated reconnaissance to Web2 scanning workflow
router.post('/recon-to-web2', async (req, res) => {
  try {
    const { domain, options = {} } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    logger.info(`🚀 [WORKFLOW-API] Starting integrated workflow for: ${domain}`);

    // Start the integrated workflow
    const result = await workflowOrchestrator.executeReconToWeb2Workflow(domain, {
      reconOptions: {
        profile: options.reconProfile || 'comprehensive'
      },
      web2Options: {
        scanTypes: options.web2ScanTypes || ['vulnerability', 'api_security'],
        maxConcurrent: options.maxConcurrent || 3
      }
    });

    if (result.success) {
      res.json({
        success: true,
        workflowId: result.workflowId,
        message: `Integrated reconnaissance to Web2 workflow started for ${domain}`,
        summary: result.summary,
        results: result.results
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        workflowId: result.workflowId
      });
    }

  } catch (error) {
    logger.error('❌ [WORKFLOW-API] Error starting integrated workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get workflow status and progress
router.get('/:workflowId/status', async (req, res) => {
  try {
    const { workflowId } = req.params;

    const result = workflowOrchestrator.getWorkflowStatus(workflowId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }

  } catch (error) {
    logger.error('❌ [WORKFLOW-API] Error getting workflow status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get workflow results
router.get('/:workflowId/results', async (req, res) => {
  try {
    const { workflowId } = req.params;

    const statusResult = workflowOrchestrator.getWorkflowStatus(workflowId);

    if (statusResult.success && statusResult.workflow.status === 'completed') {
      res.json({
        success: true,
        workflowId,
        results: statusResult.workflow.results,
        summary: statusResult.workflow.summary
      });
    } else if (statusResult.success) {
      res.json({
        success: false,
        error: 'Workflow not yet completed',
        status: statusResult.workflow.status,
        progress: statusResult.workflow.progress
      });
    } else {
      res.status(404).json(statusResult);
    }

  } catch (error) {
    logger.error('❌ [WORKFLOW-API] Error getting workflow results:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all workflows (history)
router.get('/', async (req, res) => {
  try {
    const result = workflowOrchestrator.getWorkflowHistory();
    res.json(result);

  } catch (error) {
    logger.error('❌ [WORKFLOW-API] Error getting workflow history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get workflow statistics
router.get('/stats', async (req, res) => {
  try {
    const history = workflowOrchestrator.getWorkflowHistory();
    const workflows = history.workflows || [];

    const stats = {
      total_workflows: workflows.length,
      completed_workflows: workflows.filter(w => w.status === 'completed').length,
      failed_workflows: workflows.filter(w => w.status === 'failed').length,
      total_subdomains_discovered: workflows.reduce((sum, w) => sum + (w.summary?.discovered_subdomains || 0), 0),
      total_vulnerabilities_found: workflows.reduce((sum, w) => sum + (w.summary?.total_vulnerabilities || 0), 0),
      average_scan_duration: workflows.length > 0 ?
        Math.round(workflows.reduce((sum, w) => sum + (w.summary?.duration || 0), 0) / workflows.length) : 0,
      success_rate: workflows.length > 0 ?
        Math.round((workflows.filter(w => w.status === 'completed').length / workflows.length) * 100) : 0
    }

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    logger.error('❌ [WORKFLOW-API] Error getting workflow stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Advanced workflow: Reconnaissance with selective Web2 scanning
router.post('/recon-to-web2/selective', async (req, res) => {
  try {
    const { domain, targetFilter = {}, options = {} } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    logger.info(`🎯 [WORKFLOW-API] Starting selective integrated workflow for: ${domain}`);

    // First, run reconnaissance only
    const reconResult = await workflowOrchestrator.executeReconnaissance(domain, {
      profile: options.reconProfile || 'comprehensive'
    });

    // Filter targets based on criteria
    const allSubdomains = reconResult.subdomains_found || [];
    const filteredSubdomains = allSubdomains.filter(subdomain => {
      // Apply filters
      if (targetFilter.includeAdmin && (subdomain.includes('admin') || subdomain.includes('api'))) {
        return true;
      }
      if (targetFilter.excludeWww && subdomain.startsWith('www.')) {
        return false;
      }
      if (targetFilter.includePatterns) {
        return targetFilter.includePatterns.some(pattern => subdomain.includes(pattern));
      }
      return !targetFilter.includeAdmin; // If no specific filters, include all except when admin-only is specified
    });

    logger.info(`🔍 [WORKFLOW-API] Filtered ${filteredSubdomains.length} targets from ${allSubdomains.length} discovered subdomains`);

    // Create targets and run Web2 scans on filtered subdomains
    const targets = filteredSubdomains.map(subdomain => ({
      id: `target_${subdomain}_${Date.now()}`,
      url: `https://${subdomain}`,
      subdomain: subdomain,
      type: 'web2',
      source: 'reconnaissance_filtered'
    }));

    const web2Results = await workflowOrchestrator.executeWeb2ScansOnTargets(targets, {
      scanTypes: options.web2ScanTypes || ['vulnerability', 'api_security'],
      maxConcurrent: options.maxConcurrent || 3
    });

    const correlatedFindings = await workflowOrchestrator.correlateFindings(reconResult, web2Results);

    res.json({
      success: true,
      message: `Selective workflow completed for ${domain}`,
      results: {
        reconnaissance: {
          total_discovered: allSubdomains.length,
          filtered_targets: filteredSubdomains.length,
          filter_criteria: targetFilter
        },
        web2_scanning: {
          targets_scanned: web2Results.filter(r => r.success).length,
          scan_failures: web2Results.filter(r => !r.success).length
        },
        findings: correlatedFindings
      }
    });

  } catch (error) {
    logger.error('❌ [WORKFLOW-API] Error in selective workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;