import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "./TeacherSidebar";
import TeacherNavbar from "./TeacherNavbar";
import "./TeacherLayout.css";

/**
 * Wrap all /teacher/* routes with this layout so the sidebar/navbar render
 * exactly once, e.g.:
 *
 *   <Route element={<TeacherLayout />}>
 *     <Route path="/teacher/students" element={<TeacherStudentManagement />} />
 *     <Route path="/teacher/students/:userId" element={<TeacherStudentDetails />} />
 *     ...other teacher routes
 *   </Route>
 */
export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="tl-shell">
      <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="tl-main">
        <TeacherNavbar onMenuClick={() => setSidebarOpen((v) => !v)} />
        <div className="tl-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
