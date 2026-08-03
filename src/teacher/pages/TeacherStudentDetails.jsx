import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiHash,
  FiCalendar,
  FiBookOpen,
  FiCheckCircle,
  FiGrid,
  FiZap,
} from "react-icons/fi";
import { useStudentDetails } from "../hooks/useStudentDetails";
import BookedCoursesTable from "../../teacher/components/BookedCoursesTable";
import PaymentCard from "../../teacher/components/PaymentCard";
import FacultyCard from "../../teacher/components/FacultyCard";
import EmptyState from "../../teacher/components/EmptyState";
import {
  ProfileSkeleton,
  StatsSkeleton,
  TableSkeleton,
  FacultySkeleton,
} from "../../teacher/components/LoadingSkeleton";
import { formatDate, initials, statusColor } from "../utils/studentHelpers";
import "./TeacherStudentDetails.css";

export default function TeacherStudentDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const {
    loading,
    error,
    student,
    bookings,
    faculties,
    stats,
    reload,
    activePayment,
    paymentLoading,
    paymentError,
    viewPayment,
    clearPayment,
  } = useStudentDetails(userId);

  const [activeCategoryId, setActiveCategoryId] = React.useState(null);

  const handleViewPayment = (categoryId) => {
    setActiveCategoryId(categoryId);
    viewPayment(categoryId);
  };

  if (error && !loading) {
    return (
      <div className="tsd-page">
        <button className="tsd-back-btn" onClick={() => navigate("/teacher/students")}>
          <FiArrowLeft /> Back to Students
        </button>
        <EmptyState type="error" description={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="tsd-page">
      <div className="tsd-breadcrumb">
        <Link to="/teacher">Teacher</Link>
        <span>/</span>
        <Link to="/teacher/students">Student Management</Link>
        <span>/</span>
        <span className="current">Student Details</span>
      </div>

      <button className="tsd-back-btn" onClick={() => navigate("/teacher/students")}>
        <FiArrowLeft /> Back to Students
      </button>

      {loading || !student ? (
        <ProfileSkeleton />
      ) : (
        <div className="tsd-profile-card">
          {student.avatar ? (
            <img src={student.avatar} alt="" className="tsd-avatar-lg" />
          ) : (
            <div className="tsd-avatar-lg">{initials(student.fullName)}</div>
          )}
          <div className="tsd-profile-info">
            <p className="tsd-profile-name">
              {student.fullName}
              <span className={`tsd-badge tsd-badge-${statusColor(student.status)}`}>
                {student.status}
              </span>
            </p>
            <div className="tsd-profile-meta">
              <span><FiMail size={13} /> {student.email}</span>
              <span><FiPhone size={13} /> {student.phone}</span>
              <span><FiHash size={13} /> {student.studentId}</span>
              <span><FiCalendar size={13} /> Registered {formatDate(student.registrationDate)}</span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="tsd-stats">
          <StatCard icon={FiBookOpen} label="Booked Courses" value={stats.totalBookedCourses} />
          <StatCard icon={FiCheckCircle} label="Verified Payments" value={stats.verifiedPayments} />
          <StatCard icon={FiGrid} label="Total Faculties" value={stats.totalFaculties} />
          <StatCard icon={FiZap} label="Active Courses" value={stats.activeCourses} />
        </div>
      )}

      <section className="tsd-section">
        <h2 className="tsd-section-title">Booked Courses</h2>
        <BookedCoursesTable
          bookings={bookings}
          loading={loading}
          onViewPayment={handleViewPayment}
          activeCategoryId={paymentLoading ? activeCategoryId : null}
        />
      </section>

      {(activePayment || paymentLoading || paymentError) && (
        <section className="tsd-section">
          <h2 className="tsd-section-title">Payment Verification</h2>
          <PaymentCard payment={activePayment} loading={paymentLoading} error={paymentError} />
        </section>
      )}

      <section className="tsd-section">
        <h2 className="tsd-section-title">Student Faculties</h2>
        {loading ? (
          <FacultySkeleton />
        ) : faculties.length === 0 ? (
          <EmptyState type="faculties" />
        ) : (
          <div className="tsd-faculty-grid">
            {faculties.map((f) => (
              <FacultyCard key={f.id} faculty={f} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="tsd-stat-card">
      <div className="tsd-stat-icon">
        <Icon />
      </div>
      <div>
        <div className="tsd-stat-value">{value}</div>
        <div className="tsd-stat-label">{label}</div>
      </div>
    </div>
  );
}
