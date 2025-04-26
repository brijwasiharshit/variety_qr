import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./Carousel.css";
import Navbar from "./Navbar";

export default function Carousel({ setSearchQuery, searchQuery }) {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      {/* Navbar at the very top with zero margin */}
      <Navbar />
      
      <div className="content-container">
        <div className="carousel-container position-relative d-flex flex-column align-items-center">
          {/* 🔍 Search Bar with Button */}
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control search-bar"
              placeholder="Search for food..."
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
            />
            <button className="search-button">Search</button>
          </div>

          {/* Show Menu Button */}
          <button 
            className="btn btn-warning my-3 py-2 px-4 fw-bold" 
            onClick={() => navigate('/menu')}
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
              border: "none"
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
              className="carousel slide carousel-fade custom-carousel"
              data-bs-ride="carousel"
              data-bs-interval="500"
            >
              <div className="carousel-inner">
                <div className="carousel-item">
                  <img
                    src="https://media.istockphoto.com/id/922783734/photo/assorted-indian-recipes-food-various.jpg?s=612x612&w=0&k=20&c=p8DepvymWfC5j7c6En2UsQ6sUM794SQMwceeBW3yQ9M="
                    className="d-block w-100 carousel-img"
                    alt="Indian food assortment"
                    data-bs-interval="500" 
                  />
                </div>
                <div className="carousel-item active">
                  <img
                    src="https://i.postimg.cc/j5PmSvWG/Home.png"
                    alt="Delicious food"
                    className="d-block w-100 carousel-img"
                    data-bs-interval="500" 
                  />
                </div>
                <div className="carousel-item">
                  <img
                    src="https://static.toiimg.com/photo/94078477.cms"
                    className="d-block w-100 carousel-img"
                    alt="Tasty dishes"
                  />
                </div>
              </div>

              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#carouselExampleFade"
                data-bs-slide="prev"
              >
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#carouselExampleFade"
                data-bs-slide="next"
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