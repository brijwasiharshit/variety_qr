import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./cod.css";

export default function COD() {
  const location = useLocation();
  const navigate = useNavigate();
  const cart = (location.state && location.state.cart) || [];
  const DELIVERY_CHARGE = 40; // Added delivery charge constant

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const convertToJson = (formData) => {
    const subtotal = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const totalAmount = subtotal + DELIVERY_CHARGE; // Include delivery charge

    return {
      phone: `+917060988418`,
      message: `
📦 *New Order Received* 🚚

👤 *Customer Name:* ${formData.name}
🏠 *Address:* ${formData.address}
📞 *Contact Number:* ${formData.phone}

🛒 *Order Summary:*
${cart
  .map(
    (item) =>
      `• ${item.itemName} (Size: ${item.size}, Qty: ${item.quantity}) - ₹${
        item.price * item.quantity
      }`
  )
  .join("\n")}

📦 *Delivery Charges:* ₹${DELIVERY_CHARGE}
✅ *Total Items:* ${cart.length}
💰 *Subtotal:* ₹${subtotal}
💳 *Total Amount:* ₹${totalAmount}

Please process the order accordingly. 📩
      `,
    };
  };

  const confirmCOD = async (formData) => {
    try {
      const subtotal = cart.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      const totalAmount = subtotal + DELIVERY_CHARGE;
      
      const finalData = convertToJson(formData);
      await axios.post("https://variety-food-upxc.onrender.com/api/confirmed", {
        name: formData.name,
        address: formData.address,
        contactNumber: formData.phone,
        items: cart,
        deliveryCharge: DELIVERY_CHARGE, // Added delivery charge to API payload
        subtotal: subtotal,
        totalAmount: totalAmount
      });
      
      const response = await axios.post(
        "https://variety-food-upxc.onrender.com/api/send-sms",
        finalData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        console.log("WhatsApp Message Sent Successfully:", response.data);
        alert("Order placed successfully! 🎉");
        navigate("/"); // Redirect after success
      } else {
        throw new Error("Failed to send WhatsApp message");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to send confirmation via WhatsApp. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!formData.name || !formData.address || !formData.phone) {
      alert("Please fill out all fields!");
      return;
    }

    if (formData.phone.length < 10) {
      alert("Please enter a valid phone number!");
      return;
    }

    await confirmCOD(formData);
  };

  // Calculate order totals
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const totalAmount = subtotal + DELIVERY_CHARGE;

  return (
    <div className="container mt-5">
      <h2 className="text-center text-success">📦 Cash on Delivery</h2>
      <p className="text-center text-muted">
        Please provide your details to confirm the order.
      </p>

      {/* ✅ Display Selected Cart Items */}
      {cart.length > 0 ? (
        <div className="selected-cart">
          <h4 className="fw-bold text-center">🛒 Your Order Summary</h4>
          <div className="cart-list">
            {cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="cart-item-details">
                  <h6>{item.itemName}</h6>
                  <p>
                    Size: {item.size} | Qty: {item.quantity}
                  </p>
                  <p className="fw-bold text-success">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Totals Section with Delivery Charge */}
          <div className="order-totals p-3">
            <div className="d-flex justify-content-between">
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Delivery Charge:</span>
              <span>₹{DELIVERY_CHARGE}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold">
              <span>Total Amount:</span>
              <span className="text-success">₹{totalAmount}</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-danger">No items selected! 😢</p>
      )}

      <form onSubmit={handleSubmit} className="cod-form">
        <div className="mb-3">
          <label className="form-label fw-bold">Full Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Address</label>
          <textarea
            className="form-control"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your full address"
            rows="3"
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Phone Number</label>
          <input
            type="tel"
            className="form-control"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <button type="submit" className="btn btn-success w-100 fw-bold py-2">
          ✅ Confirm Order (₹{totalAmount})
        </button>
      </form>
    </div>
  );
}