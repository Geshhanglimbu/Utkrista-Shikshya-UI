import "./StatsCard.css";

/**
 * Generic stat card used in the top row of the Teacher Dashboard.
 *
 * @param {object} props
 * @param {React.ComponentType} props.icon - lucide-react icon component
 * @param {string} props.iconVariant - "blue" | "purple" | "teal" | "red" (controls icon chip color)
 * @param {string} props.label - eyebrow label under the number, e.g. "TOTAL STUDENTS"
 * @param {string|number} props.value - the big number/value
 * @param {string} [props.badge] - small pill text shown top-right of the icon, e.g. "+12 New"
 * @param {string} [props.helper] - small caption under the value, e.g. "Assigned Courses"
 */
const StatsCard = ({ icon: Icon, iconVariant = "blue", label, value, badge, helper }) => {
  return (
    <div className="stats-card">
      <div className="stats-card__top">
        <span className={`stats-card__icon stats-card__icon--${iconVariant}`}>
          <Icon size={22} strokeWidth={2} />
        </span>
        {badge && <span className="stats-card__badge">{badge}</span>}
      </div>

      <p className="stats-card__label">{label}</p>
      <h3 className="stats-card__value">{value}</h3>
      {helper && <p className="stats-card__helper">{helper}</p>}
    </div>
  );
};

export default StatsCard;
