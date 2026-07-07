import './Dropdown.css'

// Simple styled <select> wrapper used for filters across the app.
export default function Dropdown({ value, onChange, options = [], placeholder }) {
  return (
    <select
      className="dropdown"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}

      {options.map((opt, index) => {
        const optionValue =
          typeof opt === "object" ? opt.value : opt;

        const optionLabel =
          typeof opt === "object" ? opt.label : opt;

        return (
          <option
           key={`${optionValue}-${index}`}
            value={optionValue}
          >
            {optionLabel}
          </option>
        );
      })}
    </select>
  );
}