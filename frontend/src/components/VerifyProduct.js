import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const VerifyProduct = ({ contract }) => {
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [productDetails, setProductDetails] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVerificationResult(null);
    setProductDetails(null);
    
    try {
      // Validate input
      if (!productId) {
        throw new Error('Product ID is required');
      }
      
      console.log('Verifying product with ID:', productId);
      console.log('Contract address:', contract.address);
      
      // Call the smart contract function to verify the product and emit event
      // Use verifyProductAndEmit to emit the event for tracking purposes
      console.log('Calling verifyProductAndEmit with ID:', productId);
      console.log('Contract address being used:', contract.address);
      
      // First check if the contract is properly initialized
      if (!contract || !contract.verifyProductAndEmit) {
        throw new Error('Contract not properly initialized');
      }
      
      // Use verifyProduct first to get the return values
      const verifyResult = await contract.verifyProduct(productId);
      console.log('Verify result:', verifyResult);
      
      // Parse the result
      const isAuthentic = verifyResult[0];
      const serialNumber = verifyResult[1];
      
      console.log('Is authentic (parsed):', isAuthentic);
      console.log('Serial number (parsed):', serialNumber);
      console.log('Serial number type:', typeof serialNumber);
      console.log('Serial number length:', serialNumber ? serialNumber.length : 0);
      
      // Then call verifyProductAndEmit to emit the event (but don't try to get return values)
      await contract.verifyProductAndEmit(productId);
      
      // Check if the serial number is empty (product not found)
      if (!serialNumber || serialNumber === '' || serialNumber === '0x' || serialNumber === '0x0') {
        console.log('Product not found in blockchain records');
        console.log('Empty serial number detected:', serialNumber);
        setVerificationResult({
          isAuthentic: false,
          serialNumber: ''
        });
        setLoading(false);
        return;
      }
      
      setVerificationResult({
        isAuthentic,
        serialNumber
      });
      
      // If a serial number was found, get additional product details
      if (serialNumber && serialNumber !== '') {
        try {
          console.log('Fetching product details for serial number:', serialNumber);
          const details = await contract.getProductDetails(serialNumber);
          console.log('Product details received:', details);
          
          // Handle different types of timestamp data
          let manufactureDate;
          try {
            // Try to convert using toNumber() if it's a BigNumber
            manufactureDate = new Date(details[2].toNumber() * 1000).toLocaleDateString();
          } catch (e) {
            // If toNumber() fails, try to use it directly as a number
            manufactureDate = new Date(Number(details[2]) * 1000).toLocaleDateString();
          }
          
          // Handle different types of stage data
          let currentStage;
          try {
            // Try to convert using toNumber() if it's a BigNumber
            currentStage = details[4].toNumber();
          } catch (e) {
            // If toNumber() fails, try to use it directly as a number
            currentStage = Number(details[4]);
          }
          
          const productDetails = {
            productName: details[0],
            manufacturer: details[1],
            manufactureDate: manufactureDate,
            currentId: details[3],
            currentStage: currentStage
          };
          
          console.log('Processed product details:', productDetails);
          setProductDetails(productDetails);
          
          // Double check if the provided ID matches the current ID
          console.log('Comparing provided ID:', productId, 'with current ID:', details[3]);
          if (productId !== details[3]) {
            console.log('ID mismatch: Product exists but ID is not current');
            setVerificationResult({
              isAuthentic: false,
              serialNumber: serialNumber
            });
          }
        } catch (detailsError) {
          console.error('Error fetching product details:', detailsError);
        }
      }
      
    } catch (error) {
      console.error('Error verifying product:', error);
      // Check if it's a blockchain error
      if (error.code && error.code.toString().includes('32603')) {
        setError(`Blockchain error: The product ID may not exist or the contract address may be incorrect. Please check your input and try again.`);
      } else if (error.message && error.message.includes('call revert exception')) {
        setError(`Contract error: The product verification failed. This may be due to an invalid product ID.`);
      } else {
        setError(`Failed to verify product: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="glass-card">
        <div className="page-header">
          <h1 className="page-title">Verify Product</h1>
          <p className="page-subtitle">Check product authenticity and view supply chain details</p>
        </div>
        
        <div className="page-content">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="productId" className="form-label">Product ID</label>
              <input
                type="text"
                className="form-input"
                id="productId"
                value={productId}
                onChange={(e) => setProductId(e.target.value.trim())}
                placeholder="Enter product ID to verify"
                pattern="[A-Za-z0-9-]+"
                title="Product ID should only contain letters, numbers, and hyphens"
                required
                disabled={loading}
              />
              <small className="text-muted">Enter the ID provided with the product (e.g., DIST-ABC123)</small>
            </div>
            
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Verifying...
                </>
              ) : 'Verify Product'}
            </button>
          </form>
            
            {verificationResult && (
              <div className="details-card">
                <div className={`status-badge ${verificationResult.isAuthentic ? 'status-success' : 'status-danger'}`}>
                  <h5 className="status-title">
                    {verificationResult.isAuthentic ? 'Authentic Product' : 'Fake or Compromised Product'}
                  </h5>
                  
                  {verificationResult.isAuthentic ? (
                    <p className="status-text">
                      This product is authentic. The ID you provided matches the latest ID recorded on the blockchain.
                    </p>
                  ) : (
                    <p className="status-text">
                      {verificationResult.serialNumber ? (
                        'This product ID is outdated or has been compromised. It does not match the latest ID recorded on the blockchain.'
                      ) : (
                        'This product ID was not found in our records. It may be counterfeit or incorrectly entered. Please double-check the ID and try again.'
                      )}
                    </p>
                  )}
                </div>
                
                {productDetails && (
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Product Name:</span>
                      <span className="detail-value">{productDetails.productName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Manufacturer:</span>
                      <span className="detail-value">{productDetails.manufacturer}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Manufacture Date:</span>
                      <span className="detail-value">{productDetails.manufactureDate}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Current Stage:</span>
                      <span className={`stage-badge stage-${productDetails.currentStage}`}>
                        {productDetails.currentStage === 0 ? 'Manufacturer' : 
                         productDetails.currentStage === 1 ? 'Distributor' : 'Retailer'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Latest ID:</span>
                      <span className="detail-value">{productDetails.currentId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Provided ID:</span>
                      <span className="detail-value">{productId}</span>
                    </div>
                    
                    {!verificationResult.isAuthentic && productDetails.currentId !== productId && (
                      <div className="warning-message">
                        <strong>Warning:</strong> The ID you provided ({productId}) does not match the latest ID ({productDetails.currentId}).
                        This suggests the product may have been compromised or the ID was leaked from an earlier stage in the supply chain.
                      </div>
                    )}
                    
                    <div className="action-buttons">
                      <Link to={`/product/${verificationResult.serialNumber}`} className="btn btn-outline-primary">
                        View Complete Product History
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default VerifyProduct;