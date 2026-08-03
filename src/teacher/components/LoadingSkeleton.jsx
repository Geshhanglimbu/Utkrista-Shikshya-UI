import React from "react";
import "./LoadingSkeleton.css";

/**
 * Generic skeleton block. width/height accept any CSS size value.
 */
export function SkeletonBlock({ width = "100%", height = "14px", radius, style, className = "" }) {
  return (
    <div
      className={`tsm-skel tsd-skel ${className}`}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

export function StudentStatsSkeleton() {
  return (
    <div className="tsm-stats">
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="tsm-stat-card" key={i}>
          <SkeletonBlock width="44px" height="44px" radius="12px" />
          <div style={{ flex: 1 }}>
            <SkeletonBlock width="50%" height="18px" style={{ marginBottom: 8 }} />
            <SkeletonBlock width="70%" height="11px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StudentCardSkeleton() {
  return (
    <div className="tsm-card" style={{ cursor: "default" }}>
      <div className="tsm-card-top">
        <SkeletonBlock width="46px" height="46px" radius="50%" />
        <SkeletonBlock width="60px" height="20px" radius="999px" />
      </div>
      <div>
        <SkeletonBlock width="70%" height="15px" style={{ marginBottom: 8 }} />
        <SkeletonBlock width="85%" height="12px" />
      </div>
      <div className="tsm-card-divider" />
      <SkeletonBlock width="100%" height="12px" />
    </div>
  );
}

export function StudentGridSkeleton({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <StudentCardSkeleton key={i} />
      ))}
    </>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="tsd-profile-card">
      <SkeletonBlock width="84px" height="84px" radius="50%" />
      <div style={{ flex: 1 }}>
        <SkeletonBlock width="220px" height="20px" style={{ marginBottom: 10 }} />
        <SkeletonBlock width="340px" height="13px" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="tsd-stats">
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="tsd-stat-card" key={i}>
          <SkeletonBlock width="44px" height="44px" radius="12px" />
          <div style={{ flex: 1 }}>
            <SkeletonBlock width="50%" height="18px" style={{ marginBottom: 8 }} />
            <SkeletonBlock width="70%" height="11px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 4 }) {
  return (
    <div className="tsd-table-wrap">
      <table className="tsd-table">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: 6 }).map((__, j) => (
                <td key={j}>
                  <SkeletonBlock width="80%" height="12px" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FacultySkeleton({ count = 3 }) {
  return (
    <div className="tsd-faculty-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="tsd-faculty-card" key={i}>
          <SkeletonBlock width="60%" height="14px" style={{ marginBottom: 10 }} />
          <SkeletonBlock width="100%" height="11px" style={{ marginBottom: 6 }} />
          <SkeletonBlock width="80%" height="11px" />
        </div>
      ))}
    </div>
  );
}
