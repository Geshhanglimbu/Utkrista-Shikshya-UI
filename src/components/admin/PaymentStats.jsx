import { FiClock, FiCheckCircle, FiXCircle, FiDollarSign } from 'react-icons/fi';
import { formatCurrency } from '../../admin/hooks/usePayments';
import './PaymentStats.css';

function StatCard({ label, value, loading, icon: Icon, iconBg, textColor, tone }) {
  return (
    <div className="stat-card">
      <div className="stat-card__top">
        <span className={`stat-card__icon-badge stat-card__icon-badge--${tone} ${iconBg}`}>
          <Icon />
        </span>
      </div>
      {loading ? (
        <div className="stat-card__value-skeleton" />
      ) : (
        <p className={`stat-card__value ${textColor}`}>{value}</p>
      )}
      <p className="stat-card__label">{label}</p>
    </div>
  );
}

export default function PaymentStats({ stats, monthlyRevenue, revenueLoading, loading }) {
  return (
    <div className="payment-stats">
      <StatCard
        label="Pending Payments"
        value={stats?.pending ?? 0}
        loading={loading}
        icon={FiClock}
        tone="blue"
        textColor="text-amber-600"
      />
      <StatCard
        label="Approved Payments"
        value={stats?.approved ?? 0}
        loading={loading}
        icon={FiCheckCircle}
        tone="green"
        textColor="text-emerald-600"
      />
      <StatCard
        label="Rejected Payments"
        value={stats?.rejected ?? 0}
        loading={loading}
        icon={FiXCircle}
        tone="red"
        textColor="text-rose-600"
      />
      <StatCard
        label="Monthly Revenue"
        value={formatCurrency(monthlyRevenue ?? 0)}
        loading={revenueLoading || loading}
        icon={FiDollarSign}
        tone="blue"
        textColor="text-blue-600"
      />
    </div>
  );
}
