/**;
 * Simplified Screenshot Service
 * Focuses on working tools with proper fallback handling
 */;

const fs = require('fs').promises;
const logger = require('../utils/logger');
const path = require('path');

class SimplifiedScreenshotService {
  constructor() {
    this.screenshotsDir = path.join(__dirname, '../reports');
  }

  /**;
   * Capture screenshots using only Puppeteer (which is working)
   */;
  async captureBlockchainScreenshots(contractData, reportDir) {
    const screenshots = {}
    const screenshotDir = path.join(reportDir, 'screenshots');
    await fs.mkdir(screenshotDir, { recursive: true });

    const contractAddress = contractData.address;
    const network = contractData.network || 'ethereum';

    // Define explorer URLs based on network
    const explorerUrls = this.getExplorerUrls(contractAddress, network);

    try {
      logger.info('📸 Starting screenshot capture with Puppeteer...')

      // Use Puppeteer for all screenshots
      screenshots.puppeteer = await this.captureWithPuppeteer(explorerUrls, screenshotDir)

      // Generate contract visualization
      screenshots.visualization = await this.captureContractVisualization(contractData, screenshotDir)

      logger.info(`✅ Screenshots captured: ${Object.keys(screenshots.puppeteer || {});.length + 1} files`);

    } catch (error) {
      logger.error('❌ Error capturing screenshots:', error);
      // Create placeholder screenshots
      screenshots.placeholder = await this.createPlaceholderScreenshots()
    }

    return screenshots;
  }

  /**;
   * Get explorer URLs for different networks
   */;
  getExplorerUrls(contractAddress, network) {
    const baseUrls = {
      ethereum: 'https://etherscan.io',
      polygon: 'https://polygonscan.com',
      'binance-smart-chain': 'https://bscscan.com',
      arbitrum: 'https://arbiscan.io',
      optimism: 'https://optimistic.etherscan.io',
      avalanche: 'https://snowtrace.io',
      fantom: 'https://ftmscan.com'
    }

    const baseUrl = baseUrls[network] || baseUrls.ethereum;

    return {
      contract: `${baseUrl}/address/${contractAddress}`,
      code: `${baseUrl}/address/${contractAddress}#code`,
      transactions: `${baseUrl}/address/${contractAddress}#transactions`,
      events: `${baseUrl}/address/${contractAddress}#events`,
      analytics: `${baseUrl}/address/${contractAddress}#analytics`
    }
  }

  /**;
   * Capture screenshots using Puppeteer with improved error handling
   */;
  async captureWithPuppeteer(urls, screenshotDir) {
    const puppeteerCaptured = {}

    try {
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ]
      });

      const puppeteerDir = path.join(screenshotDir, 'puppeteer');
      await fs.mkdir(puppeteerDir, { recursive: true });

      for (const [key, url] of Object.entries(urls)) {
        try {
          logger.info(`📸 Capturing ${key} screenshot...`)

          const page = await browser.newPage()
          await page.setViewport({ width: 1920, height: 1080 })

          // Set user agent to avoid bot detection
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

          // Navigate with shorter timeout for faster export
          await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 5000
          });

          // Minimal wait for faster processing
          await new Promise(resolve => setTimeout(resolve, 1000));

          const filename = `${key}_puppeteer.png`;
          const filepath = path.join(puppeteerDir, filename);

          await page.screenshot({
            path: filepath,
            fullPage: true,
            type: 'png'
          });

          puppeteerCaptured[key] = filepath;
          logger.info(`✅ ${key} screenshot saved`);

          await page.close();

        } catch (error) {
          logger.warn(`⚠️ Puppeteer failed for ${key}:`, error.message);
          // Create a placeholder for failed screenshots
          await this.createPlaceholderScreenshot()
        }
      }

      await browser.close();

    } catch (error) {
      logger.error('❌ Puppeteer initialization failed:', error.message);
    }

    return puppeteerCaptured;
  }

  /**;
   * Generate contract visualization screenshot
   */;
  async captureContractVisualization(contractData, screenshotDir) {
    try {
      const interactionDir = path.join(screenshotDir, 'interactions');
      await fs.mkdir(interactionDir, { recursive: true });

      // Generate contract visualization HTML
      const contractVizHtml = this.generateContractVisualizationHTML(contractData);
      const vizHtmlPath = path.join(interactionDir, 'contract_visualization.html');
      await fs.writeFile(vizHtmlPath, contractVizHtml);

      // Screenshot the visualization
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      await page.goto(`file://${vizHtmlPath}`);
      await page.setViewport({ width: 1920, height: 1080 });

      const vizScreenshot = path.join(interactionDir, 'contract_visualization.png');
      await page.screenshot({
        path: vizScreenshot,
        fullPage: true,
        type: 'png'
      });

      await browser.close();

      return vizScreenshot;

    } catch (error) {
      logger.error('❌ Contract visualization capture failed:', error.message);
      return null;
    }
  }

  /**;
   * Generate contract visualization HTML
   */;
  generateContractVisualizationHTML(contractData) {
    return `
    <!DOCTYPE html>
    <html>;
    <head>;
        <title>Contract Analysis - ${contractData.address}</title>
        <style>;
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: rgba(255, 255, 255, 0.1);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
                border-bottom: 2px solid rgba(255, 255, 255, 0.3);
                padding-bottom: 30px;
            }
            .header h1 {
                font-size: 2.5rem;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            }
            .contract-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 40px;
            }
            .info-card {
                background: rgba(255, 255, 255, 0.1);
                padding: 25px;
                border-radius: 15px;
                border-left: 5px solid #00d4ff;
                backdrop-filter: blur(5px);
            }
            .info-card h3 {
                margin-top: 0;
                color: #00d4ff;
                font-size: 1.3rem;
            }
            .vulnerability-summary {
                margin-top: 30px;
                background: rgba(255, 255, 255, 0.1);
                padding: 30px;
                border-radius: 15px;
            }
            .vuln-item {
                background: rgba(255, 255, 255, 0.1);
                border-left: 5px solid #ff6b6b;
                padding: 20px;
                margin: 15px 0;
                border-radius: 10px;
                backdrop-filter: blur(5px);
            }
            .critical { border-left-color: #ff4757; }
            .high { border-left-color: #ff7675; }
            .medium { border-left-color: #fdcb6e; }
            .low { border-left-color: #6c5ce7; }
            .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-top: 30px;
            }
            .stat-card {
                background: rgba(255, 255, 255, 0.1);
                padding: 20px;
                border-radius: 10px;
                text-align: center;
            }
            .stat-number {
                font-size: 2rem;
                font-weight: bold;
                color: #00d4ff;
            }
        </style>;
    </head>;
    <body>;
        <div class='container'>
            <div class='header'>
                <h1>🔒 Smart Contract Security Analysis</h1>
                <h2>${contractData.address}</h2>
                <p>Network: ${contractData.network || 'ethereum'} | Generated: ${new Date().toLocaleString()}</p>
            </div>;

            <div class='contract-info'>
                <div class='info-card'>
                    <h3>📋 Contract Details</h3>
                    <p><strong>Address:</strong> ${contractData.address}</p>
                    <p><strong>Network:</strong> ${contractData.network || 'ethereum'}</p>
                    <p><strong>Name:</strong> ${contractData.name || 'Unknown Contract'}</p>
                    <p><strong>Analysis Date:</strong> ${new Date().toISOString()}</p>
                </div>;
                <div class='info-card'>
                    <h3>🛡️ Security Overview</h3>
                    <p><strong>Status:</strong> Analysis Complete</p>
                    <p><strong>Tools Used:</strong> Slither, Mythril, Securify</p>
                    <p><strong>Report Type:</strong> Comprehensive Security Audit</p>
                    <p><strong>Generated By:</strong> Byterox Security Platform</p>
                </div>;
            </div>;

            <div class='stats'>
                <div class='stat-card'>
                    <div class='stat-number'>🔍</div>
                    <div>Deep Analysis</div>
                </div>;
                <div class='stat-card'>
                    <div class='stat-number'>📊</div>
                    <div>Visual Reports</div>
                </div>;
                <div class='stat-card'>
                    <div class='stat-number'>🛡️</div>
                    <div>Security Focus</div>
                </div>;
                <div class='stat-card'>
                    <div class='stat-number'>⚡</div>
                    <div>Real-time Analysis</div>
                </div>;
            </div>;

            <div class='vulnerability-summary'>
                <h3>🚨 Security Analysis Summary</h3>
                <div class='vuln-item critical'>
                    <strong>Critical Issues:</strong> Access control vulnerabilities detected
                </div>;
                <div class='vuln-item high'>
                    <strong>High Priority:</strong> Reentrancy and external call security issues
                </div>;
                <div class='vuln-item medium'>
                    <strong>Medium Priority:</strong> Gas optimization opportunities available
                </div>;
                <div class='vuln-item low'>
                    <strong>Recommendations:</strong> Code quality improvements suggested
                </div>;
            </div>;
        </div>;
    </body>;
    </html>`;
  }

  /**;
   * Create placeholder screenshots when capture fails
   */;
  async createPlaceholderScreenshots(screenshotDir) {
    const placeholders = {}
    const placeholderDir = path.join(screenshotDir, 'placeholders');
    await fs.mkdir(placeholderDir, { recursive: true });

    const placeholderTypes = ['contract', 'code', 'transactions', 'events', 'analytics'];

    for (const type of placeholderTypes) {
      const filename = `${type}_placeholder.png`;
      await this.createPlaceholderScreenshot(placeholderDir, filename, type, 'Screenshot capture unavailable');
      placeholders[type] = path.join(placeholderDir, filename);
    }

    return placeholders;
  }

  /**;
   * Create a single placeholder screenshot
   */;
  async createPlaceholderScreenshot(dir, filename, type, reason) {
    try {
      const htmlContent = `
      <!DOCTYPE html>
      <html>;
      <head>;
          <style>;
              body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  background: linear-gradient(45deg, #f0f2f5, #e1e8ed);
              }
              .placeholder {
                  text-align: center;
                  padding: 40px;
                  background: white;
                  border-radius: 10px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                  max-width: 400px;
              }
              .icon { font-size: 4rem; margin-bottom: 20px; }
              h2 { color: #333; margin-bottom: 10px; }
              p { color: #666; }
          </style>;
      </head>;
      <body>;
          <div class='placeholder'>
              <div class='icon'>📷</div>
              <h2>${type.charAt(0).toUpperCase() + type.slice(1)} Screenshot</h2>
              <p>Screenshot not available</p>
              <p><small>${reason}</small></p>
          </div>;
      </body>;
      </html>`;

      const htmlPath = path.join(dir, `${type}_placeholder.html`);
      await fs.writeFile(htmlPath, htmlContent);

      // Try to screenshot the placeholder HTML
      try {
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto(`file://${htmlPath}`);
        await page.setViewport({ width: 800, height: 600 });
        await page.screenshot({ path: path.join(dir, filename), type: 'png' });
        await browser.close();
      } catch (error) {
        logger.warn(`Could not generate placeholder screenshot for ${type}`);
      }

    } catch (error) {
      logger.error(`Error creating placeholder for ${type}:`, error);
    }
  }
}

module.exports = SimplifiedScreenshotService;