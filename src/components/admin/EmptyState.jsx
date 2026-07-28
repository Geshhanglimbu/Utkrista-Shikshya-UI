// components/payment/EmptyState.jsx
import { FiInbox, FiAlertTriangle } from 'react-icons/fi';
import './EmptyState.css';

export default function EmptyState({ variant = 'empty', title, description, onRetry }) {
  const isError = variant === 'error';

  return (
    <div className="empty-state">
      <span className={`empty-state__icon-badge empty-state__icon-badge--${isError ? 'error' : 'empty'}`}>
        {isError ? <FiAlertTriangle /> : <FiInbox />}
      </span>
      <p className="empty-state__title">
        {title || (isError ? 'Couldn\u2019t load payments' : 'No transactions yet')}
      </p>
      <p className="empty-state__description">
        {description ||
          (isError
            ? 'Something went wrong while reaching the server. Check your connection and try again.'
            : 'Student payments will show up here as soon as they submit a screenshot for review.')}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="empty-state__retry">
          Try again
        </button>
      )}
    </div>
  );
}
