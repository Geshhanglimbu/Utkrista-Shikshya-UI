// student/utils/helpers.js
// Shared helper functions for the Student Panel.

/**
 * Formats a numeric price into a display string.
 * Treats 0 / null / undefined as "Free".
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined || Number(price) === 0) return "Free";
  return `$${Number(price).toFixed(2)}`;
};

/**
 * Determines the badge type + label for a course/category based on its type or price.
 * Accepts either an explicit categoryType ("FREE" | "PAID") or falls back to price.
 */
export const getCourseBadge = (categoryType, price) => {
  const type =
    (categoryType || "").toUpperCase() === "FREE" || Number(price) === 0
      ? "FREE"
      : "PAID";
  return {
    label: type,
    className: type === "FREE" ? "badge-free" : "badge-paid",
  };
};

/**
 * Spring Boot / Java often serializes LocalDateTime as an array:
 * [year, month, day, hour, minute, second, nano]
 * This normalizes that (or an ISO string) into a JS Date.
 */
export const parseJavaDateTime = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    // Java months are 1-indexed, JS Date months are 0-indexed
    return new Date(year, month - 1, day, hour, minute, second);
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Formats a Java LocalDateTime (array or ISO string) into "MMM D, YYYY".
 */
export const formatDate = (value) => {
  const date = parseJavaDateTime(value);
  if (!date) return "TBA";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Formats a Java LocalDateTime (array or ISO string) into "HH:MM AM/PM".
 */
export const formatTime = (value) => {
  const date = parseJavaDateTime(value);
  if (!date) return "TBA";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Returns { day, month } for calendar-chip style date display (e.g. exam cards).
 */
export const getDateChip = (value) => {
  const date = parseJavaDateTime(value);
  if (!date) return { day: "--", month: "TBA" };
  return {
    day: date.getDate(),
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
  };
};

/**
 * Deterministic color hash — same category name always gets the same accent color.
 * Mirrors the pattern already used in the admin dashboard (Categories.jsx).
 */
const ACCENT_COLORS = [
  "#2952E3",
  "#0EA5E9",
  "#7C3AED",
  "#059669",
  "#DB2777",
  "#D97706",
];
export const hashColor = (seed = "") => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
};

/**
 * Simple debounce for search inputs.
 */
export const debounce = (fn, delay = 350) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Normalizes an id field that may come back as `id` or `categoryId` etc.
 */
export const normalizeId = (obj) =>
  obj?.id ?? obj?.categoryId ?? obj?.contentId ?? obj?.examId ?? null;

/**
 * Safely reads a nested field with a fallback, useful for inconsistent API shapes.
 */
export const safe = (value, fallback = "") =>
  value === null || value === undefined || value === "" ? fallback : value;
