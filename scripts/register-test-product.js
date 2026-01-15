// Script to register a test product for verification
const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const ProductVerification = await hre.ethers.getContractFactory("ProductVerification");
  
  // Get the deployed contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Connect to the deployed contract
  const productVerification = ProductVerification.attach(contractAddress);
  
  // Test product details
  const serialNumber = "TEST123";
  const initialId = "DIST-DUC3S8E9"; // This is the ID we'll verify
  const productName = "Test Product";
  const manufacturer = "Test Manufacturer";
  
  console.log("Registering test product...");
  
  // Register the product
  const tx = await productVerification.registerProduct(
    serialNumber,
    initialId,
    productName,
    manufacturer
  );
  
  // Wait for the transaction to be mined
  await tx.wait();
  
  console.log(`Product registered successfully!`);
  console.log(`Serial Number: ${serialNumber}`);
  console.log(`Initial ID: ${initialId}`);
  console.log(`Product Name: ${productName}`);
  console.log(`Manufacturer: ${manufacturer}`);
  console.log("\nYou can now verify this product using the ID: " + initialId);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});