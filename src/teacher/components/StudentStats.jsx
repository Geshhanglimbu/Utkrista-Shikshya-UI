import React from "react";
import { FiUsers, FiBookOpen, FiCheckCircle, FiGrid } from "react-icons/fi";
import "./StudentStats.css";

export default function StudentStats({ stats }) {
  const items = [
    { icon: FiUsers, label: "Total Students", value: stats.totalStudents },
    { icon: FiBookOpen, label: "Total Bookings", value: stats.totalBookings },
    { icon: FiCheckCircle, label: "Verified Payments", value: stats.verifiedPayments },
    { icon: FiGrid, label: "My Faculties", value: stats.myFaculties },
  ];

  return (
    <div className="tsm-stats">
      {items.map(({ icon: Icon, label, value }) => (
        <div className="tsm-stat-card" key={label}>
          <div className="tsm-stat-icon">
            <Icon />
          </div>
          <div>
            <div className="tsm-stat-value">{value}</div>
            <div className="tsm-stat-label">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
