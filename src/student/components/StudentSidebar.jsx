// student/components/StudentSidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  FileText,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  X,
  GraduationCap,
} from "lucide-react";
import "./StudentSidebar.css";

const NAV_ITEMS = [
  { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/browse-courses", label: "Browse Courses", icon: Compass },
  { to: "/student/my-courses", label: "My Courses", icon: BookOpen },
  { to: "/student/exams", label: "Exams", icon: FileText },
  { to: "/student/notifications", label: "Notifications", icon: Bell },
  { to: "/student/profile", label: "Profile", icon: User },
  { to: "/student/settings", label: "Settings", icon: Settings },
];

/**
 * StudentSidebar
 * Desktop: collapsible (icon-only vs full-width).
 * Mobile: slide-in drawer controlled by isMobileOpen.
 */
const StudentSidebar = ({ isCollapsed, isMobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Adjust to match existing auth logic (token key, context, etc.)
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside
      className={`student-sidebar ${
        isCollapsed ? "student-sidebar--collapsed" : ""
      } ${isMobileOpen ? "student-sidebar--mobile-open" : ""}`}
    >
      <div className="student-sidebar__header">
        <div className="student-sidebar__brand">
          <span className="student-sidebar__brand-icon">
            <GraduationCap size={22} />
          </span>
          {!isCollapsed && (
            <div className="student-sidebar__brand-text">
              <h1>Utkrista Shikshya</h1>
              <p>Student Portal</p>
            </div>
          )}
        </div>
        <button
          className="student-sidebar__mobile-close"
          onClick={onCloseMobile}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="student-sidebar__nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `student-sidebar__link ${
                isActive ? "student-sidebar__link--active" : ""
              }`
            }
            title={isCollapsed ? label : undefined}
          >
            <Icon size={19} className="student-sidebar__link-icon" />
            {!isCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button className="student-sidebar__logout" onClick={handleLogout}>
        <LogOut size={19} />
        {!isCollapsed && <span>Logout</span>}
      </button>
    </aside>
  );
};

export default StudentSidebar;
