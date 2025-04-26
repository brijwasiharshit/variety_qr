import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'top',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    fontFamily: "'Poppins', sans-serif",
    padding: '1rem',
  },
  content: {
    textAlign: 'center',
    padding: '2rem',
    maxWidth: '800px',
    width: '100%',
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '1rem',
    color: '#2c3e50',
    fontWeight: 700,
    background: 'linear-gradient(to right, #3498db, #2ecc71)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
    '@media (max-width: 768px)': {
      fontSize: '2.2rem',
    }
  },
  subtitle: {
    fontSize: '1.3rem',
    marginBottom: '2.5rem',
    color: '#7f8c8d',
    fontWeight: 400,
    '@media (max-width: 768px)': {
      fontSize: '1.1rem',
    }
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.2rem',
    margin: '0 auto',
    maxWidth: '600px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    }
  },
  tableButton: {
    padding: '1.5rem 0.5rem',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(145deg, #3498db, #2ecc71)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
    },
    '&:active': {
      transform: 'translateY(-1px)',
    },
    '@media (max-width: 768px)': {
      padding: '1.2rem 0.5rem',
      fontSize: '1.3rem',
    }
  },
  buttonText: {
    display: 'block',
    transition: 'all 0.3s ease',
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
          <h1 className={classes.title}>Loading Tables...</h1>
          <p className={classes.subtitle}>Please wait while we fetch available tables</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.container}>
        <div className={classes.content}>
          <h1 className={classes.title}>Error Loading Tables</h1>
          <p className={classes.subtitle}>{error}</p>
          <p>Using default tables</p>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <h1 className={classes.title}>Welcome to Variety</h1>
        <p className={classes.subtitle}>Please select your table number to begin</p>
        
        <div className={classes.buttonGrid}>
          {tables.map((table) => (
            <button
              key={table._id}
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