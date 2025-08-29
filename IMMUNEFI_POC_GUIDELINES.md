# 🛡️ **IMMUNEFI PROOF OF CONCEPT (POC) GUIDELINES**

Based on Immunefi's PoC Guidelines and Rules, here are the key requirements for creating a valid proof of concept:

## **📋 GENERAL POC REQUIREMENTS**

### **1. Completeness**
- PoC must demonstrate the full exploit chain
- Show actual impact, not just theoretical vulnerability
- Include all necessary steps to reproduce the issue
- Provide clear evidence of successful exploitation

### **2. Reproducibility**
- PoC must be easily reproducible by the project team
- Include exact environment setup instructions
- Provide all necessary dependencies and versions
- Clear step-by-step execution guide

### **3. Clarity**
- Well-documented code with comments
- Clear explanation of the vulnerability
- Impact assessment and risk analysis
- Professional presentation

## **🔧 TECHNICAL REQUIREMENTS**

### **For Smart Contract Vulnerabilities:**

#### **Required Components:**
1. **Exploit Contract** - The actual exploit code
2. **Test Setup** - Environment configuration
3. **Execution Script** - How to run the exploit
4. **Impact Demonstration** - Proof of funds/data extraction

#### **Forge/Foundry Template Structure:**
```
poc-project/
├── src/
│   ├── Exploit.sol          # Main exploit contract
│   ├── Target.sol           # Target contract (if needed)
│   └── interfaces/          # Required interfaces
├── test/
│   ├── ExploitTest.t.sol    # Test demonstrating exploit
│   └── setup/               # Test setup files
├── script/
│   └── Deploy.s.sol         # Deployment scripts
├── foundry.toml             # Foundry configuration
├── README.md                # Detailed documentation
└── .env.example             # Environment variables
```

### **Code Quality Standards:**
- Use latest Solidity version (0.8.x)
- Follow best practices and conventions
- Include proper error handling
- Add comprehensive comments

## **📝 DOCUMENTATION REQUIREMENTS**

### **README.md Must Include:**

#### **1. Vulnerability Summary**
```markdown
## Vulnerability Summary
- **Type**: [e.g., Reentrancy, Flash Loan Attack, etc.]
- **Severity**: [Critical/High/Medium/Low]
- **Impact**: [Funds at risk, data exposure, etc.]
- **Root Cause**: [Technical explanation]
```

#### **2. Environment Setup**
```markdown
## Setup Instructions
1. Install Foundry: `curl -L https://foundry.paradigm.xyz | bash`
2. Clone repository: `git clone [repo-url]`
3. Install dependencies: `forge install`
4. Copy environment: `cp .env.example .env`
5. Configure RPC URLs in .env
```

#### **3. Execution Steps**
```markdown
## Running the PoC
1. Compile contracts: `forge build`
2. Run tests: `forge test -vvv`
3. Execute exploit: `forge script script/Deploy.s.sol`
4. Verify results: [specific verification steps]
```

#### **4. Impact Analysis**
```markdown
## Impact Assessment
- **Financial Impact**: $X amount at risk
- **Affected Users**: [number/percentage]
- **Attack Cost**: [gas fees, capital required]
- **Likelihood**: [probability of exploitation]
```

## **🎯 SPECIFIC POC TYPES**

### **Flash Loan Attack PoC:**
```solidity
// Example structure
contract FlashLoanExploit {
    function executeAttack() external {
        // 1. Take flash loan
        // 2. Manipulate price/state
        // 3. Exploit vulnerability
        // 4. Repay loan + profit
    }
}
```

### **Reentrancy Attack PoC:**
```solidity
contract ReentrancyExploit {
    function attack() external {
        // 1. Initial call to vulnerable function
        // 2. Reentrant callback
        // 3. Drain funds
    }
    
    receive() external payable {
        // Reentrancy logic
    }
}
```

### **Price Manipulation PoC:**
```solidity
contract PriceManipulationExploit {
    function manipulateAndProfit() external {
        // 1. Manipulate oracle/AMM price
        // 2. Execute profitable transaction
        // 3. Restore price (if needed)
    }
}
```

## **⚠️ IMPORTANT RESTRICTIONS**

### **What NOT to Include:**
- ❌ Actual mainnet transactions
- ❌ Real user funds exploitation
- ❌ Attacks on live systems
- ❌ Malicious code distribution

### **What TO Include:**
- ✅ Testnet demonstrations
- ✅ Local fork testing
- ✅ Simulated environments
- ✅ Educational explanations

## **🔍 VALIDATION CHECKLIST**

Before submitting, ensure:

- [ ] PoC successfully demonstrates the vulnerability
- [ ] All code compiles without errors
- [ ] Tests pass and show expected results
- [ ] Documentation is complete and clear
- [ ] Environment setup is reproducible
- [ ] Impact is clearly quantified
- [ ] No malicious code included
- [ ] Follows Immunefi guidelines

## **📊 SUBMISSION FORMAT**

### **Repository Structure:**
```
immunefi-poc-[vulnerability-name]/
├── README.md                 # Main documentation
├── VULNERABILITY_REPORT.md   # Detailed technical report
├── src/                      # Source contracts
├── test/                     # Test files
├── script/                   # Deployment scripts
├── foundry.toml             # Configuration
└── .env.example             # Environment template
```

### **Submission Checklist:**
- [ ] Repository is public (or private with access granted)
- [ ] All dependencies are properly specified
- [ ] Clear commit history with meaningful messages
- [ ] No sensitive information in code/comments
- [ ] Professional presentation

## **🏆 BEST PRACTICES**

### **Code Quality:**
- Use descriptive variable names
- Add comprehensive comments
- Follow Solidity style guide
- Include proper error messages

### **Testing:**
- Test multiple scenarios
- Include edge cases
- Verify all assertions
- Use descriptive test names

### **Documentation:**
- Write for technical audience
- Include diagrams if helpful
- Explain complex logic
- Provide context and background

## **🔗 USEFUL RESOURCES**

- **Foundry Documentation**: https://book.getfoundry.sh/
- **Solidity Style Guide**: https://docs.soliditylang.org/en/latest/style-guide.html
- **Immunefi Guidelines**: https://immunefisupport.zendesk.com/hc/en-us/articles/9946217628561
- **OpenZeppelin Contracts**: https://github.com/OpenZeppelin/openzeppelin-contracts

---

*This guide provides a comprehensive framework for creating professional, reproducible, and impactful proof of concepts for Immunefi bug bounty submissions.*