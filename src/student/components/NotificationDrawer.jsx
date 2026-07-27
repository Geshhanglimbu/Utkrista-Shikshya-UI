import { FiX, FiDownload, FiCheckCircle } from "react-icons/fi";
import "./NotificationDrawer.css";

export default function NotificationDrawer({
  notification,
  isRead,
  formatDate,
  formatTime,
  onClose,
  onMarkAsRead,
}) {
  if (!notification) return null;

  const {
    title,
    description,
    facultyName,
    faculty,
    noticeType,
    type,
    createdAt,
    createdDate,
    attachments,
  } = notification;

  return (
    <>
      <div className="notif-drawer-overlay" onClick={onClose} />
      <aside className="notif-drawer">
        <div className="notif-drawer-header">
          <h2>Notification Details</h2>
          <button className="notif-drawer-close" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>

        <div className="notif-drawer-content">
          <div className="notif-drawer-icon">
            <FiCheckCircle />
          </div>

          <span className={`notif-badge large ${isRead ? "badge-read" : "badge-unread"}`}>
            {isRead ? "READ" : "UNREAD"}
          </span>

          <h3 className="notif-drawer-title">{title}</h3>
          <p className="notif-drawer-submeta">
            Posted by {facultyName || faculty || "Admin"} •{" "}
            {formatDate(createdAt || createdDate)} •{" "}
            {formatTime(createdAt || createdDate)}
          </p>

          <p className="notif-drawer-description">{description}</p>

          <div className="notif-drawer-details">
            <div>
              <span>Faculty</span>
              <strong>{facultyName || faculty || "All Faculties"}</strong>
            </div>
            <div>
              <span>Notification Type</span>
              <strong>{noticeType || type || "Notice"}</strong>
            </div>
          </div>

          {attachments && attachments.length > 0 && (
            <div className="notif-drawer-attachments">
              <p className="notif-drawer-attachments-title">
                Attachments ({attachments.length})
              </p>
              {attachments.map((file, idx) => (
                <div className="notif-attachment-row" key={file.id || idx}>
                  <div className="notif-attachment-info">
                    <span className="notif-attachment-name">{file.name}</span>
                    {file.size && (
                      <span className="notif-attachment-size">{file.size}</span>
                    )}
                  </div>
                  <a
                    href={file.url || file.downloadUrl || "#"}
                    download
                    className="notif-attachment-download"
                    aria-label={`Download ${file.name}`}
                  >
                    <FiDownload />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="notif-drawer-footer">
          {!isRead && (
            <button
              className="notif-btn-primary"
              onClick={() => onMarkAsRead(notification)}
            >
              Mark as Read
            </button>
          )}
          <button className="notif-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </aside>
    </>
  );
}
