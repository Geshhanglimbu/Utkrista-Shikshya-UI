import './DashboardCard.css'

// Statistic card used on the Dashboard top row.
export default function DashboardCard({ icon: Icon, label, value, trend, trendUp, accent }) {
  return (
    <div className="dash-card">
      <div className="dash-card__top">
        <span className="dash-card__icon" style={{ background: accent ? `${accent}1A` : 'var(--info-bg)', color: accent || 'var(--primary)' }}>
          {Icon && <Icon size={20} />}
        </span>
        {trend && (
          <span className={`dash-card__trend ${trendUp ? 'is-up' : 'is-down'}`}>{trend}</span>
        )}
      </div>
      <div className="dash-card__value">{value}</div>
      <div className="dash-card__label">{label}</div>
    </div>
  )
}
