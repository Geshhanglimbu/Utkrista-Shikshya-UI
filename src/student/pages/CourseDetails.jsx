// student/pages/CourseDetails.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Star,
  BookOpen,
  Radio,
  FileText,
  ImageOff,
  Tag,
  Layers,
  Folder,
  Calendar,
  ChevronDown,
  PlayCircle,
  File,
  Eye,
  Download,
  User,
  Clock,
  ExternalLink,
  CheckSquare,
  Infinity as InfinityIcon,
  Check,
} from "lucide-react";

import { EmptyState, ErrorState } from "../components/StateViews";
import {
  formatPrice,
  formatDate,
  formatTime,
  getCourseBadge,
  parseJavaDateTime,
  normalizeId,
} from "../utils/helpers";
import useAuthImage from "../utils/useAuthImage";

import {
  categoryService,
  contentService,
  examService,
  liveClassService,
} from "../../services/api"; // adjust path to match your actual services/api.js location

import "./CourseDetails.css";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "curriculum", label: "Curriculum" },
  { key: "live", label: "Live Classes" },
  { key: "exams", label: "Exams" },
];

/* ============================================================
 * Hero
 * ============================================================ */
const CourseHero = ({ category, stats, imageFetcher, onEnroll }) => {
  const { categoryTitle, categoryDescription, categoryType, price, imageName, rating } =
    category ?? {};

  const { url: resolvedImage, isLoading: isImageLoading } = useAuthImage(imageName, imageFetcher);
  const badge = getCourseBadge(categoryType, price);
  const displayRating = Number(rating) > 0 ? Number(rating).toFixed(1) : "New";

  return (
    <motion.section
      className="course-hero"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="course-hero__image-wrap">
        {resolvedImage ? (
          <img src={resolvedImage} alt={categoryTitle} className="course-hero__image" />
        ) : (
          <div className={`course-hero__image-fallback ${isImageLoading ? "sp-shimmer" : ""}`}>
            {!isImageLoading && <ImageOff size={28} />}
          </div>
        )}
        <div className="course-hero__overlay" />
      </div>

      <div className="course-hero__content">
        <span className={`course-card__badge ${badge.className}`}>{badge.label}</span>

        <h1 className="course-hero__title">{categoryTitle || "Untitled Course"}</h1>

        {categoryDescription && (
          <p className="course-hero__description">{categoryDescription}</p>
        )}

        <div className="course-hero__actions">
          <button className="course-hero__enroll" onClick={onEnroll}>
            Enroll Now — {formatPrice(price)}
          </button>
        </div>

        <div className="course-hero__stats">
          <span className="course-hero__stat">
            <Star size={16} className="course-hero__stat-icon course-hero__stat-icon--star" fill="currentColor" />
            {displayRating}
          </span>
          <span className="course-hero__divider" />
          <span className="course-hero__stat">
            <BookOpen size={16} className="course-hero__stat-icon" />
            {stats.lessons} Lessons
          </span>
          <span className="course-hero__divider" />
          <span className="course-hero__stat">
            <Radio size={16} className="course-hero__stat-icon" />
            {stats.liveClasses} Live Classes
          </span>
          <span className="course-hero__divider" />
          <span className="course-hero__stat">
            <FileText size={16} className="course-hero__stat-icon" />
            {stats.exams} Exams
          </span>
        </div>
      </div>
    </motion.section>
  );
};

/* ============================================================
 * Overview tab
 * ============================================================ */
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" },
  }),
};

const CourseOverview = ({ category }) => {
  const { categoryDescription, price, categoryType, mainCategory, validUntil, validityDate, expiryDate } =
    category ?? {};
  const validDate = validUntil ?? validityDate ?? expiryDate;

  const infoCards = [
    { icon: <Tag size={18} />, label: "Price", value: formatPrice(price) },
    { icon: <Layers size={18} />, label: "Course Type", value: categoryType || "N/A" },
    { icon: <Folder size={18} />, label: "Main Category", value: mainCategory || "N/A" },
    {
      icon: <Calendar size={18} />,
      label: "Valid Until",
      value: validDate ? formatDate(validDate) : "Lifetime",
    },
  ];

  return (
    <div className="course-overview">
      <h2 className="course-overview__heading">About this Course</h2>
      <p className="course-overview__text">
        {categoryDescription || "No description has been added for this course yet."}
      </p>

      <div className="course-overview__grid">
        {infoCards.map((card, i) => (
          <motion.div
            key={card.label}
            className="info-card"
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="info-card__icon">{card.icon}</div>
            <div>
              <p className="info-card__label">{card.label}</p>
              <p className="info-card__value">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
 * Curriculum tab
 * ============================================================ */
const getLessonMeta = (lesson) => {
  const isPdf = lesson.imageName?.toLowerCase?.().endsWith(".pdf");
  const hasVideo = Boolean(lesson.videoLink);

  if (isPdf) return { icon: <FileText size={20} />, label: "PDF", tone: "pdf" };
  if (hasVideo) return { icon: <PlayCircle size={20} />, label: "Video", tone: "video" };
  return { icon: <File size={20} />, label: "Document", tone: "doc" };
};

const LessonRow = ({ lesson, index, isOpen, onToggle }) => {
  const meta = getLessonMeta(lesson);
  const uploadDate = lesson.uploadDate || lesson.addedDate;
  const fileUrl = lesson.videoLink || lesson.fileUrl || lesson.imageName;

  return (
    <motion.div
      className="lesson-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <button className="lesson-card__header" onClick={onToggle}>
        <span className={`lesson-card__icon lesson-card__icon--${meta.tone}`}>{meta.icon}</span>

        <div className="lesson-card__info">
          <p className="lesson-card__title">
            {lesson.title || lesson.contentTitle || "Untitled Lesson"}
          </p>
          <div className="lesson-card__meta">
            {lesson.mentor && (
              <span>
                <User size={13} /> {lesson.mentor}
              </span>
            )}
            {uploadDate && (
              <span>
                <Calendar size={13} /> {formatDate(uploadDate)}
              </span>
            )}
            <span className="lesson-card__type-tag">{meta.label}</span>
          </div>
        </div>

        <ChevronDown
          size={18}
          className={`lesson-card__chevron ${isOpen ? "lesson-card__chevron--open" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="lesson-card__body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="lesson-card__actions">
              <a className="lesson-card__btn lesson-card__btn--view" href={fileUrl || "#"} target="_blank" rel="noreferrer">
                <Eye size={15} /> View
              </a>
              <a className="lesson-card__btn lesson-card__btn--download" href={fileUrl || "#"} download>
                <Download size={15} /> Download
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CurriculumTab = ({ contents = [] }) => {
  const [openId, setOpenId] = useState(null);

  if (!contents.length) {
    return (
      <EmptyState
        title="No lessons available."
        message="This course doesn't have any curriculum content yet — check back soon."
      />
    );
  }

  return (
    <div className="curriculum-tab">
      {contents.map((lesson, index) => {
        const id = normalizeId(lesson) ?? index;
        return (
          <LessonRow
            key={id}
            lesson={lesson}
            index={index}
            isOpen={openId === id}
            onToggle={() => setOpenId((prev) => (prev === id ? null : id))}
          />
        );
      })}
    </div>
  );
};

/* ============================================================
 * Live classes tab
 * ============================================================ */
const isLive = (value) => {
  const date = parseJavaDateTime(value);
  if (!date) return false;
  const diff = date.getTime() - Date.now();
  return diff < 30 * 60 * 1000 && diff > -2 * 60 * 60 * 1000; // 30 min before → 2 hrs after
};

const LiveClassesTab = ({ liveClasses = [] }) => {
  if (!liveClasses.length) {
    return (
      <EmptyState
        title="No live classes scheduled."
        message="Live sessions for this course haven't been scheduled yet."
      />
    );
  }

  return (
    <div className="live-tab">
      {liveClasses.map((live, index) => {
        const startTime = live.startingTime || live.startTime || live.scheduledAt;
        const streamLink = live.streamLink || live.joinLink;
        const active = isLive(startTime);

        return (
          <motion.div
            key={live.liveClassId ?? live.id ?? index}
            className="live-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <div className="live-card__icon">
              <Radio size={20} />
            </div>

            <div className="live-card__info">
              <p className="live-card__title">{live.title || "Untitled Live Class"}</p>
              <p className="live-card__time">
                <Clock size={13} />
                {startTime ? `${formatDate(startTime)} · ${formatTime(startTime)}` : "Time TBA"}
              </p>
            </div>

            {active && <span className="live-card__badge">LIVE NOW</span>}

            <a
              className="live-card__join"
              href={streamLink || "#"}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!streamLink}
            >
              Join Live <ExternalLink size={14} />
            </a>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ============================================================
 * Exams tab
 * ============================================================ */
const ExamsTab = ({ exams = [], categoryId, navigate }) => {
  if (!exams.length) {
    return (
      <EmptyState title="No exams available." message="There are no exams for this course yet." />
    );
  }

  return (
    <div className="exams-tab">
      {exams.map((exam, index) => {
        const examId = normalizeId(exam);
        return (
          <motion.div
            key={examId ?? index}
            className="exam-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <div className="exam-card__icon">
              <FileText size={20} />
            </div>

            <div className="exam-card__info">
              <p className="exam-card__title">{exam.title || exam.examTitle || "Untitled Exam"}</p>
              <div className="exam-card__meta">
                <span>
                  <CheckSquare size={14} /> {exam.totalMarks ?? exam.marks ?? "N/A"} Marks
                </span>
                <span>
                  <Clock size={14} /> {exam.duration ? `${exam.duration} min` : "N/A"}
                </span>
                {exam.totalQuestions != null && <span>{exam.totalQuestions} Questions</span>}
              </div>
            </div>

            <button
              className="exam-card__start"
              onClick={() => navigate(`/student/exam/${examId}?categoryId=${categoryId}`)}
            >
              Start Exam <ArrowRight size={15} />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

/* ============================================================
 * Sidebar
 * ============================================================ */
const INCLUDES = [
  { icon: <FileText size={16} />, label: "PDF Notes" },
  { icon: <PlayCircle size={16} />, label: "Video Lessons" },
  { icon: <Radio size={16} />, label: "Live Classes" },
  { icon: <CheckSquare size={16} />, label: "Exams" },
  { icon: <InfinityIcon size={16} />, label: "Lifetime Access" },
];

const CourseSidebar = ({ category, stats, onBack }) => {
  const { price, categoryType, mainCategory, validUntil, validityDate, expiryDate } = category ?? {};
  const validDate = validUntil ?? validityDate ?? expiryDate;

  const infoRows = [
    { label: "Price", value: formatPrice(price) },
    { label: "Course Type", value: categoryType || "N/A" },
    { label: "Main Category", value: mainCategory || "N/A" },
    { label: "Validity", value: validDate ? formatDate(validDate) : "Lifetime" },
    { label: "Lessons", value: stats.lessons },
    { label: "Live Classes", value: stats.liveClasses },
    { label: "Exams", value: stats.exams },
  ];

  return (
    <motion.aside
      className="course-sidebar"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
    >
      <div className="course-sidebar__card">
        <h3 className="course-sidebar__heading">Course Information</h3>
        <ul className="course-sidebar__info-list">
          {infoRows.map((row) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </li>
          ))}
        </ul>

        <div className="course-sidebar__divider" />

        <h3 className="course-sidebar__heading">Course Includes</h3>
        <ul className="course-sidebar__includes">
          {INCLUDES.map((item) => (
            <li key={item.label}>
              <Check size={14} className="course-sidebar__check" />
              {item.icon}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>

        <button className="course-sidebar__enroll">Enroll Now</button>
      </div>

      <button className="course-sidebar__back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Browse Courses
      </button>
    </motion.aside>
  );
};

/* ============================================================
 * Page
 * ============================================================ */

/**
 * CourseDetails
 * Student-facing course detail page. Loads category, content, live classes
 * and exams for a given categoryId, then presents them across a hero,
 * tabbed content area, and a sticky sidebar.
 *
 * NOTE: field names on the fetched objects (e.g. content.mentor,
 * content.uploadDate, exam.totalMarks) are based on the shape used
 * elsewhere in the student dashboard. Adjust the destructuring above
 * if your actual API responses differ.
 */
const CourseDetails = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [contents, setContents] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [exams, setExams] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const loadCourseDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Promise.allSettled so a single failing endpoint (e.g. exams
      // returning 404 when none exist) never breaks the whole page.
      const [categoryRes, contentRes, liveRes, examRes] = await Promise.allSettled([
        categoryService.getById(categoryId),
        contentService.getByCategoryId(categoryId),
        liveClassService.getByCategoryId(categoryId),
        examService.getByCategory(categoryId),
      ]);

      // Category is the one required piece — if it fails, show the error state.
      if (categoryRes.status !== "fulfilled") {
        throw categoryRes.reason ?? new Error("Failed to load course.");
      }
      setCategory(categoryRes.value?.data ?? null);

      setContents(contentRes.status === "fulfilled" ? contentRes.value?.data ?? [] : []);
      setLiveClasses(liveRes.status === "fulfilled" ? liveRes.value?.data ?? [] : []);
      // Exams: treat 404 (or any failure) as "no exams" rather than a hard error.
      setExams(examRes.status === "fulfilled" ? examRes.value?.data ?? [] : []);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadCourseDetails();
  }, [loadCourseDetails]);

  const stats = useMemo(
    () => ({
      lessons: contents.length,
      liveClasses: liveClasses.length,
      exams: exams.length,
    }),
    [contents.length, liveClasses.length, exams.length]
  );

  const handleBack = () => navigate("/student/browse-courses");

  if (isLoading) {
    return (
      <div className="course-details">
        <div className="course-details__back-skeleton" />
        <div className="course-details__hero-skeleton" />
        <div className="course-details__body">
          <div className="course-details__main-skeleton">
            <div className="skel-tabs" />
            <div className="skel-line skel-line--wide" />
            <div className="skel-line" />
            <div className="skel-line skel-line--short" />
            <div className="skel-card" />
            <div className="skel-card" />
          </div>
          <div className="course-details__sidebar-skeleton" />
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="course-details course-details--error">
        <ErrorState
          message="We couldn't load this course. It may have been removed, or something went wrong on our end."
          onRetry={loadCourseDetails}
        />
        <button className="course-details__back-link" onClick={handleBack}>
          <ArrowLeft size={16} /> Back to courses
        </button>
      </div>
    );
  }

  return (
    <div className="course-details">
      <button className="course-details__back" onClick={handleBack}>
        <ArrowLeft size={16} /> Back to courses
      </button>

      <CourseHero
        category={category}
        stats={stats}
        imageFetcher={categoryService.getImage}
        onEnroll={() => {}}
      />

      <div className="course-details__body">
        <div className="course-details__main">
          <nav className="course-tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                className={`course-tabs__item ${activeTab === tab.key ? "course-tabs__item--active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div layoutId="course-tab-underline" className="course-tabs__underline" />
                )}
              </button>
            ))}
          </nav>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="course-tabs__panel"
            >
              {activeTab === "overview" && <CourseOverview category={category} />}
              {activeTab === "curriculum" && <CurriculumTab contents={contents} />}
              {activeTab === "live" && <LiveClassesTab liveClasses={liveClasses} />}
              {activeTab === "exams" && (
                <ExamsTab exams={exams} categoryId={categoryId} navigate={navigate} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <CourseSidebar category={category} stats={stats} onBack={handleBack} />
      </div>
    </div>
  );
};

export default CourseDetails;
