import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import { ethers } from 'ethers';
import ProductVerificationABI from './contracts/ProductVerification.json';
import ContractAddress from './contracts/contract-address.json';
import Home from './components/Home';
import RegisterProduct from './components/RegisterProduct';
import TransferProduct from './components/TransferProduct';
import VerifyProduct from './components/VerifyProduct';
import ProductDetails from './components/ProductDetails';
import './styles/design-system.css';
import './App.css';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Function to truncate ethereum address
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Check if MetaMask is installed
        if (window.ethereum) {
          // Create a new provider
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);

          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          // Get the signer
          const signer = provider.getSigner();
          setSigner(signer);
          
          // Get the connected account
          const account = await signer.getAddress();
          setAccount(account);
          
          // Get the network
          const network = await provider.getNetwork();
          
          // Check if connected to the correct network (Hardhat local network has chainId 1337)
          if (network.chainId !== 1337) {
            setError(`Please connect to the Hardhat Local network (Chain ID: 1337). Current network: ${network.name} (Chain ID: ${network.chainId})`);
            
            // Add button to switch network automatically
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x539' }], // 0x539 is hexadecimal for 1337
              });
              // Reload the page after network switch
              window.location.reload();
              return;
            } catch (switchError) {
              // This error code indicates that the chain has not been added to MetaMask
              if (switchError.code === 4902) {
                try {
                  await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                      {
                        chainId: '0x539', // 0x539 is hexadecimal for 1337
                        chainName: 'Hardhat Local',
                        rpcUrls: ['http://127.0.0.1:8545'],
                        nativeCurrency: {
                          name: 'Ethereum',
                          symbol: 'ETH',
                          decimals: 18
                        }
                      },
                    ],
                  });
                  // Reload the page after network is added
                  window.location.reload();
                  return;
                } catch (addError) {
                  console.error('Error adding Hardhat network to MetaMask:', addError);
                }
              }
              console.error('Error switching to Hardhat network:', switchError);
            }
            return;
          }
          
          const envAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
          const contractAddress = envAddress || (ContractAddress && ContractAddress.address) || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
          
          // Create contract instance
          const contract = new ethers.Contract(
            contractAddress,
            ProductVerificationABI.abi,
            signer
          );
          
          setContract(contract);
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
            setSigner(provider.getSigner());
          });
          
          // Listen for chain changes
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });
          
        } else {
          setError('Please install MetaMask to use this application');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setError('Error connecting to blockchain. Please check your MetaMask connection.');
      } finally {
        setLoading(false);
      }
    };
    
    init();
    
    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner floating"></div>
          <h2 className="neon-cyan mt-4">Connecting to Blockchain</h2>
          <p className="text-muted">Initializing secure connection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content card-glass">
          <div className="error-icon">⚠️</div>
          <h2 className="gradient-text mb-3">Connection Error</h2>
          <p className="mb-4">{error}</p>
          <button 
            className="btn-primary-custom" 
            onClick={() => window.location.reload()}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="bg-particle"></div>
        <div className="bg-particle"></div>
        <div className="bg-particle"></div>
      </div>

      {/* Navigation */}
      <nav className="navbar-glass">
        <div className="nav-container">
          <Link to="/" className="brand">
            <div className="brand-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <span className="brand-text gradient-text">BlockVerify</span>
          </Link>

          <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <NavLink to="/" className="nav-link-glass" end>
              <i className="fas fa-home"></i>
              <span>Home</span>
            </NavLink>
            <NavLink to="/register" className="nav-link-glass">
              <i className="fas fa-plus-circle"></i>
              <span>Register</span>
            </NavLink>
            <NavLink to="/transfer" className="nav-link-glass">
              <i className="fas fa-exchange-alt"></i>
              <span>Transfer</span>
            </NavLink>
            <NavLink to="/verify" className="nav-link-glass">
              <i className="fas fa-check-circle"></i>
              <span>Verify</span>
            </NavLink>
          </div>

          <div className="nav-actions">
            <div className="wallet-info-glass">
              <i className="fas fa-wallet"></i>
              <span>{account ? truncateAddress(account) : 'Connect Wallet'}</span>
            </div>
            
            <button 
              className="mobile-menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterProduct contract={contract} account={account} />} />
            <Route path="/transfer" element={<TransferProduct contract={contract} account={account} />} />
            <Route path="/verify" element={<VerifyProduct contract={contract} />} />
            <Route path="/product/:serialNumber" element={<ProductDetails contract={contract} />} />
          </Routes>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer-glass">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="neon-cyan">
              <i className="fas fa-shield-alt"></i>
              BlockVerify
            </h3>
            <p>Revolutionary blockchain-based product verification</p>
          </div>
          
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>Secure Registration</li>
              <li>Transparent Transfers</li>
              <li>Instant Verification</li>
              <li>Immutable Records</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Technology</h4>
            <ul>
              <li>Ethereum Blockchain</li>
              <li>Smart Contracts</li>
              <li>Web3 Integration</li>
              <li>Decentralized Storage</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 BlockVerify. Securing the future of commerce.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
