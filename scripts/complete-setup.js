// Complete setup script for blockchain fake product detection
// This script handles deployment, registration, and verification in one go
const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting Complete Blockchain Setup...\n");
  
  try {
    // Get signers
    const [signer] = await hre.ethers.getSigners();
    console.log(`📍 Using account: ${signer.address}\n`);
    
    // Deploy contract
    console.log("📦 Deploying ProductVerification contract...");
    const ProductVerification = await hre.ethers.getContractFactory("ProductVerification");
    const productVerification = await ProductVerification.deploy();
    await productVerification.waitForDeployment();
    
    const contractAddress = await productVerification.getAddress();
    console.log(`✅ Contract deployed to: ${contractAddress}\n`);
    
    // Register test products
    console.log("📝 Registering test products...");
    
    const testProducts = [
      {
        serialNumber: "TEST123",
        initialId: "DIST-DUC3S8E9",
        productName: "Test Product",
        manufacturer: "Test Manufacturer"
      },
      {
        serialNumber: "PHONE001",
        initialId: "RETAIL-ABC123",
        productName: "iPhone 15 Pro",
        manufacturer: "Apple Inc."
      },
      {
        serialNumber: "LAPTOP001",
        initialId: "WHOLESALE-DEF456",
        productName: "MacBook Pro M3",
        manufacturer: "Apple Inc."
      }
    ];
    
    for (const product of testProducts) {
      const tx = await productVerification.registerProduct(
        product.serialNumber,
        product.initialId,
        product.productName,
        product.manufacturer
      );
      await tx.wait();
      console.log(`   ✅ Registered: ${product.productName} (${product.serialNumber})`);
    }
    
    console.log("\n🔍 Testing verification...");
    
    // Test verification
    for (const product of testProducts) {
      try {
        const verifyResult = await productVerification.verifyProduct(product.initialId);
        console.log(`   ✅ ${product.productName}: ${verifyResult[0] ? 'Authentic' : 'Fake'}`);
      } catch (error) {
        console.log(`   ❌ Error verifying ${product.productName}: ${error.message}`);
      }
    }
    
    console.log("\n📋 Testing product details...");
    
    // Test getting product details
    for (const product of testProducts) {
      try {
        const details = await productVerification.getProductDetails(product.serialNumber);
        console.log(`   ✅ ${product.serialNumber}: ${details[0]} by ${details[1]}`);
      } catch (error) {
        console.log(`   ❌ Error getting details for ${product.serialNumber}: ${error.message}`);
      }
    }
    
    console.log("\n🎉 Setup Complete!");
    console.log("=".repeat(50));
    console.log(`📋 Contract Address: ${contractAddress}`);
    console.log(`🔗 Network: Hardhat Local (localhost:8545)`);
    console.log("\n📚 Available Test Products:");
    testProducts.forEach(product => {
      console.log(`   • ${product.productName} (${product.serialNumber}) - ID: ${product.initialId}`);
    });
    console.log("\n💡 Next Steps:");
    console.log("   1. Update all scripts with the contract address above");
    console.log("   2. Start the Hardhat node: npx hardhat node");
    console.log("   3. Run frontend: cd frontend && npm start");
    console.log("   4. Use the test products for verification");
    
  } catch (error) {
    console.error("❌ Error during setup:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});