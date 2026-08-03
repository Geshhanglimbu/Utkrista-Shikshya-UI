import React from "react";
import { formatDate, statusColor } from "../utils/studentHelpers";
import EmptyState from "./EmptyState";
import { TableSkeleton } from "./LoadingSkeleton";
import "./BookedCoursesTable.css";

export default function BookedCoursesTable({ bookings, loading, onViewPayment, activeCategoryId }) {
  if (loading) return <TableSkeleton />;

  if (!bookings.length) {
    return <EmptyState type="bookings" />;
  }

  return (
    <div className="tsd-table-wrap">
      <table className="tsd-table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Category</th>
            <th>Teacher</th>
            <th>Booked Date</th>
            <th>Price</th>
            <th>Status</th>
            <th>Payment</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.courseName}</td>
              <td>{b.categoryType}</td>
              <td>{b.teacherName}</td>
              <td>{formatDate(b.bookedDate)}</td>
              <td>Rs. {b.price}</td>
              <td>
                <span className={`tsd-badge tsd-badge-${statusColor(b.status)}`}>
                  {b.status}
                </span>
              </td>
              <td>
                <button
                  className="tsd-view-payment-btn"
                  onClick={() => onViewPayment(b.categoryId)}
                  disabled={activeCategoryId === b.categoryId}
                >
                  {activeCategoryId === b.categoryId ? "Loading..." : "View Payment"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
