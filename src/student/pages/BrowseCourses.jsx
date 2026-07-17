// student/pages/BrowseCourses.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import FilterSidebar from "../components/FilterSidebar";
import CourseCard from "../components/CourseCard";
import { EmptyState, ErrorState, SkeletonCard } from "../components/StateViews";
import {
  categoryService,
  contentService,
  examService,
  liveClassService,
} from "../../services/api"; // adjust path to match your actual services/api.js location
import "./BrowseCourses.css";

const PAGE_SIZE = 6;

const DEFAULT_FILTERS = {
  keyword: "",
  categoryIds: [],
  minPrice: 0,
  maxPrice: 2500,
};

const SORT_OPTIONS = [
  { value: "relevant", label: "Most Relevant" },
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price Low to High" },
  { value: "price_high", label: "Price High to Low" },
];

/**
 * BrowseCourses
 * Course catalogue page: search + filter sidebar + sortable, paginated
 * course grid. Categories come from categoryService.getAll(); lesson
 * counts come from contentService.getByCategoryId() per category.
 * Clicking "View Details" on a card navigates to the CourseDetails page.
 */
const BrowseCourses = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [contentByCategory, setContentByCategory] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("relevant");
  const [page, setPage] = useState(1);

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const categoryRes = await categoryService.getAll();
      const categoryList = categoryRes?.data ?? [];
      setCategories(categoryList);

      const contentResults = await Promise.allSettled(
        categoryList.map((cat) =>
          contentService.getByCategoryId(cat.categoryId)
        )
      );

      const contentMap = {};

      categoryList.forEach((cat, idx) => {
        contentMap[cat.categoryId] =
          contentResults[idx].status === "fulfilled"
            ? contentResults[idx].value?.data ?? []
            : [];
      });
      setContentByCategory(contentMap);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Distinct categories for the filter checkboxes.
  const filterCategories = useMemo(
    () =>
      categories.map((cat) => ({
        id: cat.categoryId,
        name: cat.categoryTitle,
      })),
    [categories]
  );

  // Map raw categories into the shape CourseCard expects.
  const allCourses = useMemo(
    () =>
      categories.map((cat) => ({
        id: cat.categoryId,
        categoryId: cat.categoryId,
        image: cat.imageName,
        title: cat.categoryTitle,
        categoryName: cat.mainCategory,
        categoryType: cat.categoryType,
        price: Number(cat.price),
        description: cat.categoryDescription,
        lessonCount: (contentByCategory[cat.categoryId] || []).length,
        createdAt: cat.addedDate,
      })),
    [categories, contentByCategory]
  );

  const maxCoursePrice = useMemo(() => {
    return Math.max(
      ...categories.map((c) => Number(c.price || 0)),
      0
    );
  }, [categories]);

  // Filtering + sorting — recomputed only when its inputs actually change.
  const filteredCourses = useMemo(() => {
    let result = allCourses.filter((course) => {
      const matchesKeyword =
        !appliedFilters.keyword ||
        course.title?.toLowerCase().includes(appliedFilters.keyword.toLowerCase()) ||
        course.categoryName?.toLowerCase().includes(appliedFilters.keyword.toLowerCase());

      const matchesCategory =
        appliedFilters.categoryIds.length === 0 ||
        appliedFilters.categoryIds.includes(course.categoryId);

      const price = Number(course.price) || 0;
      const matchesPrice = price <= appliedFilters.maxPrice;

      return matchesKeyword && matchesCategory && matchesPrice;
    });

    switch (sortBy) {
      case "newest":
        result = [...result].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "price_low":
        result = [...result].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price_high":
        result = [...result].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      default:
        break; // "relevant" — keep API order
    }

    return result;
  }, [allCourses, appliedFilters, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const paginatedCourses = filteredCourses.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleFilterChange = (patch) => setFilters((prev) => ({ ...prev, ...patch }));
  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };
  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setPage(1);
  };
  const handleSearch = (keyword) => {
    setFilters((prev) => ({ ...prev, keyword }));
    setAppliedFilters((prev) => ({ ...prev, keyword }));
    setPage(1);
  };

  const handleViewDetails = (course) => {
    navigate(`/student/course/${course.categoryId}`);
  };

  if (error) {
    return (
      <ErrorState
        message="We couldn't load the course catalogue. Please try again."
        onRetry={loadCourses}
      />
    );
  }

  return (
    <div className="browse-courses">
      <div className="browse-courses__topbar">
        <div>
          <h2>Explore Courses</h2>
          <p>Discover {allCourses.length}+ courses across every category.</p>
        </div>
        <div className="browse-courses__sort">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="browse-courses__search-mobile">
        <SearchBar placeholder="Search for courses or categories..." onSearch={handleSearch} />
      </div>

      <div className="browse-courses__layout">
        <FilterSidebar
          categories={filterCategories}
          filters={filters}
          maxPrice={maxCoursePrice}
          onChange={handleFilterChange}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />

        <div className="browse-courses__content">
          <div className="browse-courses__grid">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : paginatedCourses.length === 0 ? (
              <EmptyState
                title="No courses match your filters"
                message="Try widening your price range or clearing a filter."
              />
            ) : (
              paginatedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  imageFetcher={categoryService.getImage}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </div>

          {!isLoading && filteredCourses.length > 0 && (
            <div className="browse-courses__pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                if (totalPages > 5 && pageNum > 3 && pageNum < totalPages) {
                  if (pageNum === 4) return <span key="ellipsis">…</span>;
                  return null;
                }
                return (
                  <button
                    key={pageNum}
                    className={page === pageNum ? "active" : ""}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseCourses;