import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { CalendarPlus, Calendar as CalendarIcon, Clock, CheckCircle2, Pencil, Trash2, Link as LinkIcon } from 'lucide-react'
import DashboardCard from '../../components/admin/DashboardCard'
import Table from '../../components/admin/Table'
import Badge from '../../components/admin/Badge'
import Modal from '../../components/admin/Modal'
import { liveClassService, categoryService } from '../../services/api'
import './LiveClasses.css'

export default function LiveClasses() {
const [showSchedule, setShowSchedule] = useState(false)
const [liveClasses, setLiveClasses] = useState([])
const [categories, setCategories] = useState([])
const [loading, setLoading] = useState(false)
const [title, setTitle] = useState("")
const [selectedCategory, setSelectedCategory] = useState("")
const [date, setDate] = useState("")
const [time, setTime] = useState("")
const [link, setLink] = useState("")
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

    console.log(res.data)

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
      console.log(res.data)

    setCategories(res.data)
  } catch (err) {
    console.error(err)
  }
}

const upcoming = liveClasses.filter(
  c => c.status === "UPCOMING"
).length

const ongoing = liveClasses.filter(
  c => c.status === "ONGOING"
).length

const completed = liveClasses.filter(
  c => c.status === "COMPLETED"
).length
  

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
              <button
          className="btn-icon"
          title="Edit"
          onClick={() => handleEdit(c)}
        >
          <Pencil size={15} />
        </button>

        <button
          className="btn-icon"
          onClick={() => handleDelete(c.liveId)}
        >
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
  setSelectedCategory(live.category.categoryId)

  setShowSchedule(true)
}
 const handleCreate = async () => {
  try {
    const userId = localStorage.getItem("userId")

    const data = {
      title,
      startingTime,
      streamlink,
    }

    if (editingId) {
      await liveClassService.update(editingId, data)
      toast.success("Live class updated")
    } else {
      await liveClassService.create(
        userId,
        selectedCategory,
        data
      )
      toast.success("Live class created")
    }

    fetchLiveClasses()

    setShowSchedule(false)

    // Reset form
    setEditingId(null)
    setTitle("")
    setStartingTime("")
    setStreamlink("")
    setSelectedCategory("")
    setDate("")

  } catch (err) {
    console.error(err)
    toast.error("Failed to create/update live class")
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
        <button className="btn btn-primary" onClick={() => setShowSchedule(true)}><CalendarPlus size={15} /> Schedule Live Class</button>
      </div>

      <div className="stats-grid">
          <DashboardCard
              icon={CalendarIcon}
              label="Upcoming"
              value={upcoming}
          />

          <DashboardCard
              icon={Clock}
              label="Ongoing Now"
              value={ongoing}
          />

          <DashboardCard
              icon={CheckCircle2}
              label="Completed"
              value={completed}
          />
      </div>

      <div className="card">
        <Table
          columns={columns}
          rows={liveClasses}
      />
      </div>

      <Modal open={showSchedule} onClose={() => setShowSchedule(false)} title={editingId ? "Edit Live Class" : "Schedule Live Class"} width="500px">
        <div className="schedule-form">
          <label>Class Title<input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Quantum Mechanics Foundations" /></label>
         <label>
            Category
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Select Category</option>

              {categories.map((c) => (
                <option
                  key={c.categoryId}
                  value={c.categoryId}
                >
                  {c.categoryTitle}
                </option>
              ))}
            </select>
          </label>
          <div className="schedule-form__row">
          <label>
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              Time
              <input
                type="time"
                value={startingTime}
                onChange={(e) => setStartingTime(e.target.value)}
              />
            </label>
          </div>
          <label>
            Meeting Link
            <input
              type="text"
              placeholder="https://meet.google.com/..."
              value={streamlink}
              onChange={(e) => setStreamlink(e.target.value)}
                placeholder="https://..."
                />
          </label>
          <div className="modal__footer" style={{ padding: '20px 0 0' }}>
            <button className="btn btn-outline" onClick={() => setShowSchedule(false)}>Cancel</button>
           <button
            className="btn btn-primary"
            onClick={handleCreate}
          >
            {editingId ? "Update" : "Schedule"}
          </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
