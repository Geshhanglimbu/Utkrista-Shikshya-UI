import { Clock, Users } from "lucide-react";
import "./LiveClassCard.css";

/**
 * @param {object} props
 * @param {object} props.liveClass
 * @param {(liveClass: object) => void} [props.onStart]
 */
const LiveClassCard = ({ liveClass, onStart }) => {
  // NOTE: adjust field names to match the real live class object shape
  // (e.g. title, meetingTime, duration, studentCount, platform, isLiveNow)
  const {
    title,
    meetingTime,
    duration,
    studentCount,
    platform,
    isLiveNow,
  } = liveClass;

  return (
    <div className={`live-class-card ${isLiveNow ? "live-class-card--active" : ""}`}>
      <div className="live-class-card__top">
        <h4 className="live-class-card__title">{title}</h4>
        {isLiveNow ? (
          <span className="live-class-card__tag live-class-card__tag--live">Live Now</span>
        ) : (
          <span className="live-class-card__tag">{meetingTime}</span>
        )}
      </div>

      <div className="live-class-card__meta">
        <span>
          <Clock size={14} /> {duration}
        </span>
        <span>
          <Users size={14} /> {studentCount} Students
        </span>
      </div>

      {platform && <span className="live-class-card__platform">{platform}</span>}

      {isLiveNow ? (
        <button type="button" className="live-class-card__cta" onClick={() => onStart?.(liveClass)}>
          Start Class
        </button>
      ) : (
        <button type="button" className="live-class-card__cta live-class-card__cta--muted" disabled>
          Scheduled
        </button>
      )}
    </div>
  );
};

export default LiveClassCard;
