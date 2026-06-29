import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Eye, Check, X, Clock, CheckCircle2, XCircle, Wallet, Image as ImageIcon } from 'lucide-react'
import SearchBar from '../../components/admin/SearchBar'
import Dropdown from '../../components/admin/Dropdown'
import DashboardCard from '../../components/admin/DashboardCard'
import Table from '../../components/admin/Table'
import Badge from '../../components/admin/Badge'
import Drawer from '../../components/admin/Drawer'
import Modal from '../../components/admin/Modal'
import { paymentsData, paymentStats, categoriesData } from '../utils/dummyData'
import './Payments.css'

export default function Payments() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [course, setCourse] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirm, setConfirm] = useState(null) // { payment, action }

  const filtered = useMemo(() => paymentsData.filter((p) =>
    p.student.toLowerCase().includes(search.toLowerCase()) &&
    (!status || p.status === status) &&
    (!course || p.course === course)
  ), [search, status, course])

  const act = (payment, action) => setConfirm({ payment, action })

  const confirmAction = () => {
    const { payment, action } = confirm
    toast.success(`Payment for ${payment.student} ${action === 'approve' ? 'approved' : 'rejected'}`)
    setConfirm(null)
    setSelected(null)
  }

  const columns = [
    { key: 'student', header: 'Student', render: (p) => (
      <div><strong>{p.student}</strong><div className="muted-sub">{p.studentId}</div></div>
    ) },
    { key: 'course', header: 'Course' },
    { key: 'amount', header: 'Amount', render: (p) => <strong>{p.amount}</strong> },
    { key: 'date', header: 'Date' },
    { key: 'status', header: 'Status', render: (p) => <Badge status={p.status} /> },
    {
      key: 'actions', header: 'Actions',
      render: (p) => (
        <div className="row-actions">
          <button className="btn-icon" title="View" onClick={() => setSelected(p)}><Eye size={15} /></button>
          {p.status === 'Pending' && (
            <>
              <button className="btn-icon" style={{ color: 'var(--success)' }} title="Approve" onClick={() => act(p, 'approve')}><Check size={15} /></button>
              <button className="btn-icon" style={{ color: 'var(--danger)' }} title="Reject" onClick={() => act(p, 'reject')}><X size={15} /></button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="payments-page">
      <div className="page-head">
        <div>
          <h1>Payment Management</h1>
          <p>Review and approve student payments and platform transactions.</p>
        </div>
      </div>

      <div className="stats-grid">
        <DashboardCard icon={Clock} label="Pending" value={paymentStats.pending} accent="#D97706" />
        <DashboardCard icon={CheckCircle2} label="Approved" value={paymentStats.approved} accent="#16A34A" />
        <DashboardCard icon={XCircle} label="Rejected" value={paymentStats.rejected} accent="#DC2626" />
        <DashboardCard icon={Wallet} label="Total Revenue" value={`Rs ${paymentStats.revenue}`} accent="#2563EB" />
      </div>

      <div className="card payments-page__toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by student name..." />
        <Dropdown value={status} onChange={setStatus} options={['Pending', 'Approved', 'Rejected']} placeholder="All Status" />
        <Dropdown value={course} onChange={setCourse} options={categoriesData.map((c) => c.name)} placeholder="All Courses" />
      </div>

      <div className="card">
        <Table columns={columns} rows={filtered} emptyMessage="No transactions match your filters." />
      </div>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Payment Details">
        {selected && (
          <div className="payment-detail">
            <div className="payment-detail__head">
              <h3>{selected.student}</h3>
              <Badge status={selected.status} />
            </div>
            <p className="muted-sub">Student ID: {selected.studentId}</p>
            <dl>
              <dt>Course</dt><dd>{selected.course}</dd>
              <dt>Amount</dt><dd>{selected.amount}</dd>
              <dt>Date</dt><dd>{selected.date}</dd>
              <dt>Payment Method</dt><dd>{selected.method}</dd>
            </dl>
            <h4>Verification Proof</h4>
            <div className="payment-screenshot">
              <ImageIcon size={28} />
              <span>Payment screenshot preview</span>
            </div>
            {selected.status === 'Pending' && (
              <div className="payment-detail__actions">
                <button className="btn btn-danger" onClick={() => act(selected, 'reject')}>Reject Payment</button>
                <button className="btn btn-success" onClick={() => act(selected, 'approve')}>Approve Payment</button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.action === 'approve' ? 'Approve Payment' : 'Reject Payment'}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
            <button className={confirm?.action === 'approve' ? 'btn btn-success' : 'btn btn-danger'} onClick={confirmAction}>
              {confirm?.action === 'approve' ? 'Approve' : 'Reject'}
            </button>
          </>
        }
      >
        {confirm && `Are you sure you want to ${confirm.action} the payment of ${confirm.payment.amount} from ${confirm.payment.student}?`}
      </Modal>
    </div>
  )
}
