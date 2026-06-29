import { useState } from 'react'
import { toast } from 'react-toastify'
import { CalendarPlus, Calendar as CalendarIcon, Clock, CheckCircle2, Pencil, Trash2, Link as LinkIcon } from 'lucide-react'
import DashboardCard from '../../components/admin/DashboardCard'
import Table from '../../components/admin/Table'
import Badge from '../../components/admin/Badge'
import Modal from '../../components/admin/Modal'
import { liveClassesData, liveClassStats, categoriesData } from '../utils/dummyData'
import './LiveClasses.css'

export default function LiveClasses() {
  const [showSchedule, setShowSchedule] = useState(false)

  const columns = [
    { key: 'title', header: 'Title', render: (c) => <strong>{c.title}</strong> },
    { key: 'teacher', header: 'Teacher' },
    { key: 'category', header: 'Category' },
    { key: 'date', header: 'Date' },
    { key: 'time', header: 'Time' },
    { key: 'status', header: 'Status', render: (c) => <Badge status={c.status} /> },
    { key: 'link', header: 'Meeting Link', render: (c) => c.link !== '-' ? <span className="live-link"><LinkIcon size={12} /> {c.link}</span> : '—' },
    {
      key: 'actions', header: 'Actions',
      render: (c) => (
        <div className="row-actions">
          <button className="btn-icon" title="Edit" onClick={() => toast.info(`Editing ${c.title}`)}><Pencil size={15} /></button>
          <button className="btn-icon" title="Delete" onClick={() => toast.success(`${c.title} removed`)}><Trash2 size={15} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="liveclasses-page">
      <div className="page-head">
        <div>
          <h1>Live Classes Management</h1>
          <p>Oversee real-time education and live schedules.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowSchedule(true)}><CalendarPlus size={15} /> Schedule Live Class</button>
      </div>

      <div className="stats-grid">
        <DashboardCard icon={CalendarIcon} label="Upcoming" value={liveClassStats.upcoming} accent="#2563EB" />
        <DashboardCard icon={Clock} label="Ongoing Now" value={liveClassStats.ongoing} accent="#D97706" />
        <DashboardCard icon={CheckCircle2} label="Completed" value={liveClassStats.completed} accent="#16A34A" />
      </div>

      <div className="card">
        <Table columns={columns} rows={liveClassesData} />
      </div>

      <Modal open={showSchedule} onClose={() => setShowSchedule(false)} title="Schedule Live Class" width="500px">
        <div className="schedule-form">
          <label>Class Title<input type="text" placeholder="e.g. Quantum Mechanics Foundations" /></label>
          <label>Category
            <select>{categoriesData.map((c) => <option key={c.id}>{c.name}</option>)}</select>
          </label>
          <div className="schedule-form__row">
            <label>Date<input type="date" /></label>
            <label>Time<input type="time" /></label>
          </div>
          <label>Meeting Link<input type="text" placeholder="https://meet.google.com/..." /></label>
          <div className="modal__footer" style={{ padding: '20px 0 0' }}>
            <button className="btn btn-outline" onClick={() => setShowSchedule(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { toast.success('Live class scheduled'); setShowSchedule(false) }}>Schedule</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
