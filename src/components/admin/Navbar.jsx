import { Search, Bell, Menu, ChevronDown } from 'lucide-react'
import { useSidebar } from '../../admin/context/SidebarContext'
import './Navbar.css'

export default function Navbar() {
  const { setMobileOpen } = useSidebar()

  return (
    <header className="navbar">
      <button className="navbar__menu-btn" onClick={() => setMobileOpen(true)}>
        <Menu size={20} />
      </button>

      <div className="navbar__search">
        <Search size={18} />
        <input type="text" placeholder="Search students, teachers, or courses..." />
      </div>

      <div className="navbar__right">
        <button className="navbar__icon-btn">
          <Bell size={20} />
          <span className="navbar__dot" />
        </button>
        <div className="navbar__profile">
          <span className="navbar__avatar">AU</span>
          <div className="navbar__profile-text">
            <strong>Admin User</strong>
            <span>Super Admin</span>
          </div>
          <ChevronDown size={16} className="text-muted" />
        </div>
      </div>
    </header>
  )
}
