
import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./Carousel.css";
import Navbar from "./Navbar";

export default function Carousel({ setSearchQuery, searchQuery }) {
  const navigate = useNavigate();

  return (
    <div className="page-container" style={{ 
      padding: 0, 
      margin: 0,
      overflowX: 'hidden'
    }}>
      {/* Navbar at the very top with zero margin */}
      <Navbar />
      
      <div className="content-container" style={{ 
        padding: '15px',
        marginTop: '15px',
        width: '100%',
        maxWidth: '1200px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <div className="carousel-container position-relative d-flex flex-column align-items-center" 
          style={{ gap: '15px' }}>
          
          {/* 🔍 Search Bar with Button */}
          <div className="search-wrapper d-flex w-100" style={{ 
            maxWidth: '600px',
            marginBottom: '10px'
          }}>
            <input
              type="text"
              className="form-control search-bar flex-grow-1"
              placeholder="Search for food..."
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              style={{
                padding: '12px 15px',
                borderRadius: '8px 0 0 8px',
                fontSize: '1rem',
                borderRight: 'none'
              }}
            />
            <button className="search-button" style={{
              padding: '12px 20px',
              borderRadius: '0 8px 8px 0',
              border: '1px solid #ced4da',
              borderLeft: 'none',
              backgroundColor: '#f8f9fa',
              fontWeight: '500'
            }}>
              Search
            </button>
          </div>

          {/* Show Menu Button */}
          <button 
            className="btn btn-warning fw-bold" 
            onClick={() => navigate('/menu')}
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
              border: "none",
              padding: "12px 24px",
              fontSize: "1rem",
              marginBottom: "20px",
              width: 'auto'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Show Menu
          </button>

          {/* Carousel - Only shown when search query is empty */}
          {searchQuery === "" && (
            <div
              id="carouselExampleFade"
              className="carousel slide carousel-fade w-100"
              data-bs-ride="carousel"
              data-bs-interval="500"
              style={{
                borderRadius: '0',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                margin: '0 -15px' // Negative margin for full width on mobile
              }}
            >
     

              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#carouselExampleFade"
                data-bs-slide="prev"
                style={{ width: '15%' }}
              >
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#carouselExampleFade"
                data-bs-slide="next"
                style={{ width: '15%' }}
              >
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}