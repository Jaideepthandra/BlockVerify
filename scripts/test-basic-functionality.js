// Script to test basic contract functionality step by step
const hre = require("hardhat");

async function main() {
  const provider = hre.ethers.provider;
  const [signer] = await hre.ethers.getSigners();
  
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  console.log("=== Testing Basic Contract Functionality ===");
  console.log("Contract address:", contractAddress);
  console.log("Signer address:", signer.address);
  console.log("Network:", await provider.getNetwork());
  
  try {
    // Get the contract
    const ProductVerification = await hre.ethers.getContractFactory("ProductVerification");
    const productVerification = ProductVerification.attach(contractAddress);
    
    console.log("\n1. Testing contract attachment...");
    console.log("✅ Contract attached successfully");
    
    console.log("\n2. Testing registerProduct...");
    const serialNumber = "TEST123";
    const initialId = "DIST-DUC3S8E9";
    const productName = "Test Product";
    const manufacturer = "Test Manufacturer";
    
    // Register the product
    const tx = await productVerification.registerProduct(
      serialNumber,
      initialId,
      productName,
      manufacturer
    );
    
    console.log("Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Product registered, block:", receipt.blockNumber);
    
    console.log("\n3. Testing verifyProduct...");
    try {
      const result = await productVerification.verifyProduct(initialId);
      console.log("✅ verifyProduct result:", {
        isAuthentic: result[0],
        serialNumber: result[1]
      });
    } catch (error) {
      console.log("❌ verifyProduct error:", error.message);
    }
    
    console.log("\n4. Testing getProductDetails...");
    try {
      const details = await productVerification.getProductDetails(serialNumber);
      console.log("✅ getProductDetails result:", {
        productName: details[0],
        manufacturer: details[1],
        manufactureDate: details[2].toString(),
        currentId: details[3],
        currentStage: details[4].toString()
      });
    } catch (error) {
      console.log("❌ getProductDetails error:", error.message);
    }
    
    console.log("\n5. Testing getProductIdHistory...");
    try {
      const history = await productVerification.getProductIdHistory(serialNumber);
      console.log("✅ getProductIdHistory result:", history);
    } catch (error) {
      console.log("❌ getProductIdHistory error:", error.message);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});