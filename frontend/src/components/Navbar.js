import React from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "./ContextReducer";
import "./Carousel.css";
import "./Navbar.css";
import { FaClipboardList } from "react-icons/fa"; // Import orders icon

export default function Navbar({ toggleDarkMode, darkMode }) {
  const isAdmin = localStorage.getItem("isAdmin") === "true"; 
  const cart = useCart();
  const cartItemCount = cart.length;
  const { tableId } = useParams(); // Get current tableId from URL

  return (
    <nav className="navbar navbar-expand-lg sexy-navbar">
      <div className="container-fluid">
        {/* Logo Image Instead of 'Variety' Text */}
        <Link className="navbar-brand fs-1" to="/">
          <img 
            src="https://i.ibb.co/Ps0frrDP/Whats-App-Image-2025-03-14-at-22-23-30.jpg"  
            alt="Logo" 
            className="nav-logo"
          />
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse flex" id="navbarNav">
          <div className="navbar-nav">
            <Link className="nav-link sexy-link" to="/">Home</Link>
            
            {/* Add My Orders button if tableId exists */}
            {tableId && (
              <Link 
                className="nav-link sexy-link orders-link" 
                to={`/${tableId}/orders`}
              >
                <FaClipboardList className="me-1" />
                My Orders
                {cartItemCount > 0 && (
                  <span className="orders-badge">{cartItemCount}</span>
                )}
              </Link>
            )}
          </div>

       
        </div>
      </div>
    </nav>
  );
}