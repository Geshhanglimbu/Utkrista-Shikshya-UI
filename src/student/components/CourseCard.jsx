// student/components/CourseCard.jsx
import { Star, Users, BookOpen, Clock, ImageOff, Loader2 } from "lucide-react";
import { formatPrice, getCourseBadge } from "../utils/helpers";
import useRemoteImage from "../hooks/useRemoteImage";
import "./CourseCard.css";

/**
 * CourseCard
 * Displays a single course/category with image, title, category, price,
 * FREE/PAID badge, rating, mentor, lesson count, duration, and students
 * enrolled. Clicking "View Details" opens the CourseDetailsModal
 * (handled by the parent page).
 *
 * `course.image` is just the uploaded filename (e.g. "abc123.jpg"), not a
 * loadable URL — so it's resolved through `imageFetcher` (Dashboard passes
 * `categoryService.getImage`, which returns the file as a blob) instead of
 * being used directly as an <img src>.
 */
const CourseCard = ({ course, onViewDetails, imageFetcher }) => {
  const {
    image,
    title,
    categoryName,
    categoryType,
    price,
    rating,
    mentorName,
    mentorAvatar,
    lessonCount,
    duration,
    studentsEnrolled,
    description,
    tag, // e.g. "BESTSELLER", "NEW", "TRENDING"
  } = course;

  const { url: imageUrl, loading: imageLoading } = useRemoteImage(image, imageFetcher);

  const badge = getCourseBadge(categoryType, price);

  return (
    <div className="course-card">
      <div className="course-card__image-wrap">
        {imageLoading ? (
          <div style={placeholderStyle}>
            <Loader2 size={20} className="spin" />
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt={title} loading="lazy" />
        ) : (
          <div style={placeholderStyle}>
            <ImageOff size={20} />
          </div>
        )}
        {tag && <span className="course-card__tag">{tag}</span>}
        {rating != null && (
          <span className="course-card__rating">
            <Star size={12} fill="currentColor" /> {rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="course-card__body">
        <div className="course-card__meta-row">
          <span className="course-card__category">{categoryName}</span>
          <span className={`course-card__badge ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        <h4 className="course-card__title">{title}</h4>
        <p className="course-card__description">{description}</p>

        <div className="course-card__stats">
          {lessonCount != null && (
            <span>
              <BookOpen size={13} /> {lessonCount} lessons
            </span>
          )}
          {duration && (
            <span>
              <Clock size={13} /> {duration}
            </span>
          )}
          {studentsEnrolled != null && (
            <span>
              <Users size={13} /> {studentsEnrolled.toLocaleString()}
            </span>
          )}
        </div>

        <div className="course-card__footer">
          <div className="course-card__mentor">
            {mentorAvatar && <img src={mentorAvatar} alt={mentorName} />}
            <span>{mentorName}</span>
          </div>
          <span className="course-card__price">{formatPrice(price)}</span>
        </div>

        <button
          className="course-card__cta"
          onClick={() => onViewDetails(course)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

// Inline so this drop-in fix doesn't depend on editing CourseCard.css —
// move these into the stylesheet as `.course-card__image-placeholder` if
// you'd rather keep styles centralized.
const placeholderStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#eef0ff",
  color: "#6b7280",
};

export default CourseCard;
