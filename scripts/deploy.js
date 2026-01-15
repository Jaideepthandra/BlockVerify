// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const ProductVerification = await hre.ethers.getContractFactory("ProductVerification");
  
  // Deploy the contract
  const productVerification = await ProductVerification.deploy();
  
  // Wait for the contract to be deployed
  await productVerification.waitForDeployment();
  
  // Get the contract address
  const address = await productVerification.getAddress();
  
  console.log(`ProductVerification contract deployed to: ${address}`);

  // Persist the address for the frontend
  try {
    const fs = require("fs");
    const path = require("path");
    const outPath = path.join(__dirname, "..", "frontend", "src", "contracts", "contract-address.json");
    const payload = { address };
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
    console.log(`Contract address written to: ${outPath}`);
  } catch (err) {
    console.warn("Warning: failed to write contract address for frontend:", err);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
