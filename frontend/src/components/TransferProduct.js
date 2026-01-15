import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UnifiedPages.css';

const TransferProduct = ({ contract, account }) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [productDetails, setProductDetails] = useState(null);
  
  const navigate = useNavigate();

  const verifyProduct = async () => {
    if (!serialNumber) {
      setError('Please enter a serial number');
      return;
    }
    
    setVerifying(true);
    setError('');
    setProductDetails(null);
    
    try {
      // Call the smart contract to get product details
      const details = await contract.getProductDetails(serialNumber);
      
      setProductDetails({
        productName: details[0],
        manufacturer: details[1],
        manufactureDate: new Date(details[2].toNumber() * 1000).toLocaleDateString(),
        currentId: details[3],
        currentStage: details[4].toNumber()
      });
      
      // Check if product is already at retail stage
      if (details[4].toNumber() >= 2) {
        setError('This product is already at the retail stage and cannot be transferred further.');
      }
      
    } catch (error) {
      console.error('Error verifying product:', error);
      setError('Product not found or error retrieving details.');
    } finally {
      setVerifying(false);
    }
  };

  // Function to generate unique ID based on stage
  const generateTransferId = (currentStage) => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substr(2, 9);
    const prefix = currentStage === 0 ? 'DIST' : 'RET';
    return `${prefix}-${timestamp}-${randomPart}`.toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate inputs
      if (!serialNumber) {
        throw new Error('Serial number is required');
      }
      
      if (!productDetails) {
        throw new Error('Please verify the product first');
      }
      
      // Generate unique ID automatically based on current stage
      const newId = generateTransferId(productDetails.currentStage);
      
      // Call the smart contract function
      setSuccess(`Generating new ID (${newId}) and submitting transaction...`);
      const tx = await contract.transferProduct(serialNumber, newId);
      
      // Wait for the transaction to be mined
      await tx.wait();
      
      setSuccess(`Product transferred successfully! New ID: ${newId}`);
      
      // Reset form and product details
      setProductDetails(null);
      
      // Navigate to product details page after a short delay
      setTimeout(() => {
        navigate(`/product/${serialNumber}`);
      }, 3000);
      
    } catch (error) {
      console.error('Error transferring product:', error);
      setError(error.message || 'Failed to transfer product. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="page-container">
      <div className="glass-card">
        <div className="page-header">
          <h1 className="page-title">Transfer Product</h1>
          <p className="page-subtitle">Transfer product ownership to the next stage in the supply chain</p>
        </div>
        
        <div className="page-content">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <div className="form-group">
            <label htmlFor="serialNumber" className="form-label">Product Serial Number</label>
            <div className="input-group">
              <input
                type="text"
                className="form-input"
                id="serialNumber"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Enter product serial number"
                disabled={verifying || loading}
              />
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={verifyProduct}
                disabled={verifying || loading}
              >
                {verifying ? (
                  <>
                    <span className="spinner"></span>
                    Verifying...
                  </>
                ) : 'Verify'}
              </button>
            </div>
            <p className="helper-text">First verify the product to see its current details</p>
          </div>
          
          {productDetails && (
            <div className="details-card">
              <h3 className="details-title">{productDetails.productName}</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Manufacturer:</span>
                  <span className="detail-value">{productDetails.manufacturer}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Manufacture Date:</span>
                  <span className="detail-value">{productDetails.manufactureDate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Current ID:</span>
                  <span className="detail-value">{productDetails.currentId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Current Stage:</span>
                  <span className={`stage-badge stage-${productDetails.currentStage}`}>
                    {productDetails.currentStage === 0 ? 'Manufacturer' : 
                     productDetails.currentStage === 1 ? 'Distributor' : 'Retailer'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Next Stage:</span>
                  <span className={`stage-badge stage-${productDetails.currentStage + 1}`}>
                    {productDetails.currentStage === 0 ? 'Distributor' : 'Retailer'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {productDetails && productDetails.currentStage < 2 && (
            <form onSubmit={handleSubmit}>
              <div className="info-card">
                <h4>Transfer Details</h4>
                <p>When you transfer this product, a new unique ID will be automatically generated for the next stage.</p>
                <div className="transfer-info">
                  <div className="info-item">
                    <span className="info-label">Current Stage:</span>
                    <span className={`stage-badge stage-${productDetails.currentStage}`}>
                      {productDetails.currentStage === 0 ? 'Manufacturer' : 'Distributor'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Next Stage:</span>
                    <span className={`stage-badge stage-${productDetails.currentStage + 1}`}>
                      {productDetails.currentStage === 0 ? 'Distributor' : 'Retailer'}
                    </span>
                  </div>
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary btn-full" disabled={loading || !productDetails}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Transferring...
                  </>
                ) : 'Transfer Product'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferProduct;