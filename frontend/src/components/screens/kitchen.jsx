import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  CookingPot,
  Utensils,
  Trash2,
} from "lucide-react";
import "./kitchen.css";
import io from "socket.io-client";

const KitchenDashboard = () => {
  const [orders, setOrders] = useState({});
  const [expandedTables, setExpandedTables] = useState({});
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const host = process.env.REACT_APP_HOST;

  
  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch((e) => console.error("Audio playback error:", e));
  };

  // 🧠 Socket connection for real-time updates
  useEffect(() => {
    const socket = io(host);

   // Update the socket.io 'newOrder' event handler
socket.on("newOrder", (newOrder) => {
  // Play sound first
  const audio = new Audio("/notification.mp3");
  audio.play().catch((e) => console.error("Audio playback error:", e));

  setOrders((prevOrders) => {
    const updatedOrders = { ...prevOrders };
    const tableNo = newOrder.tableNo;

    if (!updatedOrders[tableNo]) {
      updatedOrders[tableNo] = [];
    }

    updatedOrders[tableNo].push(newOrder);
    return updatedOrders;
  });

  const notificationId = Date.now();
  setNotifications((prev) => [
    ...prev,
    {
      message: `New order placed at Table ${newOrder.tableNo}`,
      id: notificationId,
    },
  ]);

  // Set timeout to exactly 3 seconds (3000ms)
  setTimeout(() => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId)
    );
  }, 3000); // Changed from 5000 to 3000
});

// Update all other notification timeouts in the component:
// In handleClearTable:
setTimeout(() => {
  setNotifications((prev) =>
    prev.filter((notif) => notif.id !== notificationId)
  );
}, 3000); // Changed from 5000 to 3000

// In handleDeleteOrder (you'll need to capture the notificationId like in other functions):
const notificationId = Date.now();
// ... rest of the code ...
setTimeout(() => {
  setNotifications((prev) =>
    prev.filter((notif) => notif.id !== notificationId)
  );
}, 3000); // Changed from 5000 to 3000

    return () => socket.disconnect();
  }, [host]);

  // 📦 Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${host}/api/kitchen/allOrders`, {
          credentials: "include",
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
    setExpandedTables((prev) => ({
      ...prev,
      [tableNumber]: !prev[tableNumber],
    }));
  };

  const handleClearTable = async (tableNumber) => {
    const notificationId = Date.now();

    try {
      const response = await fetch(
        `${host}/api/kitchen/clearTable/${tableNumber}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.success) {
        setOrders((prevOrders) => {
          const newOrders = { ...prevOrders };
          delete newOrders[tableNumber];
          return newOrders;
        });

        setNotifications((prev) => [
          ...prev,
          {
            message: `Great done! Table ${tableNumber} cleared successfully`,
            id: notificationId,
            type: "success",
          },
        ]);
      } else {
        setNotifications((prev) => [
          ...prev,
          {
            message: `Failed to clear Table ${tableNumber}: ${data.error}`,
            id: notificationId,
            type: "error",
          },
        ]);
      }
    } catch (err) {
      console.error("Error clearing table:", err);
      setNotifications((prev) => [
        ...prev,
        {
          message: `Error clearing Table ${tableNumber}`,
          id: notificationId,
          type: "error",
        },
      ]);
    }

    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
    }, 5000);
  };

 const handleDeleteOrder = async (tableNo, orderId) => {
  try {
    const response = await fetch(
      `${host}/api/kitchen/cancelOrder/${tableNo}/${orderId}`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    const data = await response.json();
    if (data.success) {
      setOrders((prevOrders) => {
        const updatedOrders = { ...prevOrders };
        updatedOrders[tableNo] = updatedOrders[tableNo].filter(
          (order) => order._id !== orderId
        );
        return updatedOrders;
      });
      // Removed success notification
    }
    // Removed error notifications
  } catch (err) {
    console.error("Delete order error:", err);
    // Removed catch notification
  }
};

  const getStatusIcon = (status) => {
    switch (status) {
      case "created":
        return <Clock size={16} className="text-yellow-500" />;
      case "preparing":
        return <CookingPot size={16} className="text-orange-500" />;
      case "ready":
        return <Check size={16} className="text-green-500" />;
      case "served":
        return <Utensils size={16} className="text-blue-500" />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="kitchen-container">
      <div className="notifications">
        {notifications.map((notif) => (
          <div key={notif.id} className={`notification ${notif.type || ""}`}>
            <span>{notif.message}</span>
          </div>
        ))}
      </div>

      <header className="kitchen-header">
        <h1>Kitchen Dashboard</h1>
      </header>

      <div className="tables-grid">
        {Object.keys(orders)
          .sort((a, b) => a - b)
          .map((tableNumber) => (
            <div key={tableNumber} className="table-card">
              <div
                className="table-header"
                onClick={() => toggleTableExpanded(tableNumber)}
              >
                <div className="table-info">
                  <span className="table-number">Table {tableNumber}</span>
                  <span className="order-count">
                    {orders[tableNumber].length}{" "}
                    {orders[tableNumber].length === 1 ? "order" : "orders"}
                  </span>
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
                    <Check size={18} style={{ color: "green" }} />
                  </button>
                  {expandedTables[tableNumber] ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </div>

              {expandedTables[tableNumber] && (
                <div className="orders-list">
                  {orders[tableNumber].length === 0 ? (
                    <div className="empty-orders">No active orders</div>
                  ) : (
                    orders[tableNumber].map((order) => (
                      <div key={order._id} className="order-item">
                        <div className="order-header">
                          <span className="order-time">
                            {formatTime(order.createdAt)}
                          </span>
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
                            className="delete-order-btn"
                            onClick={() =>
                              handleDeleteOrder(tableNumber, order._id)
                            }
                            title="Delete Order"
                          >
                            <Trash2 size={16} color="red" />
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
