import React from "react";
import { useTeacherStudents } from "../hooks/useTeacherStudents";
import StudentStats from "../../teacher/components/StudentStats";
import StudentSearch from "../../teacher/components/StudentSearch";
import StudentFilters from "../../teacher/components/StudentFilters";
import StudentCard from "../../teacher/components/StudentCard";
import EmptyState from "../../teacher/components/EmptyState";
import { StudentStatsSkeleton, StudentGridSkeleton } from "../../teacher/components/LoadingSkeleton";
import "./TeacherStudentManagement.css";

export default function TeacherStudentManagement() {
  const {
    loading,
    error,
    students,
    faculties,
    stats,
    search,
    setSearch,
    facultyFilter,
    setFacultyFilter,
    bookingStatusFilter,
    setBookingStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    reload,
  } = useTeacherStudents();

  return (
    <div className="tsm-page">
      <div className="tsm-header">
        <h1 className="tsm-title">Student Management</h1>
        <p className="tsm-subtitle">
          Manage students enrolled in your faculties and monitor their bookings, payments, and
          enrolled faculties.
        </p>
      </div>

      {loading ? <StudentStatsSkeleton /> : <StudentStats stats={stats} />}

      <div className="tsm-toolbar">
        <StudentSearch value={search} onChange={setSearch} />
        <StudentFilters
          faculties={faculties}
          facultyFilter={facultyFilter}
          onFacultyChange={setFacultyFilter}
          bookingStatusFilter={bookingStatusFilter}
          onBookingStatusChange={setBookingStatusFilter}
          paymentStatusFilter={paymentStatusFilter}
          onPaymentStatusChange={setPaymentStatusFilter}
        />
      </div>

      <div className="tsm-grid">
        {loading ? (
          <StudentGridSkeleton />
        ) : error ? (
          <EmptyState type="error" description={error} onRetry={reload} variant="grid" />
        ) : students.length === 0 ? (
          <EmptyState type="students" variant="grid" />
        ) : (
          students.map((student) => <StudentCard key={student.id} student={student} />)
        )}
      </div>
    </div>
  );
}
