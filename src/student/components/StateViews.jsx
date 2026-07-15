// student/components/StateViews.jsx
import { Inbox, AlertTriangle, RotateCw } from "lucide-react";
import "./StateViews.css";

/**
 * EmptyState — shown when an API call succeeds but returns no data.
 */
export const EmptyState = ({
  title = "Nothing here yet",
  message = "There's nothing to show right now. Check back later.",
  icon: Icon = Inbox,
}) => (
  <div className="state-view">
    <div className="state-view__icon state-view__icon--empty">
      <Icon size={26} />
    </div>
    <h4>{title}</h4>
    <p>{message}</p>
  </div>
);

/**
 * ErrorState — shown when an API call fails. Includes a retry button.
 */
export const ErrorState = ({
  title = "Something went wrong",
  message = "We couldn't load this data. Please try again.",
  onRetry,
}) => (
  <div className="state-view">
    <div className="state-view__icon state-view__icon--error">
      <AlertTriangle size={26} />
    </div>
    <h4>{title}</h4>
    <p>{message}</p>
    {onRetry && (
      <button className="state-view__retry" onClick={onRetry}>
        <RotateCw size={15} />
        Retry
      </button>
    )}
  </div>
);

/**
 * SkeletonCard — generic shimmering placeholder shaped like a course card.
 * Render N of these in a grid while data is loading.
 */
export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-card__image sp-shimmer" />
    <div className="skeleton-card__body">
      <div className="sp-shimmer skeleton-card__line" style={{ width: "40%" }} />
      <div className="sp-shimmer skeleton-card__line" style={{ width: "85%", height: 18 }} />
      <div className="sp-shimmer skeleton-card__line" style={{ width: "60%" }} />
      <div className="sp-shimmer skeleton-card__line" style={{ width: "50%" }} />
    </div>
  </div>
);
