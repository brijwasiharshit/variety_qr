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
            <span>15-20 minutes</span>
          </div>
          <div className="detail-row">
            <span>Order Number:</span>
            <span>#{Math.floor(Math.random() * 1000000)}</span>
          </div>
        </div>
       
        
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

