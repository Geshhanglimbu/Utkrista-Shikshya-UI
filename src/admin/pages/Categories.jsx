import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Plus, Pencil, Trash2, Users, FileText, LayoutGrid, List } from 'lucide-react'
import SearchBar from '../../components/admin/SearchBar'
import Dropdown from '../../components/admin/Dropdown'
import Badge from '../../components/admin/Badge'
import Modal from '../../components/admin/Modal'
import UploadBox from '../../components/admin/UploadBox'
import { categoriesData } from '../utils/dummyData'
import './Categories.css'

export default function Categories() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [view, setView] = useState('grid')
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = useMemo(() => categoriesData.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) && (!status || c.status === status)
  ), [search, status])

  const handleCreate = (e) => {
    e.preventDefault()
    toast.success('Category created successfully')
    setShowCreate(false)
  }

  return (
    <div className="categories-page">
      <div className="page-head">
        <div>
          <h1>Category Management</h1>
          <p>Organize and publish educational resources across the platform.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Add Category</button>
      </div>

      <div className="card categories-page__toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search categories..." />
        <Dropdown value={status} onChange={setStatus} options={['Active', 'Draft', 'Inactive']} placeholder="All Status" />
        <div className="view-toggle">
          <button className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')}><LayoutGrid size={16} /></button>
          <button className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')}><List size={16} /></button>
        </div>
      </div>

      <div className={view === 'grid' ? 'categories-grid' : 'categories-list'}>
        {filtered.map((c) => (
          <div key={c.id} className="card category-card">
            <div className="category-card__thumb" style={{ background: `${c.color}1A` }}>
              <span style={{ color: c.color }}>{c.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
            </div>
            <div className="category-card__body">
              <div className="category-card__top">
                <h4>{c.name}</h4>
                <Badge status={c.status} />
              </div>
              <p>{c.description}</p>
              <div className="category-card__stats">
                <span><Users size={13} /> {c.students.toLocaleString()} Students</span>
                <span><FileText size={13} /> {c.posts} Posts</span>
              </div>
              <div className="category-card__actions">
                <button className="btn btn-outline btn-sm" onClick={() => toast.info(`Editing ${c.name}`)}><Pencil size={13} /> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(c)}><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Category" width="520px">
        <form onSubmit={handleCreate} className="category-form">
          <label>Category Name<input type="text" placeholder="e.g. NEB Physics Grade 12" required /></label>
          <label>Description<textarea rows={3} placeholder="Brief description of this category" /></label>
          <label>Upload Thumbnail<UploadBox onFile={() => {}} /></label>
          <div className="modal__footer" style={{ padding: '20px 0 0' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Category</button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Category"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => { toast.success('Category deleted'); setConfirmDelete(null) }}>Delete</button>
          </>
        }
      >
        Delete <strong>{confirmDelete?.name}</strong>? Students will lose access to its content.
      </Modal>
    </div>
  )
}
