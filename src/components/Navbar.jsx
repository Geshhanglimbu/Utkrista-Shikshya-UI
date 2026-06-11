
import React, { useState } from 'react';
import './Navbar.css';

function Navbar() {
  

  return (
    <nav className="navbar">
        <div className="nav-left">
            <div className="logo">
              <span>----</span>
              <span>उत्कृष्ट शिक्षा</span>
            </div>

            <input
            type = "text"
            placeholder="Search for courses"
            className="search-input"
            />
        </div>
        <div className="nav-right">
            <div className = "nav-links">
                <a href = "#">Courses</a>
                <a href = "#">About Us</a>
                <a href = "#">Articles</a>
                <a href = "#">Contact</a>
                <div className="nav-auth-mobile">
                  <button className="login-btn">Login</button>
                  <button className="signup-btn">Sign Up</button>
                </div>
            </div>
            <div className="nav-auth">
                <button className="login-btn">Login</button>
                <button className="signup-btn">Sign Up</button>
            </div>
            
        </div>
    </nav>
  );
}
export default Navbar;