import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Registration from "./pages/Registration";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { SidebarProvider } from "./admin/context/SidebarContext";
import ProtectedRoute from "./components/ProtectedRoute";

// ====================
// Admin
// ====================
import AdminLayout from "./admin/layouts/AdminLayout";
import AdminDashboard from "./admin/pages/Dashboard";
import Categories from "./admin/pages/Categories";
import Users from "./admin/pages/Users";
import Content from "./admin/pages/Content";
import Payments from "./admin/pages/Payments";
import Grading from "./admin/pages/Grading";
import LiveClasses from "./admin/pages/LiveClasses";
import Settings from "./admin/pages/Settings";
import ContentDetails from "./admin/pages/ContentDetails";
import CategoryContent from "./admin/pages/CategoryContent";
import ExamManagement from "./admin/pages/ExamManagement";
import Booking from "./admin/pages/Booking";

// ====================
// Student
// ====================
import StudentLayout from "./student/layouts/StudentLayout";
import StudentDashboard from "./student/pages/Dashboard";
import BrowseCourses from "./student/pages/BrowseCourses";

// ====================
// Teacher
// ====================
// import TeacherLayout from "./teacher/layouts/TeacherLayout";
// import TeacherDashboard from "./teacher/pages/Dashboard";

function App() {
  return (
    <SidebarProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />

        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />

          {/* ================= ADMIN ROUTES ================= */}
          <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="categories" element={<Categories />} />
              <Route
                path="categories/:id/content"
                element={<CategoryContent />}
              />
              <Route path="content" element={<Content />} />
              <Route path="content/:id" element={<ContentDetails />} />
              <Route path="payments" element={<Payments />} />
              <Route path="grading" element={<Grading />} />
              <Route path="live-classes" element={<LiveClasses />} />
              <Route path="exam-management" element={<ExamManagement />} />
              <Route path="booking" element={<Booking />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* ================= STUDENT ROUTES ================= */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["ROLE_NORMAL"]}
              />
            }
          >
            <Route path="/student" element={<StudentLayout />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="browse-courses" element={<BrowseCourses />} />
            </Route>
          </Route>

          {/* ================= TEACHER ROUTES ================= */}
          {/* <Route element={<ProtectedRoute allowedRoles={["TEACHER"]} />}>
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route path="dashboard" element={<TeacherDashboard />} />
            </Route>
          </Route> */}
        </Routes>
      </BrowserRouter>
    </SidebarProvider>
  );
}

export default App;