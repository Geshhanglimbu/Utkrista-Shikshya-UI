// student/components/Pagination.jsx
import { memo, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Pagination.css";

/**
 * Pagination
 * Numbered pager with prev/next arrows and a "Showing X of Y" summary.
 * Fully generic — takes currentPage/totalPages/onPageChange, nothing
 * exam-specific, so it can be reused anywhere else in the portal.
 */
const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange }) => {
  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="pagination">
      <p className="pagination__summary">
        Showing {endItem - startItem + 1} of {totalItems} scheduled exams
      </p>
      <div className="pagination__controls">
        <button
          className="pagination__arrow"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {pageNumbers.map((num) => (
          <button
            key={num}
            className={`pagination__page ${
              num === currentPage ? "pagination__page--active" : ""
            }`}
            onClick={() => onPageChange(num)}
          >
            {num}
          </button>
        ))}
        <button
          className="pagination__arrow"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default memo(Pagination);
