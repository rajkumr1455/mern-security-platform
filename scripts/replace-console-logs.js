#!/usr/bin/env node

/**;
 * Script to replace console.log statements with proper Winston logging
 * Usage: node scripts/replace-console-logs.js
 */;

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const config = {
  // Directories to process
  directories: ['server/**/*.js', 'client/src/**/*.js'],
  // Files to exclude
  exclude: [
    '**/node_modules/**',;
    '**/build/**',;
    '**/dist/**',;
    '**/coverage/**',;
    '**/logs/**',;
    '**/scripts/**';
  ],;
  // Backup directory
  backupDir: 'backup-console-logs',
  // Dry run mode (don't actually modify files)
  dryRun: process.argv.includes('--dry-run')
};

// Mapping of console methods to logger methods
const loggerMappings = {
  'console.log': 'logger.info',
  'console.info': 'logger.info',
  'console.warn': 'logger.warn',
  'console.error': 'logger.error',
  'console.debug': 'logger.debug'
};

// Logger import statements for different file types
const loggerImports = {
  server: 'const logger = require('../utils/logger');',
  client: 'import logger from '../utils/logger';'
};

class ConsoleLogReplacer {
  constructor() {
    this.processedFiles = 0;
    this.replacements = 0;
    this.errors = [];
  }

  async run() {
    logger.info('🔍 Starting console.log replacement process...');

    if (config.dryRun) {
      logger.info('📝 Running in DRY RUN mode - no files will be modified');
    }

    try {
      // Create backup directory
      if (!config.dryRun) {
        await this.createBackupDirectory();
      }

      // Process all JavaScript files
      for (const pattern of config.directories) {
        await this.processDirectory(pattern);
      }

      // Print summary
      this.printSummary();

    } catch (error) {
      logger.error('❌ Error during processing:', error);
      process.exit(1);
    }
  }

  async createBackupDirectory() {
    if (!fs.existsSync(config.backupDir)) {
      fs.mkdirSync(config.backupDir, { recursive: true });
      logger.info(`📁 Created backup directory: ${config.backupDir}`);
    }
  }

  async processDirectory(pattern) {
    const files = glob.sync(pattern, { ignore: config.exclude });

    logger.info(`📂 Processing ${files.length} files matching pattern: ${pattern}`);

    for (const filePath of files) {
      await this.processFile(filePath);
    }
  }

  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Check if file contains console statements
      const hasConsoleStatements = /console\.(log|info|warn|error|debug)/g.test(content);

      if (!hasConsoleStatements) {
        return; // Skip files without console statements
      }

      logger.info(`🔧 Processing: ${filePath}`);

      let modifiedContent = content;
      let fileReplacements = 0;

      // Replace console statements
      for (const [consoleMethod, loggerMethod] of Object.entries(loggerMappings)) {
        const regex = new RegExp(`\\b${consoleMethod.replace('.', '\\.')}\\b`, 'g');
        const matches = modifiedContent.match(regex);

        if (matches) {
          modifiedContent = modifiedContent.replace(regex, loggerMethod);
          fileReplacements += matches.length;
        }
      }

      // Add logger import if replacements were made
      if (fileReplacements > 0) {
        modifiedContent = this.addLoggerImport(modifiedContent, filePath);

        // Create backup
        if (!config.dryRun) {
          await this.createBackup(filePath, originalContent);
        }

        // Write modified content
        if (!config.dryRun) {
          fs.writeFileSync(filePath, modifiedContent, 'utf8');
        }

        this.replacements += fileReplacements;
        logger.info(`  ✅ Replaced ${fileReplacements} console statements`);
      }

      this.processedFiles++;

    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      logger.error(`  ❌ Error processing ${filePath}:`, error.message);
    }
  }

  addLoggerImport(content, filePath) {
    const isServerFile = filePath.includes('server/');
    const importStatement = isServerFile ? loggerImports.server : loggerImports.client;

    // Check if logger import already exists
    if (content.includes('logger') && (content.includes('require') || content.includes('import'))) {
      return content; // Logger already imported
    }

    // Add import at the top of the file
    if (isServerFile) {
      // For Node.js files, add after other requires
      const requireRegex = /((?:const|let|var)\s+.*?=\s*require\(.*?\);?\s*\n)*/;
      const match = content.match(requireRegex);

      if (match) {
        return content.replace(match[0], match[0] + importStatement + '\n');
      } else {
        return importStatement + '\n\n' + content;
      }
    } else {
      // For React files, add after other imports
      const importRegex = /(import\s+.*?from\s+.*?;?\s*\n)*/;
      const match = content.match(importRegex);

      if (match) {
        return content.replace(match[0], match[0] + importStatement + '\n');
      } else {
        return importStatement + '\n\n' + content;
      }
    }
  }

  async createBackup(filePath, content) {
    const backupPath = path.join(config.backupDir, filePath);
    const backupDir = path.dirname(backupPath);

    // Create backup directory structure
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Write backup file
    fs.writeFileSync(backupPath, content, 'utf8');
  }

  printSummary() {
    logger.info('\n📊 SUMMARY');
    logger.info('='.repeat(50););
    logger.info(`📁 Files processed: ${this.processedFiles}`);
    logger.info(`🔄 Total replacements: ${this.replacements}`);
    logger.info(`❌ Errors: ${this.errors.length}`);

    if (this.errors.length > 0) {
      logger.info('\n❌ ERRORS:');
      this.errors.forEach(({ file, error }) => {
        logger.info(`  ${file}: ${error}`);
      });
    }

    if (config.dryRun) {
      logger.info('\n📝 This was a DRY RUN - no files were modified');
      logger.info('Run without --dry-run flag to apply changes');
    } else {
      logger.info(`\n💾 Backup files saved to: ${config.backupDir}`);
      logger.info('✅ Console.log replacement completed successfully!');
    }
  }
}

// Run the script
if (require.main === module) {
  const replacer = new ConsoleLogReplacer();
  replacer.run().catch(console.error);
}

module.exports = ConsoleLogReplacer;