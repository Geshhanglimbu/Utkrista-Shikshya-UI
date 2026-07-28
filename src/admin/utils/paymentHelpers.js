// utils/paymentHelpers.js
// Shared, dependency-free helpers used across the Payment Management module.

/**
 * Spring Boot serializes LocalDateTime as an array: [year, month, day, hour, minute, second, nano]
 * This normalizes that shape (or a plain ISO string / number, just in case) into a real JS Date.
 * Falls back to null if the value can't be parsed so callers can show "—" instead of "Invalid Date".
 */
export function normalizeDate(value) {
  if (!value) return null;

  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    // Java months are 1-indexed, JS Date months are 0-indexed
    return new Date(year, month - 1, day, hour, minute, second);
  }

  if (typeof value === 'number') {
    // Some endpoints in this backend send YYYYMMDD integers
    const str = String(value);
    if (str.length === 8) {
      const year = Number(str.slice(0, 4));
      const month = Number(str.slice(4, 6));
      const day = Number(str.slice(6, 8));
      return new Date(year, month - 1, day);
    }
    return new Date(value);
  }

  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  const date = normalizeDate(value);
  if (!date) return '—';
  return date.toLocaleDateString('en-US', options);
}

export function formatCurrency(amount) {
  const num = Number(amount);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Compact currency for big dashboard numbers, e.g. $45,250 -> $45.3k
 */
export function formatCompactCurrency(amount) {
  const num = Number(amount);
  if (isNaN(num)) return '$0';
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `$${num.toFixed(0)}`;
}

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export function getStatusMeta(status) {
  const normalized = (status || '').toUpperCase();
  switch (normalized) {
    case PAYMENT_STATUS.APPROVED:
      return { label: 'Approved', text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500', ring: 'ring-emerald-200' };
    case PAYMENT_STATUS.REJECTED:
      return { label: 'Rejected', text: 'text-rose-700', bg: 'bg-rose-50', dot: 'bg-rose-500', ring: 'ring-rose-200' };
    case PAYMENT_STATUS.PENDING:
    default:
      return { label: 'Pending', text: 'text-orange-700', bg: 'bg-orange-50', dot: 'bg-orange-500', ring: 'ring-orange-200' };
  }
}

/** Builds initials for the avatar fallback, e.g. "Anish Sharma" -> "AS" */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
