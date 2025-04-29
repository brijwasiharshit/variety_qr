import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: "'Poppins', sans-serif",
    padding: '2rem',
  },
  content: {
    textAlign: 'center',
    padding: '3rem 2rem',
    maxWidth: '900px',
    width: '100%',
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    color: '#fff',
  },
  title: {
    fontSize: '3.5rem',
    marginBottom: '1rem',
    fontWeight: 700,
    background: 'linear-gradient(to right, #fff, #f9d5bb)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    '@media (max-width: 768px)': {
      fontSize: '2.5rem',
    }
  },
  subtitle: {
    fontSize: '1.5rem',
    marginBottom: '3rem',
    fontWeight: 300,
    opacity: 0.9,
    '@media (max-width: 768px)': {
      fontSize: '1.2rem',
      marginBottom: '2rem',
    }
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
    margin: '0 auto',
    maxWidth: '700px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    }
  },
  tableButton: {
    padding: '1.5rem 0.5rem',
    fontSize: '1.5rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    backdropFilter: 'blur(5px)',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
    },
    '&:active': {
      transform: 'translateY(-1px)',
    },
    '@media (max-width: 768px)': {
      padding: '1.2rem 0.5rem',
      fontSize: '1.2rem',
    }
  },
  buttonText: {
    display: 'block',
    transition: 'all 0.3s ease',
  },
  loadingMessage: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '1.2rem',
    marginTop: '1rem',
  },
  errorMessage: {
    color: '#ff6b6b',
    fontSize: '1.2rem',
    marginTop: '1rem',
  },
  fallbackMessage: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    marginTop: '0.5rem',
  }
});

const Front = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const host = process.env.REACT_APP_HOST || 'http://localhost:5000';

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch(`${host}/api/user/fetchTables`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.tables) {
          setTables(data.tables);
        } else {
          throw new Error('Invalid data format from server');
        }
      } catch (err) {
        console.error('Failed to fetch tables:', err);
        setError(err.message);
        // Fallback to default tables if API fails
        setTables([1, 2, 3, 4, 5, 6, 7, 8].map(num => ({ tableNo: num })));
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [host]);

  const handleTableSelect = (tableNumber) => {
    localStorage.setItem('tableNumber', tableNumber);
    navigate(`/${tableNumber}/home/`);
  };

  if (loading) {
    return (
      <div className={classes.container}>
        <div className={classes.content}>
          <h1 className={classes.title}>Variety Lounge</h1>
          <p className={classes.loadingMessage}>Preparing your experience...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.container}>
        <div className={classes.content}>
          <h1 className={classes.title}>Variety Lounge</h1>
          <p className={classes.errorMessage}>{error}</p>
          <p className={classes.fallbackMessage}>Default tables loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <h1 className={classes.title}>Welcome to Variety</h1>
        <p className={classes.subtitle}>Select your table to begin an exquisite experience</p>
        
        <div className={classes.buttonGrid}>
          {tables.map((table) => (
            <button
              key={table._id || table.tableNo}
              className={classes.tableButton}
              onClick={() => handleTableSelect(table.tableNo)}
            >
              <span className={classes.buttonText}>Table {table.tableNo}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Front;