// student/layouts/StudentLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";
import StudentNavbar from "../components/StudentNavbar";
import "./StudentLayout.css";

/**
 * StudentLayout
 * Shell layout for every student-facing route. Holds the collapsible
 * sidebar + top navbar and renders the active page via <Outlet />.
 */
const StudentLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <div className="student-shell">
      <StudentSidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={closeMobileSidebar}
      />

      {/* Overlay for mobile drawer */}
      {isMobileSidebarOpen && (
        <div
          className="student-shell__overlay"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      <div
        className={`student-shell__main ${
          isSidebarCollapsed ? "student-shell__main--collapsed" : ""
        }`}
      >
        <StudentNavbar
          onToggleSidebar={toggleSidebar}
          onToggleMobileSidebar={toggleMobileSidebar}
        />
        <main className="student-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
