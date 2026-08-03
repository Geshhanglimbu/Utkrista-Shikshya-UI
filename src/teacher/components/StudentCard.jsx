import React from "react";
import { useNavigate } from "react-router-dom";
import { FiBookOpen, FiGrid } from "react-icons/fi";
import { initials, statusColor } from "../utils/studentHelpers";
import "./StudentCard.css";

const PAYMENT_LABEL = {
  approved: "Verified",
  partial: "Partial",
  pending: "Pending",
};

export default function StudentCard({ student }) {
  const navigate = useNavigate();

  const goToDetails = () => navigate(`/teacher/students/${student.id}`);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToDetails();
    }
  };

  return (
    <div
      className="tsm-card"
      onClick={goToDetails}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${student.fullName}`}
    >
      <div className="tsm-card-top">
        {student.avatar ? (
          <img src={student.avatar} alt="" className="tsm-avatar" />
        ) : (
          <div className="tsm-avatar">{initials(student.fullName)}</div>
        )}
        <span className={`tsm-badge tsm-badge-${statusColor(student.paymentStatus)}`}>
          {PAYMENT_LABEL[student.paymentStatus] || "Pending"}
        </span>
      </div>

      <div>
        <p className="tsm-card-name">{student.fullName}</p>
        <p className="tsm-card-email">{student.email}</p>
        <p className="tsm-card-id">ID: {student.studentId}</p>
      </div>

      <div className="tsm-card-divider" />

      <div className="tsm-card-meta">
        <span className="tsm-card-meta-item">
          <FiBookOpen size={13} />
          <strong>{student.bookingCount}</strong>&nbsp;Courses
        </span>
        <span className="tsm-card-meta-item">
          <FiGrid size={13} />
          <strong>{student.facultyCount}</strong>&nbsp;Faculties
        </span>
      </div>
    </div>
  );
}
