// useStudentDetails.js
// Loads a single student's profile, booked courses, and faculties for
// TeacherStudentDetails. Payment info is fetched lazily per-course when the
// teacher clicks "View Payment" (checkPayment) rather than upfront.

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { userService, bookingService, paymentService } from "../../services/api";
import { normalizeStudent, normalizeBooking, normalizeFaculty, normalizePayment } from "../utils/studentHelpers";

export function useStudentDetails(userId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [student, setStudent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [faculties, setFaculties] = useState([]);

  const [activePayment, setActivePayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const [userRes, bookingsRes, facultiesRes] = await Promise.allSettled([
        userService.getById(userId),
        bookingService.getByUserId(userId),
        userService.getFaculties(userId),
      ]);

      if (userRes.status === "fulfilled") {
        setStudent(normalizeStudent(userRes.value.data));
      } else {
        throw new Error("Could not load this student's profile.");
      }

      setBookings(
        bookingsRes.status === "fulfilled" ? (bookingsRes.value.data || []).map(normalizeBooking) : []
      );

      setFaculties(
        facultiesRes.status === "fulfilled"
          ? (facultiesRes.value.data || []).map(normalizeFaculty)
          : []
      );
    } catch (err) {
      const message = err?.message || "Failed to load student details.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const viewPayment = useCallback(
    async (categoryId) => {
      setPaymentLoading(true);
      setPaymentError(null);
      setActivePayment(null);

      try {
        const res = await paymentService.checkPayment(userId, categoryId);
        setActivePayment(normalizePayment(res.data));
      } catch (err) {
        const message =
          err?.response?.status === 404
            ? "No payment information found for this course."
            : "Failed to load payment details.";
        setPaymentError(message);
        toast.error(message);
      } finally {
        setPaymentLoading(false);
      }
    },
    [userId]
  );

  const clearPayment = useCallback(() => {
    setActivePayment(null);
    setPaymentError(null);
  }, []);

  const stats = {
    totalBookedCourses: bookings.length,
    verifiedPayments: bookings.filter((b) => b.paymentStatus === "approved").length,
    totalFaculties: faculties.length,
    activeCourses: bookings.filter((b) => b.status === "active").length,
  };

  return {
    loading,
    error,
    student,
    bookings,
    faculties,
    stats,
    reload: load,
    activePayment,
    paymentLoading,
    paymentError,
    viewPayment,
    clearPayment,
  };
}
