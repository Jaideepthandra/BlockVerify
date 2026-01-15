// Script to test verification of a registered product ID
const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const ProductVerification = await hre.ethers.getContractFactory("ProductVerification");
  
  // Get the deployed contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Connect to the deployed contract
  const productVerification = ProductVerification.attach(contractAddress);
  
  // Registered product ID to verify
  const productId = "DIST-DUC3S8E9";
  
  console.log("Verifying registered product with ID:", productId);
  
  // Call the verify function directly
  const result = await productVerification.verifyProduct(productId);
  
  console.log("Verification result:", result);
  console.log("Is authentic:", result[0]);
  console.log("Serial number:", result[1]);
  console.log("Serial number type:", typeof result[1]);
  console.log("Serial number length:", result[1] ? result[1].length : 0);
  
  // Test with the verifyProductAndEmit function
  console.log("\nTesting verifyProductAndEmit function...");
  const emitResult = await productVerification.verifyProductAndEmit(productId);
  console.log("Emit verification result transaction hash:", emitResult.hash);
  
  // Get the product details
  console.log("\nGetting product details...");
  const productDetails = await productVerification.getProductDetails(result[1]);
  console.log("Product details:", productDetails);
  console.log("Product name:", productDetails[0]);
  console.log("Manufacturer:", productDetails[1]);
  
  // Handle BigInt values properly
  const manufactureDate = Number(productDetails[2]);
  console.log("Manufacture date:", new Date(manufactureDate * 1000).toLocaleDateString());
  console.log("Current ID:", productDetails[3]);
  console.log("Current stage:", Number(productDetails[4]));
  
  // Get product ID history
  console.log("\nGetting product ID history...");
  const idHistory = await productVerification.getProductIdHistory(result[1]);
  console.log("ID history:", idHistory);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});