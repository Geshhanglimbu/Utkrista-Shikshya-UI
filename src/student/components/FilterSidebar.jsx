// student/components/FilterSidebar.jsx
import "./FilterSidebar.css";

/**
 * FilterSidebar
 * Left-hand filter panel, shared across student pages.
 *
 * mode="course" (default) -> original Browse Courses behavior, unchanged:
 *   keyword input, category checkboxes, price range slider.
 *
 * mode="exam" -> Student Exams behavior:
 *   category dropdown (single select), status filter
 *   (All / Upcoming / Completed / Results Published), sort by date.
 *a
 * Both modes stay fully controlled by the parent page — `filters` +
 * `onChange` follow the same contract as before, only the shape of
 * `filters` differs per mode. Existing callers (e.g. BrowseCourses.jsx)
 * don't need any changes.
 */
const FilterSidebar = ({
  mode = "course",
  categories = [],
  filters,
  maxPrice,
  onChange,
  onApply,
  onReset,
}) => {
  if (mode === "exam") {
    return (
      <aside className="filter-sidebar">
        <div className="filter-sidebar__header">
          <h4>Filters</h4>
          <button onClick={onReset} className="filter-sidebar__reset">
            Reset All
          </button>
        </div>

        <div className="filter-sidebar__section">
          <label>Category</label>
          <select
            className="filter-sidebar__select"
            value={filters.categoryId}
            onChange={(e) => onChange({ categoryId: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-sidebar__section">
          <label>Status</label>
          <div className="filter-sidebar__radio-group">
            {[
              { value: "all", label: "All" },
              { value: "upcoming", label: "Upcoming" },
              { value: "completed", label: "Completed" },
              { value: "published", label: "Results Published" },
            ].map((opt) => (
              <label key={opt.value} className="filter-sidebar__radio">
                <input
                  type="radio"
                  name="exam-status"
                  value={opt.value}
                  checked={filters.status === opt.value}
                  onChange={() => onChange({ status: opt.value })}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-sidebar__section">
          <label>Sort by Date</label>
          <select
            className="filter-sidebar__select"
            value={filters.sortOrder}
            onChange={(e) => onChange({ sortOrder: e.target.value })}
          >
            <option value="asc">Nearest First</option>
            <option value="desc">Latest First</option>
          </select>
        </div>

        <button className="filter-sidebar__apply" onClick={onApply}>
          Apply Changes
        </button>
      </aside>
    );
  }

  // --- original course mode (unchanged) ---
  const toggleCategory = (id) => {
    const exists = filters.categoryIds.includes(id);
    onChange({
      categoryIds: exists
        ? filters.categoryIds.filter((c) => c !== id)
        : [...filters.categoryIds, id],
    });
  };

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar__header">
        <h4>Filters</h4>
        <button onClick={onReset} className="filter-sidebar__reset">
          Reset All
        </button>
      </div>

      <div className="filter-sidebar__section">
        <label>Keywords</label>
        <input
          type="text"
          placeholder="e.g. JavaScript"
          value={filters.keyword}
          onChange={(e) => onChange({ keyword: e.target.value })}
        />
      </div>

      <div className="filter-sidebar__section">
        <label>Categories</label>
        <div className="filter-sidebar__checkboxes">
          {categories.map((cat) => (
            <label key={cat.id} className="filter-sidebar__checkbox">
              <input
                type="checkbox"
                checked={filters.categoryIds.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-sidebar__section">
        <div className="filter-sidebar__row">
          <label>Price Range</label>
          <span className="filter-sidebar__value">
            ${filters.minPrice} - ${filters.maxPrice}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={maxPrice}
          step={100}
          value={filters.maxPrice}
          onChange={(e) => onChange({ maxPrice: Number(e.target.value) })}
        />
      </div>

      <button className="filter-sidebar__apply" onClick={onApply}>
        Apply Changes
      </button>
    </aside>
  );
};

export default FilterSidebar;
