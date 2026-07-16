// student/components/FilterSidebar.jsx
import "./FilterSidebar.css";

/**
 * FilterSidebar
 * Left-hand filter panel for Browse Courses. Fully controlled — the
 * parent page (BrowseCourses.jsx) owns filter state and passes it down,
 * so filtering logic (useMemo) lives in one place.
 */
const FilterSidebar = ({
  categories,
  filters,
  maxPrice,
  onChange,
  onApply,
  onReset,
}) => {
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
