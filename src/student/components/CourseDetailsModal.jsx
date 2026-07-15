// student/components/CourseDetailsModal.jsx
import { useEffect, useState } from "react";
import { X, BookOpen, FileText, Radio, CheckCircle2 } from "lucide-react";
import { formatPrice, getCourseBadge, formatDate } from "../utils/helpers";
import "./CourseDetailsModal.css";

/**
 * CourseDetailsModal
 * Full course detail overlay. Fetches related content/exams/live-classes
 * for the selected category when opened.
 *
 * Props:
 *  - course: the course/category object from CourseCard
 *  - isEnrolled: boolean — disables Enroll button if true
 *  - onClose, onEnroll
 *  - contentService, examService, liveClassService: injected from
 *    services/api.js so this component never creates its own axios calls.
 */
const CourseDetailsModal = ({
  course,
  isEnrolled,
  onClose,
  onEnroll,
  contentService,
  examService,
  liveClassService,
}) => {
  const [lessons, setLessons] = useState([]);
  const [exams, setExams] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!course) return;
    let isMounted = true;

    const loadDetails = async () => {
      setIsLoading(true);
      try {
        const [contentRes, examRes, liveRes] = await Promise.allSettled([
          contentService?.getByCategoryId(course.categoryId ?? course.id),
          examService?.getByCategory(course.categoryId ?? course.id),
          liveClassService?.getAll(),
        ]);

        if (!isMounted) return;

        setLessons(
          contentRes.status === "fulfilled" ? contentRes.value?.data ?? [] : []
        );
        setExams(
          examRes.status === "fulfilled" ? examRes.value?.data ?? [] : []
        );
        setLiveClasses(
          liveRes.status === "fulfilled"
            ? (liveRes.value?.data ?? []).filter(
                (lc) => lc.categoryId === (course.categoryId ?? course.id)
              )
            : []
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [course, contentService, examService, liveClassService]);

  if (!course) return null;

  const badge = getCourseBadge(course.categoryType, course.price);

  return (
    <div className="course-modal__overlay" onClick={onClose}>
      <div className="course-modal" onClick={(e) => e.stopPropagation()}>
        <button className="course-modal__close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <img
          src={course.image}
          alt={course.title}
          className="course-modal__image"
        />

        <div className="course-modal__body">
          <div className="course-modal__meta-row">
            <span className="course-card__category">{course.categoryName}</span>
            <span className={`course-card__badge ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          <h2 className="course-modal__title">{course.title}</h2>
          <p className="course-modal__description">{course.description}</p>

          <div className="course-modal__facts">
            <div>
              <span className="course-modal__fact-label">Price</span>
              <span className="course-modal__fact-value">
                {formatPrice(course.price)}
              </span>
            </div>
            <div>
              <span className="course-modal__fact-label">Teacher</span>
              <span className="course-modal__fact-value">{course.mentorName}</span>
            </div>
          </div>

          <div className="course-modal__section">
            <h4>
              <BookOpen size={16} /> Lessons ({isLoading ? "…" : lessons.length})
            </h4>
            {!isLoading && lessons.length === 0 && (
              <p className="course-modal__empty">No lessons published yet.</p>
            )}
            <ul className="course-modal__list">
              {lessons.slice(0, 5).map((lesson) => (
                <li key={lesson.id ?? lesson.contentId}>
                  <CheckCircle2 size={14} /> {lesson.title ?? lesson.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="course-modal__section">
            <h4>
              <FileText size={16} /> Exams available ({isLoading ? "…" : exams.length})
            </h4>
            {!isLoading && exams.length === 0 && (
              <p className="course-modal__empty">No exams scheduled yet.</p>
            )}
            <ul className="course-modal__list">
              {exams.slice(0, 4).map((exam) => (
                <li key={exam.id ?? exam.examId}>
                  <FileText size={14} /> {exam.title} — {formatDate(exam.examDate)}
                </li>
              ))}
            </ul>
          </div>

          <div className="course-modal__section">
            <h4>
              <Radio size={16} /> Upcoming live classes ({isLoading ? "…" : liveClasses.length})
            </h4>
            {!isLoading && liveClasses.length === 0 && (
              <p className="course-modal__empty">No live classes scheduled.</p>
            )}
            <ul className="course-modal__list">
              {liveClasses.slice(0, 4).map((lc) => (
                <li key={lc.id ?? lc.liveClassId}>
                  <Radio size={14} /> {lc.title} — {formatDate(lc.date)}
                </li>
              ))}
            </ul>
          </div>

          <button
            className="course-modal__enroll"
            disabled={isEnrolled}
            onClick={() => onEnroll(course)}
          >
            {isEnrolled ? "Already Enrolled" : "Enroll Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsModal;
