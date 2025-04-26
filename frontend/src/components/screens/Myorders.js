import React, { useEffect, useState } from "react";
import "./myorders.css"; // Import CSS for styling

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    if (!authToken) return;

    fetch("/api/myorders", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`, 
      },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, [authToken]);

  return (
    <div className="orders-container">
      <h2 className="orders-title">📜 My Orders</h2>

      {orders.length === 0 ? (
        <p className="no-orders">😔 You haven't placed any orders yet.</p>
      ) : (
        <div className="table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Items</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id} className="order-row">
                  <td>{index + 1}</td>
                  <td>
                    {order.items.map((item) => (
                      <div key={item._id} className="order-item">
                        🍽️ {item.name} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="price">₹{order.totalPrice}</td>
                  <td>
                    <span className={`status-badge ${order.status === "Delivered" ? "delivered" : "pending"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
