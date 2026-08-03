import "./NotificationPanel.css";

/**
 * @param {object} props
 * @param {Array} props.notifications - latest 5 notifications
 * @param {() => void} [props.onViewAll]
 */
const NotificationPanel = ({ notifications = [], onViewAll }) => {
  return (
    <div className="notification-panel-card">
      <h3 className="notification-panel-card__title">Notifications</h3>

      <div className="notification-panel">
        {notifications.length === 0 && (
          <p className="notification-panel__empty">You're all caught up.</p>
        )}

        {notifications.map((notification) => {
          // NOTE: adjust field names to match the real notice object shape
          // (e.g. title, message, createdAt, read/seen)
          const isUnread = !notification.read && !notification.seen;
          return (
            <div
              key={notification.noticeId || notification.id}
              className={`notification-item ${isUnread ? "notification-item--unread" : ""}`}
            >
              {isUnread && <span className="notification-item__dot" />}
              <div className="notification-item__body">
                <p className="notification-item__title">{notification.title}</p>
                <p className="notification-item__desc">
                  {notification.message || notification.description}
                </p>
                <p className="notification-item__time">
                  {(notification.category || "SYSTEM").toString().toUpperCase()} •{" "}
                  {notification.timeAgo || notification.createdAt}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button type="button" className="notification-panel__view-all" onClick={onViewAll}>
        View All Notifications
      </button>
    </div>
  );
};

export default NotificationPanel;
