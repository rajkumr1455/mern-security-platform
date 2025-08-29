// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITarget {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function getBalance(address user) external view returns (uint256);
    function balances(address user) external view returns (uint256);
}