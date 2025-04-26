import React, { useState } from "react";
import { useDispatchCart } from "./ContextReducer"; // Import cart dispatcher
import axios from 'axios';
export default function Card({ item }) {
  const host = process.env.REACT_APP_HOST;
  const dispatch = useDispatchCart(); // Get dispatch function for the cart

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(Object.keys(item.options[0])[0]); // Default size selection

  // Get the price based on the selected size
  const price = item.options[0][size] * quantity;

  // Function to handle Add to Cart
  const handleAddToCart = () => {
    if (!item || !item._id) {
      console.error("Invalid item data:", item);
      alert("Item data is missing or incorrect.");
      return;
    }

    const cartItem = {
      id: item._id,
      itemName: item.name,
      size: size,
      quantity: quantity,
      price: price,
      img: item.img || "https://via.placeholder.com/200",
    };

    console.log("Adding to cart:", cartItem);

    dispatch({
      type: "ADD_TO_CART",
      payload: cartItem,
    });

    alert(`${quantity}x ${item.name} added to cart!`);
    const addedItem = axios.post(`${host}/api/add`,cartItem);
  };

  return (
    <div className="col-md-3 d-flex justify-content-center">
      <div
        className="card mt-3 shadow-lg"
        style={{
          width: "20rem",
          height: "auto",
          backgroundColor: "#343a40",
          borderRadius: "12px",
          padding: "12px",
          color: "#fff",
          border: "1px solid #495057",
        }}
      >
        <img
          src={item.img || "https://via.placeholder.com/200"}
          className="card-img-top"
          alt={item.name}
          style={{
            height: "140px",
            objectFit: "cover",
            borderRadius: "10px",
          }}
        />

        <div className="card-body text-center">
          <h6 className="card-title fw-bold" style={{ fontSize: "18px", marginBottom: "5px" }}>
            {item.name}
          </h6>

          <p className="card-text text-light" style={{ fontSize: "13px", marginBottom: "3px" }}>
            <b>Category:</b> {item.CategoryName}
          </p>

          <p className="card-text text-light" style={{ fontSize: "12px", color: "#ced4da", marginBottom: "3px" }}>
            <b>Description:</b> {item.description}
          </p>

          <div className="d-flex justify-content-between align-items-center mt-2">
            {/* Quantity Selector */}
            <select
              className="form-select form-select-sm text-white border-0"
              style={{ backgroundColor: "#20c997", width: "45%" }}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              {Array.from(Array(6), (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>

            {/* Size Selector */}
            <select
              className="form-select form-select-sm text-white bg-secondary border-0"
              style={{ width: "50%" }}
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              {Object.keys(item.options[0]).map((key) => (
                <option key={key} value={key}>
                  {key} - ₹{item.options[0][key]}
                </option>
              ))}
            </select>
          </div>

          {/* Total Price */}
          <div className="mt-2 fw-bold" style={{ color: "#20c997", fontSize: "16px" }}>
            Total: ₹{price}
          </div>

          <button className="btn btn-warning mt-2 w-100 rounded-pill fw-bold" onClick={handleAddToCart}>
            Add to Cart 🛒
          </button>
        </div>
      </div>
    </div>
  );
}
