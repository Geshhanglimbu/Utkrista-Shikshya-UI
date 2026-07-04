import { useMemo, useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { Eye, Pencil, Trash2, UserCog, UserPlus, UserMinus, ShieldOff, Plus, Download } from 'lucide-react'
import SearchBar from '../../components/admin/SearchBar'
import Dropdown from '../../components/admin/Dropdown'
import Table from '../../components/admin/Table'
import Pagination from '../../components/admin/Pagination'
import Badge from '../../components/admin/Badge'
import Drawer from '../../components/admin/Drawer'
import Modal from '../../components/admin/Modal'
import './Users.css'
import { userService } from '../../services/api'


const PAGE_SIZE = 5

export default function Users() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [college, setCollege] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [changeRoleModal, setChangeRoleModal] = useState(false);
  const [emailSearch, setEmailSearch] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await userService.getAll()

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || []

      setUsers(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])


  const filtered = useMemo(() => {
    if (!Array.isArray(users)) return []
    return users.filter((u) => {
      const matchesSearch = `${u.name || ''} ${u.email || ''}`.toLowerCase().includes(search.toLowerCase())
      const roleName = u.roles?.[0]?.name || u.role || ''
      const matchesRole = !role || roleName.toUpperCase() === `ROLE_${role.toUpperCase()}` || roleName.toUpperCase() === role.toUpperCase()
      const matchesCollege = !college || u.collegename === college
      return matchesSearch && matchesRole && matchesCollege
    })
  }, [users, search, role, college])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    if (page > totalPages) {
      setPage(1)
    }
  }, [page, totalPages])

  const handleDelete = async () => {
    if (!confirmDelete) return
    const deleteId = confirmDelete.id || confirmDelete._id
    if (!deleteId) {
      toast.error("User identifier not found")
      return
    }
    try {
      await userService.remove(deleteId)
      toast.success("User deleted successfully")
      loadUsers()
      setConfirmDelete(null)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSearchUser = () => {
    if (!emailSearch) {
      toast.error("Please enter email to search")
      return
    }
    const trimmedEmail = emailSearch.trim().toLowerCase()
    const user = users.find(
      u => u.email && u.email.trim().toLowerCase() === trimmedEmail
    );

    if (!user) {
      toast.error("User not found");
      return;
    }

    setSearchedUser(user);
    const rawRole = user.roles?.[0]?.name || user.role || ""
    setSelectedRole(
      rawRole.replace("ROLE_", "") || "Student"
    );
  };

  const handleRoleChange = async () => {
    if (!searchedUser || !searchedUser.email) return
    try {
      await userService.addRoleByEmail(
        searchedUser.email.trim(),
        `ROLE_${selectedRole.toUpperCase()}`
      );

      toast.success("Role updated");
      loadUsers();

      setChangeRoleModal(false);
      setSearchedUser(null);
      setEmailSearch("");
    } catch (error) {
      console.error(error)
    }
  };

  const collegesList = useMemo(() => {
    if (!Array.isArray(users)) return []
    return [...new Set(users.map(u => u.collegename).filter(Boolean))]
  }, [users])

  const columns = [
    {
      key: 'name', header: 'User Profile',
      render: (u) => (
        <div className="user-cell">
          <span className="user-cell__avatar">{(u.name || "").charAt(0)?.toLowerCase()}</span>
          <div>
            <strong>{u.name}</strong>
            <span>{u.email}</span>
          </div>
        </div>
      ),
    },
    { key: 'collegename', header: 'Institution' },
    { key: 'role', header: 'Role', render: (u) => <Badge>{u.roles?.[0]?.name?.replace("ROLE_", "") || u.role || "-"}</Badge> },
    { key: 'joined',header: 'Joined',render: (u) => {
      if (!u.dateOfRegistration) return "-"
      if (Array.isArray(u.dateOfRegistration) && u.dateOfRegistration.length >= 3) {
        return new Date(
          u.dateOfRegistration[0],
          u.dateOfRegistration[1] - 1,
          u.dateOfRegistration[2]
        ).toLocaleDateString()
      }
      const d = new Date(u.dateOfRegistration)
      return isNaN(d.getTime()) ? "-" : d.toLocaleDateString()
    }},
    { key: 'actions', header: 'Actions',
      render: (u) => (
        <div className="row-actions">
          <button className="btn-icon" title="View" onClick={() => setSelectedUser(u)}><Eye size={15} /></button>
          <button className="btn-icon" title="Edit" onClick={() => toast.info("Edit feature coming soon")}><Pencil size={15} /></button>
          <button
            className="btn-icon"
            title="Change Role"
            onClick={() => {
                setEmailSearch(u.email);
                setSearchedUser(u);
                const rawRole = u.roles?.[0]?.name || u.role || "";
                setSelectedRole(
                    rawRole.replace("ROLE_", "") || "Student"
                );
                setChangeRoleModal(true);
            }}
        >
            <UserCog size={15}/>
        </button>
          <button className="btn-icon" title="Delete" onClick={() => setConfirmDelete(u)}><Trash2 size={15} /></button>
        </div>
      ),
    },
  ]
  const exportCSV = () => {
    if (!Array.isArray(users) || users.length === 0) {
      toast.info("No users to export")
      return
    }
    const csv = [
      ["Name", "Email", "Role", "College"],
      ...users.map(u => [
        `"${(u.name || "").replace(/"/g, '""')}"`,
        `"${(u.email || "").replace(/"/g, '""')}"`,
        `"${(u.roles?.[0]?.name || u.role || "").replace(/"/g, '""')}"`,
        `"${(u.collegename || "").replace(/"/g, '""')}"`
      ])
    ]
      .map(e => e.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "users.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="users-page">
      <div className="page-head">
        <div>
          <h1>User Management</h1>
          <p>Manage students, teachers, and platform-wide roles and access control.</p>
        </div>
        <div className="users-page__actions">
          <button className="btn btn-outline" onClick={exportCSV}>
            <Download size={15} /> Export CSV
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setChangeRoleModal(true)}
          >
            <Plus size={15}/>
            Change User Role
          </button>
        </div>
      </div>

      <div className="card users-page__toolbar">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Search by name or email..." />
        <Dropdown value={role} onChange={(v) => { setRole(v); setPage(1) }} options={['Student', 'Teacher']} placeholder="All Roles" />
        <Dropdown value={college} onChange={(v) => { setCollege(v); setPage(1) }} options={collegesList} placeholder="All Institutions" />
      </div>

      <div className="card">
        {loading ? (
            <p>Loading users...</p>
          ) : (
            <>
              <Table
                columns={columns}
                rows={paged}
                emptyMessage="No users found."
              />
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
              />
            </>
          )}
      </div>

      <Drawer open={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details">
        {selectedUser && (
          <div className="user-detail">
            <div className="user-detail__head">
              <span className="user-cell__avatar lg">{(selectedUser.name || "").charAt(0)?.toLowerCase()}</span>
              <div>
                <h3>{selectedUser.name}</h3>
                <Badge>
                  {selectedUser.roles?.[0]?.name?.replace("ROLE_", "") || selectedUser.role || "-"}
                </Badge>
              </div>
            </div>
            <dl>
              <dt>Email</dt><dd>{selectedUser.email}</dd>
              <dt>Institution</dt><dd>{selectedUser.collegename}</dd>
              <dt>Role</dt><dd>{selectedUser.roles?.[0]?.name?.replace("ROLE_", "") || selectedUser.role || "-"}</dd>
              <dt>Joined</dt>
              <dd>
                {(() => {
                  const reg = selectedUser.dateOfRegistration;
                  if (!reg) return "-";
                  if (Array.isArray(reg) && reg.length >= 3) {
                    return `${reg[0]}-${reg[1]}-${reg[2]}`;
                  }
                  const parsed = new Date(reg);
                  return isNaN(parsed.getTime()) ? "-" : parsed.toLocaleDateString();
                })()}
              </dd>
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

      <Modal
        open={changeRoleModal}
        onClose={() => setChangeRoleModal(false)}
        title="Change User Role"
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() => setChangeRoleModal(false)}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              disabled={!searchedUser}
              onClick={handleRoleChange}
            >
              Save
            </button>
          </>
        }
      >

      <div className="change-role-modal">

          <div>
              <h4>Assign User Role</h4>
              <p>Search a user by email to change their role.</p>
          </div>

          <div className="change-role-search">

              <input
                  type="email"
                  placeholder="Enter user email..."
                  value={emailSearch}
                  onChange={(e)=>setEmailSearch(e.target.value)}
              />

              <button
                  className="btn btn-primary"
                  onClick={handleSearchUser}
              >
                  Search
              </button>

          </div>

          {searchedUser && (

              <div className="role-user">

                  <div className="role-user-avatar">
                      {(searchedUser.name || "").charAt(0).toUpperCase()}
                  </div>

                  <div className="role-user-info">

                      <h5>{searchedUser.name}</h5>

                      <small>{searchedUser.email}</small>

                      <div className="role-badge">
                          {searchedUser.roles?.[0]?.name?.replace("ROLE_", "") || searchedUser.role || "-"}
                      </div>

                  </div>

              </div>

          )}

          {searchedUser && (

              <div className="role-select">

                  <label>Assign New Role</label>

                  <Dropdown
                      value={selectedRole}
                      onChange={setSelectedRole}
                      options={["Student","Teacher","Admin"]}
                  />

              </div>

          )}

      </div>

      </Modal>
    </div>
  )
}
