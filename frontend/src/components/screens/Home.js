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
    const [activeCategory, setActiveCategory] = useState(null);
    const cartRef = useRef(null);

    const calculateSubtotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return subtotal;
    };

    const showNotification = (message) => {
        setNotification({ show: true, message });
        setTimeout(() => {
            setNotification({ show: false, message: "" });
        }, 3000);
    };

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

    const saveReceiptToGallery = async () => {
        try {
            if (!cartRef.current) {
                showNotification('Could not find receipt content');
                return;
            }

            const buttons = cartRef.current.querySelectorAll('button');
            buttons.forEach(btn => btn.style.visibility = 'hidden');

            const canvas = await html2canvas(cartRef.current, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff',
                scrollY: -window.scrollY
            });

            buttons.forEach(btn => btn.style.visibility = 'visible');

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
            const newWindow = window.open();
            newWindow.document.write(`<img src="${image}" />`);
        } else {
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
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `Receipt_Table_${tableId}_${new Date().toISOString().slice(0,10)}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

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

    const removeFromCart = (itemId, option) => {
        setCart(cart.filter(item => 
            !(item._id === itemId && item.option === option)
        ));
        showNotification('Item removed from cart');
    };

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
            
            setShowThankYou(true);
            setCart([]);
            setShowCart(false);
        } catch (error) {
            console.error("Error placing order:", error.response?.data?.error || error.message);
            showNotification(`Failed to place order: ${error.response?.data?.error || error.message}`);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const filteredItems = foodItems.filter(item => 
        item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredByCategory = activeCategory 
        ? filteredItems.filter(item => item.category === activeCategory)
        : filteredItems;

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
                
                // Set the first category as active by default
                if (data.foodCategories.length > 0) {
                    setActiveCategory(data.foodCategories[0]._id);
                }
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
                    
                    {/* Category Tabs */}
                <div className="category-tabs-container">
  <div className="category-tabs">
    {foodCat.map(category => (
      <button
        key={category._id}
        className={`category-tab ${activeCategory === category._id ? 'active' : ''}`}
        onClick={() => setActiveCategory(category._id)}
      >
        {category.name}
      </button>
    ))}
  </div>
</div>

                    
                  <div className="menu-container bg-gray-50 px-2 sm:px-4 md:px-6 py-4 rounded-lg">
  {foodCat
    .filter(category => category._id === activeCategory)
    .map(category => (
      <div key={category._id} className="category-section mb-8">
        <div className="category-header mb-4 sm:mb-6">
          <h2 className="category-title text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            {category.name}
          </h2>
          <p className="category-description text-sm sm:text-base text-gray-600">
            {category.description}
          </p>
        </div>
        
        <div className="food-items-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {filteredByCategory
            .filter(item => item.category === category._id)
            .map(item => (
              <div key={item._id} className="food-item-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="food-item-image w-full h-40 sm:h-48 object-cover"
                />
                
                <div className="food-item-details p-3 sm:p-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">
                    {item.name}
                  </h3>
                  
                  <div className="price-options space-y-1 sm:space-y-2">
                    {Object.entries(item.options).map(([option, price]) => (
                      <div key={option} className="price-option flex justify-between items-center py-1 sm:py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm sm:text-base text-gray-700">
                          {option}: <span className="font-medium text-indigo-600">₹{price}</span>
                        </span>
                        <button 
                          onClick={() => addToCart(item, option, price)}
                          className="add-to-cart-btn bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 sm:px-3 rounded text-xs sm:text-sm transition-colors duration-200"
                        >
                          Add +
                        </button>
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
                                            <div className="modern-cart-items">
                                                {cart.map((item, index) => (
                                                    <div key={`${item._id}-${item.option}-${index}`} className="modern-cart-item">
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