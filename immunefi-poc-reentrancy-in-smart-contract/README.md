# Reentrancy in Smart Contract - Proof of Concept

## Vulnerability Summary
- **Type**: reentrancy
- **Severity**: critical
- **Target**: 0x355bd33f0033066bb3de396a6d069be57353ad95
- **Network**: ethereum

## Description
This PoC demonstrates a reentrancy vulnerability that allows an attacker to extract funds from the target contract.

## Setup Instructions
1. Install Foundry: `curl -L https://foundry.paradigm.xyz | bash`
2. Clone this repository
3. Install dependencies: `forge install`
4. Copy environment: `cp .env.example .env`
5. Configure RPC URLs in .env

## Running the PoC
1. Compile contracts: `forge build`
2. Run tests: `forge test -vvv`
3. Run on fork: `forge test --fork-url $MAINNET_RPC_URL -vvv`

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
