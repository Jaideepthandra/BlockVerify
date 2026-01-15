// Script to verify contract deployment and test functionality
const hre = require("hardhat");

async function main() {
  const provider = hre.ethers.provider;
  const [signer] = await hre.ethers.getSigners();
  
  console.log("=== Verifying Contract Deployment ===");
  
  try {
    // Deploy the contract
    const ProductVerification = await hre.ethers.getContractFactory("ProductVerification");
    console.log("Deploying contract...");
    
    const productVerification = await ProductVerification.deploy();
    await productVerification.waitForDeployment();
    
    const contractAddress = await productVerification.getAddress();
    console.log("Contract deployed to:", contractAddress);
    
    // Check the deployment transaction
    const deployTx = productVerification.deploymentTransaction();
    console.log("Deployment transaction:", deployTx.hash);
    
    const receipt = await deployTx.wait();
    console.log("Deployment receipt:", {
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      contractAddress: receipt.contractAddress,
      status: receipt.status
    });
    
    // Verify contract code exists
    const code = await provider.getCode(contractAddress);
    console.log("Contract code length:", code.length);
    console.log("Contract deployed successfully:", code !== "0x");
    
    if (code === "0x") {
      console.log("❌ Contract deployment failed - no code at address");
      return;
    }
    
    // Test basic functionality
    console.log("\n=== Testing Contract Functions ===");
    
    // Register a product
    console.log("Registering product...");
    const registerTx = await productVerification.registerProduct(
      "TEST123",
      "DIST-DUC3S8E9",
      "Test Product",
      "Test Manufacturer"
    );
    
    const registerReceipt = await registerTx.wait();
    console.log("Registration successful, block:", registerReceipt.blockNumber);
    
    // Test verifyProduct
    console.log("Testing verifyProduct...");
    try {
      const verifyResult = await productVerification.verifyProduct("DIST-DUC3S8E9");
      console.log("✅ verifyProduct result:", {
        isAuthentic: verifyResult[0],
        serialNumber: verifyResult[1]
      });
    } catch (error) {
      console.log("❌ verifyProduct error:", error.message);
    }
    
    // Test getProductDetails
    console.log("Testing getProductDetails...");
    try {
      const details = await productVerification.getProductDetails("TEST123");
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
    
    // Update all scripts with the correct address
    console.log("\n=== Updating Scripts with New Address ===");
    console.log("New contract address:", contractAddress);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});