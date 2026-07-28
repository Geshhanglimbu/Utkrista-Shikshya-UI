import { useState } from 'react';
import { FiX, FiCheckCircle, FiXCircle, FiImage, FiZoomIn, FiDownload } from 'react-icons/fi';
import usePaymentImage from '../../admin/hooks/usePaymentImage';
import { formatLocalDateTime, formatCurrency } from '../../admin/hooks/usePayments';
import './PaymentDetailsModal.css';

function getInitials(name) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function PaymentDetailsModal({ payment, onClose, onApprove, onReject, busy }) {
  const [zoomed, setZoomed] = useState(false);
  const [confirmMode, setConfirmMode] = useState(null); // null | 'approve' | 'reject'

  const { src, loading, failed } = usePaymentImage(payment?.payment_screensort);

  if (!payment) return null;

  const isApproved = (payment.status || '').toUpperCase() === 'APPROVED';
  const isRejected = (payment.status || '').toUpperCase() === 'REJECTED';

  const handleConfirmApprove = async () => {
    const ok = await onApprove(payment.paymentId);
    if (ok) {
      setConfirmMode(null);
      onClose();
    }
  };

  const handleConfirmReject = async () => {
    const ok = await onReject(payment.paymentId);
    if (ok) {
      setConfirmMode(null);
      onClose();
    }
  };

  const handleDownload = () => {
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    link.download = payment.payment_screensort || `payment-${payment.paymentId}-proof`;
    link.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-header__title">Payment Verification Details</h2>
          <button onClick={onClose} className="modal-header__close" aria-label="Close modal">
            <FiX />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="modal-body space-y-4">
          {/* Student Info */}
          <div className="modal-student">
            <div className="modal-student__avatar">
              {getInitials(payment.user?.name)}
            </div>
            <div>
              <p className="modal-student__name">{payment.user?.name || 'Unknown Student'}</p>
              <p className="modal-student__meta">Student ID: {payment.user?.id || '—'}</p>
              <p className="modal-student__meta">{payment.user?.email || '—'}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="modal-grid">
            <div>
              <p className="modal-field__label">Purchased Course</p>
              <p className="modal-field__value">{payment.categories?.[0]?.categoryTitle || '—'}</p>
            </div>

            <div>
              <p className="modal-field__label">Amount Paid</p>
              <p className="modal-field__value modal-field__value--amount">
                {formatCurrency(payment.totalPrice)}
              </p>
            </div>

            <div>
              <p className="modal-field__label">Payment Date</p>
              <p className="modal-field__value">
                {formatLocalDateTime(payment.addedDate || payment.paymentDate)}
              </p>
            </div>

            <div>
              <p className="modal-field__label">Status</p>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  isRejected ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {payment.status || 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Proof Section */}
          <div className="modal-proof">
            <p className="modal-field__label">Verification Proof</p>
            <div className="modal-proof__frame min-h-[180px] flex flex-col items-center justify-center p-3">
              {loading && <div className="modal-proof__skeleton" />}

              {!loading && (failed || !payment.payment_screensort) && (
                <div className="modal-proof__failed">
                  <FiImage />
                  <span>No Screenshot</span>
                </div>
              )}

              {!loading && src && !failed && (
                <div className="w-full flex flex-col items-center space-y-2">
                  <button onClick={() => setZoomed(true)} className="modal-proof__image-btn">
                    <img src={src} alt="Payment Proof" />
                    <span className="modal-proof__zoom-hint">
                      <FiZoomIn />
                    </span>
                  </button>
                  <button onClick={handleDownload} className="modal-proof__download">
                    <FiDownload /> Download Proof Image
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Modal Footer with Action Buttons */}
        <div className="modal-footer">
          <button
            onClick={() => setConfirmMode('reject')}
            disabled={isRejected || busy}
            className="modal-footer__btn modal-footer__btn--reject"
          >
            <FiXCircle /> Reject Payment
          </button>

          <button
            onClick={() => setConfirmMode('approve')}
            disabled={isApproved || busy}
            className="modal-footer__btn modal-footer__btn--approve"
          >
            <FiCheckCircle /> Approve Payment
          </button>
        </div>
      </div>

      {/* Lightbox / Zoom Overlay */}
      {zoomed && src && (
        <div className="lightbox-overlay" onClick={() => setZoomed(false)}>
          <img src={src} alt="Payment Screenshot Zoomed" />
          <button onClick={() => setZoomed(false)} className="lightbox-close" aria-label="Close zoom">
            <FiX />
          </button>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {confirmMode && (
        <div className="confirm-overlay" onClick={() => setConfirmMode(null)}>
          <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-card__title">
              {confirmMode === 'approve' ? 'Approve Payment?' : 'Reject Payment?'}
            </h3>
            <p className="confirm-card__description">
              Are you sure you want to {confirmMode} payment #{payment.paymentId} of{' '}
              <strong>{formatCurrency(payment.totalPrice)}</strong> from{' '}
              <strong>{payment.user?.name || 'this student'}</strong>?
            </p>
            <div className="confirm-card__actions">
              <button
                onClick={() => setConfirmMode(null)}
                disabled={busy}
                className="confirm-card__cancel"
              >
                Cancel
              </button>
              <button
                onClick={confirmMode === 'approve' ? handleConfirmApprove : handleConfirmReject}
                disabled={busy}
                className={`confirm-card__confirm confirm-card__confirm--${confirmMode === 'approve' ? 'success' : 'danger'}`}
              >
                {busy ? 'Processing...' : confirmMode === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
