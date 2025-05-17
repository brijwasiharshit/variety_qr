import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, Clock, CookingPot, Utensils, Trash2 } from 'lucide-react';
import './kitchen.css';
import io from 'socket.io-client';
import axios from 'axios';

const KitchenDashboard = () => {
  const [orders, setOrders] = useState({});
  const [expandedTables, setExpandedTables] = useState({});
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const host = process.env.REACT_APP_HOST;

  // Redirect if no token cookie exists

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
        const response = await axios.get(`${host}/api/kitchen/allOrders`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setOrders(response.data.data);
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

  const handleClearTable = async (tableNumber) => {
    const notificationId = Date.now();

    try {
      const response = await axios.post(`${host}/api/kitchen/clearTable/${tableNumber}`, {}, {
        withCredentials: true,
      });

      const data = response.data;
      if (data.success) {
        // Update local state to remove the cleared table
        setOrders(prevOrders => {
          const newOrders = { ...prevOrders };
          delete newOrders[tableNumber];
          return newOrders;
        });

        // Show success notification
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          {
            message: `Great done! Table ${tableNumber} cleared successfully`,
            id: notificationId,
            type: 'success'
          },
        ]);
      } else {
        // Show error notification
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          {
            message: `Failed to clear Table ${tableNumber}: ${data.error}`,
            id: notificationId,
            type: 'error'
          },
        ]);
      }
    } catch (err) {
      console.error("Error clearing table:", err);
      // Show error notification
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        {
          message: `Error clearing Table ${tableNumber}`,
          id: notificationId,
          type: 'error'
        },
      ]);
    }

    // Remove notification after 5 seconds
    setTimeout(() => {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notif) => notif.id !== notificationId)
      );
    }, 5000);
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

  // Calculate total amount for a specific table
  const calculateTableTotal = (tableOrders) => {
    return tableOrders.reduce((sum, order) => sum + (order.price || 0), 0);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="kitchen-container">
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
        {Object.keys(orders).sort((a, b) => a - b).map(tableNumber => {
          const tableTotal = calculateTableTotal(orders[tableNumber]);
          
          return (
            <div key={tableNumber} className="table-card">
              <div
                className="table-header"
                onClick={() => toggleTableExpanded(tableNumber)}
              >
                <div className="table-info">
                  <span className="table-number">Table {tableNumber}</span>
                  <div className="table-meta">
                    <span className="order-count">
                      {orders[tableNumber].length} {orders[tableNumber].length === 1 ? 'order' : 'orders'}
                    </span>
                    <span className="table-total">₹{tableTotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className="table-actions">
                  <button
                    className="clear-table-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearTable(tableNumber);
                    }}
                    title="Mark Table as Cleared"
                  >
                    <Check size={18} style={{ color: 'green' }} />
                  </button>

                  {expandedTables[tableNumber] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedTables[tableNumber] && (
                <div className="orders-list">
                  {orders[tableNumber].length === 0 ? (
                    <div className="empty-orders">No active orders</div>
                  ) : (
                    <>
                      {orders[tableNumber].map(order => (
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
                        </div>
                      ))}
                      <div className="order-total">
                        <span>Table Total:</span>
                        <span>₹{tableTotal.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KitchenDashboard;