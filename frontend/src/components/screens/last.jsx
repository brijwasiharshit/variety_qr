import React from "react";
import { useNavigate } from "react-router-dom";
import "./last.css";
export default function ThankYouPage() {
  const navigate = useNavigate();

  const saveBillToGallery = () => {
    // Your save bill logic here
    alert("Bill saved to your gallery!");
  };

  return (
    <div className="thank-you-container">
      <div className="thank-you-content">
        <svg className="checkmark" viewBox="0 0 52 52">
          <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
          <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
        
        <h1 className="thank-you-title">Thank You For Your Order!</h1>
        <p className="thank-you-message">Your delicious food is being prepared and will arrive soon</p>
        
        <div className="order-details">
          <div className="detail-row">
            <span>Estimated Delivery Time:</span>
            <span>30-45 minutes</span>
          </div>
          <div className="detail-row">
            <span>Order Number:</span>
            <span>#{Math.floor(Math.random() * 1000000)}</span>
          </div>
        </div>
        
        <button 
          className="save-bill-btn"
          onClick={saveBillToGallery}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Save Bill
        </button>
        
        <button 
          className="back-to-home-btn"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

