// student/components/UpcomingExamBanner.jsx
import { memo } from "react";
import { Calendar, Clock, GraduationCap } from "lucide-react";
import "./UpcomingExamBanner.css";

/**
 * UpcomingExamBanner
 * Highlights the single nearest upcoming exam (by date). Renders nothing
 * if there is no upcoming exam — StudentExams.jsx passes null/undefined
 * when there isn't one, so this stays a pure presentational component.
 */
const UpcomingExamBanner = ({ exam }) => {
  if (!exam) return null;

  const { title, examDateLabel, startTime } = exam;

  return (
    <div className="upcoming-exam-banner">
      <div className="upcoming-exam-banner__content">
        <p className="upcoming-exam-banner__eyebrow">Next Scheduled Exam</p>
        <h2 className="upcoming-exam-banner__title">{title || "Untitled Exam"}</h2>
        <div className="upcoming-exam-banner__meta">
          {examDateLabel && (
            <span>
              <Calendar size={16} />
              {examDateLabel}
            </span>
          )}
          {startTime && (
            <span>
              <Clock size={16} />
              {startTime}
            </span>
          )}
        </div>
      </div>
      <GraduationCap className="upcoming-exam-banner__icon" size={72} />
    </div>
  );
};

export default memo(UpcomingExamBanner);
