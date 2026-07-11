import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeft, Video, FileText, User, CalendarClock, Inbox, ExternalLink } from 'lucide-react'
import { contentService } from '../../services/api'
import Modal from '../../components/admin/Modal'
import './Categories.css'
import './CategoryContent.css'

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

const fileUrl = (imageName) => (imageName ? contentService.getFileUrl(imageName) : null)
const isPdf = (imageName) => (imageName || '').toLowerCase().endsWith('.pdf')
const isImage = (imageName) => /\.(jpe?g|png|gif|webp)$/i.test(imageName || '')

// Video links are sometimes stored without a protocol, or with one already -
// this normalizes either form into a safe absolute URL.
const normalizeVideoLink = (link) => {
  if (!link) return null
  return /^https?:\/\//i.test(link) ? link : `https://${link}`
}

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
  const [selectedPost, setSelectedPost] = useState(null)

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
          <button className="btn btn-outline btn-sm back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Back
          </button>
          <h1>{derivedCategoryName || `Category #${id}`}</h1>
          <p>
            {loading
              ? 'Loading content…'
              : `${posts.length} post${posts.length === 1 ? '' : 's'} published under this category`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card state-panel">
          <div className="spinner" />
          <p>Loading content…</p>
        </div>
      ) : error ? (
        <div className="card state-panel">
          <p>{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="card state-panel">
          <Inbox size={26} className="state-panel__icon" />
          <p>No content has been published under this category yet.</p>
        </div>
      ) : (
        <div className="categories-grid">
          {posts.map((p) => {
            const hasImage = isImage(p.imageName)
            const hasPdf = isPdf(p.imageName)
            const videoHref = normalizeVideoLink(p.videoLink)

            return (
              <div
                key={p.id}
                className="card content-card"
                onClick={() => setSelectedPost(p)}
                role="button"
                tabIndex={0}
              >
                {hasImage && (
                  <div className="content-card__thumb">
                    <img src={fileUrl(p.imageName)} alt={p.title} />
                  </div>
                )}
                {hasPdf && (
                  <div className="content-card__thumb content-card__thumb--pdf">
                    <FileText size={26} />
                    <span>PDF</span>
                  </div>
                )}

                <div className="content-card__body">
                  <h4>{p.title}</h4>
                  {p.content && <p>{p.content}</p>}

                  {hasPdf && (
                    <a
                      href={fileUrl(p.imageName)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="btn btn-outline btn-sm content-card__attachment"
                    >
                      <FileText size={13} /> View Attachment
                    </a>
                  )}

                  <div className="content-card__meta">
                    {p.mentor && (
                      <span>
                        <User size={13} /> {p.mentor}
                      </span>
                    )}
                    <span>
                      <CalendarClock size={13} /> {p.addedDateLabel}
                    </span>
                    {videoHref && (
                      <a href={videoHref} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                        <Video size={13} /> Watch video
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        title={selectedPost?.title || 'Content'}
        width="640px"
      >
        {selectedPost && (
          <div className="content-preview">
            {isImage(selectedPost.imageName) && (
              <img
                src={fileUrl(selectedPost.imageName)}
                alt={selectedPost.title}
                className="content-preview__image"
              />
            )}

            {isPdf(selectedPost.imageName) && (
              <embed
                src={fileUrl(selectedPost.imageName)}
                type="application/pdf"
                className="content-preview__pdf"
              />
            )}

            {(isImage(selectedPost.imageName) || isPdf(selectedPost.imageName)) && (
              <a
                href={fileUrl(selectedPost.imageName)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm content-preview__open-link"
              >
                <ExternalLink size={13} /> Open file in new tab
              </a>
            )}

            {selectedPost.content && <p className="content-preview__text">{selectedPost.content}</p>}

            <div className="content-card__meta">
              {selectedPost.mentor && (
                <span>
                  <User size={13} /> {selectedPost.mentor}
                </span>
              )}
              <span>
                <CalendarClock size={13} /> {selectedPost.addedDateLabel}
              </span>
              {normalizeVideoLink(selectedPost.videoLink) && (
                <a href={normalizeVideoLink(selectedPost.videoLink)} target="_blank" rel="noreferrer">
                  <Video size={13} /> Watch video
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
