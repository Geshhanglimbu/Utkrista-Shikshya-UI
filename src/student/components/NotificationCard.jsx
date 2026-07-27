import {
  FiBell,
  FiBook,
  FiCalendar,
  FiFileText,
  FiVideo,
} from "react-icons/fi";
import "./NotificationCard.css";

const getIconForType = (type = "") => {
  const t = type.toUpperCase();
  if (t.includes("EXAM")) return <FiFileText />;
  if (t.includes("LIVE") || t.includes("CLASS")) return <FiVideo />;
  if (t.includes("COURSE") || t.includes("RESOURCE")) return <FiBook />;
  if (t.includes("EVENT") || t.includes("SCHEDULE")) return <FiCalendar />;
  return <FiBell />;
};

export default function NotificationCard({
  notification,
  isRead,
  formatDate,
  formatTime,
  onClick,
}) {
  const {
    title,
    description,
    facultyName,
    faculty,
    noticeType,
    type,
    createdAt,
    createdDate,
  } = notification;

  const facultyLabel = facultyName || faculty || "All Faculties";
  const typeLabel = noticeType || type || "Notice";

  return (
    <div
      className={`notif-card ${isRead ? "notif-card-read" : "notif-card-unread"}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="notif-card-icon">{getIconForType(typeLabel)}</div>
      <div className="notif-card-body">
        <div className="notif-card-title-row">
          <h3>{title}</h3>
          <span className={`notif-badge ${isRead ? "badge-read" : "badge-unread"}`}>
            {isRead ? "READ" : "NEW"}
          </span>
        </div>
        <p className="notif-card-description">{description}</p>
        <div className="notif-card-meta">
          <span>{facultyLabel}</span>
          <span className="notif-dot">•</span>
          <span>{typeLabel}</span>
          <span className="notif-dot">•</span>
          <span>{formatDate(createdAt || createdDate)}</span>
          <span className="notif-dot">•</span>
          <span>{formatTime(createdAt || createdDate)}</span>
        </div>
      </div>
    </div>
  );
}
