import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, Clock, CookingPot, Utensils } from 'lucide-react';
import './kitchen.css';
import io from 'socket.io-client';

const KitchenDashboard = () => {
  const [orders, setOrders] = useState({});
  const [expandedTables, setExpandedTables] = useState({});
  const [notifications, setNotifications] = useState([]);
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

      // Show notification
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        { message: `New order placed at Table ${newOrder.tableNo}`, id: Date.now() },
      ]);

      // Remove notification after 5 seconds
      setTimeout(() => {
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notif) => notif.id !== newOrder.id)
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
      {/* Notification System */}
      <div className="notifications">
        {notifications.map((notif) => (
          <div key={notif.id} className="notification">
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
              {expandedTables[tableNumber] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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
                          onClick={() => updateOrderStatus(order._id, 'preparing')}
                          disabled={order.status !== 'created'}
                          className={order.status === 'created' ? 'active' : ''}
                        >
                          Preparing
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order._id, 'ready')}
                          disabled={order.status !== 'preparing'}
                          className={order.status === 'preparing' ? 'active' : ''}
                        >
                          Ready
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order._id, 'served')}
                          disabled={order.status !== 'ready'}
                          className={order.status === 'ready' ? 'active' : ''}
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
