// components/payment/PaymentRow.jsx
import { FiEye, FiImage } from 'react-icons/fi';
import PaymentStatusBadge from './PaymentStatusBadge';
import usePaymentImage from '../../admin/hooks/usePaymentImage';
import { formatCurrency, formatDate, getInitials } from '../../admin/utils/paymentHelpers';
import './PaymentRow.css';

function ScreenshotThumb({ fileName }) {
  const { src, loading, failed } = usePaymentImage(fileName);

  if (!fileName || failed) {
    return (
      <div className="proof-thumb proof-thumb--placeholder">
        <FiImage />
      </div>
    );
  }

  if (loading || !src) {
    return <div className="proof-thumb proof-thumb--skeleton" />;
  }

  return <img src={src} alt="Payment proof" className="proof-thumb" loading="lazy" />;
}

export default function PaymentRow({ payment, onView }) {
  return (
    <tr className="payment-row">
      <td>
        <div className="payment-row__student">
          <div className="payment-row__avatar">{getInitials(payment.studentName)}</div>
          <div>
            <p className="payment-row__name">{payment.studentName}</p>
            <p className="payment-row__email">{payment.studentEmail}</p>
          </div>
        </div>
      </td>
      <td>{payment.studentId}</td>
      <td>{payment.courseName}</td>
      <td className="payment-row__amount">{formatCurrency(payment.amount)}</td>
      <td>{formatDate(payment.paymentDate)}</td>
      <td>
        <PaymentStatusBadge status={payment.status} />
      </td>
      <td>
        <ScreenshotThumb fileName={payment.screenshotFileName} />
      </td>
      <td>
        <button
          onClick={() => onView(payment)}
          className="payment-row__view-btn"
          aria-label={`View payment details for ${payment.studentName}`}
        >
          <FiEye />
        </button>
      </td>
    </tr>
  );
}
