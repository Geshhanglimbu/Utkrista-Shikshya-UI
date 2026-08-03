import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiMenu, FiBell } from "react-icons/fi";
import { notificationService } from "../../services/api"; // ADJUST path to your api.js
import { initials } from "../utils/studentHelpers";
import "./TeacherNavbar.css";

function getCurrentTeacher() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function TeacherNavbar({ onMenuClick }) {
  const navigate = useNavigate();
  const teacher = getCurrentTeacher();
  const [search, setSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const teacherId = teacher?.userId ?? teacher?.id;
    if (!teacherId) return;

    notificationService
      .getUnreadCount(teacherId)
      .then((res) => setUnreadCount(res.data?.count ?? res.data ?? 0))
      .catch(() => setUnreadCount(0));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/teacher/students?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="tl-navbar">
      <button className="tl-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
        <FiMenu />
      </button>

      <form className="tl-navbar-search" onSubmit={handleSearchSubmit}>
        <FiSearch />
        <input
          type="text"
          placeholder="Search students, IDs, or courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      <div className="tl-navbar-right">
        <span className="tl-online-badge">
          <span className="tl-online-dot" /> Online
        </span>

        <button
          className="tl-bell-btn"
          onClick={() => navigate("/teacher/notifications")}
          aria-label="Notifications"
        >
          <FiBell />
          {unreadCount > 0 && <span className="tl-bell-badge">{unreadCount}</span>}
        </button>

        <div className="tl-navbar-divider" />

        <div className="tl-profile">
          <div className="tl-profile-text">
            <div className="tl-profile-name">{teacher?.fullName || teacher?.name || "Teacher"}</div>
            <div className="tl-profile-sub">
              {teacher?.currentFaculty ? `Current Faculty: ${teacher.currentFaculty}` : "Teacher"}
            </div>
          </div>
          {teacher?.avatar ? (
            <img src={teacher.avatar} alt="" className="tl-profile-avatar" />
          ) : (
            <div className="tl-profile-avatar tl-profile-avatar-fallback">
              {initials(teacher?.fullName || teacher?.name || "T")}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
