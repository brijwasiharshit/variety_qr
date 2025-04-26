import React from "react";
import "./popup.css"; // Import styling

export default function Popup({ message, onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h4>✅ Item Added to Cart</h4>
        <p>{message}</p>
        <button className="popup-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
