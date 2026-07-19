// student/pages/StudentExams.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BookOpen, CalendarClock, CheckCircle2, TrendingUp } from "lucide-react";

import SearchBar from "../components/SearchBar";
import StatsCard from "../components/StatsCard";
import FilterSidebar from "../components/FilterSidebar";
import { EmptyState, ErrorState, SkeletonCard } from "../components/StateViews";
import ExamCard from "../components/ExamCard";
import UpcomingExamBanner from "../components/UpcomingExamBanner";
import Pagination from "../components/Pagination";

import { examService } from "../../services/api";
import "./StudentExams.css";

const PAGE_SIZE = 8;

const DEFAULT_FILTERS = {
  categoryId: "",
  status: "all",
  sortOrder: "asc",
};

/**
 * CONFIRMED from actual API response:
 *   - id field: `examId`
 *   - file field: `imageName` ('' = genuinely no file)
 *   - SCHEDULE: `startTime` (array) is the real exam date for
 *     examType "EXAM". `deadline` (array) is used instead for
 *     examType "ASSIGNMENT" (startTime/endTime are null on those).
 *     `endTime` marks when the exam window closes.
 *   - `addedDate` is just a creation timestamp — never used for status.
 */
const getExamId = (exam) => exam.examId ?? exam.id ?? null;

const parseExamDate = (value) => {
  if (value === null || value === undefined || value === "") return null;

  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    const d = new Date(year, month - 1, day, hour, minute, second);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === "string" && /[-T:/]/.test(value)) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

// startTime first (real EXAM schedule), deadline as fallback (ASSIGNMENT schedule)
const getExamRawStart = (exam) =>
  exam.startTime ?? exam.deadline ?? exam.examDate ?? exam.scheduledDate ?? exam.date ?? null;

const getExamRawEnd = (exam) => exam.endTime ?? null;

const getExamFileName = (exam) => exam.imageName || exam.fileName || exam.attachmentName || null;

const formatDateLabel = (date) =>
  date
    ? date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
    : null;

const formatTimeLabel = (date) =>
  date ? date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : null;

/**
 * Only genuinely dateless exams (neither startTime nor deadline
 * present) get "flexible" — everything in your current data has one
 * or the other, so this should now be rare/never hit.
 */
const getExamStatus = (exam, now) => {
  const rawStart = getExamRawStart(exam);

  if (rawStart === null || rawStart === undefined) {
    return "flexible";
  }

  const startDate = parseExamDate(rawStart);
  if (!startDate) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        `Exam "${exam.title || getExamId(exam)}" has a date value that couldn't be parsed:`,
        rawStart
      );
    }
    return "upcoming";
  }

  const endDate = parseExamDate(getExamRawEnd(exam));
  const referenceEnd = endDate || startDate;

  if (startDate > now) return "upcoming";
  if (referenceEnd >= now) return "ongoing";
  return exam.resultsPublished ? "published" : "completed";
};

const StudentExams = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [openingExamId, setOpeningExamId] = useState(null);

  const loadExams = useCallback(async (categoryId) => {
    setLoading(true);
    setError(null);
    try {
      const res = categoryId
        ? await examService.getByCategory(categoryId)
        : await examService.getAll();
      setExams(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExams(filters.categoryId || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.categoryId]);

  const categories = useMemo(() => {
    const map = new Map();
    exams.forEach((exam) => {
      const catId = exam.category?.categoryId ?? exam.categoryId;
      const catName = exam.category?.categoryTitle ?? exam.categoryName;
      if (catId != null && !map.has(catId)) {
        map.set(catId, { id: catId, name: catName || "Uncategorized" });
      }
    });
    return Array.from(map.values());
  }, [exams]);

  const now = useMemo(() => new Date(), [exams]);

  const enrichedExams = useMemo(
    () =>
      exams.map((exam, index) => {
        const examId = getExamId(exam);
        const startDateObj = parseExamDate(getExamRawStart(exam));
        const endDateObj = parseExamDate(getExamRawEnd(exam));
        const resolvedFileName = getExamFileName(exam);

        return {
          ...exam,
          _id: examId,
          _key: examId != null ? `exam-${examId}` : `exam-idx-${index}`,
          categoryName: exam.category?.categoryTitle ?? exam.categoryName,
          examDateObj: startDateObj,
          examDateLabel: formatDateLabel(startDateObj),
          startTime: formatTimeLabel(startDateObj),
          endTimeLabel: endDateObj ? formatTimeLabel(endDateObj) : null,
          status: getExamStatus(exam, now),
          resolvedFileName,
        };
      }),
    [exams, now]
  );

  const stats = useMemo(() => {
    const total = enrichedExams.length;
    const upcoming = enrichedExams.filter((e) => e.status === "upcoming").length;
    const completed = enrichedExams.filter(
      (e) => e.status === "completed" || e.status === "published"
    ).length;
    const scored = enrichedExams.filter(
      (e) => e.status === "published" && typeof e.score === "number"
    );
    const averageScore = scored.length
      ? Math.round(scored.reduce((sum, e) => sum + e.score, 0) / scored.length)
      : 0;
    return { total, upcoming, completed, averageScore };
  }, [enrichedExams]);

  const nextExam = useMemo(() => {
    const upcoming = enrichedExams
      .filter((e) => e.status === "upcoming" && e.examDateObj)
      .sort((a, b) => a.examDateObj - b.examDateObj);
    return upcoming[0] || null;
  }, [enrichedExams]);

  const filteredExams = useMemo(() => {
    let result = enrichedExams;

    if (filters.status !== "all") {
      result = result.filter((e) => e.status === filters.status);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.categoryName?.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      const aTime = a.examDateObj ? a.examDateObj.getTime() : 0;
      const bTime = b.examDateObj ? b.examDateObj.getTime() : 0;
      return filters.sortOrder === "asc" ? aTime - bTime : bTime - aTime;
    });

    return result;
  }, [enrichedExams, filters.status, filters.sortOrder, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / PAGE_SIZE));

  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredExams.slice(start, start + PAGE_SIZE);
  }, [filteredExams, currentPage]);

  const handleFilterChange = useCallback((partial) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setCurrentPage(1);
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleStart = useCallback(
    async (exam) => {
      const examId = getExamId(exam);
      const fileName = getExamFileName(exam);

      if (!fileName) {
        navigate(`/student/exam/${examId}`);
        return;
      }

      setOpeningExamId(examId);
      try {
        const res = await examService.getFile(fileName);
        const blob = res.data;
        const url = window.URL.createObjectURL(blob);
        const newTab = window.open(url, "_blank", "noopener,noreferrer");
        if (!newTab) {
          toast.error("Please allow pop-ups for this site to view exam files.");
        }
        setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
      } catch (err) {
        toast.error("Could not open the exam file. Please try again.");
      } finally {
        setOpeningExamId(null);
      }
    },
    [navigate]
  );

  const handleDownload = useCallback(async (fileName) => {
    if (!fileName) {
      toast.info("No file is attached to this exam.");
      return;
    }
    try {
      const res = await examService.getFile(fileName);
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Could not download the file. Please try again.");
    }
  }, []);

  return (
    <div className="student-exams-page">
      <div className="student-exams-page__header">
        <div>
          <h1>Academic Exams</h1>
          <p>Stay on track with your assessments and track your performance.</p>
        </div>
        <div className="student-exams-page__search">
          <SearchBar placeholder="Search exams, subjects..." onSearch={handleSearch} />
        </div>
      </div>

      <div className="student-exams-page__top">
        <UpcomingExamBanner exam={nextExam} />
        <div className="student-exams-page__stats-grid">
          <StatsCard icon={BookOpen} label="Total Exams" value={stats.total} isLoading={loading} />
          <StatsCard
            icon={CalendarClock}
            label="Upcoming Exams"
            value={stats.upcoming}
            isLoading={loading}
          />
          <StatsCard
            icon={CheckCircle2}
            label="Completed Exams"
            value={stats.completed}
            isLoading={loading}
          />
          <StatsCard
            icon={TrendingUp}
            iconVariant="success"
            label="Average Score"
            value={`${stats.averageScore}%`}
            isLoading={loading}
          />
        </div>
      </div>

      <div className="student-exams-page__body">
        <FilterSidebar
          mode="exam"
          categories={categories}
          filters={filters}
          onChange={handleFilterChange}
          onApply={() => setCurrentPage(1)}
          onReset={handleFilterReset}
        />

        <div className="student-exams-page__content">
          {loading && (
            <div className="student-exams-page__grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={`skeleton-${i}`} />
              ))}
            </div>
          )}

          {!loading && error && (
            <ErrorState
              title="Couldn't load your exams"
              message="Something went wrong while fetching your exams. Please try again."
              onRetry={() => loadExams(filters.categoryId || null)}
            />
          )}

          {!loading && !error && filteredExams.length === 0 && (
            <EmptyState title="No exams found" message="Try adjusting your filters or search term." />
          )}

          {!loading && !error && filteredExams.length > 0 && (
            <>
              <div className="student-exams-page__grid">
                {paginatedExams.map((exam) => (
                  <ExamCard
                    key={exam._key}
                    exam={exam}
                    isOpening={openingExamId === exam._id}
                    onStart={handleStart}
                    onDownload={handleDownload}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredExams.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentExams;