import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../common/Button";


const IconSearch = ({ size = 15, color = "#6B7280" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
    <path d="m21 21-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconArrowRight = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconLayers = ({ size = 18 }) => (
  <img
    src="/logo.jpeg"
    alt="Logo"
    width={size}
    height={size}
    onError={(e) => { e.target.src = "https://via.placeholder.com/34"; }}
  />
);

export function HeroBanner() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero__inner container">
        {/* Left text column */}
        <div className="hero__left">
          <div className="hero__eyebrow">
            <span className="badge-dot" />
            <span>Nepal's Leading E-Learning Platform</span>
          </div>

          <h1 className="hero__heading font-display">
            Learn Skills That<br />
            <span className="hero__heading-highlight">Shape</span> Your<br />
            Future
          </h1>

          <p className="hero__description">
            Join 10,000+ students mastering real-world skills with expert-led
            courses in development, design, and academics.
          </p>

          <div className="hero__cta-row">
            <Button onClick={() => navigate("/register")}>
              Start Learning <IconArrowRight size={16} />
            </Button>
            <Button variant="outline" onClick={() => navigate("/courses")}>
              Explore Courses
            </Button>
          </div>

          {/* Quick search */}
          <div className="hero__search-bar">
            <div className="hero__search-bar-icon">
              <IconSearch size={15} />
            </div>
            <input placeholder="Search 'MERN Stack', 'Mathematics'…" />
            <button className="btn btn-primary btn-sm">Search</button>
          </div>
        </div>

        {/* Right card column */}
        <div className="hero__right">
          <div className="hero__card-wrap">
            <div className="hero__course-card">
              <div className="hero__card-header">
                <div className="hero__card-header-deco1" />
                <div className="hero__card-header-deco2" />

                <div className="hero__card-brand">
                  <div className="hero__card-brand-icon">
                    <IconLayers size={34} />
                  </div>
                  <span>Utkrista Shikshya</span>
                </div>

                <div className="hero__card-tagline">
                  Quality Education, Affordable Excellence
                </div>

                <div className="hero__card-title">
                  Basic Website<br />
                  <span className="hero__card-title-accent">Development</span>
                  <span className="hero__card-title-course">COURSE</span>
                </div>
              </div>

              <div className="hero__card-body">
                <button className="hero__card-cta">BOOK YOUR SEAT NOW</button>
                <div className="hero__card-limited">⏰ LIMITED TIME</div>
                {[
                  { icon: "✅", text: "Real world projects" },
                  { icon: "🎓", text: "Certification" },
                  { icon: "💼", text: "Internship" },
                ].map(({ icon, text }) => (
                  <div key={text} className="hero__card-feature">
                    <span>{icon}</span> {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
