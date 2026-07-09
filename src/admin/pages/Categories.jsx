import { useEffect, useMemo, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import SearchBar from '../../components/admin/SearchBar'
import Dropdown from '../../components/admin/Dropdown'
import Modal from '../../components/admin/Modal'
import UploadBox from '../../components/admin/UploadBox'
import { Plus, Pencil, Trash2, LayoutGrid, List, Tag, CalendarClock, Video, FileStack } from 'lucide-react'
import { categoryService, contentService } from '../../services/api'
import './Categories.css'
import { useNavigate } from 'react-router-dom'

// Backend ma mainCategory yi fixed values ma aauxa (create form ma pani yही list use vayeko cha)
const MAIN_CATEGORIES = ['CLASS_9', 'CLASS_10', 'CLASS_11', 'CLASS_12', 'MERN_STACK', 'UI_UX', 'PYTHON']

// Dropdown component lai readable label chainxa vane, yeslai UI ma use garna sakincha
const mainCategoryLabel = (key) =>
  ({
    CLASS_9: 'Class 9',
    CLASS_10: 'Class 10',
    CLASS_11: 'Class 11',
    CLASS_12: 'Class 12',
    MERN_STACK: 'MERN Stack',
    UI_UX: 'UI/UX',
    PYTHON: 'Python',
  }[key] || key)

// Backend le date lai Java LocalDateTime array format ma pathauxa:
// [year, month(1-indexed), day, hour, minute, second, nano?]
const dateArrayToDate = (arr) => {
  if (!Array.isArray(arr) || arr.length < 3) return null
  const [year, month, day, hour = 0, minute = 0, second = 0] = arr
  return new Date(year, month - 1, day, hour, minute, second)
}

const formatDate = (arr) => {
  const d = dateArrayToDate(arr)
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Backend response ko real shape anusar normalize (fake/mock fields hataera)
const normalizeCategory = (c) => {
  const validDate = dateArrayToDate(c.courseValidDate)
  const isExpired = validDate ? validDate.getTime() < Date.now() : false

  return {
    id: c.categoryId ?? c.id ?? c._id,
    name: c.categoryTitle ?? 'Untitled',
    description: c.categoryDescription ?? '',
    mainCategory: c.mainCategory ?? '',
    categoryType: c.categoryType ?? 'free', // 'paid' | 'free'
    price: c.price ?? null,
    imageName: c.imageName || '',
    videoLink: c.videoLink ?? null,
    addedDateLabel: formatDate(c.addedDate),
    courseValidDateLabel: formatDate(c.courseValidDate),
    isExpired,
  }
}

// getAll() response shape backend anusar farak huna sakcha
const extractList = (res) => {
  const d = res?.data
  const list = d?.data ?? d?.categories ?? d
  return Array.isArray(list) ? list : []
}

// imageName matra aauxa, full path hoina — backend ko static/upload URL yaha jodinu paro
// TODO: real static file base URL confirm garera yaha replace garnu
const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL || ''
const thumbnailUrl = (imageName) => (imageName ? `${FILE_BASE_URL}/${imageName}` : null)

export default function Categories() {
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [mainCategoryFilter, setMainCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('') // 'Active' | 'Expired'
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
  const [editingCategory, setEditingCategory] = useState(null)
  const [contentCounts, setContentCounts] = useState({}) // { [categoryId]: number }
  const [countsLoading, setCountsLoading] = useState(false)

  const goToContent = (category) => {
    navigate(`/admin/categories/${category.id}/content`, {
      state: { categoryName: category.name }, // optional: header ma title dekhauna
    })
  }

  const extractContentList = (res) => {
    const d = res?.data
    const list = d?.data ?? d?.content ?? d?.posts ?? d
    return Array.isArray(list) ? list : []
  }

  const fetchContentCounts = useCallback(async (categoryList) => {
    if (categoryList.length === 0) return
    setCountsLoading(true)
    try {
      const results = await Promise.allSettled(
        categoryList.map((c) => contentService.getByCategoryId(c.id))
      )
      const counts = {}
      results.forEach((res, idx) => {
        const catId = categoryList[idx].id
        counts[catId] = res.status === 'fulfilled' ? extractContentList(res.value).length : null
      })
      setContentCounts(counts)
    } finally {
      setCountsLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await categoryService.getAll()
      const list = extractList(res).map(normalizeCategory)
      setCategories(list)
      fetchContentCounts(list)
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to load categories'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [fetchContentCounts])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Note: yaha client-side filter garya cha (already fetched list mathi).
  // Dataset thulo bhaye, categoryService.searchByTitle() / searchByMain() (api.js ma existing cha)
  // use garera server-side search garna sakincha instead.
  const filtered = useMemo(
    () =>
      categories.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) &&
          (!mainCategoryFilter || c.mainCategory === mainCategoryFilter) &&
          (!statusFilter || (statusFilter === 'Expired' ? c.isExpired : !c.isExpired))
      ),
    [categories, search, mainCategoryFilter, statusFilter]
  )

  // mainCategory anusar group garne — yehi "sub categories under main category" wala part ho
  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach((c) => {
      const key = c.mainCategory || 'UNCATEGORIZED'
      if (!groups[key]) groups[key] = []
      groups[key].push(c)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  const closeModal = () => {
    setShowCreate(false)
    setEditingCategory(null)
    setThumbnailFile(null)
    setIsPaid(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)

    setCreating(true)

    try {
      if (editingCategory) {
        // Update endpoint le yi 2 field matra expect garcha
        const updatePayload = {
          categoryTitle: form.get('categoryTitle') || '',
          categoryDescription: form.get('categoryDescription') || '',
        }

        await categoryService.update(editingCategory.id, updatePayload)
        toast.success('Category updated successfully')
      } else {
        // Create endpoint le pura body chahincha
        const payload = {
          categoryTitle: form.get('categoryTitle'),
          mainCategory: form.get('mainCategory'),
          categoryDescription: form.get('categoryDescription'),
          courceType: form.get('courceType'),
          courseValidDate: `${form.get('courseValidDate')}:00`,
          categoryType: form.get('categoryType'),
          price: isPaid ? Number(form.get('price')) : 0,
        }

        const res = await categoryService.create(payload)

        const newId =
          res?.data?.categoryId ??
          res?.data?.id ??
          res?.data?.data?.categoryId

        if (thumbnailFile && newId) {
          try {
            const fileForm = new FormData()
            fileForm.append('file', thumbnailFile)
            await categoryService.uploadFile(newId, fileForm)
          } catch {
            toast.warning('Category created but thumbnail upload failed')
          }
        }

        toast.success('Category created successfully')
      }

      closeModal()
      e.target.reset()
      fetchCategories()
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to save category'
      toast.error(message)
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

  const openEdit = (category) => {
    setEditingCategory(category)
    setIsPaid(category.categoryType === 'paid')
    setShowCreate(true)
  }

  const openCreate = () => {
    setEditingCategory(null)
    setIsPaid(false)
    setShowCreate(true)
  }

  return (
    <div className="categories-page">
      <div className="page-head">
        <div>
          <h1>Category Management</h1>
          <p>Organize and publish educational resources across the platform.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> Add Category
        </button>
      </div>

      <div className="card categories-page__toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by category title..." />
        <Dropdown
          value={mainCategoryFilter}
          onChange={setMainCategoryFilter}
          options={MAIN_CATEGORIES.map((k) => ({ value: k, label: mainCategoryLabel(k) }))}
          placeholder="All Main Categories"
        />
        <Dropdown
          value={statusFilter}
          onChange={setStatusFilter}
          options={['Active', 'Expired']}
          placeholder="All Status"
        />
        <div className="view-toggle">
          <button className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')}>
            <LayoutGrid size={16} />
          </button>
          <button className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')}>
            <List size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          Loading categories...
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          <p>{error}</p>
          <button className="btn btn-outline btn-sm" onClick={fetchCategories}>
            Retry
          </button>
        </div>
      ) : grouped.length === 0 ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          No categories found.
        </div>
      ) : (
        grouped.map(([mainCat, items]) => (
          <div key={mainCat} className="category-main-group" style={{ marginBottom: '28px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 600 }}>
              {mainCat === 'UNCATEGORIZED' ? 'Uncategorized' : mainCategoryLabel(mainCat)}
              <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: 8 }}>({items.length})</span>
            </h3>

            <div className={view === 'grid' ? 'categories-grid' : 'categories-list'}>
              {items.map((c) => (
                <div
                  key={c.id}
                  className="card category-card"
                  onClick={() => goToContent(c)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="category-card__thumb">
                    {thumbnailUrl(c.imageName) ? (
                      <img
                        src={thumbnailUrl(c.imageName)}
                        alt={c.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span>{c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
                    )}
                  </div>
                  <div className="category-card__body">
                    <div className="category-card__top">
                      <h4>{c.name}</h4>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: c.categoryType === 'paid' ? '#FEF3C7' : '#DCFCE7',
                          color: c.categoryType === 'paid' ? '#92400E' : '#166534',
                        }}
                      >
                        {c.categoryType === 'paid' ? `Paid · Rs. ${c.price}` : 'Free'}
                      </span>
                    </div>
                    <p>{c.description}</p>

                    <div className="category-card__stats">
                      <span>
                        <Tag size={13} /> {mainCategoryLabel(c.mainCategory)}
                      </span>
                      <span>
                        <FileStack size={13} />
                        {countsLoading && contentCounts[c.id] === undefined
                          ? 'Loading...'
                          : `${contentCounts[c.id] ?? 0} item${contentCounts[c.id] === 1 ? '' : 's'}`}
                      </span>
                      <span>
                        <CalendarClock size={13} /> Valid till {c.courseValidDateLabel}
                        {c.isExpired && <em style={{ color: '#B91C1C', marginLeft: 4 }}>(Expired)</em>}
                      </span>
                      {c.videoLink && (
                        <span>
                          <Video size={13} /> Has intro video
                        </span>
                      )}
                    </div>
                    <div className="category-card__actions">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEdit(c)
                        }}
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === c.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDelete(c)
                        }}
                      >
                        <Trash2 size={13} /> {deletingId === c.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <Modal
        open={showCreate}
        onClose={closeModal}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        width="520px"
      >
        <form onSubmit={handleSubmit} className="category-form">
          <label>
            Category Title
            <input
              type="text"
              name="categoryTitle"
              defaultValue={editingCategory?.name || ''}
              placeholder="e.g. Class-12_math"
              required
            />
          </label>

          <label>
            Description
            <textarea
              name="categoryDescription"
              defaultValue={editingCategory?.description || ''}
              rows={3}
              placeholder="Brief description of this category"
            />
          </label>

          {!editingCategory && (
            <>
              <label>
                Main Category
                <select name="mainCategory" required defaultValue="">
                  <option value="" disabled>
                    Select main category
                  </option>
                  {MAIN_CATEGORIES.map((k) => (
                    <option key={k} value={k}>
                      {mainCategoryLabel(k)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Category Type
                <select
                  name="categoryType"
                  required
                  defaultValue=""
                  onChange={(e) => setIsPaid(e.target.value === 'paid')}
                >
                  <option value="" disabled>
                    Select category type
                  </option>
                  <option value="paid">Paid</option>
                  <option value="free">Free</option>
                </select>
              </label>

              {isPaid && (
                <label>
                  Price (NPR)
                  <input type="number" name="price" placeholder="e.g. 2500" min="0" required={isPaid} />
                </label>
              )}

              <label>
                Course Type
                <select name="courceType" required defaultValue="">
                  <option value="" disabled>
                    Select course type
                  </option>
                  <option value="upcomming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </label>

              <label>
                Course Valid Until
                <input type="datetime-local" name="courseValidDate" required />
              </label>

              <label>
                Upload Thumbnail
                <UploadBox onFile={(file) => setThumbnailFile(file)} />
              </label>
            </>
          )}

          <div className="modal__footer" style={{ padding: '20px 0 0' }}>
            <button type="button" className="btn btn-outline" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
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
            <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </button>
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
