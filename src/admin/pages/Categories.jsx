import { useEffect, useMemo, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import { Plus, Pencil, Trash2, Users, FileText, LayoutGrid, List } from 'lucide-react'
import SearchBar from '../../components/admin/SearchBar'
import Dropdown from '../../components/admin/Dropdown'
import Badge from '../../components/admin/Badge'
import Modal from '../../components/admin/Modal'
import UploadBox from '../../components/admin/UploadBox'
import { categoryService } from "../../services/api"
import './Categories.css'

// Backend le fields haru differently naam rakhna sakcha,
// tyo lai UI le use garne shape ma normalize garne helper
const normalizeCategory = (c) => ({
  id: c.id ?? c._id,
  name: c.categoryTitle ?? c.name ?? 'Untitled',
  description: c.categoryDescription ?? c.description ?? '',
  mainCategory: c.mainCategory ?? '',
  categoryType: c.categoryType ?? 'free',
  price: c.price ?? 0,
  courceType: c.courceType ?? '',
  courseValidDate: c.courseValidDate ?? null,
  status: c.status ?? 'Active',
  color: c.color ?? c.thumbnailColor ?? '#2952E3',
  students: c.students ?? c.studentsCount ?? c.enrolledStudents ?? 0,
  posts: c.posts ?? c.postsCount ?? c.contentCount ?? 0,
})

// getAll() ko response shape backend anusar farak huna sakcha,
// yaha common patterns haru handle gareko
const extractList = (res) => {
  const d = res?.data
  const list = d?.data ?? d?.categories ?? d
  return Array.isArray(list) ? list : []
}

export default function Categories() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [view, setView] = useState('grid')
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [isPaid, setIsPaid] = useState(false)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await categoryService.getAll()
      console.log(res.data);
      setCategories(extractList(res).map(normalizeCategory))
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to load categories'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const filtered = useMemo(() => categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) && (!status || c.status === status)
  ), [categories, search, status])

 const handleCreate = async (e) => {
  e.preventDefault()
  const form = new FormData(e.target)

  const payload = {
    categoryTitle: form.get('categoryTitle') || '',
    mainCategory: form.get('mainCategory') || '',
    categoryDescription: form.get('categoryDescription') || '',
    courceType: form.get('courceType') || '',
    courseValidDate: form.get('courseValidDate') || '',
    categoryType: form.get('categoryType') || '',
  }

  if (isPaid) {
    payload.price = form.get('price') || '0'
  }

  setCreating(true)
  try {
  const res = await categoryService.create(payload)
  const newId = res?.data?.id ?? res?.data?.data?.id
  toast.success('Category created successfully')

  if (thumbnailFile && newId) {
    try {
      const fileForm = new FormData()
      fileForm.append('file', thumbnailFile)
      await categoryService.uploadFile(newId, fileForm)
    } catch (uploadErr) {
      toast.warning('Category created but thumbnail upload failed')
    }
  }

  setShowCreate(false)
  setThumbnailFile(null)
  e.target.reset()
  fetchCategories()
} catch (err) {
  toast.error(err?.response?.data?.message || 'Failed to create category')
} finally {
  setCreating(false)
}
}
    const handleDelete = async () => {
    if (!confirmDelete) return
    setDeletingId(confirmDelete.id)
    try {
      await categoryService.remove(confirmDelete.id)
      toast.success('Category deleted')
      setConfirmDelete(null)
      fetchCategories()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete category')
    } finally {
      setDeletingId(null)
    }
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

      {loading ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>Loading categories...</div>
      ) : error ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <p>{error}</p>
          <button className="btn btn-outline btn-sm" onClick={fetchCategories}>Retry</button>
        </div>
      ) : (
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
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={deletingId === c.id}
                    onClick={() => setConfirmDelete(c)}
                  >
                    <Trash2 size={13} /> {deletingId === c.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Category" width="520px">
  <form onSubmit={handleCreate} className="category-form">
    <label>Category Title
      <input type="text" name="categoryTitle" placeholder="e.g. Class-12_math" required />
    </label>

    <label>Main Category
      <select name="mainCategory" required defaultValue="">
        <option value="" disabled>Select main category</option>
        <option value="CLASS_9">Class 9</option>
        <option value="CLASS_10">Class 10</option>
        <option value="CLASS_11">Class 11</option>
        <option value="CLASS_12">Class 12</option>
        <option value="MERN_STACK">MERN Stack</option>
        <option value="UI_UX">UI/UX</option>
        <option value="PYTHON">Python</option>
      </select>
    </label>

    <label>Category Type
      <select
        name="categoryType"
        required
        defaultValue=""
        onChange={(e) => setIsPaid(e.target.value === 'paid')}
      >
        <option value="" disabled>Select category type</option>
        <option value="paid">Paid</option>
        <option value="free">Free</option>
      </select>
    </label>

    {isPaid && (
      <label>Price (NPR)
        <input type="number" name="price" placeholder="e.g. 2500" min="0" required={isPaid} />
      </label>
    )}

    <label>Description
      <textarea name="categoryDescription" rows={3} placeholder="Brief description of this category" />
    </label>

    <label>Course Type
      <select name="courceType" required defaultValue="">
        <option value="" disabled>Select course type</option>
        <option value="upcomming">Upcoming</option>
        <option value="ongoing">Ongoing</option>
        <option value="completed">Completed</option>
      </select>
    </label>

    <label>Course Valid Until
      <input type="datetime-local" name="courseValidDate" required />
    </label>

    <label>Upload Thumbnail
      <UploadBox onFile={(file) => setThumbnailFile(file)} />
    </label>

    <div className="modal__footer" style={{ padding: '20px 0 0' }}>
      <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
      <button type="submit" className="btn btn-primary" disabled={creating}>
        {creating ? 'Creating...' : 'Create Category'}
      </button>
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
            <button className="btn btn-danger" onClick={handleDelete} disabled={deletingId === confirmDelete?.id}>
              {deletingId === confirmDelete?.id ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        Delete <strong>{confirmDelete?.name}</strong>? Students will lose access to its content.
      </Modal>
    </div>
  )
}