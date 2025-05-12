import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, LogIn } from "react-feather";
import "./Login.css";

export default function Login() {
  const host = process.env.REACT_APP_HOST;
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    console.log("Submit called!");
  
    try {
      const response = await fetch(`${host}/api/user/login`, {
        method: "POST",
        credentials: 'include', 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      }); 
  
      const data = await response.json();
     
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }
  
    
      if (data.user.role === "Admin") {
        navigate("/admin");
      } else if (data.user.role === "Kitchen") {

        navigate("/kitchen");
      } else {
        throw new Error("Invalid role, contact support.");
      }
  
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-icon">
            <Lock size={32} />
          </div>
          <h1>Welcome Back</h1>
          <p>Please enter your credentials to login</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">
              <Mail size={18} />
              <span>Email Address</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={credentials.email}
              onChange={onChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">
              <Lock size={18} />
              <span>Password</span>
            </label>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={credentials.password}
                onChange={onChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

       
      </div>
    </div>
  );
}