// student/components/ProgressCard.jsx
import { ImageOff, Loader2 } from "lucide-react";
import useRemoteImage from "../hooks/useRemoteImage";
import "./ProgressCard.css";

/**
 * ProgressCard
 * "Continue Learning" style card — shows a thumbnail, course title,
 * a level tag, current module/next lesson, and a progress bar.
 *
 * `thumbnail` is just the uploaded filename, not a loadable URL — so it's
 * resolved through `imageFetcher` (Dashboard passes `categoryService.getImage`,
 * which returns the file as a blob) instead of being used directly as an
 * <img src>.
 */
const ProgressCard = ({
  thumbnail,
  level,
  title,
  currentModule,
  nextLesson,
  progressPercent = 0,
  onClick,
  imageFetcher,
}) => {
  const { url: thumbUrl, loading: thumbLoading } = useRemoteImage(thumbnail, imageFetcher);

  return (
    <div className="progress-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="progress-card__thumb">
        {thumbLoading ? (
          <div style={placeholderStyle}>
            <Loader2 size={20} className="spin" />
          </div>
        ) : thumbUrl ? (
          <img src={thumbUrl} alt={title} loading="lazy" />
        ) : (
          <div style={placeholderStyle}>
            <ImageOff size={20} />
          </div>
        )}
      </div>
      <div className="progress-card__body">
        {level && <span className="progress-card__level">{level}</span>}
        <h4 className="progress-card__title">{title}</h4>
        {currentModule && (
          <p className="progress-card__module">{currentModule}</p>
        )}

        <div className="progress-card__bar-row">
          <span>Progress</span>
          <span className="progress-card__percent">{progressPercent}%</span>
        </div>
        <div className="progress-card__bar-track">
          <div
            className="progress-card__bar-fill"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>

        {nextLesson && (
          <p className="progress-card__next">Next: {nextLesson}</p>
        )}
      </div>
    </div>
  );
};

// Inline so this drop-in fix doesn't depend on editing ProgressCard.css —
// move these into the stylesheet as `.progress-card__thumb-placeholder` if
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

export default ProgressCard;
