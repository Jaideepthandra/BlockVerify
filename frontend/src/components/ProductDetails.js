import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const ProductDetails = ({ contract }) => {
  const { serialNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productDetails, setProductDetails] = useState(null);
  const [idHistory, setIdHistory] = useState([]);
  const [debugInfo, setDebugInfo] = useState({});
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5; // Increased from 3 to 5

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!contract || !serialNumber) return;
      
      if (retryCount === 0) {
        setLoading(true);
        setError('');
      }
      
      try {
        console.log(`Fetching product details for serial number: ${serialNumber} (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
        console.log('Contract address:', contract.address);
        
        // Add a small delay before the first attempt to allow blockchain state to update
        if (retryCount === 0) {
          console.log('Adding initial delay of 2 seconds before first attempt');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Check if the product exists using a direct call to the contract
        try {
          // First check if the product is registered by checking the isRegistered property
          console.log('Checking if product exists with serial number:', serialNumber);
          
          // Get product details
          console.log('Calling getProductDetails with serialNumber:', serialNumber);
          const details = await contract.getProductDetails(serialNumber);
          console.log('Raw product details received:', details);
          
          if (details && details.length > 0 && details[0] !== '') {
            setProductDetails({
              productName: details[0],
              manufacturer: details[1],
              manufactureDate: new Date(details[2].toNumber() * 1000),
              currentId: details[3],
              currentStage: details[4].toNumber()
            });
            
            console.log('Processed product details:', {
              productName: details[0],
              manufacturer: details[1],
              manufactureDate: new Date(details[2].toNumber() * 1000),
              currentId: details[3],
              currentStage: details[4].toNumber()
            });
            
            // Get ID history
            console.log('Calling getProductIdHistory with serialNumber:', serialNumber);
            const history = await contract.getProductIdHistory(serialNumber);
            console.log('ID history received:', history);
            setIdHistory(history);
            
            // Clear any previous errors since we succeeded
            setError('');
          } else {
            throw new Error('Product details are empty or invalid');
          }
        } catch (detailsError) {
          console.error('Error in inner try block:', detailsError);
          throw detailsError; // Re-throw to be caught by outer catch
        }
        
      } catch (error) {
        console.error(`Error fetching product details (Attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error);
        
        // If we haven't reached max retries, schedule another attempt
        if (retryCount < MAX_RETRIES) {
          const retryDelay = 3000 * (retryCount + 1); // Increasing delay with each retry
          console.log(`Scheduling retry in ${retryDelay/1000} seconds... (${retryCount + 1}/${MAX_RETRIES})`);
          setTimeout(() => {
            setRetryCount(prevCount => prevCount + 1);
          }, retryDelay);
        } else {
          // Max retries reached, show error
          setDebugInfo({
            errorMessage: error.message,
            errorCode: error.code,
            errorData: error.data,
            serialNumber: serialNumber,
            contractExists: !!contract,
            retryAttempts: retryCount + 1
          });
          setError('Failed to fetch product details. The product may not exist or blockchain state is still updating.');
        }
      } finally {
        if (retryCount >= MAX_RETRIES || !error) {
          setLoading(false);
        }
      }
    };
    
    fetchProductDetails();
  }, [contract, serialNumber, retryCount]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info">
          <h4>Loading Product Details</h4>
          <p>Attempt {retryCount + 1} of {MAX_RETRIES + 1}</p>
          <p>Please wait while we fetch the product information from the blockchain...</p>
          <div className="progress">
            <div 
              className="progress-bar progress-bar-striped progress-bar-animated" 
              role="progressbar" 
              style={{ width: `${(retryCount / MAX_RETRIES) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <hr />
          <div className="mb-0">
            <Link to="/verify" className="btn btn-outline-danger">Verify Another Product</Link>
          </div>
          {Object.keys(debugInfo).length > 0 && (
            <div className="mt-3 p-3 bg-light">
              <h5>Debug Information:</h5>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!productDetails) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Product Not Found</h4>
          <p>No product found with serial number: {serialNumber}</p>
          <hr />
          <div className="mb-0">
            <Link to="/verify" className="btn btn-outline-warning">Verify Another Product</Link>
          </div>
        </div>
      </div>
    );
  }

  // Get stage names for display
  const getStageNameFromIndex = (index) => {
    const stages = ['Manufacturer', 'Distributor', 'Retailer'];
    return stages[index] || 'Unknown';
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-12 mb-4">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/">Home</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Product Details</li>
            </ol>
          </nav>
        </div>
        
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Product Information</h4>
            </div>
            <div className="card-body">
              <h2 className="card-title">{productDetails.productName}</h2>
              <p className="card-text"><strong>Serial Number:</strong> {serialNumber}</p>
              <p className="card-text"><strong>Manufacturer:</strong> {productDetails.manufacturer}</p>
              <p className="card-text"><strong>Manufacture Date:</strong> {productDetails.manufactureDate.toLocaleDateString()}</p>
              <p className="card-text"><strong>Current ID:</strong> {productDetails.currentId}</p>
              <p className="card-text"><strong>Current Stage:</strong> {getStageNameFromIndex(productDetails.currentStage)}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header bg-info text-white">
              <h4 className="mb-0">ID History</h4>
            </div>
            <div className="card-body">
              {idHistory.length > 0 ? (
                <ul className="list-group">
                  {idHistory.map((id, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      {id}
                      {index === 0 && <span className="badge bg-primary rounded-pill">Initial</span>}
                      {index === idHistory.length - 1 && index !== 0 && <span className="badge bg-success rounded-pill">Current</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No ID history available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;