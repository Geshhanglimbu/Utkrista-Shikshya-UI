import "./BookingTable.css";

const STATUS_STYLES = {
  PENDING: "booking-badge--pending",
  Pending: "booking-badge--pending",
  APPROVED: "booking-badge--approved",
  Approved: "booking-badge--approved",
  REJECTED: "booking-badge--rejected",
  Rejected: "booking-badge--rejected",
};

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

/**
 * @param {object} props
 * @param {Array} props.bookings - latest 5 bookings
 * @param {() => void} [props.onViewAll]
 */
const BookingTable = ({ bookings = [], onViewAll }) => {
  return (
    <div className="booking-table-card">
      <div className="booking-table-card__header">
        <h3>Booking Requests</h3>
      </div>

      <div className="booking-table__scroll">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr>
                <td colSpan={3} className="booking-table__empty">
                  No booking requests yet.
                </td>
              </tr>
            )}

            {bookings.map((booking) => {
              // NOTE: adjust field names to match the real booking object shape
              // (e.g. studentName, courseName, bookingDate, status)
              const studentName = booking.studentName || booking.student || "Unknown";
              return (
                <tr key={booking.bookingId || booking.id}>
                  <td>
                    <div className="booking-table__student">
                      <span className="booking-table__avatar">{initials(studentName)}</span>
                      {studentName}
                    </div>
                  </td>
                  <td>{booking.courseName || booking.categoryTitle}</td>
                  <td>
                    <span className={`booking-badge ${STATUS_STYLES[booking.status] || "booking-badge--pending"}`}>
                      {booking.status || "Pending"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button type="button" className="booking-table__view-all" onClick={onViewAll}>
        View All Bookings
      </button>
    </div>
  );
};

export default BookingTable;
