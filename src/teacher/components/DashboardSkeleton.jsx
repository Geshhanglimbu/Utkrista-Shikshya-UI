import "./DashboardSkeleton.css";

const Bar = ({ width = "100%", height = 14 }) => (
  <span className="skeleton-bar" style={{ width, height }} />
);

const DashboardSkeleton = () => {
  return (
    <div className="dashboard-skeleton">
      <div className="dashboard-skeleton__stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-card skeleton-card--stat">
            <span className="skeleton-circle" />
            <Bar width="70%" height={10} />
            <Bar width="40%" height={22} />
            <Bar width="55%" height={10} />
          </div>
        ))}
      </div>

      <div className="dashboard-skeleton__row">
        <div className="skeleton-card skeleton-card--wide">
          <Bar width="30%" height={18} />
          {Array.from({ length: 4 }).map((_, i) => (
            <Bar key={i} width="100%" height={16} />
          ))}
        </div>
        <div className="skeleton-card skeleton-card--narrow">
          <Bar width="50%" height={18} />
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="skeleton-block" />
          ))}
        </div>
      </div>

      <div className="dashboard-skeleton__row">
        <div className="skeleton-card skeleton-card--wide">
          <Bar width="35%" height={18} />
          <span className="skeleton-block" style={{ height: 60 }} />
          <span className="skeleton-block" style={{ height: 60 }} />
        </div>
        <div className="skeleton-card skeleton-card--narrow">
          <Bar width="45%" height={18} />
          {Array.from({ length: 3 }).map((_, i) => (
            <Bar key={i} width="100%" height={14} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
