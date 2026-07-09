import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeft, Video, FileText, User, CalendarClock } from 'lucide-react'
import { contentService } from '../../services/api'
import './Categories.css' // ya alag CategoryContent.css banauna sakincha

// Java LocalDateTime array -> JS Date
const dateArrayToDate = (arr) => {
  if (!Array.isArray(arr) || arr.length < 3) return null
  const [year, month, day, hour = 0, minute = 0, second = 0] = arr
  return new Date(year, month - 1, day, hour, minute, second)
}

const formatDate = (arr) => {
  const d = dateArrayToDate(arr)
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const fileUrl = (imageName) =>
  imageName ? contentService.getFileUrl(imageName) : null;
const isPdf = (imageName) => imageName?.toLowerCase().endsWith('.pdf')
const isImage = (imageName) => /\.(jpe?g|png|gif|webp)$/i.test(imageName || '')

const normalizePost = (p) => ({
  id: p.postId,
  title: p.title || 'Untitled',
  content: p.content || '',
  imageName: p.imageName || '',
  videoLink: p.videoLink || null,
  mentor: p.mentor || null,
  addedDateLabel: formatDate(p.addedDate),
  categoryTitle: p.category?.categoryTitle || null,
})

// Response direct array auxa — { data } wrap huna sakcha vane pani handle garne
const extractPosts = (res) => {
  const d = res?.data
  if (Array.isArray(d)) return d
  const list = d?.data ?? d?.content ?? d?.posts
  return Array.isArray(list) ? list : []
}

export default function CategoryContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const categoryName = location.state?.categoryName

  useEffect(() => {
    let active = true
    const fetchContent = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await contentService.getByCategoryId(id)
        const list = extractPosts(res).map(normalizePost)
        if (active) setPosts(list)
      } catch (err) {
        const message = err?.response?.data?.message || 'Failed to load content'
        if (active) {
          setError(message)
          toast.error(message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchContent()
    return () => {
      active = false
    }
  }, [id])

  // category ko title chai state bata aaucha, natra first post bata nikalne
  const derivedCategoryName = useMemo(
    () => categoryName || posts[0]?.categoryTitle,
    [categoryName, posts]
  )

  return (
    <div className="categories-page">
      <div className="page-head">
        <div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate(-1)}
            style={{ marginBottom: 12 }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1>{derivedCategoryName || `Category #${id}`} — Content</h1>
          <p>All posts published under this category.</p>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          Loading content...
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
          No content found for this category.
        </div>
      ) : (
        <div className="categories-grid">
          {posts.map((p) => (
            <div
                key={p.id}
                className="card category-card"
                onClick={() => navigate(`/content/${p.id}`)}
                style={{ cursor: "pointer" }}
                >
              <div className="category-card__body">
                <div className="category-card__top">
                  <h4>{p.title}</h4>
                </div>

                {p.content && <p>{p.content}</p>}

                {isImage(p.imageName) && (
                  <img
                    src={fileUrl(p.imageName)}
                    alt={p.title}
                    style={{ width: '100%', borderRadius: 8, margin: '8px 0' }}
                  />
                )}
                {console.log(fileUrl(p.imageName))}
                {isPdf(p.imageName) && (
                 <a
                    
                    href={fileUrl(p.imageName)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="btn btn-outline btn-sm"
                    style={{ margin: '8px 0', display: 'inline-flex' }}
                    >
                    <FileText size={13} /> View Attachment
                  </a>
                )}

                <div className="category-card__stats">
                  {p.mentor && (
                    <span>
                      <User size={13} /> {p.mentor}
                    </span>
                  )}
                  <span>
                    <CalendarClock size={13} /> {p.addedDateLabel}
                  </span>
                  {p.videoLink && (
                    <span>
                      <Video size={13} />{' '}
                      <a
                            href={`https://${p.videoLink.replace(/^https?:\/\//, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            >
                        Watch video
                      </a>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
