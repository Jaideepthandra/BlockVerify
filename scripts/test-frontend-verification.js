// Script to test the frontend's verifyProductAndEmit function
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const ProductVerification = await hre.ethers.getContractFactory("ProductVerification");
  
  // Get the deployed contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Connect to the deployed contract
  const productVerification = ProductVerification.attach(contractAddress);
  
  // Test product ID to verify
  const productId = "DIST-DUC3S8E9";
  
  console.log("Testing frontend verification with ID:", productId);
  
  // Call the verifyProduct function to compare results
  console.log("\nCalling verifyProduct for comparison...");
  const result = await productVerification.verifyProduct(productId);
  console.log("verifyProduct result:", result);
  console.log("Is authentic:", result[0]);
  console.log("Serial number:", result[1]);
  
  // Call the verifyProductAndEmit function directly
  console.log("\nCalling verifyProductAndEmit...");
  try {
    const tx = await productVerification.verifyProductAndEmit(productId);
    console.log("Transaction hash:", tx.hash);
    
    // Wait for the transaction to be mined
    console.log("Waiting for transaction to be mined...");
    const receipt = await tx.wait();
    console.log("Transaction mined in block:", receipt.blockNumber);
    
    // Log the transaction receipt for debugging
    console.log("Transaction receipt:", JSON.stringify(receipt, null, 2));
    
    // Check if there are any logs in the receipt
    if (receipt.logs && receipt.logs.length > 0) {
      console.log("\nFound logs in the receipt:", receipt.logs.length);
      
      // Try to decode each log
      for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        console.log(`\nLog ${i}:`, log);
        
        try {
          // Try to decode the log
          const iface = new ethers.utils.Interface(ProductVerification.interface.format());
          const decodedLog = iface.parseLog(log);
          console.log(`Decoded Log ${i}:`, decodedLog);
          console.log("Event name:", decodedLog.name);
          console.log("Event args:", decodedLog.args);
        } catch (error) {
          console.log(`Could not decode log ${i}:`, error.message);
        }
      }
    } else {
      console.log("No logs found in the transaction receipt.");
    }
  } catch (error) {
    console.error("Error calling verifyProductAndEmit:", error);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});