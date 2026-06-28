import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/admin/Sidebar'
import Navbar from '../../components/admin/Navbar'
import { useSidebar } from '../context/SidebarContext'
import './AdminLayout.css'

export default function AdminLayout() {
  const { collapsed } = useSidebar()

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className={`admin-layout__main ${collapsed ? 'is-collapsed' : ''}`}>
        <Navbar />
        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
