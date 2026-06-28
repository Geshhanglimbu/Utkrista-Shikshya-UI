import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Pencil, Trash2, Eye, UploadCloud } from 'lucide-react'
import SearchBar from '../../components/admin/SearchBar'
import Dropdown from '../../components/admin/Dropdown'
import Tabs from '../../components/admin/Tabs'
import Table from '../../components/admin/Table'
import Modal from '../../components/admin/Modal'
import UploadBox from '../../components/admin/UploadBox'
import { contentData, contentTabs, categoriesData } from '../utils/dummyData'
import './Content.css'

export default function Content() {
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [teacher, setTeacher] = useState('')
  const [showUpload, setShowUpload] = useState(false)

  const teachers = [...new Set(contentData.map((c) => c.teacher))]

  const filtered = useMemo(() => contentData.filter((c) => {
    const matchesTab = tab === 'All' || c.type === tab.replace(/s$/, '')
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !category || c.category === category
    const matchesTeacher = !teacher || c.teacher === teacher
    return matchesTab && matchesSearch && matchesCategory && matchesTeacher
  }), [tab, search, category, teacher])

  const columns = [
    { key: 'title', header: 'Title', render: (c) => <strong>{c.title}</strong> },
    { key: 'category', header: 'Category' },
    { key: 'type', header: 'Type', render: (c) => <span className="content-type-tag">{c.type}</span> },
    { key: 'teacher', header: 'Uploaded By' },
    { key: 'uploaded', header: 'Date' },
    { key: 'views', header: 'Views' },
    {
      key: 'actions', header: 'Actions',
      render: (c) => (
        <div className="row-actions">
          <button className="btn-icon" title="Preview" onClick={() => toast.info(`Previewing ${c.title}`)}><Eye size={15} /></button>
          <button className="btn-icon" title="Edit" onClick={() => toast.info(`Editing ${c.title}`)}><Pencil size={15} /></button>
          <button className="btn-icon" title="Delete" onClick={() => toast.success(`${c.title} deleted`)}><Trash2 size={15} /></button>
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
        <button className="btn btn-primary" onClick={() => setShowUpload(true)}><UploadCloud size={15} /> Upload Files</button>
      </div>

      <Tabs tabs={contentTabs} active={tab} onChange={setTab} />

      <div className="card content-page__toolbar" style={{ marginTop: 16 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search content title..." />
        <Dropdown value={category} onChange={setCategory} options={categoriesData.map((c) => c.name)} placeholder="All Categories" />
        <Dropdown value={teacher} onChange={setTeacher} options={teachers} placeholder="All Teachers" />
      </div>

      <div className="card">
        <Table columns={columns} rows={filtered} emptyMessage="No content matches your filters." />
      </div>

      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Content" width="500px">
        <div className="upload-form">
          <UploadBox accept=".pdf,.mp4,.doc,.docx" hint="PDF, Video, or Document up to 200MB" onFile={() => {}} />
          <label>Title<input type="text" placeholder="Content title" /></label>
          <label>Category
            <select>{categoriesData.map((c) => <option key={c.id}>{c.name}</option>)}</select>
          </label>
          <div className="modal__footer" style={{ padding: '20px 0 0' }}>
            <button className="btn btn-outline" onClick={() => setShowUpload(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { toast.success('Content uploaded'); setShowUpload(false) }}>Upload</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
