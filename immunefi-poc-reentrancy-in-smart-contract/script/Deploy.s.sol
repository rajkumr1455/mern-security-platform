// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/{{EXPLOIT_CONTRACT_NAME}}.sol";
import "../src/{{TARGET_CONTRACT_NAME}}.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address targetAddress = vm.envAddress("TARGET_CONTRACT");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy exploit contract
        {{EXPLOIT_CONTRACT_NAME}} exploit = new {{EXPLOIT_CONTRACT_NAME}}(targetAddress);
        
        console.log("Exploit deployed at:", address(exploit));
        console.log("Target contract:", targetAddress);
        
        vm.stopBroadcast();
    }
}