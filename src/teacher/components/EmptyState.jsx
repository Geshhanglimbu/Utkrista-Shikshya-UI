import React from "react";
import {
  FiUsers,
  FiInbox,
  FiCreditCard,
  FiBookOpen,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";
import "./EmptyState.css";

const ICONS = {
  students: FiUsers,
  bookings: FiInbox,
  payment: FiCreditCard,
  faculties: FiBookOpen,
  error: FiAlertTriangle,
};

/**
 * type: "students" | "bookings" | "payment" | "faculties" | "error"
 * onRetry: optional function — renders a Retry button when provided
 * variant: "grid" (tsm-empty, spans full grid) | "section" (tsd-empty, inline)
 */
export default function EmptyState({
  type = "students",
  title,
  description,
  onRetry,
  variant = "section",
}) {
  const Icon = ICONS[type] || FiInbox;
  const wrapClass = variant === "grid" ? "tsm-empty" : "tsd-empty";
  const iconClass = variant === "grid" ? "tsm-empty-icon" : "tsd-empty-icon";
  const titleClass = variant === "grid" ? "tsm-empty-title" : "tsd-empty-title";
  const btnClass = variant === "grid" ? "tsm-retry-btn" : "tsd-retry-btn";

  const defaults = {
    students: {
      title: "No students found",
      description: "Try adjusting your search or filters.",
    },
    bookings: {
      title: "No booked courses found",
      description: "This student hasn't booked any courses yet.",
    },
    payment: {
      title: "No payment information",
      description: "This course doesn't have a payment record yet.",
    },
    faculties: {
      title: "No faculties assigned",
      description: "This student isn't enrolled in any faculty yet.",
    },
    error: {
      title: "Something went wrong",
      description: "We couldn't load this data. Please try again.",
    },
  };

  const finalTitle = title || defaults[type]?.title;
  const finalDescription = description || defaults[type]?.description;

  return (
    <div className={wrapClass}>
      <Icon className={iconClass} />
      <p className={titleClass}>{finalTitle}</p>
      <p style={{ fontSize: 13, margin: 0 }}>{finalDescription}</p>
      {onRetry && (
        <button className={btnClass} onClick={onRetry}>
          <FiRefreshCw style={{ marginRight: 6, verticalAlign: -2 }} />
          Retry
        </button>
      )}
    </div>
  );
}
