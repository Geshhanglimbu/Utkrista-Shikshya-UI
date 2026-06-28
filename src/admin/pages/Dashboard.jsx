import {
  Users, GraduationCap, BookOpenCheck, FolderKanban, CreditCard, Banknote,
  Video, FileCheck2, Plus, FilePlus2, ShieldCheck, CalendarClock
} from 'lucide-react'
import {
  statsData, revenueTrend, registrationTrend, paymentStatusBreakdown,
  enrollmentDistribution, recentUsers, recentPayments, recentActivities, upcomingLiveClasses
} from '../utils/dummyData'
import './Dashboard.css'
import DashboardCard from '../../components/admin/DashboardCard'
import Badge from '../../components/admin/Badge'
import ChartCard, { BarTrendChart, LineTrendChart, DonutChart } from '../../components/admin/ChartCard'


export default function Dashboard() {
    
  const cards = [
    { icon: Users, label: 'Total Users', value: statsData.totalUsers.toLocaleString(), trend: '+12%', trendUp: true, accent: '#2563EB' },
    { icon: GraduationCap, label: 'Teachers', value: statsData.teachers, trend: '+3%', trendUp: true, accent: '#7C3AED' },
    { icon: BookOpenCheck, label: 'Students', value: statsData.students.toLocaleString(), trend: '+15%', trendUp: true, accent: '#0891B2' },
    { icon: FolderKanban, label: 'Categories', value: statsData.categories, accent: '#16A34A' },
    { icon: CreditCard, label: 'Pending Payments', value: statsData.pendingPayments, trend: '-4%', trendUp: false, accent: '#D97706' },
    { icon: Banknote, label: 'Monthly Revenue', value: `Rs ${statsData.monthlyRevenue}M`, trend: '+8%', trendUp: true, accent: '#2563EB' },
    { icon: Video, label: 'Live Classes', value: statsData.liveClasses, accent: '#DC2626' },
    { icon: FileCheck2, label: 'Exams', value: statsData.exams, accent: '#0F766E' },
  ]

  const quickActions = [
    { icon: Plus, label: 'Add Category' },
    { icon: FilePlus2, label: 'Create Post' },
    { icon: ShieldCheck, label: 'Review Payments' },
    { icon: CalendarClock, label: 'Schedule Live Class' },
  ]

  return (
    <div className="dashboard">
      <div className="page-head">
        <div>
          <h1>Overview Dashboard</h1>
          <p>Welcome back, Admin! Here's what's happening at Utkrista Shikshya today.</p>
        </div>
        <div className="dashboard__quick-actions">
          {quickActions.map(({ icon: Icon, label }) => (
            <button key={label} className="btn btn-outline btn-sm">
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((c) => <DashboardCard key={c.label} {...c} />)}
      </div>

      <div className="dashboard__charts">
        <ChartCard title="Monthly Revenue Trend" subtitle="Last 12 months">
          <LineTrendChart data={revenueTrend} />
        </ChartCard>
        <ChartCard title="Payment Status" subtitle="This month">
          <div className="dashboard__donut">
            <DonutChart segments={paymentStatusBreakdown} />
            <div className="dashboard__donut-legend">
              {paymentStatusBreakdown.map((s) => (
                <div key={s.label} className="legend-row">
                  <span className="legend-dot" style={{ background: s.color }} />
                  {s.label} <strong>{s.value}%</strong>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
        <ChartCard title="User Registrations" subtitle="Last 12 months">
          <BarTrendChart data={registrationTrend} color="var(--secondary)" />
        </ChartCard>
        <ChartCard title="Course Enrollment Distribution" subtitle="Top courses">
          <div className="dashboard__enroll-list">
            {enrollmentDistribution.map((e) => (
              <div key={e.name} className="enroll-row">
                <span>{e.name}</span>
                <strong>{e.value.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="dashboard__widgets">
        <div className="card widget">
          <h4>Recent User Registrations</h4>
          {recentUsers.map((u) => (
            <div key={u.id} className="widget-row">
              <span className="widget-avatar">{u.avatar}</span>
              <div className="widget-row__text">
                <strong>{u.name}</strong>
                <span>{u.role} • {u.joined}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="card widget">
          <h4>Recent Payments</h4>
          {recentPayments.map((p) => (
            <div key={p.id} className="widget-row">
              <div className="widget-row__text">
                <strong>{p.student}</strong>
                <span>{p.course} • {p.amount}</span>
              </div>
              <Badge status={p.status} />
            </div>
          ))}
        </div>

        <div className="card widget">
          <h4>Upcoming Live Classes</h4>
          {upcomingLiveClasses.map((l) => (
            <div key={l.id} className="widget-row">
              <div className="widget-row__text">
                <strong>{l.title}</strong>
                <span>{l.teacher} • {l.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="card widget">
          <h4>Recent Activity</h4>
          {recentActivities.map((a) => (
            <div key={a.id} className="widget-row">
              <div className="widget-row__text">
                <strong>{a.text}</strong>
                <span>{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
