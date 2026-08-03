import "./ActivityTimeline.css";

/**
 * @param {object} props
 * @param {Array} props.activities - each item: { id, studentName, action, context, timestamp }
 */
const ActivityTimeline = ({ activities = [] }) => {
  return (
    <div className="activity-timeline-card">
      <h3 className="activity-timeline-card__title">Recent Student Activity</h3>

      <ul className="activity-timeline">
        {activities.length === 0 && (
          <li className="activity-timeline__empty">No recent activity yet.</li>
        )}

        {activities.map((activity) => (
          <li key={activity.id} className="activity-timeline__item">
            <span className="activity-timeline__dot" />
            <div className="activity-timeline__content">
              <p className="activity-timeline__text">
                <strong>{activity.studentName}</strong> {activity.action}
              </p>
              <p className="activity-timeline__meta">
                {activity.timestamp} {activity.context ? `• ${activity.context}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityTimeline;
