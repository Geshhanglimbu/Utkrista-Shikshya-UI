import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { CalendarPlus, Calendar as CalendarIcon, Clock, CheckCircle2, Pencil, Trash2, Link as LinkIcon } from 'lucide-react'
import DashboardCard from '../../components/admin/DashboardCard'
import Table from '../../components/admin/Table'
import Badge from '../../components/admin/Badge'
import Modal from '../../components/admin/Modal'
import { liveClassService, categoryService } from '../../services/api'
import './LiveClasses.css'

// The logged-in user's id is stored directly as "userId" by Login.jsx:
//   localStorage.setItem("userId", res.data.user.id.toString())
// (There's also a "user" key with the full user object, kept as a fallback.)
const getLoggedInUserId = () => {
  const directId = localStorage.getItem("userId")
  if (directId) return directId

  try {
    const stored = JSON.parse(localStorage.getItem("user") || "null")
    return stored?.id ?? stored?.userId ?? null
  } catch {
    return null
  }
}

export default function LiveClasses() {
const [showSchedule, setShowSchedule] = useState(false)
const [liveClasses, setLiveClasses] = useState([])
const [categories, setCategories] = useState([])
const [loading, setLoading] = useState(false)
const [title, setTitle] = useState("")
const [selectedCategory, setSelectedCategory] = useState("")
const [startingTime, setStartingTime] = useState("")
const [streamlink, setStreamlink] = useState("")
const [editingId, setEditingId] = useState(null)

useEffect(() => {
  fetchLiveClasses()
  fetchCategories()
}, [])

const fetchLiveClasses = async () => {
  setLoading(true)

  try {
    const res = await liveClassService.getAll()
    setLiveClasses(res.data)
  } catch (err) {
    console.error(err)
    toast.error("Failed to load live classes")
  } finally {
    setLoading(false)
  }
}

const fetchCategories = async () => {
  try {
    const res = await categoryService.getAll()
    setCategories(res.data)
  } catch (err) {
    console.error(err)
  }
}

const upcoming = liveClasses.filter(c => c.status === "UPCOMING").length
const ongoing = liveClasses.filter(c => c.status === "ONGOING").length
const completed = liveClasses.filter(c => c.status === "COMPLETED").length

const columns = [
  {
    key: "title",
    header: "Title",
    render: (c) => <strong>{c.title}</strong>,
  },
  {
    key: "teacher",
    header: "Teacher",
    render: (c) => c.user?.name || "N/A",
  },
  {
    key: "category",
    header: "Category",
    render: (c) => c.category?.categoryTitle || "N/A",
  },
  {
    key: "time",
    header: "Starting Time",
    render: (c) => c.startingTime,
  },
  {
    key: "link",
    header: "Meeting Link",
    render: (c) =>
      c.streamlink ? (
        <a href={c.streamlink} target="_blank" rel="noreferrer">
          <LinkIcon size={12} /> Join
        </a>
      ) : (
        "—"
      ),
  },
  {
    key: "actions",
    header: "Actions",
    render: (c) => (
      <div className="row-actions">
        <button className="btn-icon" title="Edit" onClick={() => handleEdit(c)}>
          <Pencil size={15} />
        </button>
        <button className="btn-icon" onClick={() => handleDelete(c.liveId)}>
          <Trash2 size={15} />
        </button>
      </div>
    ),
  },
]

const handleEdit = (live) => {
  setEditingId(live.liveId)
  setTitle(live.title)
  setStartingTime(live.startingTime)
  setStreamlink(live.streamlink)
  setSelectedCategory(live.category?.categoryId ?? "")
  setShowSchedule(true)
}

const resetForm = () => {
  setEditingId(null)
  setTitle("")
  setStartingTime("")
  setStreamlink("")
  setSelectedCategory("")
}

const handleCreate = async () => {
  // Basic guardrails so we fail fast in the UI with a clear message
  // instead of sending a request that 500s.
  if (!title.trim()) {
    toast.error("Please enter a class title.")
    return
  }
  if (!startingTime) {
    toast.error("Please pick a starting time.")
    return
  }
  if (!streamlink.trim()) {
    toast.error("Please enter a meeting link.")
    return
  }

  const data = { title, startingTime, streamlink }

  try {
    if (editingId) {
      await liveClassService.update(editingId, data)
      toast.success("Live class updated")
    } else {
      if (!selectedCategory) {
        toast.error("Please select a category.")
        return
      }

      const userId = getLoggedInUserId()
      if (!userId) {
        toast.error("Couldn't determine the logged-in user — please log in again.")
        return
      }

      await liveClassService.create(userId, selectedCategory, data)
      toast.success("Live class created")
    }

    fetchLiveClasses()
    setShowSchedule(false)
    resetForm()
  } catch (err) {
    console.error(err)
    const serverMessage = err.response?.data?.message || err.response?.data?.error
    toast.error(serverMessage || "Failed to create/update live class")
  }
}

const handleDelete = async (id) => {
  try {
    await liveClassService.remove(id)
    toast.success("Live class deleted")
    fetchLiveClasses()
  } catch (err) {
    toast.error("Delete failed")
  }
}

  return (
    <div className="liveclasses-page">
      <div className="page-head">
        <div>
          <h1>Live Classes Management</h1>
          <p>Oversee real-time education and live schedules.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowSchedule(true)}>
          <CalendarPlus size={15} /> Schedule Live Class
        </button>
      </div>

      <div className="stats-grid">
        <DashboardCard icon={CalendarIcon} label="Upcoming" value={upcoming} />
        <DashboardCard icon={Clock} label="Ongoing Now" value={ongoing} />
        <DashboardCard icon={CheckCircle2} label="Completed" value={completed} />
      </div>

      <div className="card">
        <Table columns={columns} rows={liveClasses} />
      </div>

      <Modal
        open={showSchedule}
        onClose={() => { setShowSchedule(false); resetForm() }}
        title={editingId ? "Edit Live Class" : "Schedule Live Class"}
        width="500px"
      >
        <div className="schedule-form">
          <label>
            Class Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quantum Mechanics Foundations"
            />
          </label>

          <label>
            Category
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={!!editingId}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryTitle}
                </option>
              ))}
            </select>
          </label>

          <label>
            Time
            <input
              type="time"
              value={startingTime}
              onChange={(e) => setStartingTime(e.target.value)}
            />
          </label>

          <label>
            Meeting Link
            <input
              type="text"
              placeholder="https://meet.google.com/..."
              value={streamlink}
              onChange={(e) => setStreamlink(e.target.value)}
            />
          </label>

          <div className="modal__footer" style={{ padding: '20px 0 0' }}>
            <button className="btn btn-outline" onClick={() => { setShowSchedule(false); resetForm() }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreate}>
              {editingId ? "Update" : "Schedule"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
