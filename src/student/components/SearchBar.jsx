// student/components/SearchBar.jsx
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { debounce } from "../utils/helpers";
import "./SearchBar.css";

/**
 * SearchBar
 * Controlled input that debounces calls to onSearch so parent pages
 * (Dashboard, BrowseCourses) can filter instantly without spamming
 * re-renders on every keystroke.
 */
const SearchBar = ({ placeholder = "Search...", onSearch, defaultValue = "" }) => {
  const [value, setValue] = useState(defaultValue);

  const debouncedSearch = useMemo(() => debounce(onSearch, 300), [onSearch]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  return (
    <div className="student-search-bar">
      <Search size={18} className="student-search-bar__icon" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
};

export default SearchBar;
