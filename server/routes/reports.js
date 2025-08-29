const express = require('express');
const logger = require('../utils/logger');

const router = express.Router();
const fs = require('fs');
const path = require('path');

// Get reports list
router.get('/list', async (req, res) => {
  try {
    const reportsDir = path.join(__dirname, '../reports');
    let reports = [];

    // Check if reports directory exists
    if (fs.existsSync(reportsDir)) {
      const reportFolders = fs.readdirSync(reportsDir).filter(item => {
        const itemPath = path.join(reportsDir, item);
        return fs.statSync(itemPath).isDirectory();
      });

      reports = reportFolders.map(folder => {
        const reportPath = path.join(reportsDir, folder);
        const stats = fs.statSync(reportPath);

        // Try to read executive summary if it exists
        let summary = 'No summary available';
        const summaryPath = path.join(reportPath, 'executive_summary.txt');
        if (fs.existsSync(summaryPath)) {
          try {
            summary = fs.readFileSync(summaryPath, 'utf8').substring(0, 200) + '...'
          } catch (e) {
            summary = 'Summary unavailable'
          }
        }

        // Determine report type based on folder name
        let type = 'general';
        if (folder.includes('web3')) type = 'web3';
        else if (folder.includes('web2')) type = 'web2';
        else if (folder.includes('recon')) type = 'reconnaissance';
        else if (folder.includes('vuln')) type = 'vulnerability';

        return {
          id: folder,
          name: folder.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          type: type,
          created: stats.birthtime.toISOString(),
          modified: stats.mtime.toISOString(),
          size: getDirectorySize(reportPath),
          summary: summary,
          status: 'completed',
          format: ['html', 'pdf'],
          downloadUrl: `/api/reports/download/${folder}`
        }
      }).sort((a, b) => new Date(b.created) - new Date(a.created));
    }

    res.json({
      success: true,
      data: {
        reports: reports,
        total: reports.length,
        types: ['web3', 'web2', 'reconnaissance', 'vulnerability', 'general'],
        summary: {
          totalReports: reports.length,
          recentReports: reports.slice(0, 5),
          reportsByType: {
            web3: reports.filter(r => r.type === 'web3').length,
            web2: reports.filter(r => r.type === 'web2').length,
            reconnaissance: reports.filter(r => r.type === 'reconnaissance').length,
            vulnerability: reports.filter(r => r.type === 'vulnerability').length,
            general: reports.filter(r => r.type === 'general').length
          }
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports list',
      details: error.message
    });
  }
});

// Get all reports (alias for /list)
router.get('/all', async (req, res) => {
  // Redirect to /list endpoint
  req.url = '/list';
  return router.handle(req, res);
});

// Get reports (basic endpoint)
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Reports API is operational',
      endpoints: {
        list: '/api/reports/list',
        all: '/api/reports/all',
        download: '/api/reports/download/:reportId',
        export: '/api/reports/export/:reportId'
      },
      status: 'active'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Reports API error'
    });
  }
});

// Download report
router.get('/download/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const reportPath = path.join(__dirname, '../reports', reportId);

    if (!fs.existsSync(reportPath)) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    // Check for HTML report
    const htmlReportPath = path.join(reportPath, 'security_report.html');
    if (fs.existsSync(htmlReportPath)) {
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename='${reportId}_report.html'`);
      return res.sendFile(htmlReportPath);
    }

    // If no HTML report, return error
    res.status(404).json({
      success: false,
      error: 'Report file not found'
    });
  } catch (error) {
    logger.error('Error downloading report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download report'
    });
  }
});

// Export report in different formats
router.get('/export/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { format = 'html' } = req.query;

    const reportPath = path.join(__dirname, '../reports', reportId);

    if (!fs.existsSync(reportPath)) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    if (format === 'html') {
      const htmlReportPath = path.join(reportPath, 'security_report.html');
      if (fs.existsSync(htmlReportPath)) {
        res.setHeader('Content-Type', 'text/html');
        return res.sendFile(htmlReportPath);
      }
    }

    res.status(404).json({
      success: false,
      error: `Report format '${format}' not available`
    });
  } catch (error) {
    logger.error('Error exporting report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export report'
    });
  }
});

// Bug bounty report endpoint
router.get('/bug-bounty/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    // Mock bug bounty report data
    const bugBountyReport = {
      scanId: scanId,
      title: `Bug Bounty Report - Scan ${scanId}`,
      summary: 'Comprehensive security assessment with bug bounty focus',
      findings: [
        {
          id: 1,
          title: 'SQL Injection Vulnerability',
          severity: 'high',
          cvss: 8.5,
          bountyValue: 1500,
          description: 'SQL injection found in login form',
          impact: 'Data breach potential',
          recommendation: 'Implement parameterized queries'
        },
        {
          id: 2,
          title: 'Cross-Site Scripting (XSS)',
          severity: 'medium',
          cvss: 6.1,
          bountyValue: 750,
          description: 'Reflected XSS in search parameter',
          impact: 'Session hijacking possible',
          recommendation: 'Sanitize user input'
        }
      ],
      totalBountyValue: 2250,
      submissionReady: true,
      generatedAt: new Date().toISOString()
    }

    res.json({
      success: true,
      data: bugBountyReport
    });
  } catch (error) {
    logger.error('Error generating bug bounty report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate bug bounty report'
    });
  }
});

// Helper function to calculate directory size
function getDirectorySize(dirPath) {
  let totalSize = 0;
  try {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    });
  } catch (error) {
    logger.error('Error calculating directory size:', error);
  }
  return totalSize;
}

module.exports = router;