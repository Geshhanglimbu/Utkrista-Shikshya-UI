import "./StudentOverview.css";

const ProgressRow = ({ label, value, variant }) => (
  <div className="progress-row">
    <div className="progress-row__top">
      <span>{label}</span>
      <span className="progress-row__value">{value}%</span>
    </div>
    <div className="progress-row__track">
      <div
        className={`progress-row__fill progress-row__fill--${variant}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

/**
 * Student overview metrics.
 *
 * NOTE: attendanceRate, submissionRate, avgGrade and passingRatio are not
 * directly exposed by an aggregated endpoint today. These are placeholder
 * values — wire them up once a backend endpoint (or a derived calculation
 * from exam/assignment data) is available.
 *
 * @param {object} props
 * @param {number} [props.attendanceRate]
 * @param {number} [props.submissionRate]
 * @param {string} [props.avgGrade]
 * @param {number} [props.passingRatio]
 */
const StudentOverview = ({
  attendanceRate = 91,
  submissionRate = 84,
  avgGrade = "A-",
  passingRatio = 96.4,
}) => {
  return (
    <div className="student-overview-card">
      <h3 className="student-overview-card__title">Student Overview</h3>

      <ProgressRow label="Attendance Rate" value={attendanceRate} variant="blue" />
      <ProgressRow label="Assignments Submitted" value={submissionRate} variant="indigo" />

      <div className="student-overview__stat-row">
        <div className="student-overview__stat">
          <p className="student-overview__stat-label">Avg. Grade</p>
          <p className="student-overview__stat-value">{avgGrade}</p>
        </div>
        <div className="student-overview__stat">
          <p className="student-overview__stat-label">Passing Ratio</p>
          <p className="student-overview__stat-value">{passingRatio}%</p>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;
