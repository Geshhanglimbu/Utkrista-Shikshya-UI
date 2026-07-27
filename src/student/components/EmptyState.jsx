import { FiBell, FiRefreshCw } from "react-icons/fi";
import "./EmptyState.css";

export default function EmptyState({ onRefresh }) {
  return (
    <div className="notif-empty-state">
      <div className="notif-empty-icon">
        <FiBell />
      </div>
      <p>No notifications found.</p>
      <button onClick={onRefresh}>
        <FiRefreshCw /> Refresh
      </button>
    </div>
  );
}
