import React, { useEffect, useState, useRef } from "react";
import html2canvas from 'html2canvas';
import Carousel from "../Carousal";
import Footer from "../Footer";
import { FaArrowUp } from "react-icons/fa";
import "./home.css";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ThankYouPopup = ({ onClose, tableId }) => {
  return (
    <div className="thank-you-popup-overlay">
      <div className="thank-you-popup-content">
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
        
        {/* Add View Orders Button */}
        <button 
          className="view-orders-btn"
          onClick={() => {
            window.location.href = `/${tableId}/orders`;
          }}
        >
          View My Orders
        </button>
        
        <button 
          className="back-to-home-btn"
          onClick={onClose}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default function Home() {
    const params = useParams();
    const navigate = useNavigate();
    const tableId = params.tableId;
    const host = process.env.REACT_APP_HOST;
    const [foodCat, setFoodCat] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: "" });
    const cartRef = useRef(null);

    // Calculate subtotal from cart items
    const calculateSubtotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Calculate total with tax (5%)
    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return subtotal ;
    };

    // Show notification
    const showNotification = (message) => {
        setNotification({ show: true, message });
        setTimeout(() => {
            setNotification({ show: false, message: "" });
        }, 3000);
    };

    // Function to save individual item image
    const saveImageToGallery = (imageUrl, itemName) => {
        try {
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `${itemName || 'item'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showNotification(`Saved image of ${itemName}`);
        } catch (error) {
            console.error('Error saving image:', error);
            showNotification('Failed to save image');
        }
    };

    // Improved function to save receipt
    const saveReceiptToGallery = async () => {
        try {
            if (!cartRef.current) {
                showNotification('Could not find receipt content');
                return;
            }

            // Hide buttons before capturing
            const buttons = cartRef.current.querySelectorAll('button');
            buttons.forEach(btn => btn.style.visibility = 'hidden');

            const canvas = await html2canvas(cartRef.current, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff',
                scrollY: -window.scrollY
            });

            // Restore buttons visibility
            buttons.forEach(btn => btn.style.visibility = 'visible');

            // Different handling for mobile vs desktop
            if (isMobileDevice()) {
                await handleMobileSave(canvas);
            } else {
                await handleDesktopSave(canvas);
            }

            showNotification('Receipt saved successfully!');
        } catch (error) {
            console.error('Error saving receipt:', error);
            showNotification('Failed to save receipt');
        }
    };

    const isMobileDevice = () => {
        return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    };

    const handleMobileSave = async (canvas) => {
        const image = canvas.toDataURL('image/png');
        
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            // iOS - open image in new tab
            const newWindow = window.open();
            newWindow.document.write(`<img src="${image}" />`);
        } else {
            // Android - download image
            const link = document.createElement('a');
            link.href = image;
            link.download = `Receipt_Table_${tableId}_${new Date().toISOString().slice(0,10)}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleDesktopSave = async (canvas) => {
        try {
            // Try to copy to clipboard first
            if (navigator.clipboard && navigator.clipboard.write) {
                const blob = await new Promise(resolve => canvas.toBlob(resolve));
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                showNotification('Receipt copied to clipboard!');
            } else {
                throw new Error('Clipboard API not available');
            }
        } catch (err) {
            console.log('Falling back to download:', err);
            // Fallback to download
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `Receipt_Table_${tableId}_${new Date().toISOString().slice(0,10)}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Add item to cart
    const addToCart = (item, option, price) => {
        const existingItem = cart.find(cartItem => 
            cartItem._id === item._id && cartItem.option === option
        );

        if (existingItem) {
            setCart(cart.map(cartItem =>
                cartItem._id === item._id && cartItem.option === option
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            ));
            showNotification(`Increased quantity of ${item.name} (${option})`);
        } else {
            setCart([...cart, {
                ...item,
                option,
                price,
                quantity: 1
            }]);
            showNotification(`Added ${item.name} (${option}) to cart`);
        }
    };

    // Remove item from cart
    const removeFromCart = (itemId, option) => {
        setCart(cart.filter(item => 
            !(item._id === itemId && item.option === option)
        ));
        showNotification('Item removed from cart');
    };

    // Update item quantity
    const updateQuantity = (itemId, option, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId, option);
            return;
        }

        setCart(cart.map(item =>
            item._id === itemId && item.option === option
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    // Handle checkout - Updated to show popup
    const handleCheckout = async () => {
        try {
            const promises = cart.map((item) =>
                axios.post(`${host}/api/user/placeOrder`, {
                    itemId: item._id,
                    quantity: item.quantity,
                    portion: item.option,
                    tableNo: parseInt(tableId), 
                    status: "created",
                })
            );
        
            const results = await Promise.all(promises);
            console.log("All orders placed successfully:", results);
            
            // Show thank you popup
            setShowThankYou(true);
            
            // Clear cart
            setCart([]);
            setShowCart(false);
        } catch (error) {
            console.error("Error placing order:", error.response?.data?.error || error.message);
            showNotification(`Failed to place order: ${error.response?.data?.error || error.message}`);
        }
    };

    // Scroll to top
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Filter food items based on search query
    const filteredItems = foodItems.filter(item => 
        item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoaded(false);
                setError(null);
                
                const response = await fetch(`${host}/api/user/foodData`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                
                if (!data.foodItems || data.foodItems.length === 0) {
                    throw new Error("No food items available");
                }

                setFoodCat(data.foodCategories);
                setFoodItems(data.foodItems);
                
            } catch (err) {
                console.error("Failed to fetch data:", err.message);
                setError(err.message);
            } finally {
                setIsLoaded(true);
            }
        };

        loadData();
    }, [host]);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div style={{ backgroundColor: "#fffacd", minHeight: "100vh", paddingBottom: "20px" }}>
            {/* Notification Popup */}
            {notification.show && (
                <div className="notification-popup">
                    {notification.message}
                </div>
            )}

    
{showThankYou && (
  <ThankYouPopup 
    onClose={() => setShowThankYou(false)} 
    tableId={tableId} 
  />
)}

            {!isLoaded ? (
                <div className="loading-container">
                   
                    <div className="loading-spinner"></div>
                </div>
            ) : error ? (
                <div className="error-container">
                    <h2 style={{ color: "red", textAlign: "center" }}>Error loading menu</h2>
                    <p style={{ textAlign: "center" }}>{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="retry-button"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <>
                    <Carousel setSearchQuery={setSearchQuery} searchQuery={searchQuery} />
                    
                    <div className="menu-container">
                        {foodCat.map(category => (
                            <div key={category._id} className="category-section">
                                <h2 className="category-title">{category.name}</h2>
                                <p className="category-description">{category.description}</p>
                                <div className="food-items-grid">
                                    {filteredItems
                                        .filter(item => item.category === category._id)
                                        .map(item => (
                                            <div key={item._id} className="food-item-card">
                                                <img 
                                                    src={item.imageUrl} 
                                                    alt={item.name} 
                                                    className="food-item-image"
                                                />
                                                <div className="food-item-details">
                                                    <h3>{item.name}</h3>
                                                    <p>{item.description}</p>
                                                    <div className="price-options">
                                                        {Object.entries(item.options).map(([option, price]) => (
                                                            <div key={option} className="price-option">
                                                                <span>{option}: ₹{price}</span>
                                                                <div className="quantity-controls">
                                                                    <button 
                                                                        onClick={() => addToCart(item, option, price)}
                                                                        className="add-to-cart-btn"
                                                                    >
                                                                        Add
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cart Button */}
                    <button 
                        className="cart-button"
                        onClick={() => setShowCart(true)}
                    >
                        🛒 {cart.length > 0 && <span className="cart-count">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>}
                    </button>

                    {showCart && (
                        <div className="cart-overlay">
                            <div className="modern-cart-modal" ref={cartRef}>
                                <div className="modern-cart-header">
                                    <h2 className="cart-title">Your Order Summary</h2>
                                    <button 
                                        className="modern-close-btn"
                                        onClick={() => setShowCart(false)}
                                        aria-label="Close cart"
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className="modern-cart-body">
                                    {cart.length === 0 ? (
                                        <div className="empty-cart-state">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <h3>Your cart feels lonely</h3>
                                            <p>Add some delicious items to get started</p>
                                            <button 
                                                className="modern-btn outline"
                                                onClick={() => setShowCart(false)}
                                            >
                                                Browse Menu
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                         <div 
  className="modern-cart-items"
  style={{ backgroundColor: '#f0fff4', padding: '1rem', borderRadius: '8px' }}
>
  {cart.map((item, index) => (
    <div 
      key={`${item._id}-${item.option}-${index}`} 
      className="modern-cart-item"
      style={{ 
        backgroundColor: '#ffffff',
        border: '1px solid #c6f6d5',
        borderRadius: '8px',
        padding: '0.75rem',
        marginBottom: '1rem',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="cart-item-details">
        <div className="item-meta">
          <h4 className="item-name">{item.name}</h4>
          <span className="item-option">{item.option}</span>
          <div className="item-pricing">
            <span className="item-price">₹{item.price}</span>
            <span className="item-multiply">×</span>
            <span className="item-quantity">{item.quantity}</span>
            <span className="item-subtotal">₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        </div>
        
        <div className="item-actions">
          <div className="quantity-controls">
            <button
              onClick={() => updateQuantity(item._id, item.option, item.quantity - 1)}
              className="quantity-btn minus"
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="quantity-display">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item._id, item.option, item.quantity + 1)}
              className="quantity-btn plus"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          
          <button
            onClick={() => removeFromCart(item._id, item.option)}
            className="delete-btn"
            aria-label="Remove item"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
                                            
                                            <div className="modern-cart-summary">
                                                <div className="summary-row">
                                                    <span>Subtotal</span>
                                                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                                                </div>
                                             
                                                <div className="summary-row total">
                                                    <span>Total</span>
                                                    <span>₹{calculateTotal().toFixed(2)}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="modern-cart-footer">
                                                <button 
                                                    className="modern-btn primary"
                                                    onClick={handleCheckout}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                    Confirm Order (₹{calculateTotal().toFixed(2)})
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <Footer />

                    {showBackToTop && (
                        <button className="back-to-top" onClick={scrollToTop}>
                            <FaArrowUp />
                        </button>
                    )}
                </>
            )}
        </div>
    );
}