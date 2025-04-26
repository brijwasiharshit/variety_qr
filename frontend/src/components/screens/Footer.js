import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaWhatsapp, FaEnvelope } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                {/* Logo & Tagline */}
                <div className="footer-section">
                    <h2 className="brand-name">Variety 🍽️</h2>
                    <p className="tagline">Bringing flavors to your doorstep!</p>
                </div>

                {/* Quick Links */}
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/">🏠 Home</Link></li>
                        <li><Link to="/cart">🛒 My Cart</Link></li>
                        <li><Link to="/orders">📜 Orders</Link></li>
                       
                    </ul>
                </div>

                {/* Contact Info */}
                <div className="footer-section">
                    <h4>Contact Us</h4>
                    <p>📍 Your Location</p>
                    <p>📞 +91 XXXXXXXXXX</p>
                    <p>✉️ support@varietyfoods.com</p>
                </div>

                {/* Social Media */}
                <div className="footer-section social-icons">
                    <h4>Follow Us</h4>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                    <a href="https://wa.me/+91XXXXXXXXXX" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
                    <a href="mailto:support@varietyfoods.com"><FaEnvelope /></a>
                </div>
            </div>

            {/* Copyright */}
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Variety | All Rights Reserved.</p>
            </div>
        </footer>
    );
}
