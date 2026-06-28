import { ChevronLeft, ChevronRight } from 'lucide-react'
import './Pagination.css'

export default function Pagination({ page, totalPages, onChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div className="pagination">
      <span className="pagination__info">Showing {start}-{end} of {totalItems}</span>
      <div className="pagination__controls">
        <button className="pagination__btn" disabled={page === 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft size={16} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            className={`pagination__btn ${p === page ? 'is-active' : ''}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ))}
        <button className="pagination__btn" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
