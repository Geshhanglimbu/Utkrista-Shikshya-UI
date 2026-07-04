import {
  Users as UsersIcon, GraduationCap, BookOpenCheck, FolderKanban, CreditCard, Banknote,
  Video, FileCheck2, Plus, FilePlus2, ShieldCheck, CalendarClock,
  TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowUpRight
} from 'lucide-react'

import './Dashboard.css'
import DashboardCard from '../../components/admin/DashboardCard'
import Badge from '../../components/admin/Badge'
import ChartCard, { BarTrendChart, LineTrendChart, DonutChart } from '../../components/admin/ChartCard'
import { useEffect, useMemo, useState } from "react"

import {
  userService,
  categoryService,
  liveClassService
} from "../../services/api"

export default function Dashboard() {
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [liveClasses, setLiveClasses] = useState([])
  const [loading, setLoading] = useState(true)

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const [usersRes, categoriesRes, liveClassesRes] = await Promise.allSettled([
        userService.getAll(),
        categoryService.getAll(),
        liveClassService.getAll()
      ])

      if (usersRes.status === 'fulfilled') {
        const uVal = usersRes.value;
        const data = Array.isArray(uVal?.data)
          ? uVal.data
          : uVal?.data?.data || []
        setUsers(data)
      } else {
        console.error("Dashboard users load failed:", usersRes.reason)
        setUsers([])
      }

      if (categoriesRes.status === 'fulfilled') {
        const cVal = categoriesRes.value;
        const data = Array.isArray(cVal?.data)
          ? cVal.data
          : cVal?.data?.data || []
        setCategories(data)
      } else {
        console.error("Dashboard categories load failed:", categoriesRes.reason)
        setCategories([])
      }

      if (liveClassesRes.status === 'fulfilled') {
        const lcVal = liveClassesRes.value;
        const data = Array.isArray(lcVal?.data)
          ? lcVal.data
          : lcVal?.data?.data || []
        setLiveClasses(data)
      } else {
        console.error("Dashboard live classes load failed:", liveClassesRes.reason)
        setLiveClasses([])
      }
    } catch (err) {
      console.error("Error occurred while loading dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const teacherCount = useMemo(() => {
    if (!Array.isArray(users)) return 0
    return users.filter(u => {
      const roleName = u.roles?.[0]?.name?.toUpperCase() || u.role?.toUpperCase() || ''
      return roleName === 'ROLE_TEACHER' || roleName === 'TEACHER'
    }).length
  }, [users])

  const studentCount = useMemo(() => {
    if (!Array.isArray(users)) return 0
    return users.filter(u => {
      const roleName = u.roles?.[0]?.name?.toUpperCase() || u.role?.toUpperCase() || ''
      return roleName === 'ROLE_STUDENT' || roleName === 'STUDENT'
    }).length
  }, [users])

  const cards = useMemo(() => [
    { icon: UsersIcon, label: 'Total Users', value: users?.length || 0, trend: '+12%', trendUp: true, accent: '#2563EB' },
    { icon: GraduationCap, label: 'Teachers', value: teacherCount, trend: '+3%', trendUp: true, accent: '#7C3AED' },
    { icon: BookOpenCheck, label: 'Students', value: studentCount, trend: '+15%', trendUp: true, accent: '#0891B2' },
    { icon: FolderKanban, label: 'Categories', value: categories?.length || 0, accent: '#16A34A' },
    { icon: Video, label: 'Live Classes', value: liveClasses?.length || 0, accent: '#DC2626' },
  ], [users, teacherCount, studentCount, categories, liveClasses])

  const quickActions = [
    { icon: Plus, label: 'Add Category' },
    { icon: FilePlus2, label: 'Create Post' },
    { icon: ShieldCheck, label: 'Review Payments' },
    { icon: CalendarClock, label: 'Schedule Live Class' },
  ]

  const categoryDistribution = useMemo(() => {
    const palette = ['#2563EB', '#7C3AED', '#0891B2', '#16A34A', '#D97706', '#DC2626']
    if (!Array.isArray(categories)) return []
    return categories.slice(0, 6).map((c, i) => ({
      label: c.name || c.categoryTitle || 'Untitled',
      value: c.courseCount ?? 0,
      color: palette[i % palette.length]
    }))
  }, [categories])

  const recentEnrollments = useMemo(() => {
    if (!Array.isArray(users)) return []
    return [...users]
      .filter(u => {
        const roleName = u.roles?.[0]?.name?.toUpperCase() || u.role?.toUpperCase() || ''
        return roleName === 'ROLE_STUDENT' || roleName === 'STUDENT'
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5)
  }, [users])

  const upcomingLiveClasses = useMemo(() => {
    if (!Array.isArray(liveClasses)) return []
    return [...liveClasses]
      .filter(lc => {
        const timeVal = lc.startsAt || lc.date
        if (!timeVal) return false
        const d = new Date(timeVal)
        return !isNaN(d.getTime()) && d >= new Date()
      })
      .sort((a, b) => {
        const dA = new Date(a.startsAt || a.date)
        const dB = new Date(b.startsAt || b.date)
        return dA - dB
      })
      .slice(0, 5)
  }, [liveClasses])

  const initials = (name) => {
    if (!name || typeof name !== 'string') return ''
    return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]?.toUpperCase()).join('')
  }

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
        <ChartCard
          title="Courses by Category"
          subtitle="Distribution across active categories"
        >
          {categoryDistribution.length > 0 ? (
            <div className="dashboard__donut">
              <DonutChart segments={categoryDistribution} />
              <div className="dashboard__donut-legend">
                {categoryDistribution.map((c) => (
                  <div className="legend-row" key={c.label}>
                    <span className="legend-dot" style={{ background: c.color }} />
                    {c.label}
                    <strong style={{ marginLeft: 'auto' }}>{c.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="dashboard__empty">No category data yet</div>
          )}
        </ChartCard>
      </div>

      <div className="dashboard__widgets">
        <div className="widget card">
          <div className="widget__head">
            <h4>New Enrollments</h4>
            <a className="widget__link" href="/admin/users">View all <ArrowUpRight size={13} /></a>
          </div>
          {recentEnrollments.length === 0 ? (
            <div className="dashboard__empty">No recent enrollments</div>
          ) : recentEnrollments.map((student) => (
            <div className="widget-row" key={student._id || student.id}>
              <div className="widget-avatar">{initials(student.name)}</div>
              <div className="widget-row__text">
                <strong>{student.name}</strong>
                <span>{student.email}</span>
              </div>
              <Badge tone="info">Student</Badge>
            </div>
          ))}
        </div>

        <div className="widget card">
          <div className="widget__head">
            <h4>Upcoming Live Classes</h4>
            <a className="widget__link" href="/admin/live-classes">View all <ArrowUpRight size={13} /></a>
          </div>
          {upcomingLiveClasses.length === 0 ? (
            <div className="dashboard__empty">No classes scheduled</div>
          ) : upcomingLiveClasses.map((lc) => (
            <div className="widget-row" key={lc._id || lc.id}>
              <div className="widget-avatar">
                <Video size={16} />
              </div>
              <div className="widget-row__text">
                <strong>{lc.title}</strong>
                <span>
                  {(() => {
                    const timeVal = lc.startsAt || lc.date
                    if (!timeVal) return ""
                    const d = new Date(timeVal)
                    return isNaN(d.getTime()) ? "" : d.toLocaleString('default', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  })()}
                </span>
              </div>
              <Badge tone="info">Live</Badge>
            </div>
          ))}
        </div>

        <div className="widget card">
          <div className="widget__head">
            <h4>Needs Your Attention</h4>
          </div>
          <div className="widget-row">
            
          </div>
          <div className="widget-row">
            <div className="widget-avatar" style={{ background: '#DBEAFE', color: '#2563EB' }}>
              <FileCheck2 size={16} />
            </div>
            <div className="widget-row__text">
              <strong>Course approvals</strong>
              <span>Check submissions from teachers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
