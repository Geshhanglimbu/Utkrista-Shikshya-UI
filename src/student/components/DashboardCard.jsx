// student/components/DashboardCard.jsx
import { Play } from "lucide-react";
import "./DashboardCard.css";

/**
 * DashboardCard
 * The large blue "Welcome back" hero card with a headline, a short
 * status message, and a "Resume/Continue" call to action.
 */
const DashboardCard = ({
  studentName,
  headline,
  message,
  ctaLabel = "Resume Last Lesson",
  onCtaClick,
  isLoading,
}) => {
  if (isLoading) {
    return <div className="dashboard-hero dashboard-hero--skeleton" />;
  }

  return (
    <div className="dashboard-hero">
      <span className="dashboard-hero__eyebrow">Welcome back, {studentName}!</span>
      <h2 className="dashboard-hero__headline">{headline}</h2>
      <p className="dashboard-hero__message">{message}</p>
      <button className="dashboard-hero__cta" onClick={onCtaClick}>
        <Play size={16} fill="currentColor" />
        {ctaLabel}
      </button>
    </div>
  );
};

export default DashboardCard;
