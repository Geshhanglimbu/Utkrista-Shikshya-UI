import React from 'react';
import './HeroBanner.css';

function HeroBanner() {
    return(
        <div className="hero-banner">
            <div className="hero-content">
                <div className="hero-logo">
                    <span className = "logo-icon"> ------</span>
                 <div>
                    <h1>Utkrista Shikshya</h1>
                    <p>"Quality Education, Affordable Excellence"</p>
                    </div>   
            </div>
            <h2 className = "prebooking-text">Prebooking Open</h2>
            <h3 className = "NEB">NEB</h3>
            <h3 className = "management-text">XII MANAGEMENT</h3>

            <button className = "prebook-btn">Prebook Now</button>

            </div>
            <div className="hero-right">
        <div className="blue-shape"></div>
        <img
          src={"#"}
          alt="student"
          className="student-img"
        />
      </div>
        </div>
    )
}
export default HeroBanner;
