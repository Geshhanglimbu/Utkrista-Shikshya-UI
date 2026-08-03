import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiPlus, FiBookOpen,FiLogOut } from "react-icons/fi";
import { TEACHER_MENU_ITEMS } from "../utils/teacherMenuConfig";
import "./TeacherSidebar.css";

/**
 * isOpen / onClose control the slide-in behavior on mobile/tablet (<1024px).
 * On desktop the sidebar is always visible and these props are unused.
 */
export default function TeacherSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const handleLogout = () => {
  // Clear authentication data
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("roles");

  // Or, if you want to clear everything:
  // localStorage.clear();

  navigate("/login", { replace: true });
};

  return (
    <>
      {isOpen && <div className="tl-sidebar-backdrop" onClick={onClose} />}

      <aside className={`tl-sidebar ${isOpen ? "tl-sidebar-open" : ""}`}>
        <div className="tl-brand">
          <div className="tl-brand-icon">
            <FiBookOpen />
          </div>
          <div>
            <div className="tl-brand-name">Utkrista Shikshya</div>
            <div className="tl-brand-eyebrow">Teacher Panel</div>
          </div>
        </div>

        <nav className="tl-nav">
          {TEACHER_MENU_ITEMS.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => `tl-nav-item ${isActive ? "tl-nav-item-active" : ""}`}
            >
              <Icon className="tl-nav-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

       <div className="tl-sidebar-footer">

          <button
            className="tl-logout-btn"
            onClick={handleLogout}
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
