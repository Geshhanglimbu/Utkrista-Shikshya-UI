import { FiSearch, FiChevronLeft, FiChevronRight, FiEye, FiImage, FiAlertCircle } from 'react-icons/fi';
import usePaymentImage from '../../admin/hooks/usePaymentImage';
import { formatLocalDateTime, formatCurrency } from '../../admin/hooks/usePayments';
import './PaymentTable.css';

function ProofThumbnail({ fileName }) {
  const { src, loading, failed } = usePaymentImage(fileName);

  if (!fileName || failed) {
    return (
      <div
        className="proof-thumb proof-thumb--placeholder"
        style={{ width: '64px', height: '64px', minWidth: '64px', minHeight: '64px', maxWidth: '64px', maxHeight: '64px' }}
      >
        <FiImage className="w-4 h-4 mb-0.5" />
        <span style={{ fontSize: '9px', lineHeight: '1' }}>No Screenshot</span>
      </div>
    );
  }

  if (loading || !src) {
    return (
      <div
        className="proof-thumb proof-thumb--skeleton"
        style={{ width: '64px', height: '64px', minWidth: '64px', minHeight: '64px', maxWidth: '64px', maxHeight: '64px' }}
      />
    );
  }

  return (
    <img
      src={src}
      alt="Payment Proof"
      className="proof-thumb"
      style={{
        width: '64px',
        height: '64px',
        minWidth: '64px',
        minHeight: '64px',
        maxWidth: '64px',
        maxHeight: '64px',
        objectFit: 'cover',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
        display: 'block',
      }}
    />
  );
}

function StatusBadge({ status }) {
  const norm = (status || 'PENDING').toUpperCase();
  let bg = 'bg-amber-50 text-amber-700 border-amber-200';
  let label = 'Pending';

  if (norm === 'APPROVED') {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    label = 'Approved';
  } else if (norm === 'REJECTED') {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
    label = 'Rejected';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg}`}>
      {label}
    </span>
  );
}

function TableSkeleton({ rows = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={idx} className="border-b border-slate-100 animate-pulse">
          <td className="px-4 py-3"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-12 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
          <td className="px-4 py-3"><div className="h-5 w-16 bg-slate-200 rounded-full" /></td>
          <td className="px-4 py-3"><div className="w-16 h-16 bg-slate-200 rounded-lg" /></td>
          <td className="px-4 py-3 text-center"><div className="h-8 w-8 bg-slate-200 rounded-lg mx-auto" /></td>
        </tr>
      ))}
    </>
  );
}

export default function PaymentTable({
  payments,
  loading,
  error,
  onRetry,
  onView,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortOrder,
  onSortOrderChange,
  page,
  totalPages,
  onPageChange,
  totalFiltered,
  rowsPerPage,
}) {
  const showEmpty = !loading && !error && payments.length === 0;
  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const rangeEnd = Math.min(page * rowsPerPage, totalFiltered);

  return (
    <div className="payment-table-card flex flex-col">
      {/* Search & Filter Toolbar */}
      <div className="payment-table__toolbar">
        <div className="payment-table__search">
          <FiSearch />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by student, email, course..."
          />
        </div>

        <div className="payment-table__controls">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="payment-table__select"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value)}
            className="payment-table__select"
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Responsive Table View */}
      <div className="payment-table__scroll">
        <table className="payment-table">
          <thead>
            <tr>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Student ID</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Payment Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Proof</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && <TableSkeleton rows={6} />}
            {!loading && !error && payments.map((payment) => (
              <tr key={payment.paymentId} className="hover:bg-slate-50/75 transition-colors border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                  <div>
                    <p className="font-semibold text-slate-800">{payment.user?.name || '—'}</p>
                    <p className="text-xs text-slate-500 font-normal">{payment.user?.email || '—'}</p>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                  {payment.user?.id || '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">
                  {payment.categories?.[0]?.categoryTitle || '—'}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                  {formatCurrency(payment.totalPrice)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                  {formatLocalDateTime(payment.addedDate || payment.paymentDate)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <ProofThumbnail fileName={payment.payment_screensort} />
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <button
                    onClick={() => onView(payment)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center border border-slate-200"
                    title="View Details"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {error && (
          <div className="p-8 text-center bg-white flex flex-col items-center justify-center">
            <FiAlertCircle className="w-10 h-10 text-rose-500 mb-2" />
            <p className="text-sm font-semibold text-slate-800">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {showEmpty && (
          <div className="p-8 text-center bg-white text-slate-500 text-sm">
            No transactions found matching your criteria.
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {!loading && !error && totalFiltered > 0 && (
        <div className="payment-table__pagination">
          <p className="payment-table__pagination-info">
            Showing <span className="font-semibold text-slate-800">{rangeStart}</span> to{' '}
            <span className="font-semibold text-slate-800">{rangeEnd}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalFiltered}</span> entries
          </p>

          <div className="payment-table__pagination-controls">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="pagination-btn"
            >
              <FiChevronLeft />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`pagination-page ${p === page ? 'pagination-page--active' : ''}`}
                >
                  {p}
                </button>
              ))}

            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="pagination-btn"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
