import { useEffect, useMemo, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import { Pencil, Trash2, Eye, UploadCloud, FileText, Video, File, Inbox } from 'lucide-react'
import SearchBar from '../../components/admin/SearchBar'
import Dropdown from '../../components/admin/Dropdown'
import Tabs from '../../components/admin/Tabs'
import Table from '../../components/admin/Table'
import Modal from '../../components/admin/Modal'
import UploadBox from '../../components/admin/UploadBox'
import { contentService, categoryService } from '../../services/api'
import './Content.css'
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";



const contentTabs = ['All', 'Videos', 'Documents', 'PDFs']

// Backend response shape farak huna sakcha — yaha common field name
// variations haru handle gareko, tapaiko actual API response herera
// adjust garna sakincha

const normalizeContent = (c) => ({
  id: c.id ?? c._id ?? c.postId,
  title: c.title ?? c.postTitle ?? 'Untitled',
  category: c.categoryTitle ?? c.category?.categoryTitle ?? c.category ?? '—',
  categoryId: c.categoryId ?? c.category?.categoryId ?? c.category?.id,
  type: c.type ?? c.fileType ?? c.contentType ?? 'Document',
  teacher: c.teacherName ?? c.uploadedBy ?? c.teacher ?? c.author?.name ?? 'Unknown',
  uploaded: c.createdAt ?? c.uploadedAt ?? c.date ?? null,
  views: c.views ?? c.viewCount ?? 0,
})

const normalizeCategory = (c) => ({
  id: c.id ?? c._id ?? c.categoryId,
  name: c.categoryTitle ?? c.name ?? 'Untitled',
})

const extractList = (res) => {
  const d = res?.data
  const list = d?.data ?? d?.content ?? d?.posts ?? d
  return Array.isArray(list) ? list : []
}

const formatDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('default', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatViews = (value) => {
  const n = Number(value) || 0
  return n.toLocaleString()
}

const typeIcon = (type) => {
  const t = (type || '').toLowerCase()
  if (t.startsWith('video')) return <Video size={13} />
  if (t.startsWith('pdf')) return <File size={13} />
  return <FileText size={13} />
}

export default function Content() {
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [teacher, setTeacher] = useState('')
  const [showUpload, setShowUpload] = useState(false)

  const [content, setContent] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // NOTE: backend ma "get all content" ko euta single endpoint dekhinena —
  // contentService.getByCategoryId(categoryId) matra cha. Tesaile pahila
  // categories fetch garera, tesपछि each category ko content parallel ma
  // tanera combine gareko. Yadi backend ma pachi "/posts" jasto get-all route
  // aayo bhane, yo loop hatai euta call le nai kaam huncha.
  
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const categoriesRes = await categoryService.getAll()
      const categoryList = extractList(categoriesRes).map(normalizeCategory)
      setCategories(categoryList)

      if (categoryList.length === 0) {
        setContent([])
        return
      }

      const contentResults = await Promise.allSettled(
        categoryList.map((cat) => contentService.getByCategoryId(cat.id))
      )

      const combined = []
      let allFailed = true

      contentResults.forEach((res, idx) => {
        if (res.status === 'fulfilled') {
          allFailed = false
          const items = extractList(res.value).map((item) =>
            normalizeContent({ ...item, categoryTitle: item.categoryTitle ?? categoryList[idx].name })
          )
          combined.push(...items)
        }
      })

      setContent(combined)
      if (allFailed) {
        setError('Failed to load content')
        toast.error('Failed to load content')
      }
    } catch (err) {
      setError('Something went wrong')
      toast.error('Something went wrong while loading content')
      setContent([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const teachers = useMemo(
    () => [...new Set(content.map((c) => c.teacher).filter(Boolean))],
    [content]
  )

  const filtered = useMemo(() => content.filter((c) => {
    const matchesTab = tab === 'All' || c.type?.toLowerCase() === tab.replace(/s$/i, '').toLowerCase()
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !category || c.category === category
    const matchesTeacher = !teacher || c.teacher === teacher
    return matchesTab && matchesSearch && matchesCategory && matchesTeacher
  }), [content, tab, search, category, teacher])

  const stats = useMemo(() => {
    const count = (predicate) => content.filter(predicate).length
    return {
      total: content.length,
      videos: count((c) => c.type?.toLowerCase().startsWith('video')),
      documents: count((c) => c.type?.toLowerCase().startsWith('document')),
      pdfs: count((c) => c.type?.toLowerCase().startsWith('pdf')),
    }
  }, [content])

  const handleDelete = async (item) => {
    setDeletingId(item.id)
    try {
      await contentService.remove(item.id)
      toast.success(`${item.title} deleted`)
      setContent((prev) => prev.filter((c) => c.id !== item.id))
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete content')
    } finally {
      setDeletingId(null)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const title = form.get('title')
    const categoryId = form.get('categoryId')

    if (!title || !categoryId) {
      toast.error('Title and category are required')
      return
    }
    if (!uploadFile) {
      toast.error('Please select a file to upload')
      return
    }

    // Aafno auth flow anusar userId nikalne — adjust garnu paro
      console.log("userId:", localStorage.getItem("userId"));
      console.log("user:", localStorage.getItem("user"));
      console.log("token:", localStorage.getItem("token"));

      const userId = localStorage.getItem("userId");

      if (!userId) {
        toast.error("User session missing. Please log in again.");
        return;
      }

    setUploading(true)
    try {
      // Step 1: post metadata create garne
      const res = await contentService.create(userId, categoryId, { title })
      console.log(res.data);
      const newId = res?.data?.id ?? res?.data?.data?.id ?? res?.data?.postId

      // Step 2: actual file separate endpoint bata upload garne
     if (!newId) {
    toast.error("Post ID not found");
    return;
          }
    const fileForm = new FormData();

        fileForm.append("file", uploadFile);

        console.log("Uploading Post:", newId);
        console.log("Selected File:", uploadFile);

        await contentService.uploadFile(newId, fileForm);

        console.log("Upload Success");
    

      toast.success('Content uploaded successfully')
      setShowUpload(false)
      setUploadFile(null)
      e.target.reset()
      await loadData()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload content')
    } finally {
      setUploading(false)
    }
  }
  const navigate = useNavigate();
  const columns = [
    
    { key: 'title', header: 'Title', render: (c) => (
    <Link
        to={`/admin/content/${c.id}`}
        style={{
            color: "#2952E3",
            fontWeight: 600,
            textDecoration: "none"
        }}
    >
        {c.title}
    </Link>
) },
    { key: 'category', header: 'Category' },
    {
      key: 'type', header: 'Type',
      render: (c) => (
        <span className={`content-type-tag content-type-tag--${(c.type || 'document').toLowerCase()}`}>
          {typeIcon(c.type)} {c.type}
        </span>
      ),
    },
    { key: 'teacher', header: 'Uploaded By' },
    { key: 'uploaded', header: 'Date', render: (c) => formatDate(c.uploaded) },
    { key: 'views', header: 'Views', render: (c) => formatViews(c.views) },
    {
      key: 'actions', header: 'Actions',
      render: (c) => (
        <div className="row-actions">
          <button
            className="btn-icon"
            title="Preview"
            onClick={() => navigate(`/admin/content/${c.id}`)}
        >
            <Eye size={15}/>
        </button>
          <button className="btn-icon" title="Edit" onClick={() => toast.info(`Editing ${c.title}`)}>
            <Pencil size={15} />
          </button>
          <button
            className="btn-icon"
            title="Delete"
            disabled={deletingId === c.id}
            onClick={() => handleDelete(c)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="content-page">
      <div className="page-head">
        <div>
          <h1>Content Management</h1>
          <p>Manage and publish educational resources across the platform.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
          <UploadCloud size={15} /> Upload Files
        </button>
      </div>

      {!loading && !error && content.length > 0 && (
        <div className="content-stats" style={{ display: 'flex', gap: 16, margin: '16px 0' }}>
          <div className="card" style={{ flex: 1, padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Total Content</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#2952E3' }}>{stats.total}</div>
          </div>
          <div className="card" style={{ flex: 1, padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Videos</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#2952E3' }}>{stats.videos}</div>
          </div>
          <div className="card" style={{ flex: 1, padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Documents</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#2952E3' }}>{stats.documents}</div>
          </div>
          <div className="card" style={{ flex: 1, padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>PDFs</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#2952E3' }}>{stats.pdfs}</div>
          </div>
        </div>
      )}

      <Tabs tabs={contentTabs} active={tab} onChange={setTab} />

      <div className="card content-page__toolbar" style={{ marginTop: 16 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search content title..." />
        <Dropdown
          value={category}
          onChange={setCategory}
          options={categories.map((c) => c.name)}
          placeholder="All Categories"
        />
        <Dropdown value={teacher} onChange={setTeacher} options={teachers} placeholder="All Teachers" />
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '32px' }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: 16,
                  borderRadius: 6,
                  marginBottom: 12,
                  background: '#eef1f8',
                  animation: 'pulse 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`,
                  width: i % 2 === 0 ? '100%' : '85%',
                }}
              />
            ))}
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
            `}</style>
          </div>
        ) : error ? (
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <p style={{ fontWeight: 500, marginBottom: 4 }}>{error}</p>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>
              Check your connection and try again.
            </p>
            <button className="btn btn-outline btn-sm" onClick={loadData}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 32px', textAlign: 'center', color: '#6b7280' }}>
            <Inbox size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
            <p style={{ fontWeight: 500, color: '#111827' }}>
              {content.length === 0 ? 'No content uploaded yet' : 'No content matches your filters'}
            </p>
            <p style={{ fontSize: 14 }}>
              {content.length === 0
                ? 'Upload your first file to get started.'
                : 'Try adjusting the search, category, or teacher filters.'}
            </p>
          </div>
        ) : (
          <Table columns={columns} rows={filtered} emptyMessage="No content matches your filters." />
        )}
      </div>

      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Content" width="500px">
        <form onSubmit={handleUpload} className="upload-form">
          <UploadBox
            accept=".pdf,.mp4,.doc,.docx"
            hint="PDF, Video, or Document up to 200MB"
            onFile={(file) => setUploadFile(file)}
          />
          <label>Title
            <input type="text" name="title" placeholder="Content title" required />
          </label>
          <label>Category
            <select name="categoryId" required defaultValue="">
              <option value="" disabled>Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <div className="modal__footer" style={{ padding: '20px 0 0' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowUpload(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
