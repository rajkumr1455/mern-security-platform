#!/usr/bin/env node

/**;
 * Immunefi PoC Generator
 * Automatically generates professional PoC templates for bug bounty submissions
 */;

const fs = require('fs');
const logger = require('../utils/logger');
const path = require('path');

class ImmuneFiPoCGenerator {
  constructor() {
    this.templates = {
      foundryConfig: this.getFoundryConfig(),
      envExample: this.getEnvExample(),
      gitignore: this.getGitignore(),
      exploitContract: this.getExploitTemplate(),
      targetContract: this.getTargetTemplate(),
      interfaceTemplate: this.getInterfaceTemplate(),
      testContract: this.getTestTemplate(),
      deployScript: this.getDeployTemplate(),
      readme: this.getReadmeTemplate()
    };
  }

  getExploitTemplate() {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import './interfaces/ITarget.sol';

/**;
 * @title {{EXPLOIT_NAME}}
 * @notice Proof of Concept for {{VULNERABILITY_TYPE}}
 * @dev This contract demonstrates the {{VULNERABILITY_TYPE}} vulnerability
 */;
contract {{EXPLOIT_CONTRACT_NAME}} {
    ITarget public immutable target;
    address public immutable attacker;

    uint256 public profit;
    bool public exploitExecuted;

    event ExploitExecuted(uint256 profit);
    event StepCompleted(string step, uint256 value);

    constructor(address _target) {
        target = ITarget(_target);
        attacker = msg.sender;
    }

    /**;
     * @notice Execute the {{VULNERABILITY_TYPE}} exploit
     */;
    function executeExploit() external {
        require(msg.sender == attacker, 'Only attacker');
        require(!exploitExecuted, 'Already executed');

        uint256 initialBalance = address(this).balance;

        // Step 1: Setup attack
        _setupAttack();
        emit StepCompleted('Setup completed', address(this).balance);

        // Step 2: Execute main exploit logic
        _executeMainAttack();
        emit StepCompleted('Main attack completed', address(this).balance);

        // Step 3: Extract profit
        _extractProfit();
        emit StepCompleted('Profit extracted', address(this).balance);

        profit = address(this).balance - initialBalance;
        exploitExecuted = true;

        emit ExploitExecuted(profit);
    }

    function _setupAttack() internal {
        {{SETUP_CODE}}
    }

    function _executeMainAttack() internal {
        {{EXPLOIT_CODE}}
    }

    function _extractProfit() internal {
        {{PROFIT_CODE}}
    }

    receive() external payable {
        {{FALLBACK_CODE}}
    }
}`;
  }

  getTargetTemplate() {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**;
 * @title {{TARGET_CONTRACT_NAME}}
 * @notice Vulnerable contract for demonstration
 * @dev Contains {{VULNERABILITY_TYPE}} vulnerability
 */;
contract {{TARGET_CONTRACT_NAME}} {
    mapping(address => uint256) public balances;

    event Deposit(address user, uint256 amount);
    event Withdrawal(address user, uint256 amount);

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, 'Insufficient balance');

        {{VULNERABLE_CODE}}

        balances[msg.sender] -= amount;
        emit Withdrawal(msg.sender, amount);
    }

    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    receive() external payable {
        deposit();
    }
}`;
  }

  getInterfaceTemplate() {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITarget {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function getBalance(address user) external view returns (uint256);
    function balances(address user) external view returns (uint256);
}`;
  }

  getTestTemplate() {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import '../src/{{EXPLOIT_CONTRACT_NAME}}.sol';
import '../src/{{TARGET_CONTRACT_NAME}}.sol';

contract {{EXPLOIT_CONTRACT_NAME}}Test is Test {
    {{EXPLOIT_CONTRACT_NAME}} public exploit;
    {{TARGET_CONTRACT_NAME}} public target;

    address public attacker = makeAddr('attacker');
    address public victim = makeAddr('victim');

    uint256 public constant INITIAL_BALANCE = 10 ether;
    uint256 public constant TARGET_BALANCE = 100 ether;

    function setUp() public {
        target = new {{TARGET_CONTRACT_NAME}}();
        vm.deal(address(target), TARGET_BALANCE);

        vm.prank(attacker);
        exploit = new {{EXPLOIT_CONTRACT_NAME}}(address(target));

        vm.deal(attacker, INITIAL_BALANCE);
    }

    function testExploitExecution() public {
        uint256 initialAttackerBalance = attacker.balance;
        uint256 initialTargetBalance = address(target).balance;

        logger.info('=== {{VULNERABILITY_TYPE}} EXPLOIT TEST ===');
        logger.info('Initial attacker balance:', initialAttackerBalance);
        logger.info('Initial target balance:', initialTargetBalance);

        vm.prank(attacker);
        exploit.executeExploit();

        uint256 finalAttackerBalance = attacker.balance;
        uint256 finalTargetBalance = address(target).balance;
        uint256 profit = exploit.profit();

        logger.info('Final attacker balance:', finalAttackerBalance);
        logger.info('Final target balance:', finalTargetBalance);
        logger.info('Profit extracted:', profit);

        assertTrue(exploit.exploitExecuted(), 'Exploit should be executed');
        assertGt(profit, 0, 'Should extract profit');
        assertLt(finalTargetBalance, initialTargetBalance, 'Target should lose funds');
    }
}`;
  }

  getDeployTemplate() {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/Script.sol';
import '../src/{{EXPLOIT_CONTRACT_NAME}}.sol';
import '../src/{{TARGET_CONTRACT_NAME}}.sol';

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint('PRIVATE_KEY');
        address targetAddress = vm.envAddress('TARGET_CONTRACT');

        vm.startBroadcast(deployerPrivateKey);

        // Deploy exploit contract
        {{EXPLOIT_CONTRACT_NAME}} exploit = new {{EXPLOIT_CONTRACT_NAME}}(targetAddress);

        logger.info('Exploit deployed at:', address(exploit););
        logger.info('Target contract:', targetAddress);

        vm.stopBroadcast();
    }
}`;
  }

  getReadmeTemplate() {
    return `# {{VULNERABILITY_NAME}} - Proof of Concept

## Vulnerability Summary
- **Type**: {{VULNERABILITY_TYPE}}
- **Severity**: {{SEVERITY}}
- **Target**: {{TARGET_CONTRACT}}
- **Network**: {{NETWORK}}

## Description
This PoC demonstrates a {{VULNERABILITY_TYPE}} vulnerability that allows an attacker to extract funds from the target contract.

## Setup Instructions
1. Install Foundry: \`curl -L https://foundry.paradigm.xyz | bash\`
2. Clone this repository
3. Install dependencies: \`forge install\`
4. Copy environment: \`cp .env.example .env\`
5. Configure RPC URLs in .env

## Running the PoC
1. Compile contracts: \`forge build\`
2. Run tests: \`forge test -vvv\`
3. Run on fork: \`forge test --fork-url $MAINNET_RPC_URL -vvv\`

## Expected Results
- Exploit successfully extracts funds from target contract
- Profit is demonstrated and quantified
- Attack is reproducible and documented

## Impact Analysis
- **Financial Impact**: Funds at risk in target contract
- **Attack Cost**: Minimal gas fees required
- **Likelihood**: High (if vulnerability exists)

## Mitigation
- Implement checks-effects-interactions pattern
- Add reentrancy guards
- Use pull payment pattern
`;
  }

  async generatePoC(vulnerabilityData) {
    const {
      name = 'sample-vulnerability',
      type = 'reentrancy',
      severity = 'high',
      targetContract = '0x1234567890abcdef1234567890abcdef12345678',
      network = 'ethereum',
      description = '',
      impact = '',
      mitigation = '',
      vulnerabilities = [] // Array of all vulnerabilities found
    } = vulnerabilityData;

    const projectName = `immunefi-poc-${name.toLowerCase().replace(/\s+/g, '-')}`;
    const projectPath = path.join(process.cwd(), projectName);

    logger.info(`🚀 Generating Immunefi PoC: ${projectName}`);

    // Create project structure
    this.createDirectoryStructure(projectPath);

    // Generate files with comprehensive vulnerability data
    await this.generateFiles(projectPath, {
      name,;
      type,;
      severity,;
      targetContract,;
      network,;
      description,;
      impact,;
      mitigation,;
      vulnerabilities;
    });

    logger.info(`✅ PoC generated successfully at: ${projectPath}`);
    logger.info(`📋 Next steps:`);
    logger.info(`   1. cd ${projectName}`);
    logger.info(`   2. forge install`);
    logger.info(`   3. cp .env.example .env`);
    logger.info(`   4. Configure .env with your RPC URLs`);
    logger.info(`   5. forge test -vvv`);

    return {
      projectPath,;
      exploitContract: this.generateExploitContract(vulnerabilityData),
      testContract: this.generateTestContract(vulnerabilityData),
      targetContract: this.generateTargetContract(vulnerabilityData),
      interface: this.generateInterface(vulnerabilityData),
      deployScript: this.templates.deployScript,
      readme: this.generateReadme(vulnerabilityData),
      foundryConfig: this.templates.foundryConfig,
      envExample: this.templates.envExample,
      metadata: {
        generatedAt: new Date().toISOString(),
        vulnerabilityData,;
        projectName,;
        immunefiCompliant: true,
        totalVulnerabilities: vulnerabilities.length || 1
      }
    };
  }

  // Enhanced method to generate comprehensive PoC for multiple vulnerabilities
  async generateComprehensivePoC(analysisResults) {
    const vulnerabilities = analysisResults.results?.vulnerabilities || [];
    const contractAddress = analysisResults.contractAddress;
    const network = analysisResults.network || 'ethereum';

    if (vulnerabilities.length === 0) {
      throw new Error('No vulnerabilities found to generate PoC');
    }

    // Use the most critical vulnerability as primary
    const primaryVuln = vulnerabilities.find(v => v.severity === 'Critical') ||
                       vulnerabilities.find(v => v.severity === 'High') ||
                       vulnerabilities[0];

    const pocData = {
      name: `${primaryVuln.type} in Smart Contract`,
      type: this.mapVulnerabilityType(primaryVuln.type),
      severity: primaryVuln.severity.toLowerCase(),
      targetContract: contractAddress,
      network: network,
      description: primaryVuln.description,
      impact: primaryVuln.impact || `This ${primaryVuln.severity} vulnerability could lead to significant financial losses`,
      mitigation: primaryVuln.recommendation || 'Implement proper security measures',
      vulnerabilities: vulnerabilities,
      analysisResults: analysisResults
    };

    return await this.generatePoC(pocData);
  }

  mapVulnerabilityType(vulnType) {
    const typeMap = {
      'Reentrancy': 'reentrancy',
      'Flash Loan Attack': 'flashloan',
      'Price Manipulation': 'price-manipulation',
      'Access Control': 'access-control',
      'Integer Overflow': 'integer-overflow',
      'Front Running': 'front-running',
      'Sandwich Attack': 'sandwich-attack',
      'Governance Attack': 'governance-attack'
    };

    return typeMap[vulnType] || vulnType.toLowerCase().replace(/\s+/g, '-');
  }

  createDirectoryStructure(projectPath) {
    const dirs = [
      projectPath,;
      path.join(projectPath, 'src'),
      path.join(projectPath, 'src/interfaces'),
      path.join(projectPath, 'test'),
      path.join(projectPath, 'test/utils'),
      path.join(projectPath, 'script')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async generateFiles(projectPath, data) {
    const files = [
      { path: 'foundry.toml', content: this.templates.foundryConfig },
      { path: '.env.example', content: this.templates.envExample },
      { path: '.gitignore', content: this.templates.gitignore },
      { path: 'src/Exploit.sol', content: this.generateExploitContract(data) },
      { path: 'src/Target.sol', content: this.generateTargetContract(data) },
      { path: 'src/interfaces/ITarget.sol', content: this.generateInterface(data) },
      { path: 'test/ExploitTest.t.sol', content: this.generateTestContract(data) },
      { path: 'script/Deploy.s.sol', content: this.templates.deployScript },
      { path: 'README.md', content: this.generateReadme(data) }
    ];

    files.forEach(file => {
      const filePath = path.join(projectPath, file.path);
      fs.writeFileSync(filePath, file.content);
      logger.info(`📄 Created: ${file.path}`);
    });
  }

  getFoundryConfig() {
    return `[profile.default]
src = 'src'
out = 'out'
libs = ['lib']
remappings = [
    '@openzeppelin/=lib/openzeppelin-contracts/',;
    '@forge-std/=lib/forge-std/src/';
];

[rpc_endpoints];
mainnet = '\${MAINNET_RPC_URL}'
polygon = '\${POLYGON_RPC_URL}'
arbitrum = '\${ARBITRUM_RPC_URL}'

[etherscan];
mainnet = { key = '\${ETHERSCAN_API_KEY}' }
polygon = { key = '\${POLYGONSCAN_API_KEY}' }
arbitrum = { key = '\${ARBISCAN_API_KEY}' }
`;
  }

  getEnvExample() {
    return `# RPC URLs
MAINNET_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY;
POLYGON_RPC_URL=https://polygon-mainnet.alchemyapi.io/v2/YOUR_KEY;
ARBITRUM_RPC_URL=https://arb-mainnet.alchemyapi.io/v2/YOUR_KEY;

# API Keys
ETHERSCAN_API_KEY=your_etherscan_key;
POLYGONSCAN_API_KEY=your_polygonscan_key;
ARBISCAN_API_KEY=your_arbiscan_key;

# Target Contract
TARGET_CONTRACT=0x1234567890abcdef1234567890abcdef12345678;

# Private Key (for deployment - use test key only)
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12;
`;
  }

  getGitignore() {
    return `# Foundry
cache/;
out/;
broadcast/;

# Environment
.env;
.env.local;

# Node
node_modules/;
npm-debug.log*;

# IDE
.vscode/;
.idea/;

# OS
.DS_Store;
Thumbs.db;
`;
  }

  generateExploitContract(data) {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import './interfaces/ITarget.sol';

/**;
 * @title ${data.name}Exploit
 * @notice Proof of Concept for ${data.type} vulnerability
 * @dev This contract demonstrates the ${data.type} vulnerability
 */;
contract ${data.name.replace(/\s+/g, '')}Exploit {
    ITarget public immutable target;
    address public immutable attacker;

    uint256 public profit;
    bool public exploitExecuted;

    event ExploitExecuted(uint256 profit);
    event StepCompleted(string step, uint256 value);

    constructor(address _target) {
        target = ITarget(_target);
        attacker = msg.sender;
    }

    /**;
     * @notice Execute the ${data.type} exploit
     */;
    function executeExploit() external {
        require(msg.sender == attacker, 'Only attacker');
        require(!exploitExecuted, 'Already executed');

        uint256 initialBalance = address(this).balance;

        // Step 1: Setup attack
        _setupAttack();
        emit StepCompleted('Setup completed', address(this).balance);

        // Step 2: Execute main exploit logic
        _executeMainAttack();
        emit StepCompleted('Main attack completed', address(this).balance);

        // Step 3: Extract profit
        _extractProfit();
        emit StepCompleted('Profit extracted', address(this).balance);

        profit = address(this).balance - initialBalance;
        exploitExecuted = true;

        emit ExploitExecuted(profit);
    }

    function _setupAttack() internal {
        // Implement attack setup logic
        // Example: Flash loan initiation, price manipulation setup
    }

    function _executeMainAttack() internal {
        // Implement main attack logic
        // Example: Reentrancy call, price manipulation
    }

    function _extractProfit() internal {
        // Implement profit extraction
        // Example: Withdraw funds, repay flash loan
    }

    receive() external payable {
        // Handle reentrancy or callbacks
    }
}`;
  }

  generateTargetContract(data) {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**;
 * @title Target Contract
 * @notice Vulnerable contract for demonstration
 */;
contract Target {
    mapping(address => uint256) public balances;

    event Deposit(address user, uint256 amount);
    event Withdrawal(address user, uint256 amount);

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, 'Insufficient balance');

        // Vulnerable pattern - external call before state update
        (bool success, ) = msg.sender.call{value: amount}('');
        require(success, 'Transfer failed');

        balances[msg.sender] -= amount; // State update after external call
        emit Withdrawal(msg.sender, amount);
    }

    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    receive() external payable {
        deposit();
    }
}`;
  }

  generateInterface(data) {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITarget {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function getBalance(address user) external view returns (uint256);
    function balances(address user) external view returns (uint256);
}`;
  }

  generateTestContract(data) {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import 'forge-std/Test.sol';
import '../src/Exploit.sol';
import '../src/Target.sol';

contract ExploitTest is Test {
    ${data.name.replace(/\s+/g, '')}Exploit public exploit;
    Target public target;

    address public attacker = makeAddr('attacker');
    address public victim = makeAddr('victim');

    uint256 public constant INITIAL_BALANCE = 10 ether;
    uint256 public constant TARGET_BALANCE = 100 ether;

    function setUp() public {
        // Deploy target contract
        target = new Target();

        // Fund target contract
        vm.deal(address(target), TARGET_BALANCE);

        // Deploy exploit contract
        vm.prank(attacker);
        exploit = new ${data.name.replace(/\s+/g, '')}Exploit(address(target));

        // Fund attacker
        vm.deal(attacker, INITIAL_BALANCE);
    }

    function testExploitExecution() public {
        uint256 initialAttackerBalance = attacker.balance;
        uint256 initialTargetBalance = address(target).balance;

        logger.info('=== INITIAL STATE ===');
        logger.info('Attacker balance:', initialAttackerBalance);
        logger.info('Target balance:', initialTargetBalance);

        // Execute exploit
        vm.prank(attacker);
        exploit.executeExploit();

        uint256 finalAttackerBalance = attacker.balance;
        uint256 finalTargetBalance = address(target).balance;
        uint256 profit = exploit.profit();

        logger.info('=== FINAL STATE ===');
        logger.info('Attacker balance:', finalAttackerBalance);
        logger.info('Target balance:', finalTargetBalance);
        logger.info('Profit extracted:', profit);

        // Assertions
        assertTrue(exploit.exploitExecuted(), 'Exploit should be executed');
        assertGt(profit, 0, 'Should extract profit');
        assertLt(finalTargetBalance, initialTargetBalance, 'Target should lose funds');
    }
}`;
  }

  generateReadme(data) {
    return `# ${data.name} - Proof of Concept

## Vulnerability Summary
- **Type**: ${data.type}
- **Severity**: ${data.severity}
- **Target**: ${data.targetContract}
- **Network**: ${data.network}

## Description
This PoC demonstrates a ${data.type} vulnerability that allows an attacker to extract funds from the target contract.

## Setup Instructions
1. Install Foundry: \`curl -L https://foundry.paradigm.xyz | bash\`
2. Clone this repository
3. Install dependencies: \`forge install\`
4. Copy environment: \`cp .env.example .env\`
5. Configure RPC URLs in .env

## Running the PoC
1. Compile contracts: \`forge build\`
2. Run tests: \`forge test -vvv\`
3. Run on fork: \`forge test --fork-url $MAINNET_RPC_URL -vvv\`

## Expected Results
- Exploit successfully extracts funds from target contract
- Profit is demonstrated and quantified
- Attack is reproducible and documented

## Impact Analysis
- **Financial Impact**: Funds at risk in target contract
- **Attack Cost**: Minimal gas fees required
- **Likelihood**: High (if vulnerability exists)

## Mitigation
- Implement checks-effects-interactions pattern
- Add reentrancy guards
- Use pull payment pattern
`;
  }
}

// CLI Usage
if (require.main === module) {
  const generator = new ImmuneFiPoCGenerator();

  const vulnerabilityData = {
    name: process.argv[2] || 'Sample Vulnerability',
    type: process.argv[3] || 'reentrancy',
    severity: process.argv[4] || 'high',
    targetContract: process.argv[5] || '0x1234567890abcdef1234567890abcdef12345678',
    network: process.argv[6] || 'ethereum'
  };

  generator.generatePoC(vulnerabilityData);
    .then(projectPath => {
      logger.info(`\n🎉 PoC generated successfully!`);
      logger.info(`📁 Project location: ${projectPath}`);
    })
    .catch(error => {
      logger.error('❌ Error generating PoC:', error);
      process.exit(1);
    });
}

module.exports = ImmuneFiPoCGenerator;