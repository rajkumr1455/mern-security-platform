#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Orchestrates all test types for the modular architecture
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class TestRunner {
  constructor() {
    this.testTypes = {
      unit: {
        name: 'Unit Tests',
        pattern: 'server/tests/unit/**/*.test.js',
        timeout: 10000,
        coverage: true
      },
      integration: {
        name: 'Integration Tests',
        pattern: 'server/tests/integration/**/*.test.js',
        timeout: 30000,
        coverage: true,
        env: { TEST_TYPE: 'integration' }
      },
      e2e: {
        name: 'End-to-End Tests',
        pattern: 'server/tests/e2e/**/*.test.js',
        timeout: 60000,
        coverage: false,
        env: { TEST_TYPE: 'e2e' }
      },
      client: {
        name: 'Client Tests',
        pattern: 'client/src/**/*.test.js',
        timeout: 15000,
        coverage: true,
        env: { TEST_TYPE: 'client' }
      }
    };

    this.results = {};
    this.startTime = Date.now();
  }

  /**
   * Run all tests or specific test type
   */
  async run(testType = 'all') {
    console.log('🧪 Starting Comprehensive Test Suite\n');
    console.log('=====================================\n');

    if (testType === 'all') {
      await this.runAllTests();
    } else if (this.testTypes[testType]) {
      await this.runTestType(testType);
    } else {
      console.error(`❌ Unknown test type: ${testType}`);
      console.log(`Available types: ${Object.keys(this.testTypes).join(', ')}, all`);
      process.exit(1);
    }

    this.generateSummary();
  }

  /**
   * Run all test types sequentially
   */
  async runAllTests() {
    for (const [type, config] of Object.entries(this.testTypes)) {
      await this.runTestType(type);
      console.log(''); // Add spacing between test types
    }
  }

  /**
   * Run specific test type
   */
  async runTestType(testType) {
    const config = this.testTypes[testType];
    console.log(`🔍 Running ${config.name}...`);
    console.log(`Pattern: ${config.pattern}`);
    console.log(`Timeout: ${config.timeout}ms`);

    const startTime = Date.now();

    try {
      const result = await this.executeJest(testType, config);
      const duration = Date.now() - startTime;

      this.results[testType] = {
        success: result.success,
        duration,
        tests: result.tests,
        coverage: result.coverage
      };

      if (result.success) {
        console.log(`✅ ${config.name} completed successfully`);
        console.log(`   Tests: ${result.tests.passed}/${result.tests.total} passed`);
        console.log(`   Duration: ${duration}ms`);
        if (result.coverage) {
          console.log(`   Coverage: ${result.coverage.percentage}%`);
        }
      } else {
        console.log(`❌ ${config.name} failed`);
        console.log(`   Tests: ${result.tests.passed}/${result.tests.total} passed`);
        console.log(`   Failures: ${result.tests.failed}`);
      }
    } catch (error) {
      console.error(`❌ ${config.name} failed with error:`, error.message);
      this.results[testType] = {
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * Execute Jest with specific configuration
   */
  async executeJest(testType, config) {
    return new Promise((resolve, reject) => {
      const jestArgs = [
        '--testPathPattern', config.pattern,
        '--testTimeout', config.timeout.toString(),
        '--verbose',
        '--detectOpenHandles',
        '--forceExit'
      ];

      if (config.coverage) {
        jestArgs.push('--coverage');
        jestArgs.push('--coverageReporters', 'text', 'lcov', 'html');
      }

      // Add setup file
      jestArgs.push('--setupFilesAfterEnv', '<rootDir>/server/tests/setup/testSetup.js');

      const env = {
        ...process.env,
        NODE_ENV: 'test',
        ...config.env
      };

      const jest = spawn('npx', ['jest', ...jestArgs], {
        stdio: 'pipe',
        env,
        cwd: process.cwd()
      });

      let stdout = '';
      let stderr = '';

      jest.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        if (process.env.TEST_VERBOSE === 'true') {
          process.stdout.write(output);
        }
      });

      jest.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        if (process.env.TEST_VERBOSE === 'true') {
          process.stderr.write(output);
        }
      });

      jest.on('close', (code) => {
        const result = this.parseJestOutput(stdout, stderr);
        result.success = code === 0;
        resolve(result);
      });

      jest.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Parse Jest output to extract test results
   */
  parseJestOutput(stdout, stderr) {
    const result = {
      tests: { total: 0, passed: 0, failed: 0 },
      coverage: null
    };

    // Parse test results
    const testSummaryMatch = stdout.match(/Tests:\s+(\d+)\s+failed,\s+(\d+)\s+passed,\s+(\d+)\s+total/);
    if (testSummaryMatch) {
      result.tests.failed = parseInt(testSummaryMatch[1]);
      result.tests.passed = parseInt(testSummaryMatch[2]);
      result.tests.total = parseInt(testSummaryMatch[3]);
    } else {
      const passedMatch = stdout.match(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+total/);
      if (passedMatch) {
        result.tests.passed = parseInt(passedMatch[1]);
        result.tests.total = parseInt(passedMatch[2]);
        result.tests.failed = 0;
      }
    }

    // Parse coverage
    const coverageMatch = stdout.match(/All files\s+\|\s+([\d.]+)/);
    if (coverageMatch) {
      result.coverage = {
        percentage: parseFloat(coverageMatch[1])
      };
    }

    return result;
  }

  /**
   * Generate comprehensive test summary
   */
  generateSummary() {
    const totalDuration = Date.now() - this.startTime;
    
    console.log('\n📊 Test Summary Report');
    console.log('======================\n');

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let allSuccessful = true;

    for (const [type, result] of Object.entries(this.results)) {
      const config = this.testTypes[type];
      console.log(`${config.name}:`);
      
      if (result.success) {
        console.log(`  ✅ Status: PASSED`);
        console.log(`  📈 Tests: ${result.tests.passed}/${result.tests.total}`);
        console.log(`  ⏱️  Duration: ${result.duration}ms`);
        
        if (result.coverage) {
          console.log(`  📊 Coverage: ${result.coverage.percentage}%`);
        }
      } else {
        console.log(`  ❌ Status: FAILED`);
        if (result.tests) {
          console.log(`  📈 Tests: ${result.tests.passed}/${result.tests.total}`);
          console.log(`  💥 Failures: ${result.tests.failed}`);
        }
        console.log(`  ⏱️  Duration: ${result.duration}ms`);
        if (result.error) {
          console.log(`  🚨 Error: ${result.error}`);
        }
        allSuccessful = false;
      }

      if (result.tests) {
        totalTests += result.tests.total;
        totalPassed += result.tests.passed;
        totalFailed += result.tests.failed;
      }

      console.log('');
    }

    console.log('Overall Summary:');
    console.log(`  📊 Total Tests: ${totalTests}`);
    console.log(`  ✅ Passed: ${totalPassed}`);
    console.log(`  ❌ Failed: ${totalFailed}`);
    console.log(`  ⏱️  Total Duration: ${totalDuration}ms`);
    console.log(`  🎯 Success Rate: ${totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0}%`);

    if (allSuccessful) {
      console.log('\n🎉 All tests passed successfully!');
      process.exit(0);
    } else {
      console.log('\n💥 Some tests failed. Please review the results above.');
      process.exit(1);
    }
  }
}

// CLI interface
if (require.main === module) {
  const testType = process.argv[2] || 'all';
  const runner = new TestRunner();
  runner.run(testType).catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;