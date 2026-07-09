import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Registration from "./pages/Registration";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminLayout from "./admin/layouts/AdminLayout";
import AdminDashboard from "./admin/pages/Dashboard";
import { SidebarProvider } from "./admin/context/SidebarContext";
import Categories from "./admin/pages/Categories";
import Users from "./admin/pages/Users";
import Content from "./admin/pages/Content";
import Payments from "./admin/pages/Payments";
import Grading from "./admin/pages/Grading";
import LiveClasses from "./admin/pages/LiveClasses";
import Settings from "./admin/pages/Settings";
import ContentDetails from "./admin/pages/ContentDetails"
import CategoryContent from "./admin/pages/CategoryContent"; // Import the new component


function App() {
  return (
    <SidebarProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />

          {/* Admin routes — wrapped inside AdminLayout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/:id/content" element={<CategoryContent />} />
             <Route path="users" element={<Users />} />
             <Route path="content" element = {<Content />} />
            <Route path="content/:id" element={<ContentDetails />} />
             <Route path="payments" element = {<Payments />} />
             <Route path="grading"  element = {<Grading />} />
             <Route path="live-classes" element={<LiveClasses/>} />
             <Route path="settings" element={<Settings />} />

            {/* later: users, payments, categories, etc. add here */}
          </Route>
        </Routes>
      </BrowserRouter>
    </SidebarProvider>
  );
}

export default App;