import React, { useEffect, useState } from "react";
import Carousel from "../Carousal";
import Footer from "../Footer";
import { FaArrowUp } from "react-icons/fa";
import "./home.css";

export default function Home() {
    const host = process.env.REACT_APP_HOST;
    const [foodCat, setFoodCat] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [selectedTable, setSelectedTable] = useState("");
    const [tables,setTables] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: "" });

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoaded(false);
                setError(null);
                
                const response = await fetch(`${host}/api/user/foodData`);
                const table = await fetch(`${host}/api/user/fetchTables`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
    
                const data = await response.json();
                const availableTables = await table.json();
                setTables(availableTables.tables);
                console.log(availableTables.tables);
                
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

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
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

    const showNotification = (message) => {
        setNotification({ show: true, message });
        setTimeout(() => {
            setNotification({ show: false, message: "" });
        }, 3000);
    };

    const removeFromCart = (itemId, option) => {
        setCart(cart.filter(item => 
            !(item._id === itemId && item.option === option)
        ));
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

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleCheckout = () => {
        if (!selectedTable) {
            alert("Please select a table before checkout");
            return;
        }
        
        // Here you would typically send the order to your backend
        const order = {
            table: selectedTable,
            items: cart,
            total: calculateTotal(),
            timestamp: new Date().toISOString()
        };
        
        console.log("Order submitted:", order);
        alert(`Order placed for ${selectedTable}! Total: ₹${calculateTotal()}`);
        
        // Clear cart after successful checkout
        setCart([]);
        setShowCart(false);
    };

    const filteredItems = foodItems.filter(item => 
        item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ backgroundColor: "#fffacd", minHeight: "100vh", paddingBottom: "20px" }}>
            {/* Notification Popup */}
            {notification.show && (
                <div className="notification-popup">
                    {notification.message}
                </div>
            )}

            {!isLoaded ? (
                <div className="loading-container">
                    <img
                        src="https://i.postimg.cc/02DXQszV/Whats-App-Image-2025-03-18-at-14-40-25-1.jpg"
                        alt="Variety Sweets Logo"
                        className="loading-logo"
                    />
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

                    {/* Cart Modal */}
                    {showCart && (
                        <div className="cart-modal">
                            <div className="cart-content">
                                <div className="cart-header">
                                    <h2>Your Order</h2>
                                    <button 
                                        className="close-cart"
                                        onClick={() => setShowCart(false)}
                                    >
                                        ×
                                    </button>
                                </div>
                                
                                {cart.length === 0 ? (
                                    <p className="empty-cart-message">Your cart is empty</p>
                                ) : (
                                    <>
                           

                                        <div className="cart-items">
                                            {cart.map((item, index) => (
                                                <div key={`${item._id}-${item.option}-${index}`} className="cart-item">
                                                    <div className="cart-item-info">
                                                        <h4>{item.name} ({item.option})</h4>
                                                        <p>₹{item.price} × {item.quantity}</p>
                                                    </div>
                                                    <div className="cart-item-actions">
                                                        <button 
                                                            onClick={() => updateQuantity(item._id, item.option, item.quantity - 1)}
                                                            className="quantity-btn"
                                                        >
                                                            -
                                                        </button>
                                                        <span>{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQuantity(item._id, item.option, item.quantity + 1)}
                                                            className="quantity-btn"
                                                        >
                                                            +
                                                        </button>
                                                        <button 
                                                            onClick={() => removeFromCart(item._id, item.option)}
                                                            className="remove-btn"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="cart-total">
                                            <h3>Total: ₹{calculateTotal()}</h3>
                                        </div>
                                        <button 
                                            className="checkout-btn"
                                            onClick={handleCheckout}
                                        >
                                            Proceed to Checkout
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <Footer />
                </>
            )}

            {showBackToTop && (
                <button className="back-to-top" onClick={scrollToTop}>
                    <FaArrowUp />
                </button>
            )}
        </div>
    );
}