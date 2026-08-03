// teacherMenuConfig.js
import {
  FiGrid,
  FiBookOpen,
  FiFileText,
  FiClipboard,
  FiVideo,
  FiUsers,
  FiBell,
  FiUser,
  FiSettings,
} from "react-icons/fi";

export const TEACHER_MENU_ITEMS = [
  { label: "Dashboard", icon: FiGrid, path: "/teacher/dashboard" },
  { label: "My Faculties", icon: FiBookOpen, path: "/teacher/faculties" },
  { label: "Content Management", icon: FiFileText, path: "/teacher/content" },
  { label: "Exam Management", icon: FiClipboard, path: "/teacher/exams" },
  { label: "Live Classes", icon: FiVideo, path: "/teacher/live-classes" },
  { label: "Student Management", icon: FiUsers, path: "/teacher/students" },
  { label: "Notifications", icon: FiBell, path: "/teacher/notifications" },
  { label: "Profile", icon: FiUser, path: "/teacher/profile" },
  { label: "Settings", icon: FiSettings, path: "/teacher/settings" },
];
