// components/payment/PaymentStatusBadge.jsx
import './PaymentStatusBadge.css';

const META = {
  PENDING: { label: 'Pending', modifier: 'pending' },
  APPROVED: { label: 'Approved', modifier: 'approved' },
  REJECTED: { label: 'Rejected', modifier: 'rejected' },
};

export default function PaymentStatusBadge({ status, size = 'md' }) {
  const meta = META[(status || '').toUpperCase()] || META.PENDING;
  const sizeClass = size === 'sm' ? 'status-badge--sm' : '';

  return (
    <span className={`status-badge status-badge--${meta.modifier} ${sizeClass}`}>
      <span className="status-badge__dot" />
      {meta.label}
    </span>
  );
}
