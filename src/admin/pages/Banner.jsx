import { useState } from 'react'
import { toast } from 'react-toastify'
import { Image as ImageIcon, Eye, RefreshCw, Trash2, Plus } from 'lucide-react'
import UploadBox from '../../components/admin/UploadBox'
import Badge from '../../components/admin/Badge'
import { bannersData } from '../utils/dummyData'
import './Banner.css'

export default function Banner() {
  const [banners] = useState(bannersData)

  return (
    <div className="banner-page">
      <div className="page-head">
        <div>
          <h1>Banner Management</h1>
          <p>Curate and organize the visual storytelling of your homepage carousels.</p>
        </div>
      </div>

      <div className="card banner-upload">
        <UploadBox hint="JPEG, PNG up to 10MB. Recommended resolution: 1920x600px for desktop banners." onFile={() => toast.success('Banner uploaded')} />
      </div>

      <h3 className="banner-section-title">Active Banners <span className="banner-count">{banners.filter(b => b.status === 'Active').length}</span></h3>

      <div className="banner-grid">
        {banners.map((b) => (
          <div key={b.id} className="card banner-card">
            <div className="banner-card__thumb"><ImageIcon size={26} /></div>
            <div className="banner-card__body">
              <strong>{b.title}</strong>
              <span className="muted-sub">Uploaded {b.uploaded}</span>
              <Badge status={b.status} />
            </div>
            <div className="banner-card__actions">
              <button className="btn btn-outline btn-sm" onClick={() => toast.info('Preview')}> <Eye size={13} /> Preview</button>
              <button className="btn btn-outline btn-sm" onClick={() => toast.info('Replace banner')}><RefreshCw size={13} /> Replace</button>
              <button className="btn-icon" title="Delete" onClick={() => toast.success('Banner deleted')}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
        <button className="banner-add-card" onClick={() => toast.info('Create new slot')}>
          <Plus size={22} />
          <span>Create New Slot</span>
        </button>
      </div>
    </div>
  )
}
