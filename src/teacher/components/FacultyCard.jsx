import React from "react";
import { formatDate, statusColor } from "../utils/studentHelpers";
import "./FacultyCard.css";

export default function FacultyCard({ faculty }) {
  return (
    <div className="tsd-faculty-card">
      <p className="tsd-faculty-title">{faculty.title}</p>
      <p className="tsd-faculty-desc">{faculty.description}</p>
      <div className="tsd-faculty-meta">
        <span>Teacher: {faculty.teacherName}</span>
        <span>{faculty.courseCount} courses</span>
        <span>Joined {formatDate(faculty.joinedDate)}</span>
      </div>
      <span
        className={`tsd-badge tsd-badge-${statusColor(faculty.status)}`}
        style={{ marginTop: 10, display: "inline-block" }}
      >
        {faculty.status}
      </span>
    </div>
  );
}
