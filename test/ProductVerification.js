const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProductVerification", function () {
  let productVerification;
  let owner;
  let distributor;
  let retailer;
  let consumer;

  // Sample product data
  const serialNumber = "SN12345678";
  const initialId = "MFR-ID-12345";
  const productName = "Premium Headphones";
  const manufacturer = "AudioTech Inc.";
  
  // New IDs for supply chain stages
  const distributorId = "DIST-ID-98765";
  const retailerId = "RET-ID-54321";

  beforeEach(async function () {
    // Get signers
    [owner, distributor, retailer, consumer] = await ethers.getSigners();
    
    // Deploy the contract
    const ProductVerification = await ethers.getContractFactory("ProductVerification");
    productVerification = await ProductVerification.deploy();
  });

  describe("Product Registration", function () {
    it("Should register a new product", async function () {
      await expect(productVerification.registerProduct(
        serialNumber,
        initialId,
        productName,
        manufacturer
      ))
        .to.emit(productVerification, "ProductRegistered")
        .withArgs(serialNumber, initialId, productName, manufacturer);

      // Verify product details
      const details = await productVerification.getProductDetails(serialNumber);
      expect(details[0]).to.equal(productName);
      expect(details[1]).to.equal(manufacturer);
      expect(details[3]).to.equal(initialId);
      expect(details[4]).to.equal(0); // Stage 0: Manufacturer
    });

    it("Should not allow registering the same product twice", async function () {
      // Register once
      await productVerification.registerProduct(
        serialNumber,
        initialId,
        productName,
        manufacturer
      );

      // Try to register again
      await expect(
        productVerification.registerProduct(
          serialNumber,
          "different-id",
          productName,
          manufacturer
        )
      ).to.be.revertedWith("Product already registered");
    });
  });

  describe("Product Transfer", function () {
    beforeEach(async function () {
      // Register a product first
      await productVerification.registerProduct(
        serialNumber,
        initialId,
        productName,
        manufacturer
      );
    });

    it("Should transfer product to distributor", async function () {
      await expect(productVerification.transferProduct(serialNumber, distributorId))
        .to.emit(productVerification, "ProductTransferred")
        .withArgs(serialNumber, initialId, distributorId, 1); // Stage 1: Distributor

      // Verify updated details
      const details = await productVerification.getProductDetails(serialNumber);
      expect(details[3]).to.equal(distributorId);
      expect(details[4]).to.equal(1); // Stage 1: Distributor
    });

    it("Should transfer product to retailer", async function () {
      // First to distributor
      await productVerification.transferProduct(serialNumber, distributorId);
      
      // Then to retailer
      await expect(productVerification.transferProduct(serialNumber, retailerId))
        .to.emit(productVerification, "ProductTransferred")
        .withArgs(serialNumber, distributorId, retailerId, 2); // Stage 2: Retailer

      // Verify updated details
      const details = await productVerification.getProductDetails(serialNumber);
      expect(details[3]).to.equal(retailerId);
      expect(details[4]).to.equal(2); // Stage 2: Retailer
    });

    it("Should not allow transfer beyond retailer stage", async function () {
      // To distributor
      await productVerification.transferProduct(serialNumber, distributorId);
      
      // To retailer
      await productVerification.transferProduct(serialNumber, retailerId);
      
      // Try to transfer again
      await expect(
        productVerification.transferProduct(serialNumber, "CONSUMER-ID-11111")
      ).to.be.revertedWith("Product already at retail stage");
    });
  });

  describe("Product Verification", function () {
    beforeEach(async function () {
      // Register a product
      await productVerification.registerProduct(
        serialNumber,
        initialId,
        productName,
        manufacturer
      );
      
      // Transfer to distributor
      await productVerification.transferProduct(serialNumber, distributorId);
      
      // Transfer to retailer
      await productVerification.transferProduct(serialNumber, retailerId);
    });

    it("Should verify authentic product with latest ID", async function () {
      const result = await productVerification.verifyProduct(retailerId);
      expect(result[0]).to.be.true; // isAuthentic
      expect(result[1]).to.equal(serialNumber);
    });

    it("Should identify fake product with old ID", async function () {
      // Try to verify with manufacturer ID (now outdated)
      const result = await productVerification.verifyProduct(initialId);
      expect(result[0]).to.be.false; // Not authentic
      expect(result[1]).to.equal(serialNumber);
    });

    it("Should identify fake product with non-existent ID", async function () {
      const result = await productVerification.verifyProduct("FAKE-ID-99999");
      expect(result[0]).to.be.false; // Not authentic
      expect(result[1]).to.equal(""); // No serial number found
    });
  });

  describe("Product History", function () {
    it("Should track complete ID history", async function () {
      // Register a product
      await productVerification.registerProduct(
        serialNumber,
        initialId,
        productName,
        manufacturer
      );
      
      // Transfer to distributor
      await productVerification.transferProduct(serialNumber, distributorId);
      
      // Transfer to retailer
      await productVerification.transferProduct(serialNumber, retailerId);

      // Get ID history
      const history = await productVerification.getProductIdHistory(serialNumber);
      
      // Verify history
      expect(history.length).to.equal(3);
      expect(history[0]).to.equal(initialId);
      expect(history[1]).to.equal(distributorId);
      expect(history[2]).to.equal(retailerId);
    });
  });
});