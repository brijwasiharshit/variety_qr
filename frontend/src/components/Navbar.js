import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "./ContextReducer";
import "./Carousel.css";
import "./Navbar.css";

export default function Navbar() {
  const isAdmin = localStorage.getItem("isAdmin") === "true"; 
  const cart = useCart();
  const cartItemCount = cart.length;

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
            
          </div>

         
        </div>
      </div>
    </nav>
  );
}