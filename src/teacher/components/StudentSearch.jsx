import React from "react";
import { FiSearch } from "react-icons/fi";
import "./StudentSearch.css";

/**
 * Controlled search input. Debouncing (300ms) is handled inside
 * useTeacherStudents, so this component just reflects `value` and calls
 * `onChange` on every keystroke.
 */
export default function StudentSearch({ value, onChange }) {
  return (
    <div className="tsm-search">
      <FiSearch />
      <input
        type="text"
        placeholder="Search by name, email, or student ID..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search students"
      />
    </div>
  );
}
