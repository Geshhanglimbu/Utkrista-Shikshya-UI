import './Dropdown.css'

// Simple styled <select> wrapper used for filters across the app.
export default function Dropdown({ value, onChange, options, placeholder }) {
  return (
    <select className="dropdown" value={value} onChange={(e) => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  )
}
