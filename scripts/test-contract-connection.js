// Script to test contract connection and methods
const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const ProductVerification = await hre.ethers.getContractFactory("ProductVerification");
  
  // Get the deployed contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Connect to the deployed contract
  const productVerification = ProductVerification.attach(contractAddress);
  
  console.log("Testing contract connection...");
  console.log("Contract address:", productVerification.address);
  
  // Test if the contract has the expected methods
  console.log("\nChecking contract methods...");
  console.log("verifyProduct method exists:", typeof productVerification.verifyProduct === 'function');
  console.log("verifyProductAndEmit method exists:", typeof productVerification.verifyProductAndEmit === 'function');
  console.log("getProductDetails method exists:", typeof productVerification.getProductDetails === 'function');
  
  // Test product ID to verify
  const productId = "DIST-DUC3S8E9";
  
  console.log("\nVerifying product with ID:", productId);
  
  // Call the verify function directly
  const result = await productVerification.verifyProduct(productId);
  
  console.log("Verification result:", result);
  console.log("Is authentic:", result[0]);
  console.log("Serial number:", result[1]);
  
  // If we got a serial number, get the product details
  if (result[1] && result[1] !== '') {
    console.log("\nFetching product details...");
    const details = await productVerification.getProductDetails(result[1]);
    
    console.log("Product details:");
    console.log("Product name:", details[0]);
    console.log("Manufacturer:", details[1]);
    
    // Handle the manufacture date correctly
    let manufactureDate;
    try {
      manufactureDate = new Date(details[2].toNumber() * 1000).toLocaleDateString();
    } catch (e) {
      manufactureDate = new Date(Number(details[2]) * 1000).toLocaleDateString();
    }
    console.log("Manufacture date:", manufactureDate);
    console.log("Current ID:", details[3]);
    
    // Handle the current stage correctly
    let currentStage;
    try {
      currentStage = details[4].toNumber();
    } catch (e) {
      currentStage = Number(details[4]);
    }
    console.log("Current stage:", currentStage);
    
    // Get ID history
    const idHistory = await productVerification.getProductIdHistory(result[1]);
    console.log("\nID history:", idHistory);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});