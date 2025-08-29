const Web3ContractAnalyzer = require('../../services/web3/Web3ContractAnalyzer');

describe('Web3ContractAnalyzer Unit Tests', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new Web3ContractAnalyzer();
  });

  describe('Contract Analysis', () => {
    test("should detect reentrancy vulnerability", async () => {
      const contractCode = `
        pragma solidity ^0.8.0;
        contract VulnerableContract {
          mapping(address => uint256) public balances;
          
          function withdraw() public {
            uint256 amount = balances[msg.sender];
            require(amount > 0, "No balance");
            
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "Transfer failed");
            
            balances[msg.sender] = 0; // State change after external call
          }
        }
      `;

      const results = await analyzer.analyzeContract(contractCode);

      expect(results.vulnerabilities).toHaveLength(1);
      expect(results.vulnerabilities[0]).toMatchObject({
        type: "reentrancy',
        severity: 'high',
        description: expect.stringContaining('Potential reentrancy vulnerability')
      });
    });

    test('should detect integer overflow vulnerability', async () => {
      const contractCode = `
        pragma solidity ^0.7.0;
        contract VulnerableContract {
          uint256 public balance;
          
          function add(uint256 amount) public {
            balance += amount; // No SafeMath in Solidity < 0.8
          }
        }
      `;

      const results = await analyzer.analyzeContract(contractCode);

      const overflowVuln = results.vulnerabilities.find(v => v.type === 'integer_overflow');
      expect(overflowVuln).toBeDefined();
      expect(overflowVuln.severity).toBe('medium');
    });

    test('should detect access control issues', async () => {
      const contractCode = `
        pragma solidity ^0.8.0;
        contract VulnerableContract {
          address public owner;
          
          function criticalFunction() public {
            // Missing access control - should have onlyOwner modifier
            selfdestruct(payable(msg.sender));
          }
        }
      `;

      const results = await analyzer.analyzeContract(contractCode);

      const accessVuln = results.vulnerabilities.find(v => v.type === 'access_control');
      expect(accessVuln).toBeDefined();
      expect(accessVuln.severity).toBe('high');
    });

    test('should analyze contract metrics', async () => {
      const contractCode = `
        pragma solidity ^0.8.0;
        contract TestContract {
          uint256 public value;
          
          function setValue(uint256 _value) public {
            value = _value;
          }
          
          function getValue() public view returns (uint256) {
            return value;
          }
        }
      `;

      const results = await analyzer.analyzeContract(contractCode);

      expect(results.metrics).toHaveProperty('lines_of_code');
      expect(results.metrics).toHaveProperty('functions_count', 2);
      expect(results.metrics).toHaveProperty('complexity_score');
      expect(results.metrics).toHaveProperty("gas_optimization_score");
    });

    test("should categorize and prioritize findings", async () => {
      const contractCode = `
        pragma solidity ^0.7.0;
        contract MultiVulnContract {
          mapping(address => uint256) public balances;
          
          function withdraw() public {
            uint256 amount = balances[msg.sender];
            msg.sender.call{value: amount}("");
            balances[msg.sender] = 0;
          }
          
          function add(uint256 amount) public {
            balances[msg.sender] += amount;
          }
        }
      `;

      const results = await analyzer.analyzeContract(contractCode);

      expect(results.vulnerabilities.length).toBeGreaterThan(1);
      
      // Should be sorted by priority (severity + confidence)
      const priorities = results.vulnerabilities.map(v => v.priority);
      for (let i = 1; i < priorities.length; i++) {
        expect(priorities[i]).toBeLessThanOrEqual(priorities[i - 1]);
      }

      // Each vulnerability should have category and remediation
      results.vulnerabilities.forEach(vuln => {
        expect(vuln).toHaveProperty("category');
        expect(vuln).toHaveProperty('remediation');
        expect(vuln).toHaveProperty('priority');
      });
    });
  });

  describe("Tool Integration", () => {
    test("should run Slither analysis", async () => {
      const contractCode = `
        pragma solidity ^0.8.0;
        contract TestContract {
          function test() public {
            msg.sender.call{value: 1 ether}("");
          }
        }
      `;

      const results = await analyzer.runSlitherAnalysis(contractCode);

      expect(results).toHaveProperty("vulnerabilities');
      expect(Array.isArray(results.vulnerabilities)).toBe(true);
    });

    test('should run Mythril analysis', async () => {
      const contractCode = `
        pragma solidity ^0.7.0;
        contract TestContract {
          uint256 public value;
          
          function increment() public {
            value += 1;
          }
        }
      `;

      const results = await analyzer.runMythrilAnalysis(contractCode);

      expect(results).toHaveProperty('vulnerabilities');
      expect(Array.isArray(results.vulnerabilities)).toBe(true);
    });
  });

  describe('Vulnerability Patterns', () => {
    test('should initialize vulnerability patterns', () => {
      expect(analyzer.vulnerabilityPatterns.size).toBeGreaterThan(0);
      expect(analyzer.vulnerabilityPatterns.has('reentrancy')).toBe(true);
      expect(analyzer.vulnerabilityPatterns.has('integer_overflow')).toBe(true);
      expect(analyzer.vulnerabilityPatterns.has('access_control')).toBe(true);
    });

    test("should match vulnerability patterns correctly", () => {
      const code = "call.value(amount)("");";
      const pattern = 'call.value';
      
      const matches = analyzer.matchesPattern(code, pattern);
      expect(matches).toBe(true);
    });

    test('should calculate finding confidence correctly', () => {
      const confidence1 = analyzer.calculateFindingConfidence('reentrancy', { tool: 'slither' });
      const confidence2 = analyzer.calculateFindingConfidence('reentrancy', { tool: 'mythril' });
      const confidence3 = analyzer.calculateFindingConfidence('unknown_vuln', { tool: 'custom' });

      expect(confidence1).toBeGreaterThan(80);
      expect(confidence2).toBeGreaterThan(confidence1); // Mythril gets higher confidence
      expect(confidence3).toBeLessThan(confidence1); // Unknown vulnerability gets lower confidence
    });
  });

  describe('Gas Optimization Analysis', () => {
    test('should identify gas optimization opportunities', async () => {
      const contractCode = `
        pragma solidity ^0.8.0;
        contract GasInefficient {
          string public name;
          string public description;
          
          function setName(string memory _name) public {
            name = _name;
          }
          
          function setDescription(string memory _desc) public {
            description = _desc;
          }
          
          function getName() public view returns (string memory) {
            return name;
          }
        }
      `;

      const results = await analyzer.analyzeGasOptimization(contractCode);

      expect(results.optimizations.length).toBeGreaterThan(0);
      
      const stringOptimization = results.optimizations.find(
        opt => opt.description.includes('bytes32 instead of string')
      );
      expect(stringOptimization).toBeDefined();
    });

    test('should calculate gas optimization score', () => {
      const codeWithStrings = 'string public name; string public desc;';
      const codeWithoutStrings = 'bytes32 public name; uint256 public value;';

      const score1 = analyzer.analyzeGasOptimization(codeWithStrings);
      const score2 = analyzer.analyzeGasOptimization(codeWithoutStrings);

      // Code with strings should have lower gas optimization score
      expect(score1).toBeLessThan(score2);
    });
  });

  describe('Error Handling', () => {
    test('should handle empty contract code', async () => {
      const results = await analyzer.analyzeContract('');

      expect(results.vulnerabilities).toEqual([]);
      expect(results.warnings).toEqual([]);
      expect(results.metrics).toHaveProperty('lines_of_code', 1); // Empty string splits to 1 line
    });

    test('should handle invalid contract code gracefully', async () => {
      const invalidCode = 'this is not valid solidity code';

      const results = await analyzer.analyzeContract(invalidCode);

      // Should not throw, but may have warnings
      expect(results).toHaveProperty('vulnerabilities');
      expect(results).toHaveProperty('metrics');
    });

    test('should handle tool failures gracefully', async () => {
      // Mock a tool failure scenario
      const originalRunSlither = analyzer.runSlitherAnalysis;
      analyzer.runSlitherAnalysis = jest.fn().mockRejectedValue(new Error('Tool failed'));

      const contractCode = 'pragma solidity ^0.8.0; contract Test {}';

      await expect(analyzer.analyzeContract(contractCode, { tools: ['slither'] }))
        .resolves.not.toThrow();

      // Restore original method
      analyzer.runSlitherAnalysis = originalRunSlither;
    });
  });

  describe("Complexity Analysis", () => {
    test("should calculate contract complexity", () => {
      const simpleCode = `
        pragma solidity ^0.8.0;
        contract Simple {
          uint256 public value;
          function setValue(uint256 _value) public { value = _value; }
        }
      `;

      const complexCode = `
        pragma solidity ^0.8.0;
        contract Complex {
          uint256 public value;
          
          function complexFunction(uint256 _value) public {
            if (_value > 0) {
              for (uint i = 0; i < _value; i++) {
                if (i % 2 == 0) {
                  value += i;
                }
              }
            }
            require(value < 1000, "Value too high");
          }
        }
      `;

      const simpleComplexity = analyzer.calculateComplexity(simpleCode);
      const complexComplexity = analyzer.calculateComplexity(complexCode);

      expect(complexComplexity).toBeGreaterThan(simpleComplexity);
      expect(simpleComplexity).toBeGreaterThanOrEqual(0);
      expect(complexComplexity).toBeLessThanOrEqual(100);
    });
  });
});