import React from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Thanks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderDetails = location.state?.cart || [];

  const totalAmount = orderDetails.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Variety Sweets & Restaurant</h1>
          <div style={styles.divider}></div>
        </div>

        <div style={styles.content}>
          <div style={styles.iconContainer}>
            <svg style={styles.checkIcon} viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
            </svg>
          </div>
          <h2 style={styles.confirmationText}>Your Order is Confirmed!</h2>
          <p style={styles.message}>Thank you for your order. Our team is preparing your delicious food.</p>
          
          {orderDetails.length > 0 && (
            <div style={styles.orderSummary}>
              <h3 style={styles.summaryTitle}>Order Summary</h3>
              <ul style={styles.itemList}>
                {orderDetails.map((item, index) => (
                  <li key={index} style={styles.item}>
                    <span>{item.itemName} (x{item.quantity})</span>
                    <span>₹{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div style={styles.totalContainer}>
                <span style={styles.totalLabel}>Total:</span>
                <span style={styles.totalAmount}>₹{totalAmount}</span>
              </div>
            </div>
          )}

          <p style={styles.footerMessage}>
            We appreciate your business. Please visit us again!
          </p>
          
          <button 
            onClick={() => navigate('/')} 
            style={styles.button}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
    overflow: 'hidden',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#e63946',
    padding: '25px 20px',
    color: 'white',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  divider: {
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    margin: '15px auto',
    width: '80px',
  },
  content: {
    padding: '30px',
  },
  iconContainer: {
    marginBottom: '20px',
  },
  checkIcon: {
    width: '80px',
    height: '80px',
    color: '#4CAF50',
  },
  confirmationText: {
    color: '#2b2d42',
    fontSize: '24px',
    margin: '10px 0',
    fontWeight: '600',
  },
  message: {
    color: '#6c757d',
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  orderSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    padding: '20px',
    margin: '25px 0',
    textAlign: 'left',
  },
  summaryTitle: {
    color: '#2b2d42',
    fontSize: '18px',
    margin: '0 0 15px 0',
    paddingBottom: '10px',
    borderBottom: '1px solid #eee',
  },
  itemList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px dashed #ddd',
    color: '#495057',
  },
  totalContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '15px',
    paddingTop: '10px',
    borderTop: '2px solid #ddd',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  totalLabel: {
    color: '#2b2d42',
  },
  totalAmount: {
    color: '#e63946',
  },
  footerMessage: {
    color: '#6c757d',
    fontSize: '15px',
    fontStyle: 'italic',
    margin: '25px 0',
  },
  button: {
    backgroundColor: '#e63946',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '10px',
  },
};

export default Thanks;v