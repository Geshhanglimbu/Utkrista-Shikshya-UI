// student/pages/Dashboard.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight, Video } from "lucide-react";
import DashboardCard from "../components/DashboardCard";
import ProgressCard from "../components/ProgressCard";
import CourseCard from "../components/CourseCard";
import CourseDetailsModal from "../components/CourseDetailsModal";
import { EmptyState, ErrorState, SkeletonCard } from "../components/StateViews";
import {
  categoryService,
  contentService,
  examService,
  liveClassService,
} from "../../services/api"; // adjust path to match your actual services/api.js location
import { formatTime, getDateChip } from "../utils/helpers";
import "./Dashboard.css";

// ---------- Response-shape helpers ----------
// Different endpoints on this backend wrap their list payload differently
// (raw array vs { data: [...] } vs { content: [...] } etc). Extracting it
// defensively here is what was silently breaking categories/exams/live
// classes before — a wrapped response was being treated as if it were
// already the array, so `.map()` either threw (caught by the outer
// try/catch → ErrorState) or produced an empty dashboard.
function extractList(res) {
  const body = res?.data;
  if (Array.isArray(body)) return body;
  const nested =
    body?.data ?? body?.content ?? body?.categories ?? body?.exams ?? body?.lives ?? body?.posts;
  return Array.isArray(nested) ? nested : [];
}

function getCategoryId(cat) {
  return cat?.categoryId ?? cat?.id ?? cat?._id ?? null;
}

// Backend sends Java LocalDateTime as an array: [yyyy, MM, dd, HH, mm, ss(, nano)]
// (month is 1-indexed). Plain ISO strings/timestamps are also handled.
function normalizeDateValue(value) {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    return new Date(year, (month || 1) - 1, day || 1, hour, minute, second);
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// The live class's actual join URL can come back under a few different
// field names depending on how it was created (Zoom link, YouTube link,
// generic meeting link, etc) — check them all before giving up.
function getLiveClassLink(lc) {
  return (
    lc.link ??
    lc.liveLink ??
    lc.meetingLink ??
    lc.joinLink ??
    lc.joinUrl ??
    lc.zoomLink ??
    lc.youtubeLink ??
    lc.url ??
    null
  );
}

const Dashboard = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [contentByCategory, setContentByCategory] = useState({});
  const [exams, setExams] = useState([]); // each exam gets `categoryId` + `categoryName` + `dateObj` attached
  const [liveClasses, setLiveClasses] = useState([]); // each gets `categoryId` + `categoryName` + `dateObj`

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const student = useMemo(
    () => JSON.parse(localStorage.getItem("student") || "null") || { name: "Student" },
    []
  );

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // ---- Categories ----
      const categoryRes = await categoryService.getAll();
      const categoryList = extractList(categoryRes);
      setCategories(categoryList);

      const categoryIds = categoryList.map(getCategoryId).filter((id) => id != null);

      // ---- Content (per category, so one failure doesn't block the rest) ----
      const contentResults = await Promise.allSettled(
        categoryIds.map((id) => contentService.getByCategoryId(id))
      );

      const contentMap = {};
      categoryList.forEach((cat) => {
        const id = getCategoryId(cat);
        const index = categoryIds.indexOf(id);
        const result = index >= 0 ? contentResults[index] : null;
        contentMap[id] = result?.status === "fulfilled" ? extractList(result.value) : [];
      });
      setContentByCategory(contentMap);

      // ---- Exams ----
      let examList = [];
      try {
        const examRes = await examService.getAll();
        examList = extractList(examRes).map((exam) => {
          const dateObj = normalizeDateValue(exam.startTime ?? exam.examDate);
          return {
            ...exam,
            categoryId: exam.category?.categoryId ?? exam.categoryId ?? null,
            categoryName: exam.category?.categoryTitle || exam.category?.mainCategory || "General",
            dateObj,
          };
        });
      } catch (e) {
        console.error("Exam API failed", e);
      }
      setExams(examList);

      // ---- Live Classes ----
      let liveList = [];
      try {
        const liveRes = await liveClassService.getAll();
        liveList = extractList(liveRes).map((live) => {
          const dateObj = normalizeDateValue(live.startTime ?? live.date ?? live.liveDate);
          return {
            ...live,
            categoryId: live.category?.categoryId ?? live.categoryId ?? null,
            categoryName: live.category?.categoryTitle || live.category?.mainCategory || "General",
            dateObj,
          };
        });
      } catch (e) {
        console.error("Live class API failed", e);
      }
      setLiveClasses(liveList);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // ---- Derived data (useMemo so unrelated re-renders don't recompute these) ----

  const totalLessons = useMemo(
    () => Object.values(contentByCategory).reduce((sum, arr) => sum + arr.length, 0),
    [contentByCategory]
  );

  const purchasedCoursesCount = categories.length; // Swap for a real enrollment API once available.

  const upcomingExams = useMemo(
    () =>
      [...exams]
        .filter((e) => e.dateObj) // drop exams we couldn't parse a date for
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
        .slice(0, 4),
    [exams]
  );

  const upcomingLiveClasses = useMemo(
    () =>
      [...liveClasses]
        .filter((lc) => lc.dateObj)
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
        .slice(0, 3),
    [liveClasses]
  );

  const continueLearning = useMemo(() => {
    const firstCategoryWithContent = categories.find(
      (cat) => (contentByCategory[getCategoryId(cat)] || []).length > 0
    );
    if (!firstCategoryWithContent) return null;

    return {
      thumbnail: firstCategoryWithContent.imageName ?? firstCategoryWithContent.image,
      title: firstCategoryWithContent.categoryTitle ?? firstCategoryWithContent.title,
      categoryId: getCategoryId(firstCategoryWithContent),
    };
  }, [categories, contentByCategory]);

  const recommendedCourses = useMemo(
    () =>
      categories.map((cat) => {
        const id = getCategoryId(cat);
        return {
          id,
          categoryId: id,
          image: cat.imageName ?? cat.image,
          title: cat.categoryTitle ?? cat.title,
          lessonCount: (contentByCategory[id] || []).length,
        };
      }),
    [categories, contentByCategory]
  );

  const visibleRecommended = recommendedCourses.slice(carouselIndex, carouselIndex + 3);

  const handleCarousel = (dir) => {
    setCarouselIndex((prev) => {
      const next = prev + dir * 3;
      if (next < 0) return 0;
      if (next >= recommendedCourses.length) return prev;
      return next;
    });
  };

  // ---- Navigation handlers ----
  const goToMyCourses = () => navigate("/student/my-courses");
  const goToExams = (categoryId) =>
    navigate(categoryId ? `/student/exams?categoryId=${categoryId}` : "/student/exams");

  // Joining a live class takes the student straight to the class's own link
  // (Zoom/YouTube/meeting URL) instead of an internal route.
  const goToLiveClass = (liveClass) => {
    const link = getLiveClassLink(liveClass);
    if (!link) {
      toast.error("Live class link isn't available yet.");
      return;
    }
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const resumeLearning = () => {
    if (continueLearning?.categoryId) {
      navigate(`/student/my-courses/${continueLearning.categoryId}`);
    } else {
      navigate("/student/browse-courses");
    }
  };

  if (error) {
    return (
      <ErrorState
        message="We couldn't load your dashboard. Please check your connection and try again."
        onRetry={loadDashboard}
      />
    );
  }

  return (
    <div className="student-dashboard">
      {/* Hero */}
      <div className="student-dashboard__hero-row">
        <DashboardCard
          isLoading={isLoading}
          studentName={student.name}
          headline={
            continueLearning
              ? `Continue your path to excellence in ${continueLearning.title}.`
              : "Welcome to your learning journey!"
          }
          message="You've completed 72% of your weekly goal. Keep the momentum going to reach your certification by next month."
          ctaLabel="Resume Last Lesson"
          onCtaClick={resumeLearning}
        />
      </div>

      {/* Continue learning + upcoming exams */}
      <div className="student-dashboard__row">
        <div className="student-dashboard__panel">
          <div className="student-dashboard__panel-header">
            <h3>Continue Learning</h3>
            <button className="student-dashboard__link-btn" onClick={goToMyCourses}>
              View All →
            </button>
          </div>
          {isLoading ? (
            <SkeletonCard />
          ) : continueLearning ? (
            <ProgressCard
              {...continueLearning}
              imageFetcher={categoryService.getImage}
              onClick={resumeLearning}
            />
          ) : (
            <EmptyState
              title="No courses in progress"
              message="Browse courses to start your first lesson."
            />
          )}
        </div>

        <div className="student-dashboard__panel">
          <div className="student-dashboard__panel-header">
            <h3>Upcoming Exams</h3>
          </div>
          <div className="student-dashboard__exam-list">
            {isLoading ? (
              <SkeletonCard />
            ) : upcomingExams.length === 0 ? (
              <EmptyState title="No upcoming exams" message="You're all caught up." />
            ) : (
              upcomingExams.map((exam) => {
                const chip = getDateChip(exam.dateObj);
                return (
                  <div
                    className="exam-row"
                    key={exam.examId ?? exam.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => goToExams(exam.categoryId)}
                  >
                    <div className="exam-row__date">
                      <span>{chip.day}</span>
                      <small>{chip.month}</small>
                    </div>
                    <div className="exam-row__info">
                      <span className="exam-row__tag">{exam.categoryName}</span>
                      <h5>{exam.title}</h5>
                      <p>
                        {formatTime(exam.dateObj)}
                        {exam.examType ? ` • ${exam.examType}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <button className="student-dashboard__view-calendar" onClick={() => goToExams()}>
              + View Full Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming live classes */}
      <div className="student-dashboard__panel">
        <div className="student-dashboard__panel-header">
          <h3>
            <Video size={16} /> Upcoming Live Classes
          </h3>
        </div>
        <div className="student-dashboard__live-list">
          {isLoading ? (
            <SkeletonCard />
          ) : upcomingLiveClasses.length === 0 ? (
            <EmptyState title="No live classes scheduled" message="Check back soon for new sessions." />
          ) : (
            upcomingLiveClasses.map((lc) => (
              <div className="live-row" key={lc.liveId ?? lc.id}>
                <div className="live-row__info">
                  <span className="exam-row__tag">{lc.categoryName}</span>
                  <h5>{lc.title}</h5>
                  <p>
                    {lc.teacherName ? `${lc.teacherName} • ` : ""}
                    {formatTime(lc.dateObj)}
                  </p>
                </div>
                <button className="live-row__join" onClick={() => goToLiveClass(lc)}>
                  Join
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recommended courses carousel */}
      <div className="student-dashboard__panel">
        <div className="student-dashboard__panel-header">
          <div>
            <h3>Recommended for You</h3>
            <p className="student-dashboard__subtext">Picked from your active categories</p>
          </div>
          <div className="student-dashboard__carousel-controls">
            <button onClick={() => handleCarousel(-1)} disabled={carouselIndex === 0}>
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => handleCarousel(1)}
              disabled={carouselIndex + 3 >= recommendedCourses.length}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="student-dashboard__recommended-grid">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : recommendedCourses.length === 0 ? (
            <EmptyState title="No recommendations yet" message="Explore Browse Courses to get started." />
          ) : (
            visibleRecommended.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                imageFetcher={categoryService.getImage}
                onViewDetails={setSelectedCourse}
              />
            ))
          )}
        </div>
      </div>

      {selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          isEnrolled={false}
          onClose={() => setSelectedCourse(null)}
          onEnroll={() => setSelectedCourse(null)}
          categoryService={categoryService}
          contentService={contentService}
          examService={examService}
          liveClassService={liveClassService}
        />
      )}
    </div>
  );
};

export default Dashboard;
