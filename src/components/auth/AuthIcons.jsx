/* Shared inline SVG icons for the auth flow */
import React from "react";

export const IconCap = ({ size = 28, color = "#2952E3" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill={color} />
    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill={color} />
  </svg>
);

export const IconChevronLeft = ({ size = 18, color = "#0D1B2A" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconMail = ({ size = 16, color = "#9CA8C2" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="1.8" />
    <path d="M3 7l9 6 9-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconLock = ({ size = 16, color = "#9CA8C2" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="4" y="11" width="16" height="9" rx="2" stroke={color} strokeWidth="1.8" />
    <path d="M8 11V8a4 4 0 118 0v3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const IconEye = ({ size = 18, color = "#9CA8C2" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
  </svg>
);

export const IconEyeOff = ({ size = 18, color = "#9CA8C2" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 3l18 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M10.6 5.1A11 11 0 0112 5c7 0 11 7 11 7a13.5 13.5 0 01-3 3.7M6.6 6.6C3.8 8.3 1 12 1 12s4 7 11 7a10.6 10.6 0 005.4-1.5M9.9 9.9a3 3 0 104.2 4.2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconAlertTriangle = ({ size = 16, color = "#DC2626" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3L2 20h20L12 3z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 10v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="17" r="1" fill={color} />
  </svg>
);

export const IconAlertCircle = ({ size = 13, color = "#DC2626" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
    <path d="M12 8v5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1" fill={color} />
  </svg>
);

export const IconClose = ({ size = 12, color = "#DC2626" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const IconCheckCircle = ({ size = 16, color = "#16A34A" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
    <path d="M8 12.5l2.5 2.5L16 9.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconCheckBig = ({ size = 40, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 13l4 4L19 7" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconArrowRight = ({ size = 16, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconLogout = ({ size = 16, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconGoogle = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.69-2.26 1.1-3.71 1.1-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.98 10.98 0 0012 23z" />
    <path fill="#FBBC05" d="M5.84 14.14a6.6 6.6 0 010-4.27V7.03H2.18a11 11 0 000 9.94l3.66-2.83z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A10.98 10.98 0 002.18 7.03l3.66 2.84c.87-2.6 3.3-4.49 6.16-4.49z" />
  </svg>
);

export const IconShield = ({ size = 16, color = "#16A34A" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconPhone = ({ size = 16, color = "#9CA8C2" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

export const IconSmartphone = ({ size = 22, color = "#2952E3" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="6" y="2" width="12" height="20" rx="2" stroke={color} strokeWidth="1.8" />
    <path d="M11 18h2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const IconUser = ({ size = 16, color = "#9CA8C2" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" />
    <path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const IconUserPlus = ({ size = 18, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="10" cy="8" r="4" stroke={color} strokeWidth="2" />
    <path d="M2 20c0-3.5 3.5-6 8-6s8 2.5 8 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M19 8v6M16 11h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconCalendar = ({ size = 16, color = "#9CA8C2" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth="1.8" />
    <path d="M16 3v4M8 3v4M3 10h18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const IconInfo = ({ size = 16, color = "#2952E3" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
    <path d="M12 11v5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="8" r="1" fill={color} />
  </svg>
);

export const IconSend = ({ size = 18, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconEdit = ({ size = 13, color = "#2952E3" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 20h9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

export const IconRefresh = ({ size = 13, color = "#2952E3" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 12a9 9 0 11-2.6-6.4L21 8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 3v5h-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconClockOutline = ({ size = 14, color = "#2952E3" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
    <path d="M12 7v5l3 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const IconBriefcase = ({ size = 18, color = "#16A34A" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="7" width="18" height="13" rx="2" stroke={color} strokeWidth="1.8" />
    <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth="1.8" />
  </svg>
);

export const IconStar = ({ size = 18, color = "#D97706" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2l3 6.5 7 .9-5 5 1.3 7-6.3-3.5L5.7 21.4 7 14.4l-5-5 7-.9L12 2z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);
