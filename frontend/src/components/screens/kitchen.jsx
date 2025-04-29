import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, Clock, CookingPot, Utensils, Trash2 } from 'lucide-react';
import './kitchen.css';
import io from 'socket.io-client';

const KitchenDashboard = () => {
  const [orders, setOrders] = useState({});
  const [expandedTables, setExpandedTables] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [showClearTableModal, setShowClearTableModal] = useState(false);
  const [tableToClear, setTableToClear] = useState(null);
  const [verificationNumber, setVerificationNumber] = useState('');
  const navigate = useNavigate();
  const host = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Redirect if no token cookie exists
  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {});

    const token = cookies.token;
    const role = cookies.role;
    
    if (!token || role !== 'Kitchen') {
      navigate('/login');
    }
  }, [navigate]);

  // Set up socket connection to listen for new orders
  useEffect(() => {
    const socket = io(host);

    socket.on('newOrder', (newOrder) => {
      setOrders((prevOrders) => {
        const updatedOrders = { ...prevOrders };
        const tableNo = newOrder.tableNo;

        if (!updatedOrders[tableNo]) {
          updatedOrders[tableNo] = [];
        }

        updatedOrders[tableNo].push(newOrder);
        return updatedOrders;
      });

      // Show notification with unique ID
      const notificationId = Date.now();
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { message: `New order placed at Table ${newOrder.tableNo}`, id: notificationId },
      ]);

      // Remove notification after 5 seconds
      setTimeout(() => {
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notif) => notif.id !== notificationId)
        );
      }, 5000);
    });

    return () => socket.disconnect();
  }, [host]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${host}/api/kitchen/allOrders`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [host]);

  const toggleTableExpanded = (tableNumber) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableNumber]: !prev[tableNumber]
    }));
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${host}/api/kitchen/updateOrderStatus/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (data.success) {
        const updatedOrders = await fetch(`${host}/api/kitchen/allOrders`, {
          credentials: 'include'
        });
        const updatedData = await updatedOrders.json();
        if (updatedData.success) {
          setOrders(updatedData.data);
        }
      } else {
        console.error("Failed to update order:", data.error);
      }
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  const handleClearTableClick = (tableNumber) => {
    setTableToClear(tableNumber);
    setShowClearTableModal(true);
    setVerificationNumber('');
  };

  const handleClearTableConfirm = async () => {
    if (!verificationNumber) {
      alert('Please enter the mobile to confirm');
      return;
    }

    if (parseInt(verificationNumber) !== parseInt(tableToClear)) {
      alert('Entered mobile does not match');
      return;
    }

    try {
      const response = await fetch(`${host}/api/kitchen/clearTable/${tableToClear}`, {
        method: 'POST',
        credentials: 'include',
      });
      
      const data = await response.json();
      if (data.success) {
        // Update local state to remove the cleared table
        setOrders(prevOrders => {
          const newOrders = {...prevOrders};
          delete newOrders[tableToClear];
          return newOrders;
        });
        
        // Show success notification
        const notificationId = Date.now();
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          { 
            message: `Table ${tableToClear} cleared successfully`, 
            id: notificationId, 
            type: 'success' 
          },
        ]);
        
        setTimeout(() => {
          setNotifications((prevNotifications) =>
            prevNotifications.filter((notif) => notif.id !== notificationId)
          );
        }, 5000);
      } else {
        // Show error notification
        const notificationId = Date.now();
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          { 
            message: `Failed to clear Table ${tableToClear}: ${data.error}`, 
            id: notificationId, 
            type: 'error' 
          },
        ]);
        
        setTimeout(() => {
          setNotifications((prevNotifications) =>
            prevNotifications.filter((notif) => notif.id !== notificationId)
          );
        }, 5000);
      }
    } catch (err) {
      console.error("Error clearing table:", err);
      // Show error notification
      const notificationId = Date.now();
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { 
          message: `Error clearing Table ${tableToClear}`, 
          id: notificationId, 
          type: 'error' 
        },
      ]);
      
      setTimeout(() => {
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notif) => notif.id !== notificationId)
        );
      }, 5000);
    }

    setShowClearTableModal(false);
    setTableToClear(null);
    setVerificationNumber('');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'created':
        return <Clock size={16} className="text-yellow-500" />;
      case 'preparing':
        return <CookingPot size={16} className="text-orange-500" />;
      case 'ready':
        return <Check size={16} className="text-green-500" />;
      case 'served':
        return <Utensils size={16} className="text-blue-500" />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="kitchen-container">
      {/* Clear Table Confirmation Modal */}
      {showClearTableModal && (
        <div className="modal-overlay">
          <div className="clear-table-modal">
            <h3>Clear Table {tableToClear}</h3>
            <p>To confirm, please enter the mobile number:</p>
            <input
              type="number"
              value={verificationNumber}
              onChange={(e) => setVerificationNumber(e.target.value)}
              placeholder="Enter mobile number"
              className="verification-input"
            />
            <div className="modal-actions">
              <button 
                onClick={() => {
                  setShowClearTableModal(false);
                  setTableToClear(null);
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={handleClearTableConfirm}
                className="confirm-btn"
              >
                Confirm Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification System */}
      <div className="notifications">
        {notifications.map((notif) => (
          <div key={notif.id} className={`notification ${notif.type || ''}`}>
            <span>{notif.message}</span>
          </div>
        ))}
      </div>

      <header className="kitchen-header">
        <h1>Kitchen Dashboard</h1>
      </header>

      <div className="tables-grid">
        {Object.keys(orders).sort((a, b) => a - b).map(tableNumber => (
          <div key={tableNumber} className="table-card">
            <div 
              className="table-header"
              onClick={() => toggleTableExpanded(tableNumber)}
            >
              <div className="table-info">
                <span className="table-number">Table {tableNumber}</span>
                <span className="order-count">
                  {orders[tableNumber].length} {orders[tableNumber].length === 1 ? 'order' : 'orders'}
                </span>
              </div>
              <div className="table-actions">
                <button 
                  className="clear-table-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearTableClick(tableNumber);
                  }}
                  title="Clear Table"
                >
                  <Trash2 size={18} />
                </button>
                {expandedTables[tableNumber] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {expandedTables[tableNumber] && (
              <div className="orders-list">
                {orders[tableNumber].length === 0 ? (
                  <div className="empty-orders">No active orders</div>
                ) : (
                  orders[tableNumber].map(order => (
                    <div key={order._id} className="order-item">
                      <div className="order-header">
                        <span className="order-time">{formatTime(order.createdAt)}</span>
                        <div className="order-status">
                          {getStatusIcon(order.status)}
                          <span>{order.status}</span>
                        </div>
                      </div>
                      
                      <div className="order-details">
                        <div className="item-name">
                          {order.itemName} ({order.portion})
                        </div>
                        <div className="item-quantity">×{order.quantity}</div>
                        <div className="item-price">₹{order.price}</div>
                      </div>

                      <div className="order-actions">
                        <button
                          className={`status-btn ${order.status === 'created' ? 'active' : ''}`}
                          onClick={() => updateOrderStatus(order._id, 'created')}
                          disabled={order.status === 'created'}
                        >
                          Created
                        </button>
                        <button
                          className={`status-btn ${order.status === 'preparing' ? 'active' : ''}`}
                          onClick={() => updateOrderStatus(order._id, 'preparing')}
                          disabled={order.status === 'preparing'}
                        >
                          Preparing
                        </button>
                        <button
                          className={`status-btn ${order.status === 'ready' ? 'active' : ''}`}
                          onClick={() => updateOrderStatus(order._id, 'ready')}
                          disabled={order.status === 'ready'}
                        >
                          Ready
                        </button>
                        <button
                          className={`status-btn ${order.status === 'served' ? 'active' : ''}`}
                          onClick={() => updateOrderStatus(order._id, 'served')}
                          disabled={order.status === 'served'}
                        >
                          Served
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenDashboard;