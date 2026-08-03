// studentHelpers.js
// Normalizes raw backend shapes (users, categories, bookings, payments) into
// consistent objects the Student Management UI can rely on.
//
// NOTE: Field names below (teacherId, categoryId, userId, etc.) are based on
// the existing API service layer (userService, categoryService, bookingService,
// paymentService). If your backend uses slightly different field names for
// "who owns this faculty" or "who booked this course", adjust the two spots
// marked with // ADJUST below — everything else will keep working.

/**
 * Converts a Java LocalDateTime array [yyyy, MM, dd, HH, mm, ss, nano]
 * (or an ISO string, or null) into a JS Date. Returns null if unparsable.
 */
export function normalizeDate(value) {
  if (!value) return null;

  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    if (!year || !month || !day) return null;
    // Java months are 1-indexed, JS Date months are 0-indexed
    return new Date(year, month - 1, day, hour, minute, second);
  }

  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value, fallback = "—") {
  const date = normalizeDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Normalizes a raw user object into a consistent shape for the student cards
 * and details page. Backend may return different casing / naming for the
 * same concept (id vs userId, name vs fullName), so we cover common variants.
 */
export function normalizeStudent(raw) {
  if (!raw) return null;

  const id = raw.userId ?? raw.id ?? raw.studentId;
  const fullName =
    raw.fullName ||
    raw.name ||
    [raw.firstName, raw.lastName].filter(Boolean).join(" ") ||
    "Unnamed Student";

  return {
    id,
    fullName,
    email: raw.email || "—",
    phone: raw.phone || raw.phoneNumber || "—",
    studentId: raw.studentId || raw.username || `STU-${id}`,
    registrationDate: raw.addedDate || raw.registrationDate || raw.createdAt,
    status: (raw.status || raw.accountStatus || "active").toLowerCase(),
    avatar: raw.avatar || raw.profileImage || null,
    raw,
  };
}

/**
 * Normalizes a raw booking object (from bookingService.getByUserId /
 * bookingService.getAll) into a consistent shape.
 */
export function normalizeBooking(raw) {
  if (!raw) return null;

  const categoryId =
    raw.categoryId ?? raw.category?.categoryId ?? raw.category?.id;

  return {
    id: raw.id ?? raw.bookedId,
    userId: raw.userId ?? raw.user?.userId ?? raw.user?.id, // ADJUST if your booking DTO nests user differently
    categoryId,
    courseName:
      raw.categoryTitle || raw.category?.categoryTitle || raw.courseName || "Untitled Course",
    categoryType: raw.category?.categoryType || raw.categoryType || "—",
    teacherName: raw.teacherName || raw.category?.teacherName || "—",
    bookedDate: raw.addedDate || raw.bookedDate || raw.createdAt,
    price: raw.price ?? raw.totalPrice ?? raw.category?.price ?? "0",
    status: (raw.status || "pending").toLowerCase(),
    paymentStatus: (raw.paymentStatus || raw.payment_screensort || "pending").toLowerCase(),
    raw,
  };
}

/**
 * Normalizes a raw payment object (from paymentService.checkPayment) into a
 * consistent shape for the PaymentCard component.
 */
export function normalizePayment(raw) {
  if (!raw) return null;

  return {
    paymentId: raw.paymentId ?? raw.id,
    screenshot: raw.imageName || raw.fileName || raw.attachment || raw.file || null,
    status: (raw.status || raw.paymentStatus || "pending").toLowerCase(),
    uploadedDate: raw.addedDate || raw.uploadedDate || raw.createdAt,
    validUntil: raw.courseValidDate || raw.validUntil || raw.expiryDate,
    verified: !!raw.verified || (raw.status || "").toLowerCase() === "approved",
    raw,
  };
}

/**
 * Normalizes a raw faculty/category object into a consistent shape for
 * FacultyCard.
 */
export function normalizeFaculty(raw) {
  if (!raw) return null;

  return {
    id: raw.categoryId ?? raw.id,
    title: raw.categoryTitle || raw.title || "Untitled Faculty",
    description: raw.description || raw.categoryDescription || "No description provided.",
    teacherName: raw.teacherName || raw.mainCategory || "—",
    courseCount: raw.courseCount ?? raw.numberOfCourses ?? 0,
    joinedDate: raw.addedDate || raw.joinedDate,
    status: (raw.status || "active").toLowerCase(),
    raw,
  };
}

export function statusColor(status = "") {
  const s = status.toLowerCase();
  if (["approved", "verified", "active", "confirmed"].includes(s)) return "success";
  if (["pending", "processing"].includes(s)) return "warning";
  if (["rejected", "cancelled", "inactive", "expired"].includes(s)) return "danger";
  return "neutral";
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
