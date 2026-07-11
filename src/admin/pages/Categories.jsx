import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import SearchBar from '../../components/admin/SearchBar'
import Dropdown from '../../components/admin/Dropdown'
import Modal from '../../components/admin/Modal'
import UploadBox from '../../components/admin/UploadBox'
import {
  Plus,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  Tag,
  CalendarClock,
  Video,
  FileStack,
  Eye,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  X,
  ArrowRight,
} from 'lucide-react'
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

// File-type helpers - the same `imageName` field is used whether the admin
// uploaded an image (thumbnail) or a PDF (e.g. syllabus/brochure)
const isPdfFile = (name = '') => name.toLowerCase().endsWith('.pdf')
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
const ACCEPT_ATTR = 'image/png,image/jpeg,image/webp,image/gif,application/pdf'

// Converts the backend's date array into the string a <input type="datetime-local">
// expects (yyyy-MM-ddTHH:mm), so we can prefill it when editing a category.
const dateArrayToInputValue = (arr) => {
  const d = dateArrayToDate(arr)
  if (!d) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
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
    // NOTE: the list/get endpoints in your sample response don't return
    // `courceType` at all, so this is usually empty on existing categories —
    // the edit form asks the admin to reselect it when blank.
    courceType: c.courceType ?? c.courseType ?? '',
    price: c.price ?? null,
    imageName: c.imageName || '',
    videoLink: c.videoLink ?? null,
    addedDateLabel: formatDate(c.addedDate),
    courseValidDateLabel: formatDate(c.courseValidDate),
    courseValidDateInputValue: dateArrayToInputValue(c.courseValidDate),
    isExpired,
  }
}

// getAll() response shape backend anusar farak huna sakcha
const extractList = (res) => {
  const d = res?.data
  const list = d?.data ?? d?.categories ?? d
  return Array.isArray(list) ? list : []
}

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

  // Details modal (opened by clicking a category card)
  const [detailsCategory, setDetailsCategory] = useState(null)

  // File preview modal (image or PDF, fetched as a blob)
  const [preview, setPreview] = useState(null) // { url, kind: 'image' | 'pdf', name }
  const [previewLoadingId, setPreviewLoadingId] = useState(null)
  const objectUrlRef = useRef(null)

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

  // Revoke any open blob URL when the preview modal closes or the page unmounts
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

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

  const closePreview = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setPreview(null)
  }

  // Fetches the stored file for a category (image or PDF) and opens it in the
  // preview modal. Files are streamed as a blob so we build a local object URL.
  const openFilePreview = async (category) => {
    if (!category?.imageName) {
      toast.info('No file has been uploaded for this category yet')
      return
    }
    setPreviewLoadingId(category.id)
    try {
      const res = await categoryService.getFile(category.imageName)
      const url = URL.createObjectURL(res.data)
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = url
      setPreview({
        url,
        kind: isPdfFile(category.imageName) ? 'pdf' : 'image',
        name: category.name,
      })
    } catch (err) {
      toast.error('Failed to load the uploaded file')
    } finally {
      setPreviewLoadingId(null)
    }
  }

  const handleThumbnailPick = (file) => {
    if (!file) return
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast.error('Only image files (JPG, PNG, WEBP, GIF) or PDF are allowed')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File is too large — please keep it under 15MB')
      return
    }
    setThumbnailFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)

    setCreating(true)

    // Both create and update send the SAME full shape. The backend's earlier
    // 500 on update was almost certainly caused by sending a partial body
    // (just title/description) into a DTO/entity that expects every field -
    // so we no longer special-case a "slim" update payload.
    const payload = {
      categoryTitle: form.get('categoryTitle'),
      mainCategory: form.get('mainCategory'),
      categoryDescription: form.get('categoryDescription'),
      courceType: form.get('courceType'),
      courseValidDate: `${form.get('courseValidDate')}:00`,
      categoryType: form.get('categoryType'),
      price: isPaid ? Number(form.get('price')) : 0,
    }

    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, payload)

        if (thumbnailFile) {
          try {
            const fileForm = new FormData()
            fileForm.append('file', thumbnailFile)
            await categoryService.uploadFile(editingCategory.id, fileForm)
          } catch {
            toast.warning('Category updated but the file failed to upload')
          }
        }

        toast.success('Category updated successfully')
      } else {
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
            toast.warning('Category created but file upload failed')
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
      if (detailsCategory?.id === confirmDelete.id) setDetailsCategory(null)
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
    setThumbnailFile(null)
    setShowCreate(true)
  }

  const openCreate = () => {
    setEditingCategory(null)
    setIsPaid(false)
    setThumbnailFile(null)
    setShowCreate(true)
  }

  // Small reusable thumbnail: shows the image, a PDF badge, or the category's
  // initials when nothing has been uploaded yet. Includes a hover "view" affordance.
  const Thumbnail = ({ category }) => {
    const hasFile = !!category.imageName
    const pdf = hasFile && isPdfFile(category.imageName)
    const isLoadingThis = previewLoadingId === category.id

    return (
      <div className="category-card__thumb">
        {pdf ? (
          <div className="thumb-pdf">
            <FileText size={26} />
            <span>PDF</span>
          </div>
        ) : hasFile ? (
          <FileImage category={category} />
        ) : (
          <span className="thumb-initials">
            {category.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
          </span>
        )}

        {hasFile && (
          <button
            type="button"
            className="thumb-view-btn"
            title="View uploaded file"
            onClick={(e) => {
              e.stopPropagation()
              openFilePreview(category)
            }}
            disabled={isLoadingThis}
          >
            {isLoadingThis ? 'Loading…' : (
              <>
                <Eye size={13} /> View file
              </>
            )}
          </button>
        )}
      </div>
    )
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
          <button className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')} title="Grid view">
            <LayoutGrid size={16} />
          </button>
          <button className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} title="List view">
            <List size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card state-panel">
          <div className="spinner" />
          <p>Loading categories…</p>
        </div>
      ) : error ? (
        <div className="card state-panel">
          <p>{error}</p>
          <button className="btn btn-outline btn-sm" onClick={fetchCategories}>
            Retry
          </button>
        </div>
      ) : grouped.length === 0 ? (
        <div className="card state-panel">
          <p>No categories found. Try adjusting your filters, or add a new category.</p>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <Plus size={14} /> Add Category
          </button>
        </div>
      ) : (
        grouped.map(([mainCat, items]) => (
          <div key={mainCat} className="category-main-group">
            <h3>
              {mainCat === 'UNCATEGORIZED' ? 'Uncategorized' : mainCategoryLabel(mainCat)}
              <span className="group-count">({items.length})</span>
            </h3>

            <div className={view === 'grid' ? 'categories-grid' : 'categories-list'}>
              {items.map((c) => (
                <div
                  key={c.id}
                  className="card category-card"
                  onClick={() => setDetailsCategory(c)}
                  role="button"
                  tabIndex={0}
                >
                  <Thumbnail category={c} />
                  <div className="category-card__body">
                    <div className="category-card__top">
                      <h4>{c.name}</h4>
                      <span className={`type-badge ${c.categoryType === 'paid' ? 'is-paid' : 'is-free'}`}>
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
                        {c.isExpired && <em className="expired-tag">(Expired)</em>}
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
                          goToContent(c)
                        }}
                      >
                        <FileStack size={13} /> Content
                      </button>
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

      {/* Create / Edit modal */}
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

          <label>
            Main Category
            <select name="mainCategory" required defaultValue={editingCategory?.mainCategory || ''}>
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
              defaultValue={editingCategory?.categoryType || ''}
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
              <input
                type="number"
                name="price"
                placeholder="e.g. 2500"
                min="0"
                required={isPaid}
                defaultValue={editingCategory?.price ?? ''}
              />
            </label>
          )}

          <label>
            Course Type
            <select name="courceType" required defaultValue={editingCategory?.courceType || ''}>
              <option value="" disabled>
                Select course type
              </option>
              <option value="upcomming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
            {editingCategory && !editingCategory.courceType && (
              <span className="field-hint">Not returned by the server for existing categories — please reselect it.</span>
            )}
          </label>

          <label>
            Course Valid Until
            <input
              type="datetime-local"
              name="courseValidDate"
              required
              defaultValue={editingCategory?.courseValidDateInputValue || ''}
            />
          </label>

          <div className="category-form__field">
            <span className="category-form__label">
              {editingCategory ? 'Replace Category File (Image or PDF)' : 'Upload Category File (Image or PDF)'}
            </span>
            {editingCategory?.imageName && (
              <div className="current-file-row">
                {isPdfFile(editingCategory.imageName) ? <FileText size={14} /> : <ImageIcon size={14} />}
                <span>{editingCategory.imageName}</span>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => openFilePreview(editingCategory)}
                  disabled={previewLoadingId === editingCategory.id}
                >
                  {previewLoadingId === editingCategory.id ? 'Loading…' : 'View current file'}
                </button>
              </div>
            )}
            <UploadBox accept={ACCEPT_ATTR} onFile={handleThumbnailPick} />
            {thumbnailFile && <span className="picked-file-name">Selected: {thumbnailFile.name}</span>}
            <span className="field-hint">Accepted: JPG, PNG, WEBP, GIF or PDF — up to 15MB.</span>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn-outline" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Category details modal — opened by clicking a card */}
      <Modal
        open={!!detailsCategory}
        onClose={() => setDetailsCategory(null)}
        title="Category Details"
        width="560px"
      >
        {detailsCategory && (
          <div className="details-view">
            <div className="details-view__head">
              <div className="details-view__thumb">
                <Thumbnail category={detailsCategory} />
              </div>
              <div>
                <h3>{detailsCategory.name}</h3>
                <span className={`type-badge ${detailsCategory.categoryType === 'paid' ? 'is-paid' : 'is-free'}`}>
                  {detailsCategory.categoryType === 'paid' ? `Paid · Rs. ${detailsCategory.price}` : 'Free'}
                </span>
              </div>
            </div>

            {detailsCategory.description && <p className="details-view__desc">{detailsCategory.description}</p>}

            <div className="details-grid">
              <div>
                <span className="details-grid__label">Main Category</span>
                <span>{mainCategoryLabel(detailsCategory.mainCategory)}</span>
              </div>
              <div>
                <span className="details-grid__label">Content Items</span>
                <span>
                  {countsLoading && contentCounts[detailsCategory.id] === undefined
                    ? 'Loading...'
                    : contentCounts[detailsCategory.id] ?? 0}
                </span>
              </div>
              <div>
                <span className="details-grid__label">Added On</span>
                <span>{detailsCategory.addedDateLabel}</span>
              </div>
              <div>
                <span className="details-grid__label">Valid Until</span>
                <span>
                  {detailsCategory.courseValidDateLabel}
                  {detailsCategory.isExpired && <em className="expired-tag"> (Expired)</em>}
                </span>
              </div>
            </div>

            <div className="details-view__actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  goToContent(detailsCategory)
                  setDetailsCategory(null)
                }}
              >
                View Content <ArrowRight size={14} />
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  openEdit(detailsCategory)
                  setDetailsCategory(null)
                }}
              >
                <Pencil size={13} /> Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setConfirmDelete(detailsCategory)
                  setDetailsCategory(null)
                }}
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* File preview modal (image or PDF) */}
      <Modal
        open={!!preview}
        onClose={closePreview}
        title={preview ? `File — ${preview.name}` : 'File'}
        width="680px"
      >
        {preview && (
          <div className="file-preview">
            {preview.kind === 'pdf' ? (
              <embed src={preview.url} type="application/pdf" className="file-preview__pdf" />
            ) : (
              <img src={preview.url} alt={preview.name} className="file-preview__image" />
            )}
            <div className="file-preview__actions">
              <a href={preview.url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                <ExternalLink size={13} /> Open in new tab
              </a>
              <button className="btn btn-outline btn-sm" onClick={closePreview}>
                <X size={13} /> Close
              </button>
            </div>
          </div>
        )}
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

// Fetches and displays an image-type category file as a blob (so the
// request goes through the same authenticated API client as everything else,
// rather than assuming a public static file URL).
function FileImage({ category }) {
  const [src, setSrc] = useState(null)
  const [failed, setFailed] = useState(false)
  const urlRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setFailed(false)
    categoryService
      .getImage(category.imageName)
      .then((res) => {
        if (cancelled) return
        const url = URL.createObjectURL(res.data)
        urlRef.current = url
        setSrc(url)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [category.imageName])

  if (failed) {
    return (
      <span className="thumb-initials">
        {category.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
      </span>
    )
  }

  if (!src) return <div className="thumb-skeleton" />

  return <img src={src} alt={category.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
}
