import './Badge.css'

const map = {
  Active: 'badge--success', Approved: 'badge--success', Graded: 'badge--success', Completed: 'badge--neutral', Upcoming: 'badge--info',
  Pending: 'badge--warning', Inactive: 'badge--neutral', Draft: 'badge--neutral', Ongoing: 'badge--info',
  Suspended: 'badge--danger', Rejected: 'badge--danger',
}

export default function Badge({ status, children }) {
  const cls = map[status] || 'badge--neutral'
  return <span className={`badge ${cls}`}>{children || status}</span>
}
