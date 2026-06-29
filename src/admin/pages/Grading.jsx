import { useState } from 'react'
import { toast } from 'react-toastify'
import { FileText, Clock, CheckCircle2, BarChart3, Save } from 'lucide-react'
import DashboardCard from '../../components/admin/DashboardCard'
import Table from '../../components/admin/Table'
import Badge from '../../components/admin/Badge'
import { gradingSubmissions, gradingStats } from '../utils/dummyData'
import './Grading.css'

export default function Grading() {
  const [active, setActive] = useState(gradingSubmissions[0])
  const [marks, setMarks] = useState(active.marks || '')
  const [feedback, setFeedback] = useState('')

  const selectSubmission = (s) => {
    setActive(s)
    setMarks(s.marks || '')
    setFeedback('')
  }

  const handleSave = () => {
    toast.success(`Grade saved for ${active.student}`)
  }

  const columns = [
    { key: 'student', header: 'Student', render: (s) => (
      <div className="grading-student" onClick={() => selectSubmission(s)}>
        <span className="user-cell__avatar">{s.avatar}</span>
        <strong>{s.student}</strong>
      </div>
    ) },
    { key: 'marks', header: 'Marks', render: (s) => s.marks ?? '—' },
    { key: 'status', header: 'Status', render: (s) => <Badge status={s.status} /> },
    { key: 'actions', header: 'Actions', render: (s) => (
      <button className="btn btn-outline btn-sm" onClick={() => selectSubmission(s)}>Grade</button>
    ) },
  ]

  return (
    <div className="grading-page">
      <div className="page-head">
        <div>
          <h1>Grading Terminal</h1>
          <p>Evaluating: Monthly Test Mid-Term 2024</p>
        </div>
      </div>

      <div className="stats-grid">
        <DashboardCard icon={Clock} label="Pending Submissions" value={gradingStats.pending} accent="#D97706" />
        <DashboardCard icon={CheckCircle2} label="Graded" value={gradingStats.graded} accent="#16A34A" />
        <DashboardCard icon={BarChart3} label="Average Score" value={`${gradingStats.average}%`} accent="#2563EB" />
      </div>

      <div className="grading-split">
        <div className="card grading-split__list">
          <h4 style={{ padding: '16px 16px 0' }}>Submissions</h4>
          <Table columns={columns} rows={gradingSubmissions} />
        </div>

        <div className="card grading-split__detail">
          <div className="grading-preview">
            <FileText size={36} />
            <span>Submission preview for {active.student}</span>
          </div>
          <div className="grading-form">
            <h4>{active.student}</h4>
            <p className="muted-sub">{active.exam}</p>
            <label>Marks Obtained
              <input type="number" value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="e.g. 85" max={100} />
            </label>
            <label>Feedback
              <textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Write feedback for the student..." />
            </label>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSave}>
              <Save size={15} /> Save & Next Student
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
