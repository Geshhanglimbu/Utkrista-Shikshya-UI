// useTeacherStudents.js
// Fetches all students enrolled in the current teacher's faculties, and
// exposes search / filter / stats derived state for TeacherStudentManagement.
//
// ADJUST: this hook assumes:
//  1. The logged-in teacher's id is available in localStorage under "user"
//     (JSON with a userId/id field). Change getTeacherId() if you store it
//     differently.
//  2. A category "belongs" to a teacher via category.teacherId. If your
//     categories don't carry a teacherId, swap the filter in loadFaculties()
//     for whatever field actually identifies ownership (e.g. addedBy).

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  categoryService,
  bookingService,
  userService,
  paymentService,
} from "../../services/api"; // ADJUST path to your actual api.js location
import { normalizeStudent, normalizeBooking, normalizeFaculty } from "../utils/studentHelpers";

function getTeacherId() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.userId ?? user?.id ?? null;
  } catch {
    return null;
  }
}

export function useTeacherStudents() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [faculties, setFaculties] = useState([]); // this teacher's faculties
  const [bookings, setBookings] = useState([]); // all bookings across those faculties
  const [students, setStudents] = useState([]); // normalized, merged student objects

  const [search, setSearch] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const teacherId = getTeacherId();

      const [categoriesRes, bookingsRes] = await Promise.all([
        categoryService.getAll(),
        bookingService.getByUserId(teacherId),
      ]);

      const allCategories = categoriesRes.data || [];
      const myFaculties = teacherId
        ? allCategories.filter((c) => (c.teacherId ?? c.addedBy) === teacherId)
        : allCategories; // fallback: show all if teacher id unknown (dev mode)

      const myFacultyIds = new Set(myFaculties.map((f) => f.categoryId ?? f.id));

      const allBookings = (bookingsRes.data || [])
        .map(normalizeBooking)
        .filter((b) => myFacultyIds.has(b.categoryId));

      // Unique student ids from bookings in my faculties
      const studentIds = [...new Set(allBookings.map((b) => b.userId).filter(Boolean))];

      // Fetch each student's profile. Falls back gracefully per-student so one
      // bad id doesn't break the whole list.
      const profiles = await Promise.all(
        studentIds.map(async (id) => {
          try {
            const res = await userService.getById(id);
            return normalizeStudent(res.data);
          } catch {
            return normalizeStudent({ id, fullName: `Student #${id}` });
          }
        })
      );

      const merged = profiles
        .filter(Boolean)
        .map((student) => {
          const studentBookings = allBookings.filter((b) => b.userId === student.id);
          const facultyIds = new Set(studentBookings.map((b) => b.categoryId));
          const verifiedCount = studentBookings.filter((b) => b.paymentStatus === "approved").length;

          return {
            ...student,
            bookingCount: studentBookings.length,
            facultyCount: facultyIds.size,
            paymentStatus:
              verifiedCount === studentBookings.length && studentBookings.length > 0
                ? "approved"
                : verifiedCount > 0
                ? "partial"
                : "pending",
            bookingStatus: studentBookings.some((b) => b.status === "active")
              ? "active"
              : studentBookings.some((b) => b.status === "pending")
              ? "pending"
              : "inactive",
            facultyIds: [...facultyIds],
          };
        });

      setFaculties(myFaculties.map(normalizeFaculty));
      setBookings(allBookings);
      setStudents(merged);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load students.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        !debouncedSearch ||
        s.fullName.toLowerCase().includes(debouncedSearch) ||
        s.email.toLowerCase().includes(debouncedSearch) ||
        String(s.studentId).toLowerCase().includes(debouncedSearch);

      const matchesFaculty =
        facultyFilter === "all" || s.facultyIds.includes(Number(facultyFilter));

      const matchesBookingStatus =
        bookingStatusFilter === "all" || s.bookingStatus === bookingStatusFilter;

      const matchesPaymentStatus =
        paymentStatusFilter === "all" || s.paymentStatus === paymentStatusFilter;

      return matchesSearch && matchesFaculty && matchesBookingStatus && matchesPaymentStatus;
    });
  }, [students, debouncedSearch, facultyFilter, bookingStatusFilter, paymentStatusFilter]);

  const stats = useMemo(
    () => ({
      totalStudents: students.length,
      totalBookings: bookings.length,
      verifiedPayments: bookings.filter((b) => b.paymentStatus === "approved").length,
      myFaculties: faculties.length,
    }),
    [students, bookings, faculties]
  );

  return {
    loading,
    error,
    students: filteredStudents,
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
    reload: load,
  };
}
