// student/components/StudentNavbar.jsx
import { useEffect, useState } from "react";
import { Menu, Bell, Crown } from "lucide-react";
import SearchBar from "./SearchBar";
import "./StudentNavbar.css";

/**
 * StudentNavbar
 * Top bar shown on every student page. Includes the global search bar,
 * notification bell, and the logged-in student's identity.
 *
 * `student` would normally come from an auth/user context — replace the
 * placeholder fetch below with your real auth hook (e.g. useAuth()).
 */
const StudentNavbar = ({ onToggleSidebar, onToggleMobileSidebar }) => {
  const [student, setStudent] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Replace with real user context / profile API call.
    const cached = JSON.parse(localStorage.getItem("student") || "null");
    setStudent(
      cached || {
        name: "Student",
        plan: "Free Plan",
        avatarUrl: null,
        isPremium: false,
      }
    );
  }, []);

  const handleSearch = (query) => {
    // Bubble search up — BrowseCourses page listens via query param, or
    // lift this into context if search should work from any page.
    console.log("Global search:", query);
  };

  return (
    <header className="student-navbar">
      <button
        className="student-navbar__menu-btn student-navbar__menu-btn--desktop"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>
      <button
        className="student-navbar__menu-btn student-navbar__menu-btn--mobile"
        onClick={onToggleMobileSidebar}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="student-navbar__search">
        <SearchBar
          placeholder="Search for lessons, courses, or mentors..."
          onSearch={handleSearch}
        />
      </div>

      <div className="student-navbar__actions">
        <button className="student-navbar__bell" aria-label="Notifications">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="student-navbar__bell-dot">{unreadCount}</span>
          )}
        </button>

        <div className="student-navbar__profile">
          <div className="student-navbar__avatar">
            {student?.avatarUrl ? (
              <img src={student.avatarUrl} alt={student.name} />
            ) : (
              <span>{student?.name?.[0]?.toUpperCase() || "S"}</span>
            )}
          </div>
          <div className="student-navbar__identity">
            <p className="student-navbar__name">{student?.name}</p>
            <p className="student-navbar__plan">
              {student?.isPremium && <Crown size={12} />}
              {student?.plan || "Free Plan"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudentNavbar;
