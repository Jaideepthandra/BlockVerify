// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ProductVerification {
    // Struct to store product information
    struct Product {
        string productName;
        string manufacturer;
        address manufacturerAddress;
        uint256 manufactureDate;
        string[] idHistory; // Array to store all previous IDs
        uint256 currentStage; // 0: Manufacturer, 1: Distributor, 2: Retailer
        bool isRegistered;
    }

    // Mapping from product serial number to Product struct
    mapping(string => Product) private products;
    
    // Mapping from product ID to serial number
    mapping(string => string) private idToSerial;
    
    // Events
    event ProductRegistered(string serialNumber, string initialId, string productName, string manufacturer);
    event ProductTransferred(string serialNumber, string oldId, string newId, uint256 newStage);
    event ProductVerified(string id, bool isAuthentic, string serialNumber);
    
    // Modifiers
    modifier onlyManufacturer(string memory serialNumber) {
        require(
            products[serialNumber].manufacturerAddress == msg.sender,
            "Only the manufacturer can perform this action"
        );
        _;
    }
    
    modifier productExists(string memory serialNumber) {
        require(products[serialNumber].isRegistered, "Product does not exist");
        _;
    }
    
    // Register a new product (only manufacturers)
    function registerProduct(
        string memory serialNumber,
        string memory initialId,
        string memory productName,
        string memory manufacturer
    ) public {
        // Ensure product doesn't already exist
        require(!products[serialNumber].isRegistered, "Product already registered");
        
        // Create a new product
        products[serialNumber].productName = productName;
        products[serialNumber].manufacturer = manufacturer;
        products[serialNumber].manufacturerAddress = msg.sender;
        products[serialNumber].manufactureDate = block.timestamp;
        products[serialNumber].currentStage = 0; // Start at manufacturer stage
        products[serialNumber].isRegistered = true;
        
        // Add the initial ID to history
        products[serialNumber].idHistory.push(initialId);
        
        // Map the ID to the serial number for verification
        idToSerial[initialId] = serialNumber;
        
        emit ProductRegistered(serialNumber, initialId, productName, manufacturer);
    }
    
    // Transfer product to next stage in supply chain
    function transferProduct(
        string memory serialNumber,
        string memory newId
    ) public productExists(serialNumber) {
        Product storage product = products[serialNumber];
        
        // Ensure the new stage is valid (can't go beyond retailer)
        require(product.currentStage < 2, "Product already at retail stage");
        
        // Get the current ID
        string memory currentId = product.idHistory[product.idHistory.length - 1];
        
        // Add the new ID to history
        product.idHistory.push(newId);
        
        // Update the stage
        product.currentStage += 1;
        
        // Map the new ID to the serial number
        idToSerial[newId] = serialNumber;
        
        emit ProductTransferred(serialNumber, currentId, newId, product.currentStage);
    }
    
    // Verify a product using its ID
    function verifyProduct(string memory id) public view returns (bool isAuthentic, string memory serialNumber) {
        serialNumber = idToSerial[id];
        
        // Check if the ID exists
        if (bytes(serialNumber).length == 0) {
            return (false, "");
        }
        
        Product storage product = products[serialNumber];
        
        // Get the latest ID
        string memory latestId = product.idHistory[product.idHistory.length - 1];
        
        // Check if the provided ID is the latest
        isAuthentic = keccak256(abi.encodePacked(id)) == keccak256(abi.encodePacked(latestId));
        
        return (isAuthentic, serialNumber);
    }
    
    // Verify a product and emit event (for frontend tracking)
    function verifyProductAndEmit(string memory id) public returns (bool isAuthentic, string memory serialNumber) {
        (isAuthentic, serialNumber) = verifyProduct(id);
        emit ProductVerified(id, isAuthentic, serialNumber);
        return (isAuthentic, serialNumber);
    }
    
    // Get product details
    function getProductDetails(string memory serialNumber) 
        public 
        view 
        productExists(serialNumber) 
        returns (
            string memory productName,
            string memory manufacturer,
            uint256 manufactureDate,
            string memory currentId,
            uint256 currentStage
        ) 
    {
        Product storage product = products[serialNumber];
        return (
            product.productName,
            product.manufacturer,
            product.manufactureDate,
            product.idHistory[product.idHistory.length - 1],
            product.currentStage
        );
    }
    
    // Get product ID history
    function getProductIdHistory(string memory serialNumber) 
        public 
        view 
        productExists(serialNumber) 
        returns (string[] memory) 
    {
        return products[serialNumber].idHistory;
    }
}