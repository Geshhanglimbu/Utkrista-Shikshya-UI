// components/payment/RevenueCard.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../admin/utils/paymentHelpers';
import './RevenueCard.css';

/**
 * Animated count-up. Runs once when `value` first becomes a real number.
 */
function useCountUp(value, duration = 900) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value == null || isNaN(value)) return;
    let start = null;
    const from = 0;
    const to = Number(value);

    function step(timestamp) {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setDisplay(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
}

/**
 * variant "hero"  -> big blue gradient dashboard card (top stat row)
 * variant "plain" -> compact white card (daily/weekly/yearly rail)
 */
export default function RevenueCard({ label, value, loading, icon: Icon, variant = 'plain', trend }) {
  const animated = useCountUp(loading ? null : value);

  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="revenue-hero"
      >
        <div className="revenue-hero__blob-1" />
        <div className="revenue-hero__blob-2" />
        <div className="revenue-hero__row">
          <div>
            <p className="revenue-hero__label">{label}</p>
            {loading ? (
              <div className="revenue-hero__skeleton" />
            ) : (
              <p className="revenue-hero__value">{formatCurrency(animated)}</p>
            )}
          </div>
          {Icon && (
            <span className="revenue-hero__icon-badge">
              <Icon />
            </span>
          )}
        </div>
        {trend && <p className="revenue-hero__trend">{trend}</p>}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="revenue-card"
    >
      <div className="revenue-card__top">
        <p className="revenue-card__label">{label}</p>
        {Icon && <Icon className="revenue-card__icon" />}
      </div>
      {loading ? (
        <div className="revenue-card__skeleton" />
      ) : (
        <p className="revenue-card__value">{formatCurrency(animated)}</p>
      )}
    </motion.div>
  );
}
