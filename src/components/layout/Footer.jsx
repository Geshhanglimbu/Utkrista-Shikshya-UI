import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../common/Button";

const IconLayers = ({ size = 16, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Footer() {
  const platformLinks = [
    { label: "All Courses", path: "/courses" },
    { label: "Learning Paths", path: "/paths" },
    { label: "For Business", path: "/business" },
    { label: "Become Instructor", path: "/teach" }
  ];
  const supportLinks = [
    { label: "Help Center", path: "/help" },
    { label: "Terms of Service", path: "/terms" },
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Contact Us", path: "/contact" }
  ];
  const socials = [
    { label: "f", path: "#" },
    { label: "in", path: "#" },
    { label: "𝕏", path: "#" },
    { label: "▶", path: "#" },
  ];

  return (
    <footer className="footer">
      <div className="footer__grid container">
        {/* Brand column */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <div className="footer__logo-icon">
              <IconLayers size={16} color="#fff" />
            </div>
            <span className="footer__logo-text">Utkrista Shikshya</span>
          </Link>
          <p className="footer__brand-desc">
            Empowering students and professionals with world-class education
            and industry-relevant skills.
          </p>
          <div className="footer__socials">
            {socials.map((s, i) => (
              <a key={i} href={s.path} className="footer__social-btn">{s.label}</a>
            ))}
          </div>
        </div>

        {/* Platform links */}
        <div className="footer__links-col">
          <h4 className="footer__col-title">Platform</h4>
          {platformLinks.map((l) => (
            <Link key={l.label} to={l.path} className="footer__link">{l.label}</Link>
          ))}
        </div>

        {/* Support links */}
        <div className="footer__links-col">
          <h4 className="footer__col-title">Support</h4>
          {supportLinks.map((l) => (
            <Link key={l.label} to={l.path} className="footer__link">{l.label}</Link>
          ))}
        </div>

        {/* Newsletter */}
        <div className="footer__newsletter">
          <h4 className="footer__col-title">Stay Updated</h4>
          <p className="footer__newsletter-text">
            Get the latest courses and updates in your inbox.
          </p>
          <form className="footer__newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              className="footer__newsletter-input"
              placeholder="Your email address"
              type="email"
              required
            />
            <Button type="submit" size="sm">Subscribe</Button>
          </form>
        </div>
      </div>

      <div className="footer__bottom container">
        <span className="footer__copy">
          © 2026 Utkrista Shikshya. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
