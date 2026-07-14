import { Navigate, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, FolderKanban, FileStack, CreditCard,
  GraduationCap, Video, Image, Settings, LogOut, ChevronsLeft, ChevronsRight, BookOpenText
} from 'lucide-react'
import { useSidebar } from '../../admin/context/SidebarContext'
import './Sidebar.css'
import { useNavigate } from "react-router-dom";

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/categories', label: 'Categories', icon: FolderKanban },
  { to: '/admin/content', label: 'Content', icon: FileStack },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/live-classes', label: 'Live Classes', icon: Video },
  {to: '/admin/booking', label: 'Booking', icon: CreditCard},
  { to: '/admin/exam-management', label: 'Exam Management', icon: Image },
  { to: '/admin/grading', label: 'Grading', icon: GraduationCap },
  { to: '/admin/settings', label: 'Settings', icon: Settings },

]

export default function Sidebar() {

  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar()
  const navigate = useNavigate();
  return (
    <>
      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`}>
        <div className="sidebar__brand">
          <span className="sidebar__logo"><BookOpenText size={20} /></span>
          {!collapsed && (
            <div className="sidebar__brand-text">
              <strong>Utkrista Shikshya</strong>
              <span>Admin Console</span>
            </div>
          )}
        </div>

        <nav className="sidebar__nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
            >
              <Icon size={19} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <button className="sidebar__link sidebar__logout"
           onClick={() => navigate("/")}
           >
            <LogOut size={19} />
            {!collapsed && <span>Logout</span>}
          </button>
          <button className="sidebar__collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>
      </aside>
    </>
  )
}
