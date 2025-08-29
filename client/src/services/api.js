// Comprehensive API service for MERN stack security platform
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 1. TARGET MANAGEMENT
export const targetAPI = {
  // Get all targets
  getTargets: (params = {}) => api.get('/api/targets', { params }),

  // Add new target
  addTarget: (targetData) => api.post('/api/targets', targetData),

  // Delete target
  deleteTarget: (targetId) => api.delete(`/api/targets/${targetId}`),

  // Get target details
  getTargetDetails: (targetId) => api.get(`/api/targets/${targetId}`),
};

// 2. RECONNAISSANCE
export const reconAPI = {
  // Start reconnaissance scan
  startRecon: (reconData) => api.post('/api/recon/start', reconData),

  // Get recon modules
  getReconModules: () => api.get('/api/recon/modules'),

  // Get recon results
  getReconResults: (params = {}) => api.get('/api/recon/results', { params }),
};

// 3. WEB2 VULNERABILITY SCANNING
export const web2API = {
  // Start Web2 scan
  startScan: (scanData) => api.post('/api/scan/web2/start', scanData),

  // Get scan status
  getScanStatus: (scanId) => api.get(`/api/scan/web2/${scanId}/status`),

  // Get scan results
  getScanResults: (scanId) => api.get(`/api/scan/web2/${scanId}/results`),

  // Stop scan
  stopScan: (scanId) => api.post(`/api/scan/web2/${scanId}/stop`),

  // Get active scans
  getActiveScans: () => api.get('/api/scan/web2/active'),

  // Get Web2 modules
  getWeb2Modules: () => api.get('/api/scan/web2/modules'),

  // Get scan history
  getScanHistory: (params = {}) => api.get('/api/scan/history', { params }),

  // Get scan stats
  getScanStats: () => api.get('/api/scan/stats'),
};

// 4. WEB3/SMART CONTRACT ANALYSIS
export const web3API = {
  // Start Web3 scan
  startWeb3Scan: (scanData) => api.post('/api/scan/web3/start', scanData),

  // Analyze smart contract with enhanced error handling
  analyzeContract: async (contractData) => {
    try {
      // logger.info('API: Sending contract analysis request:', contractData); // TODO: Implement client-side logging
      const response = await api.post('/api/web3/analyze', contractData);
      // logger.info('API: Received response:', response.data); // TODO: Implement client-side logging
      return response
    } catch (error) {
      // logger.error('API: Contract analysis failed:', error); // TODO: Implement client-side logging

      // Enhanced error information
      if (error.response) {
        console.error('API: Server responded with error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('API: No response received:', {
          request: error.request,
          message: 'Server may be down or unreachable'
        });
      } else {
        // logger.error('API: Request setup error:', error.message); // TODO: Implement client-side logging
      }

      throw error
    }
  },

  // Get Web3 scan progress
  getWeb3Progress: (scanId) => api.get(`/api/scan/web3/${scanId}/progress`),

  // Get Web3 scan results
  getWeb3Results: (scanId) => api.get(`/api/scan/web3/${scanId}/results`),

  // Get Web3 status
  getWeb3Status: () => api.get('/api/web3/status'),

  // Get Web3 tools status
  getWeb3Tools: () => api.get('/api/web3/tools'),

  // Get tools status (alias)
  getToolsStatus: () => api.get('/api/web3/tools'),

  // Scan blockchain
  scanBlockchain: (scanData) => api.post('/api/web3/scan', scanData),

  // Analyze DeFi protocol
  analyzeDeFi: (protocolData) => api.post('/api/web3/defi/analyze', protocolData),

  // Analyze NFT contract
  analyzeNFT: (nftData) => api.post('/api/web3/nft/analyze', nftData),

  // Analyze bridge
  analyzeBridge: (bridgeData) => api.post('/api/web3/bridge/analyze', bridgeData),

  // Delete Web3 results
  deleteWeb3Results: (scanId) => api.delete(`/api/results/web3/${scanId}`),
};

// 5. DASHBOARD & ANALYTICS
export const dashboardAPI = {
  // Get dashboard stats
  getDashboardStats: () => api.get('/api/dashboard/stats'),

  // Get system status
  getStatus: () => api.get('/api/status'),

  // Get real-time metrics
  getRealTimeMetrics: () => api.get('/api/v6/metrics/real-time'),

  // Get engine status
  getEngineStatus: () => api.get('/api/v6/engine/status'),
};

// 6. PERFORMANCE MONITORING
export const performanceAPI = {
  // Get performance stats
  getPerformanceStats: () => api.get('/api/performance/stats'),

  // Get health status
  getHealthStatus: () => api.get('/api/performance/health'),

  // Optimize performance
  optimizePerformance: () => api.post('/api/performance/optimize'),

  // Get database performance
  getDatabasePerformance: () => api.get('/api/performance/database'),

  // Get system performance
  getSystemPerformance: () => api.get('/api/performance/system'),
};

// 7. RATE LIMITING & SECURITY
export const securityAPI = {
  // Get rate limit status
  getRateLimitStatus: () => api.get('/api/rate-limit/status'),

  // Get rate limit config
  getRateLimitConfig: () => api.get('/api/rate-limit/config'),

  // Update rate limit config
  updateRateLimitConfig: (config) => api.post('/api/rate-limit/config', config),

  // Get rate limit stats
  getRateLimitStats: (ipAddress) => api.get(`/api/rate-limit/stats/${ipAddress}`),

  // Add to whitelist
  addToWhitelist: (ipData) => api.post('/api/rate-limit/whitelist', ipData),

  // Add to blacklist
  addToBlacklist: (ipData) => api.post('/api/rate-limit/blacklist', ipData),

  // Remove from whitelist
  removeFromWhitelist: (ipAddress) => api.delete(`/api/rate-limit/whitelist/${ipAddress}`),
};

// 8. REPORTING
export const reportAPI = {
  // Get reports list
  getReportsList: () => api.get('/api/reports/list'),

  // Get all reports
  getAllReports: () => api.get('/api/reports/all'),

  // Get bug bounty report
  getBugBountyReport: (scanId) => api.get(`/api/reports/bug-bounty/${scanId}`),

  // Export report
  exportReport: (scanId, format) => api.get(`/api/reports/export/${scanId}`, {
    params: { format },
    responseType: 'blob'
  }),
};

// 9. AI & INTELLIGENCE
export const intelligenceAPI = {
  // Start AI analysis
  startAnalysis: (analysisData) => api.post('/api/v6/analysis/start', analysisData),

  // Get analysis status
  getAnalysisStatus: (analysisId) => api.get(`/api/v6/analysis/status/${analysisId}`),

  // Analyze threat intelligence
  analyzeThreatIntelligence: (threatData) => api.post('/api/v6/threat-intelligence/analyze', threatData),

  // Get threat intelligence
  getThreatIntelligence: () => api.get('/api/v6/threat-intelligence'),

  // Take screenshot
  takeScreenshot: (screenshotData) => api.post('/api/v6/visual-intelligence/screenshot', screenshotData),

  // Get visual intelligence heatmap
  getVisualHeatmap: () => api.get('/api/v6/visual-intelligence/heatmap'),
};

// 10. CONFIGURATION
export const configAPI = {
  // Get configuration settings
  getConfigSettings: () => api.get('/api/config/settings'),

  // Get environment template
  getEnvironmentTemplate: () => api.get('/api/config/environment-template'),
};

// 11. AUDIT & LOGGING
export const auditAPI = {
  // Get audit events
  getAuditEvents: (params = {}) => api.get('/api/audit/events', { params }),

  // Get audit summary
  getAuditSummary: (hours = 24) => api.get('/api/audit/summary', { params: { hours } }),
};

// 12. DATABASE
export const databaseAPI = {
  // Get database status
  getDatabaseStatus: () => api.get('/api/database/status'),

  // Get database performance summary
  getDatabasePerformanceSummary: () => api.get('/api/database/performance-summary'),
};

// 13. WEBSOCKET
export const websocketAPI = {
  // Get WebSocket status
  getWebSocketStatus: () => api.get('/api/websocket/status'),
};

// 14. MODULES & PLUGINS
export const modulesAPI = {
  // Get available modules
  getAvailableModules: () => api.get('/api/v6/modules/available'),
};

// 15. HEALTH & MONITORING
export const healthAPI = {
  // Health check
  healthCheck: () => api.get('/health'),

  // Readiness check
  readinessCheck: () => api.get('/readyz'),

  // Cache info
  getCacheInfo: () => api.get('/healthz'),
};

// 16. SCAN RESULTS
export const resultsAPI = {
  // Get all scan results
  getAllResults: () => api.get('/api/results/all'),

  // Get specific scan results
  getScanResults: (scanId) => api.get(`/api/results/${scanId}`),

  // Get scan results with filters
  getScanResultsFiltered: (params = {}) => api.get('/api/scan-results', { params }),

  // Get specific scan result details
  getScanResultDetails: (scanId) => api.get(`/api/scan-results/${scanId}`),
};

// 17. BUG BOUNTY AUTOMATION
export const bugBountyAPI = {
  // Get bug bounty statistics
  getStats: () => api.get('/api/bugbounty/stats'),

  // Start automated campaign
  startCampaign: (campaignData) => api.post('/api/bugbounty/campaign/start', campaignData),

  // Get active campaigns
  getActiveCampaigns: () => api.get('/api/bugbounty/campaigns/active'),

  // Get campaign details
  getCampaignDetails: (campaignId) => api.get(`/api/bugbounty/campaigns/${campaignId}`),

  // Stop campaign
  stopCampaign: (campaignId) => api.post(`/api/bugbounty/campaigns/${campaignId}/stop`),

  // Get earnings summary
  getEarnings: () => api.get('/api/bugbounty/earnings'),

  // Get program list
  getPrograms: () => api.get('/api/bugbounty/programs'),

  // Submit vulnerability
  submitVulnerability: (vulnData) => api.post('/api/bugbounty/submit', vulnData),

  // Get submission history
  getSubmissions: () => api.get('/api/bugbounty/submissions'),
};

// 18. COMPLETE ELITE AI INTEGRATION
export const eliteAIAPI = {
  // Engine status and control
  getStatus: () => api.get('/api/elite-ai/status'),
  getMetrics: () => api.get('/api/elite-ai/metrics'),
  getHealth: () => api.get('/api/elite-ai/health'),

  // Discovery and intelligence
  executeDiscovery: (targetData) => api.post('/api/elite-ai/discovery/execute', targetData),
  gatherOSINT: (targetData) => api.post('/api/elite-ai/osint/gather', targetData),

  // Exploitation and zero-day hunting
  generateExploit: (vulnData) => api.post('/api/elite-ai/exploit/generate', vulnData),
  huntZerodays: (targetData) => api.post('/api/elite-ai/zeroday/hunt', targetData),

  // Campaign management
  executeCampaign: (campaignData) => api.post('/api/elite-ai/campaign/execute', campaignData),
  getCampaignStatus: (campaignId) => api.get(`/api/elite-ai/campaign/${campaignId}/status`),

  // Exploit management
  getPendingExploits: () => api.get('/api/elite-ai/exploit/pending'),
  approveExploit: (exploitId, approvalData) => api.post(`/api/elite-ai/exploit/${exploitId}/approve`, approvalData),

  // Demo and testing
  startDemo: (demoData) => api.post('/api/elite-ai/demo/start', demoData),
  stopDemo: () => api.post('/api/elite-ai/demo/stop'),
  pauseDemo: () => api.post('/api/elite-ai/demo/pause'),
};

// 19. WORKFLOW ORCHESTRATION
export const workflowAPI = {
  // Get available workflows
  getWorkflows: () => api.get('/api/workflows'),

  // Create new workflow
  createWorkflow: (workflowData) => api.post('/api/workflows', workflowData),

  // Execute workflow
  executeWorkflow: (workflowId, params) => api.post(`/api/workflows/${workflowId}/execute`, params),

  // Get workflow status
  getWorkflowStatus: (workflowId) => api.get(`/api/workflows/${workflowId}/status`),

  // Get workflow results
  getWorkflowResults: (workflowId) => api.get(`/api/workflows/${workflowId}/results`),

  // Stop workflow
  stopWorkflow: (workflowId) => api.post(`/api/workflows/${workflowId}/stop`),

  // Get workflow history
  getWorkflowHistory: () => api.get('/api/workflows/history'),

  // Integrated recon to web2 workflow
  executeReconToWeb2: (workflowData) => api.post('/api/workflows/recon-to-web2', workflowData),

  // Get workflow templates
  getWorkflowTemplates: () => api.get('/api/workflows/templates'),

  // Save workflow as template
  saveAsTemplate: (workflowId, templateData) => api.post(`/api/workflows/${workflowId}/save-template`, templateData),
};

// 20. WEB3 ANALYSIS (Enhanced) - Complete Web3 Security Suite
export const enhancedWeb3API = {
  // Smart contract analysis
  analyzeContract: (contractData) => api.post('/api/web3/analyze', contractData),

  // Get analysis results
  getAnalysisResults: (analysisId) => api.get(`/api/web3/analysis/${analysisId}`),

  // Blockchain scanning
  scanBlockchain: (scanData) => api.post('/api/web3/scan', scanData),

  // Get Web3 tools status
  getToolsStatus: () => api.get('/api/web3/tools'),

  // Get supported networks
  getSupportedNetworks: () => api.get('/api/web3/networks'),

  // DeFi protocol analysis
  analyzeDeFi: (protocolData) => api.post('/api/web3/defi/analyze', protocolData),

  // NFT contract analysis
  analyzeNFT: (nftData) => api.post('/api/web3/nft/analyze', nftData),

  // Cross-chain bridge analysis
  analyzeBridge: (bridgeData) => api.post('/api/web3/bridge/analyze', bridgeData),

  // Get analysis progress
  getAnalysisProgress: (analysisId) => api.get(`/api/web3/analysis/${analysisId}/progress`),

  // Get user analyses
  getUserAnalyses: (params = {}) => api.get('/api/web3/analyses', { params }),

  // Get user statistics
  getUserStatistics: (params = {}) => api.get('/api/web3/statistics', { params })
};

// 21. ENHANCED SUDOMY (Medium Priority)
export const enhancedSudomyAPI = {
  // Start enhanced scan
  startEnhancedScan: (scanData) => api.post('/api/enhanced_sudomy/start', scanData),

  // Get scan progress
  getScanProgress: (scanId) => api.get(`/api/enhanced_sudomy/${scanId}/progress`),

  // Get enhanced results
  getEnhancedResults: (scanId) => api.get(`/api/enhanced_sudomy/${scanId}/results`),

  // Get advanced techniques
  getAdvancedTechniques: () => api.get('/api/enhanced_sudomy/techniques'),

  // Configure advanced options
  configureAdvanced: (config) => api.post('/api/enhanced_sudomy/config', config),
};

export default api;