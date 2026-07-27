import "./LoadingSkeleton.css";

export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="notif-skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <div className="notif-skeleton-card" key={i}>
          <div className="notif-skeleton-icon" />
          <div className="notif-skeleton-lines">
            <div className="notif-skeleton-line title" />
            <div className="notif-skeleton-line" />
            <div className="notif-skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}
