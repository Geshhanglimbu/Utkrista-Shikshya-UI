import "./UpcomingExamTable.css";

// Maps exam status strings coming from the backend to a badge style.
// NOTE: confirm the exact enum string casing your backend returns
// (e.g. "PUBLISHED" vs "Published") and adjust the keys below if needed.
const STATUS_STYLES = {
  PUBLISHED: "badge--published",
  Published: "badge--published",
  PENDING: "badge--pending",
  Pending: "badge--pending",
  DRAFT: "badge--draft",
  Draft: "badge--draft",
};

const StatusBadge = ({ status }) => {
  const variant = STATUS_STYLES[status] || "badge--draft";
  return <span className={`exam-badge ${variant}`}>{status || "Draft"}</span>;
};

/**
 * @param {object} props
 * @param {Array} props.exams - upcoming exams (already filtered to future dates)
 * @param {() => void} [props.onViewAll]
 */
const UpcomingExamTable = ({ exams = [], onViewAll }) => {
  return (
    <div className="exam-table-card">
      <div className="exam-table-card__header">
        <h3>Upcoming Exams</h3>
        <button type="button" className="link-btn" onClick={onViewAll}>
          View All Exams <span aria-hidden="true">&gt;</span>
        </button>
      </div>

      <div className="exam-table__scroll">
        <table className="exam-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Date</th>
              <th>Time</th>
              <th>Students</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 && (
              <tr>
                <td colSpan={5} className="exam-table__empty">
                  No upcoming exams scheduled.
                </td>
              </tr>
            )}

            {exams.map((exam) => (
              <tr key={exam.examId || exam.id}>
                {/* NOTE: adjust field names below to match the real exam object shape
                    (e.g. title, examType, startTime as ISO string, studentCount) */}
                <td className="exam-table__subject">{exam.title || exam.subject}</td>
                <td>{exam.date}</td>
                <td>{exam.time}</td>
                <td>{exam.studentCount ?? exam.students ?? "—"}</td>
                <td>
                  <StatusBadge status={exam.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UpcomingExamTable;
