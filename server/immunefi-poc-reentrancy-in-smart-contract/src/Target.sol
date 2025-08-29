// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Target Contract
 * @notice Vulnerable contract for demonstration
 */
contract Target {
    mapping(address => uint256) public balances;
    
    event Deposit(address user, uint256 amount);
    event Withdrawal(address user, uint256 amount);
    
    function deposit() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // Vulnerable pattern - external call before state update
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        balances[msg.sender] -= amount; // State update after external call
        emit Withdrawal(msg.sender, amount);
    }
    
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
    
    receive() external payable {
        deposit();
    }
}