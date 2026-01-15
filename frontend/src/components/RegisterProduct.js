import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UnifiedPages.css';

const RegisterProduct = ({ contract, account }) => {
  const navigate = useNavigate();
  const [serialNumber, setSerialNumber] = useState('');
  const [productName, setProductName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Function to generate unique ID
  const generateUniqueId = () => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substr(2, 9);
    return `PROD-${timestamp}-${randomPart}`.toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!serialNumber || !productName || !manufacturer) {
      setError('All fields are required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      
      // Generate unique ID automatically
      const initialId = generateUniqueId();
      
      console.log('Registering product with contract:', contract.address);
      console.log('Product details:', { serialNumber, initialId, productName, manufacturer });
      
      // Store the serial number before resetting the form
      const registeredSerialNumber = serialNumber;
      
      // Register the product
      setSuccess('Generating unique ID and submitting transaction...');
      const tx = await contract.registerProduct(serialNumber, initialId, productName, manufacturer);
      console.log('Transaction sent:', tx.hash);
      
      // Wait for the transaction to be mined
      setSuccess('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Reset the form
      setSerialNumber('');
      setProductName('');
      setManufacturer('');
      
      setSuccess(`Product registered successfully! Generated ID: ${initialId}. Redirecting to product details...`);
      
      // Wait for blockchain state to update before navigating
      let waitTime = 15;
      const updateInterval = setInterval(() => {
        waitTime--;
        setSuccess(`Product registered successfully! ID: ${initialId}. Redirecting in ${waitTime} seconds...`);
        
        if (waitTime <= 0) {
          clearInterval(updateInterval);
          navigate(`/product/${registeredSerialNumber}`);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error registering product:', error);
      setError(`Failed to register product: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="glass-card">
        <div className="page-header">
          <h1 className="page-title">Register New Product</h1>
          <p className="page-subtitle">Add your product to the blockchain for authentication</p>
        </div>
        
        <div className="page-content">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="serialNumber" className="form-label">Serial Number</label>
              <input
                type="text"
                className="form-input"
                id="serialNumber"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                disabled={isSubmitting}
                placeholder="Enter product serial number"
                required
              />
            </div>
            

            
            <div className="form-group">
              <label htmlFor="productName" className="form-label">Product Name</label>
              <input
                type="text"
                className="form-input"
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={isSubmitting}
                placeholder="Enter product name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="manufacturer" className="form-label">Manufacturer</label>
              <input
                type="text"
                className="form-input"
                id="manufacturer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                disabled={isSubmitting}
                placeholder="Enter manufacturer name"
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Registering...
                </>
              ) : 'Register Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterProduct;