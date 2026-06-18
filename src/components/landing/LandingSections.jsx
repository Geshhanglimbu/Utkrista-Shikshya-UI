import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../common/Button";

/* ── HELPERS ── */
const IconArrowRight = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconClock = ({ size = 12, color = "#6B7280" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ── STATS BAR ── */
export function StatsBar() {
  const stats = [
    { icon: "👥", value: "10,000+", label: "Enrolled Students" },
    { icon: "📚", value: "500+",    label: "Expert Courses" },
    { icon: "🏆", value: "150+",    label: "Certified Instructors" },
    { icon: "📈", value: "98%",     label: "Success Rate" },
  ];

  return (
    <section className="stats">
      <div className="stats__grid container">
        {stats.map(({ icon, value, label }) => (
          <div key={label} className="stats__item">
            <div className="stats__icon">{icon}</div>
            <div>
              <div className="stats__value">{value}</div>
              <div className="stats__label">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── FEATURED COURSES ── */
function CourseCard({ thumbClass, emoji, tagLabel, tagClass, title, instructor, avatar, rating, reviews, hours }) {
  return (
    <div className="course-card">
      <div className={`course-card__thumb ${thumbClass}`}>
        <span className="course-card__thumb-icon">{emoji}</span>
        <div className="course-card__thumb-tag">
          <span className={`tag ${tagClass}`}>{tagLabel}</span>
        </div>
      </div>
      <div className="course-card__body">
        <h3 className="course-card__title">{title}</h3>
        <div className="course-card__instructor">
          <span className="course-card__avatar">{avatar}</span>
          <span className="course-card__instructor-name">{instructor}</span>
        </div>
        <div className="course-card__meta">
          <div className="course-card__rating">
            <span className="star">★</span> {rating} <span>({reviews})</span>
          </div>
          <span className="course-card__hours"><IconClock size={12} /> {hours}h</span>
        </div>
      </div>
    </div>
  );
}

export function FeaturedCourses() {
  const courses = [
    { thumbClass: "course-card__thumb--dev", emoji: "💻", tagLabel: "Development", tagClass: "tag-dev", title: "MERN Stack Development: Master the Full Stack", instructor: "Anish Shrestha", avatar: "👨", rating: "4.8", reviews: "1.3k", hours: 45 },
    { thumbClass: "course-card__thumb--design", emoji: "🎨", tagLabel: "Design", tagClass: "tag-design", title: "Mastering UI/UX Design: Principles & Practice", instructor: "Priya Thapa", avatar: "👩", rating: "4.8", reviews: "850", hours: 30 },
    { thumbClass: "course-card__thumb--academic", emoji: "📐", tagLabel: "Academic", tagClass: "tag-academic", title: "Grade XII Mathematics: Complete Guide", instructor: "Dr. Ramesh Kunwar", avatar: "👨‍🏫", rating: "4.7", reviews: "2.5k", hours: 60 },
    { thumbClass: "course-card__thumb--cs", emoji: "🐍", tagLabel: "Computer Science", tagClass: "tag-cs", title: "Advanced Computer Science with Python", instructor: "Sushant Bajracharya", avatar: "👨‍💻", rating: "4.8", reviews: "1.5k", hours: 40 },
  ];

  return (
    <section className="section-padding">
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured Courses</h2>
            <p className="section-subtitle">Hand-picked courses from industry experts.</p>
          </div>
          <Link to="/courses" className="btn btn-outline btn-sm">
            View All Courses <IconArrowRight size={16} />
          </Link>
        </div>
        <div className="courses-grid">
          {courses.map(c => <CourseCard key={c.title} {...c} />)}
        </div>
      </div>
    </section>
  );
}

/* ── CATEGORIES ── */
export function Categories() {
  const cats = [
    { icon: "🌐", label: "Web Development",  count: "84 Courses" },
    { icon: "📱", label: "Mobile Apps",       count: "52 Courses" },
    { icon: "🎨", label: "UX Design",         count: "38 Courses" },
    { icon: "➗", label: "Mathematics",       count: "61 Courses" },
    { icon: "💻", label: "Computer Science",  count: "47 Courses" },
    { icon: "📊", label: "Business",          count: "29 Courses" },
  ];

  return (
    <section className="section-padding" style={{ background: 'var(--bg-light)' }}>
      <div className="container">
        <div className="section-header section-header--center">
          <h2 className="section-title">Explore Categories</h2>
          <p className="section-subtitle">Find the perfect path for your learning journey.</p>
        </div>
        <div className="categories-grid">
          {cats.map(cat => (
            <div key={cat.label} className="category-card">
              <div className="category-card__icon">{cat.icon}</div>
              <div className="category-card__label">{cat.label}</div>
              <div className="category-card__count">{cat.count}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── TESTIMONIALS ── */
export function Testimonials() {
  const testimonials = [
    { quote: "The MERN stack course completely transformed my career path in just 4 months.", name: "Rahul Khatri", role: "Frontend Developer", avatar: "👨" },
    { quote: "Finally found quality education that is actually affordable for students.", name: "Sita Sharma", role: "Grade XII Student", avatar: "👩" },
    { quote: "The project-based learning approach is what sets this platform apart from others.", name: "Binod Adhikari", role: "Product Manager", avatar: "👨‍💼" },
  ];

  return (
    <section className="section-padding">
      <div className="container">
        <div className="section-header section-header--center">
          <h2 className="section-title">What Our Students Say</h2>
          <p className="section-subtitle">Real stories from our global community of learners.</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map(t => (
            <div key={t.name} className="testimonial-card">
              <p className="testimonial-card__text">"{t.quote}"</p>
              <div className="testimonial-card__author">
                <span className="testimonial-card__avatar">{t.avatar}</span>
                <div>
                  <div className="testimonial-card__name">{t.name}</div>
                  <div className="testimonial-card__role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA BANNER ── */
export function CTABanner() {
  return (
    <section className="section-padding">
      <div className="container">
        <div className="cta-banner">
          <h2 className="cta-banner__title">Ready to Start Your<br />Learning Journey?</h2>
          <div className="cta-banner__actions">
            <Button size="lg" className="btn-white">Join for Free</Button>
            <Button size="lg" variant="outline" className="btn-outline-white">Browse All Courses</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
