import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="container">
      <div className="hero-section text-center">
        <h1 className="display-4 mb-3">Blockchain-Based Fake Product Detection</h1>
        <p className="lead mb-4">
          Ensuring product authenticity through blockchain technology
        </p>
      </div>

      <div className="row justify-content-center g-4 mb-5">
        <div className="col-md-4">
          <div className="feature-card">
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <div className="feature-icon mb-4">
                  <i className="fas fa-box fa-2x"></i>
                </div>
                <h3 className="card-title h4 mb-3">Register Products</h3>
                <p className="card-text flex-grow-1">
                  Manufacturers can register new products on the blockchain with unique identifiers.
                  Each product is assigned an initial ID that will be updated throughout the supply chain.
                </p>
                <Link to="/register" className="btn btn-gradient mt-3">
                  <i className="fas fa-plus-circle me-2"></i>
                  Register a Product
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="feature-card">
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <div className="feature-icon mb-4">
                  <i className="fas fa-exchange-alt fa-2x"></i>
                </div>
                <h3 className="card-title h4 mb-3">Transfer Products</h3>
                <p className="card-text flex-grow-1">
                  As products move through the supply chain, their IDs are updated at each stage.
                  This creates a secure chain of custody that prevents counterfeiting.
                </p>
                <Link to="/transfer" className="btn btn-gradient mt-3">
                  <i className="fas fa-exchange-alt me-2"></i>
                  Transfer a Product
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="feature-card">
            <div className="card h-100">
              <div className="card-body d-flex flex-column">
                <div className="feature-icon mb-4">
                  <i className="fas fa-shield-alt fa-2x"></i>
                </div>
                <h3 className="card-title h4 mb-3">Verify Products</h3>
                <p className="card-text flex-grow-1">
                  Consumers can verify product authenticity by checking if the ID matches the latest one
                  recorded on the blockchain. Old or fake IDs are immediately flagged.
                </p>
                <Link to="/verify" className="btn btn-gradient mt-3">
                  <i className="fas fa-check-circle me-2"></i>
                  Verify a Product
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="workflow-card mb-5">
        <div className="card-body py-5">
          <h2 className="section-title">How It Works</h2>
          <div className="row justify-content-center g-4">
            <div className="col-md-4">
              <div className="workflow-step text-center">
                <div className="workflow-icon">
                  <i className="fas fa-box-open fa-2x"></i>
                </div>
                <h4>1. Product Registration</h4>
                <p className="text-muted">Manufacturers register products with initial IDs</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="workflow-step text-center">
                <div className="workflow-icon">
                  <i className="fas fa-exchange-alt fa-2x"></i>
                </div>
                <h4>2. ID Updates</h4>
                <p className="text-muted">IDs are updated at each supply chain stage</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="workflow-step text-center">
                <div className="workflow-icon">
                  <i className="fas fa-shield-alt fa-2x"></i>
                </div>
                <h4>3. Verification</h4>
                <p className="text-muted">Only the latest ID is considered authentic</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;