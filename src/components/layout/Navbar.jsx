import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "../common/Button";

const IconLayers = ({ size = 18 }) => (
  <img
    src="/logo.jpeg"
    alt="Logo"
    width={size}
    height={size}
    onError={(e) => { e.target.src = "https://via.placeholder.com/34"; }}
  />
);

const IconSearch = ({ size = 15, color = "#6B7280" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
    <path d="m21 21-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 12h18M3 6h18M3 18h18" stroke="#0D1B2A" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navLinks = [
    { label: "Courses", path: "/courses" },
    { label: "Categories", path: "/categories" },
    { label: "Instructors", path: "/instructors" },
    { label: "About", path: "/about" }
  ];

  return (
    <nav className="navbar">
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon">
            <IconLayers size={34}/>
          </div>
          <span className="navbar__logo-text">
            Utkrista <span>Shikshya</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {navLinks.map((item) => (
            <Link 
              key={item.label} 
              to={item.path} 
              className={`navbar__link ${location.pathname === item.path ? 'navbar__link--active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
          
        
        </div>

        {/* Search */}
        <div className="navbar__search">
          <IconSearch size={15} />
          <input placeholder="Search courses…" />
        </div>

        {/* Auth buttons */}
        <div className="navbar__auth">
          <button className="navbar__login" onClick={() => navigate("/login")}>
            Log in
          </button>
          <Button size="sm" onClick={() => navigate("/register")}>
            Sign up
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <IconMenu />
        </button>
      </div>
    </nav>
  );
}
