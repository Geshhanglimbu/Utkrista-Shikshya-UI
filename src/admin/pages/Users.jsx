import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Eye, Pencil, Trash2, UserCog, UserPlus, UserMinus, ShieldOff, Plus, Download } from 'lucide-react'
import SearchBar from '../../components/admin/SearchBar'
import Dropdown from '../../components/admin/Dropdown'
import Table from '../../components/admin/Table'
import Pagination from '../../components/admin/Pagination'
import Badge from '../../components/admin/Badge'
import Drawer from '../../components/admin/Drawer'
import Modal from '../../components/admin/Modal'
import { usersData, collegesList } from '../utils/dummyData'
import './Users.css'

const PAGE_SIZE = 5

export default function Users() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [college, setCollege] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = useMemo(() => {
    return usersData.filter((u) => {
      const matchesSearch = `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
      const matchesRole = !role || u.role === role
      const matchesStatus = !status || u.status === status
      const matchesCollege = !college || u.college === college
      return matchesSearch && matchesRole && matchesStatus && matchesCollege
    })
  }, [search, role, status, college])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = () => {
    toast.success(`${confirmDelete.name} removed successfully`)
    setConfirmDelete(null)
  }

  const columns = [
    {
      key: 'name', header: 'User Profile',
      render: (u) => (
        <div className="user-cell">
          <span className="user-cell__avatar">{u.avatar}</span>
          <div>
            <strong>{u.name}</strong>
            <span>{u.email}</span>
          </div>
        </div>
      ),
    },
    { key: 'college', header: 'Institution' },
    { key: 'role', header: 'Role', render: (u) => <Badge status={u.role === 'Teacher' ? 'Active' : 'Pending'}>{u.role}</Badge> },
    { key: 'status', header: 'Status', render: (u) => <Badge status={u.status} /> },
    { key: 'joined', header: 'Joined' },
    { key: 'lastLogin', header: 'Last Login' },
    {
      key: 'actions', header: 'Actions',
      render: (u) => (
        <div className="row-actions">
          <button className="btn-icon" title="View" onClick={() => setSelectedUser(u)}><Eye size={15} /></button>
          <button className="btn-icon" title="Edit" onClick={() => toast.info(`Editing ${u.name}`)}><Pencil size={15} /></button>
          <button className="btn-icon" title="Change Role" onClick={() => toast.info(`Change role for ${u.name}`)}><UserCog size={15} /></button>
          <button className="btn-icon" title="Delete" onClick={() => setConfirmDelete(u)}><Trash2 size={15} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="users-page">
      <div className="page-head">
        <div>
          <h1>User Management</h1>
          <p>Manage students, teachers, and platform-wide roles and access control.</p>
        </div>
        <div className="users-page__actions">
          <button className="btn btn-outline"><Download size={15} /> Export CSV</button>
          <button className="btn btn-primary"><Plus size={15} /> Register New User</button>
        </div>
      </div>

      <div className="card users-page__toolbar">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search by name or email..." />
        <Dropdown value={role} onChange={(v) => { setRole(v); setPage(1) }} options={['Student', 'Teacher']} placeholder="All Roles" />
        <Dropdown value={college} onChange={(v) => { setCollege(v); setPage(1) }} options={collegesList} placeholder="All Institutions" />
        <Dropdown value={status} onChange={(v) => { setStatus(v); setPage(1) }} options={['Active', 'Inactive', 'Suspended']} placeholder="All Status" />
      </div>

      <div className="card">
        <Table columns={columns} rows={paged} emptyMessage="No users match your filters." />
        <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
      </div>

      <Drawer open={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details">
        {selectedUser && (
          <div className="user-detail">
            <div className="user-detail__head">
              <span className="user-cell__avatar lg">{selectedUser.avatar}</span>
              <div>
                <h3>{selectedUser.name}</h3>
                <Badge status={selectedUser.status} />
              </div>
            </div>
            <dl>
              <dt>Email</dt><dd>{selectedUser.email}</dd>
              <dt>Institution</dt><dd>{selectedUser.college}</dd>
              <dt>Role</dt><dd>{selectedUser.role}</dd>
              <dt>Joined</dt><dd>{selectedUser.joined}</dd>
              <dt>Last Login</dt><dd>{selectedUser.lastLogin}</dd>
            </dl>
            <div className="user-detail__actions">
              <button className="btn btn-outline btn-sm"><UserPlus size={14} /> Add Faculty</button>
              <button className="btn btn-outline btn-sm"><UserMinus size={14} /> Remove Faculty</button>
              <button className="btn btn-outline btn-sm"><ShieldOff size={14} /> Clear Device</button>
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Remove User"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Remove User</button>
          </>
        }
      >
        Are you sure you want to remove <strong>{confirmDelete?.name}</strong>? This action cannot be undone.
      </Modal>
    </div>
  )
}
