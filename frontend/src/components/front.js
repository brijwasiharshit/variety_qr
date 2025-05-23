import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#F5F5F0', // Soft cream background
    fontFamily: "'Playfair Display', serif",
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '40%',
      background: '#E8E4D9', // Darker cream accent
      zIndex: 0,
      transform: 'skewY(-4deg)',
      transformOrigin: 'top left',
    }
  },
  content: {
    textAlign: 'center',
    padding: '4rem 3rem',
    maxWidth: '900px',
    width: '100%',
    background: '#FFFDF7', // Pure cream white
    borderRadius: '16px',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.08)',
    position: 'relative',
    zIndex: 1,
    border: '1px solid rgba(0, 0, 0, 0.05)',
    color: '#5A4A42', // Earthy brown text
  },
  title: {
    fontSize: '3.5rem',
    marginBottom: '1.5rem',
    fontWeight: 700,
    color: '#3A332E', // Dark chocolate
    position: 'relative',
    '&::after': {
      content: '""',
      display: 'block',
      width: '80px',
      height: '4px',
      background: '#D4A76A', // Gold accent
      margin: '1rem auto',
      borderRadius: '2px'
    },
    '@media (max-width: 768px)': {
      fontSize: '2.8rem',
    }
  },
  subtitle: {
    fontSize: '1.3rem',
    marginBottom: '3rem',
    fontWeight: 400,
    color: '#7D6E63', // Lighter brown
    lineHeight: 1.6,
    '@media (max-width: 768px)': {
      fontSize: '1.1rem',
      marginBottom: '2.5rem',
    }
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
    margin: '0 auto',
    maxWidth: '800px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1.2rem',
    }
  },
  tableButton: {
    padding: '1.8rem 0.5rem',
    fontSize: '1.5rem',
    fontWeight: '600',
    background: '#FFFDF7',
    color: '#5A4A42',
    border: '1px solid #E8E4D9',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, rgba(212,167,106,0.1) 0%, rgba(255,255,255,0) 100%)',
      zIndex: 0,
    },
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      borderColor: '#D4A76A',
      '& span': {
        transform: 'scale(1.05)',
      }
    },
    '&:active': {
      transform: 'translateY(-2px)',
    },
    '@media (max-width: 768px)': {
      padding: '1.5rem 0.5rem',
      fontSize: '1.3rem',
    }
  },
  buttonText: {
    display: 'block',
    transition: 'all 0.3s ease',
    position: 'relative',
    zIndex: 1,
  },
  loadingMessage: {
    color: '#7D6E63',
    fontSize: '1.3rem',
    marginTop: '2rem',
    fontStyle: 'italic',
  },
  errorMessage: {
    color: '#C17C74', // Soft red
    fontSize: '1.3rem',
    marginTop: '2rem',
    fontWeight: 500,
  },
  fallbackMessage: {
    color: '#A89B8C',
    fontSize: '1.1rem',
    marginTop: '1rem',
  },
  decorativeElement: {
    position: 'absolute',
    width: '150px',
    height: '150px',
    background: 'rgba(212,167,106,0.1)',
    borderRadius: '50%',
    zIndex: 0,
    '&:nth-child(1)': {
      top: '-50px',
      left: '-50px',
    },
    '&:nth-child(2)': {
      bottom: '-30px',
      right: '-30px',
    }
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
      <div className={classes.decorativeElement} />
      <div className={classes.decorativeElement} />
      
      <div className={classes.content}>
        
        
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