// student/components/StatsCard.jsx
import "./StatsCard.css";

/**
 * StatsCard
 * Small metric card: icon + big number + label.
 * Used for "Courses Enrolled", "Lessons Completed", "Available Exams", etc.
 */
const StatsCard = ({ icon: Icon, iconVariant = "primary", label, value, isLoading }) => {
  if (isLoading) {
    return (
      <div className="stats-card stats-card--skeleton">
        <div className="stats-card__icon skeleton-block" />
        <div className="stats-card__body">
          <div className="skeleton-line skeleton-line--label" />
          <div className="skeleton-line skeleton-line--value" />
        </div>
      </div>
    );
  }

  return (
    <div className="stats-card">
      <div className={`stats-card__icon stats-card__icon--${iconVariant}`}>
        <Icon size={22} />
      </div>
      <div className="stats-card__body">
        <p className="stats-card__label">{label}</p>
        <h3 className="stats-card__value">{value}</h3>
      </div>
    </div>
  );
};

export default StatsCard;
