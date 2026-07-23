// student/utils/useEnrollmentStatus.js
import { useState, useEffect, useCallback } from "react";
import { paymentService } from "../../services/api"; // adjust path to match your actual services/api.js location

// Reads the logged-in user's id from localStorage.
// Mirrors the same lookup used in StudentPayment.jsx — keep both in sync
// if you change how the logged-in user is stored.
const getUserId = () => {
  try {
    const stored = localStorage.getItem("userId") || localStorage.getItem("user");
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return parsed?.userId ?? parsed?.id ?? stored;
    } catch {
      return stored;
    }
  } catch {
    return null;
  }
};

/**
 * useEnrollmentStatus
 * Checks whether the logged-in student has an APPROVED payment for a given
 * categoryId, using the existing paymentService.checkPayment API — no new
 * endpoints, no assumptions about extra request bodies.
 *
 * Returns:
 *  - status: "APPROVED" | "PENDING" | "REJECTED" | "NONE" | null (null while first loading)
 *  - isEnrolled: true only when status === "APPROVED"
 *  - isLoading: true while the check is in flight
 *  - refresh: re-run the check (e.g. after a payment is submitted/approved)
 *
 * NOTE: this only controls what the UI *shows*. The backend must
 * independently verify enrollment before returning real content
 * (file URLs, video links, exam questions) — this hook is not a security
 * boundary by itself.
 */
const useEnrollmentStatus = (categoryId) => {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    const userId = getUserId();

    if (!userId || !categoryId) {
      setStatus("NONE");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await paymentService.checkPayment(userId, categoryId);
      const data = Array.isArray(res?.data) ? res.data[0] : res?.data;
      setStatus(data?.status ? String(data.status).toUpperCase() : "NONE");
    } catch {
      // 404 / no record found → treat as "not enrolled" rather than an error.
      setStatus("NONE");
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    status,
    isEnrolled: status === "APPROVED",
    isLoading,
    refresh: checkStatus,
  };
};

export default useEnrollmentStatus;