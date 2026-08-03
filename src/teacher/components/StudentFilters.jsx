import React from "react";
import "./StudentFilters.css";

export default function StudentFilters({
  faculties,
  facultyFilter,
  onFacultyChange,
  bookingStatusFilter,
  onBookingStatusChange,
  paymentStatusFilter,
  onPaymentStatusChange,
}) {
  return (
    <div className="tsm-filters">
      <select
        className="tsm-filter-select"
        value={facultyFilter}
        onChange={(e) => onFacultyChange(e.target.value)}
        aria-label="Filter by faculty"
      >
        <option value="all">All Faculties</option>
        {faculties.map((f) => (
          <option key={f.id} value={f.id}>
            {f.title}
          </option>
        ))}
      </select>

      <select
        className="tsm-filter-select"
        value={bookingStatusFilter}
        onChange={(e) => onBookingStatusChange(e.target.value)}
        aria-label="Filter by booking status"
      >
        <option value="all">All Booking Status</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="inactive">Inactive</option>
      </select>

      <select
        className="tsm-filter-select"
        value={paymentStatusFilter}
        onChange={(e) => onPaymentStatusChange(e.target.value)}
        aria-label="Filter by payment status"
      >
        <option value="all">All Payment Status</option>
        <option value="approved">Verified</option>
        <option value="partial">Partially Paid</option>
        <option value="pending">Pending</option>
      </select>
    </div>
  );
}
