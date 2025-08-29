# 🛡️ **IMMUNEFI POC TEMPLATE - READY TO USE**

## **🚀 QUICK START TEMPLATE**

Based on Immunefi's forge-poc-templates repository, here's a complete template for creating professional PoCs:

### **📁 PROJECT STRUCTURE**
```
immunefi-poc-[vulnerability-name]/
├── README.md                 # This file
├── foundry.toml             # Foundry configuration
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore file
├── src/
│   ├── Exploit.sol          # Main exploit contract
│   ├── Target.sol           # Target vulnerable contract
│   └── interfaces/
│       └── ITarget.sol      # Target interface
├── test/
│   ├── ExploitTest.t.sol    # Main test file
│   └── utils/
│       └── TestUtils.sol    # Test utilities
└── script/
    └── Deploy.s.sol         # Deployment script
```

## **📋 VULNERABILITY REPORT TEMPLATE**

### **Executive Summary**
- **Vulnerability Type**: [e.g., Reentrancy, Flash Loan Attack, Price Manipulation]
- **Severity**: [Critical/High/Medium/Low]
- **Impact**: [Quantified financial impact]
- **Root Cause**: [Technical explanation in 1-2 sentences]
- **Fix Complexity**: [Simple/Medium/Complex]

### **Technical Details**

#### **Vulnerability Description**
[Detailed technical explanation of the vulnerability]

#### **Attack Vector**
1. [Step 1 of the attack]
2. [Step 2 of the attack]
3. [Step 3 of the attack]
4. [Final step and profit extraction]

#### **Impact Assessment**
- **Financial Impact**: $[amount] at risk
- **Affected Contracts**: [list of contracts]
- **Attack Cost**: [gas fees + capital required]
- **Likelihood**: [High/Medium/Low]

## **🔧 CODE TEMPLATES**

### **foundry.toml**
```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
remappings = [
    "@openzeppelin/=lib/openzeppelin-contracts/",
    "@forge-std/=lib/forge-std/src/"
]

[rpc_endpoints]
mainnet = "${MAINNET_RPC_URL}"
polygon = "${POLYGON_RPC_URL}"
arbitrum = "${ARBITRUM_RPC_URL}"

[etherscan]
mainnet = { key = "${ETHERSCAN_API_KEY}" }
polygon = { key = "${POLYGONSCAN_API_KEY}" }
arbitrum = { key = "${ARBISCAN_API_KEY}" }
```

### **.env.example**
```bash
# RPC URLs
MAINNET_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY
POLYGON_RPC_URL=https://polygon-mainnet.alchemyapi.io/v2/YOUR_KEY
ARBITRUM_RPC_URL=https://arb-mainnet.alchemyapi.io/v2/YOUR_KEY

# API Keys
ETHERSCAN_API_KEY=your_etherscan_key
POLYGONSCAN_API_KEY=your_polygonscan_key
ARBISCAN_API_KEY=your_arbiscan_key

# Target Contract (if needed)
TARGET_CONTRACT=0x1234567890abcdef1234567890abcdef12345678
```

### **src/Exploit.sol**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/ITarget.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ExploitContract
 * @notice Proof of Concept for [Vulnerability Name]
 * @dev This contract demonstrates the vulnerability in a controlled environment
 */
contract ExploitContract {
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
    
    /**
     * @notice Execute the exploit
     * @dev This function demonstrates the complete attack vector
     */
    function executeExploit() external {
        require(msg.sender == attacker, "Only attacker can execute");
        require(!exploitExecuted, "Exploit already executed");
        
        uint256 initialBalance = address(this).balance;
        
        // Step 1: [Describe what this step does]
        _step1();
        emit StepCompleted("Step 1 completed", address(this).balance);
        
        // Step 2: [Describe what this step does]
        _step2();
        emit StepCompleted("Step 2 completed", address(this).balance);
        
        // Step 3: [Describe what this step does]
        _step3();
        emit StepCompleted("Step 3 completed", address(this).balance);
        
        // Calculate profit
        profit = address(this).balance - initialBalance;
        exploitExecuted = true;
        
        emit ExploitExecuted(profit);
    }
    
    function _step1() internal {
        // Implement first step of exploit
        // Example: Flash loan initiation
    }
    
    function _step2() internal {
        // Implement second step of exploit
        // Example: Price manipulation
    }
    
    function _step3() internal {
        // Implement third step of exploit
        // Example: Profit extraction
    }
    
    // Receive function for handling ETH transfers
    receive() external payable {
        // Handle reentrancy or other callbacks
    }
    
    // Fallback function
    fallback() external payable {
        // Handle unexpected calls
    }
}
```

### **test/ExploitTest.t.sol**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/Exploit.sol";
import "../src/Target.sol";

contract ExploitTest is Test {
    ExploitContract public exploit;
    Target public target;
    
    address public attacker = makeAddr("attacker");
    address public victim = makeAddr("victim");
    
    uint256 public constant INITIAL_BALANCE = 100 ether;
    uint256 public constant TARGET_BALANCE = 1000 ether;
    
    function setUp() public {
        // Deploy target contract
        vm.prank(victim);
        target = new Target();
        
        // Fund target contract
        vm.deal(address(target), TARGET_BALANCE);
        
        // Deploy exploit contract
        vm.prank(attacker);
        exploit = new ExploitContract(address(target));
        
        // Fund attacker
        vm.deal(attacker, INITIAL_BALANCE);
    }
    
    function testExploitExecution() public {
        // Record initial state
        uint256 initialAttackerBalance = attacker.balance;
        uint256 initialTargetBalance = address(target).balance;
        
        console.log("=== INITIAL STATE ===");
        console.log("Attacker balance:", initialAttackerBalance);
        console.log("Target balance:", initialTargetBalance);
        
        // Execute exploit
        vm.startPrank(attacker);
        exploit.executeExploit();
        vm.stopPrank();
        
        // Record final state
        uint256 finalAttackerBalance = attacker.balance;
        uint256 finalTargetBalance = address(target).balance;
        uint256 profit = exploit.profit();
        
        console.log("=== FINAL STATE ===");
        console.log("Attacker balance:", finalAttackerBalance);
        console.log("Target balance:", finalTargetBalance);
        console.log("Profit extracted:", profit);
        
        // Assertions
        assertTrue(exploit.exploitExecuted(), "Exploit should be executed");
        assertGt(profit, 0, "Should have extracted profit");
        assertLt(finalTargetBalance, initialTargetBalance, "Target should have lost funds");
        
        // Calculate impact
        uint256 impactPercentage = ((initialTargetBalance - finalTargetBalance) * 100) / initialTargetBalance;
        console.log("Impact percentage:", impactPercentage);
        
        // Verify impact is significant
        assertGe(impactPercentage, 10, "Should have significant impact (>10%)");
    }
    
    function testExploitOnlyByAttacker() public {
        // Try to execute exploit from different address
        vm.prank(victim);
        vm.expectRevert("Only attacker can execute");
        exploit.executeExploit();
    }
    
    function testExploitCannotBeRepeated() public {
        // Execute exploit once
        vm.prank(attacker);
        exploit.executeExploit();
        
        // Try to execute again
        vm.prank(attacker);
        vm.expectRevert("Exploit already executed");
        exploit.executeExploit();
    }
}
```

### **script/Deploy.s.sol**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Exploit.sol";
import "../src/Target.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address targetAddress = vm.envAddress("TARGET_CONTRACT");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy exploit contract
        ExploitContract exploit = new ExploitContract(targetAddress);
        
        console.log("Exploit deployed at:", address(exploit));
        console.log("Target contract:", targetAddress);
        
        vm.stopBroadcast();
    }
}
```

## **📝 DOCUMENTATION TEMPLATE**

### **README.md Structure**
```markdown
# [Vulnerability Name] - Proof of Concept

## Summary
Brief description of the vulnerability and its impact.

## Vulnerability Details
- **Type**: [Vulnerability type]
- **Severity**: [Severity level]
- **Impact**: [Financial/operational impact]
- **Root Cause**: [Technical root cause]

## Setup Instructions
1. Install Foundry: `curl -L https://foundry.paradigm.xyz | bash`
2. Clone repository: `git clone [repo-url]`
3. Install dependencies: `forge install`
4. Copy environment: `cp .env.example .env`
5. Configure RPC URLs in .env

## Running the PoC
1. Compile contracts: `forge build`
2. Run tests: `forge test -vvv`
3. Execute on fork: `forge test --fork-url $MAINNET_RPC_URL -vvv`

## Expected Results
- [Expected outcome 1]
- [Expected outcome 2]
- [Profit/loss amounts]

## Impact Analysis
- **Financial Impact**: $X at risk
- **Attack Cost**: Y ETH in gas + Z ETH capital
- **Likelihood**: [Assessment]

## Mitigation
- [Recommended fix 1]
- [Recommended fix 2]
```

## **🎯 INTEGRATION WITH YOUR PLATFORM**

### **Add PoC Generation to Web3 Analysis**
```javascript
// In Web3AnalysisService.js
async generateImmuneFiPoC(vulnerabilityData) {
  const pocTemplate = {
    vulnerabilityType: vulnerabilityData.type,
    severity: vulnerabilityData.severity,
    impact: vulnerabilityData.impact,
    exploitCode: this.generateExploitContract(vulnerabilityData),
    testCode: this.generateTestContract(vulnerabilityData),
    documentation: this.generatePoCDocumentation(vulnerabilityData)
  };
  
  return pocTemplate;
}
```

## **✅ SUBMISSION CHECKLIST**

Before submitting to Immunefi:

- [ ] PoC successfully demonstrates vulnerability
- [ ] All tests pass with clear results
- [ ] Documentation is complete and professional
- [ ] Code is well-commented and clean
- [ ] Impact is clearly quantified
- [ ] Environment setup is reproducible
- [ ] No malicious code included
- [ ] Follows Immunefi guidelines
- [ ] Repository is properly structured
- [ ] All dependencies are specified

## **🏆 BEST PRACTICES**

1. **Always test on forks, never mainnet**
2. **Quantify impact in dollar amounts**
3. **Provide clear step-by-step reproduction**
4. **Include comprehensive test coverage**
5. **Write professional documentation**
6. **Follow Solidity best practices**
7. **Use descriptive variable names**
8. **Add detailed comments**

This template provides everything needed to create a professional, Immunefi-compliant proof of concept that will stand out in bug bounty submissions.