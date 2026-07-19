// student/components/ExamCard.jsx
import { memo, useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Award,
  HelpCircle,
  User,
  Download,
  Eye,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  File as FileIcon,
  Loader2,
} from "lucide-react";
import { examService } from "../../services/api";
import "./ExamCard.css";

const STATUS_META = {
  upcoming: { label: "Upcoming", className: "exam-card__status--upcoming" },
  completed: { label: "Completed", className: "exam-card__status--completed" },
  published: { label: "Results Published", className: "exam-card__status--published" },
  flexible: { label: "Self-Paced", className: "exam-card__status--flexible" },
};

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp"];

const FILE_TYPE_META = {
  pdf: { label: "PDF", icon: FileText, color: "#e11d48" },
  doc: { label: "DOC", icon: FileText, color: "#2563eb" },
  docx: { label: "DOCX", icon: FileText, color: "#2563eb" },
  ppt: { label: "PPT", icon: Presentation, color: "#ea580c" },
  pptx: { label: "PPTX", icon: Presentation, color: "#ea580c" },
  xls: { label: "XLS", icon: FileSpreadsheet, color: "#15803d" },
  xlsx: { label: "XLSX", icon: FileSpreadsheet, color: "#15803d" },
  png: { label: "Image", icon: ImageIcon, color: "#7c3aed" },
  jpg: { label: "Image", icon: ImageIcon, color: "#7c3aed" },
  jpeg: { label: "Image", icon: ImageIcon, color: "#7c3aed" },
  gif: { label: "Image", icon: ImageIcon, color: "#7c3aed" },
  webp: { label: "Image", icon: ImageIcon, color: "#7c3aed" },
};
const NO_FILE_META = { label: "Online Exam", icon: FileIcon, color: "#6b7280" };

const getExtension = (fileName = "") => fileName.split(".").pop()?.toLowerCase();
const getFileMeta = (fileName) =>
  (fileName && FILE_TYPE_META[getExtension(fileName)]) || NO_FILE_META;

const getExamFileName = (exam) =>
  exam.resolvedFileName ||
  exam.fileName ||
  exam.examFileName ||
  exam.attachmentName ||
  exam.documentName ||
  exam.imageName ||
  null;

const ExamCard = ({ exam, onStart, onDownload, isOpening }) => {
  const {
    title,
    description,
    categoryName,
    examDateLabel,
    startTime,
    durationMinutes,
    totalMarks,
    questionCount,
    createdBy,
    status,
  } = exam;

  const fileName = getExamFileName(exam);
  const fileMeta = getFileMeta(fileName);
  const FileTypeIcon = fileMeta.icon;
  const isImageAttachment = fileName && IMAGE_EXTENSIONS.includes(getExtension(fileName));

  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    if (isImageAttachment) {
      examService
        .getFile(fileName)
        .then((res) => {
          if (cancelled) return;
          objectUrl = window.URL.createObjectURL(res.data);
          setThumbnailUrl(objectUrl);
        })
        .catch(() => {
          if (!cancelled) setThumbnailUrl(null);
        });
    }

    return () => {
      cancelled = true;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [fileName, isImageAttachment]);

  const statusMeta = STATUS_META[status] || null;

  return (
    <article className="exam-card">
      <div className="exam-card__image">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title || "Exam"} loading="lazy" />
        ) : (
          <div className="exam-card__file-tile" style={{ "--file-color": fileMeta.color }}>
            <div className="exam-card__file-icon-wrap">
              <FileTypeIcon size={34} strokeWidth={1.6} />
              <span className="exam-card__file-fold" />
            </div>
            <span className="exam-card__file-label">{fileMeta.label}</span>
          </div>
        )}
        {categoryName && <span className="exam-card__category-badge">{categoryName}</span>}
        {statusMeta && (
          <span className={`exam-card__status ${statusMeta.className}`}>{statusMeta.label}</span>
        )}
      </div>

      <div className="exam-card__body">
        <h3 className="exam-card__title">{title || "Untitled Exam"}</h3>
        {description && <p className="exam-card__description">{description}</p>}

        <div className="exam-card__meta">
          {examDateLabel && (
            <div className="exam-card__meta-item">
              <Calendar size={15} />
              <span>{examDateLabel}</span>
            </div>
          )}
          {startTime && (
            <div className="exam-card__meta-item">
              <Clock size={15} />
              <span>{startTime}</span>
            </div>
          )}
          {durationMinutes != null && (
            <div className="exam-card__meta-item">
              <Clock size={15} />
              <span>{durationMinutes} Minutes</span>
            </div>
          )}
          {totalMarks != null && (
            <div className="exam-card__meta-item">
              <Award size={15} />
              <span>{totalMarks} Points</span>
            </div>
          )}
          {questionCount != null && (
            <div className="exam-card__meta-item">
              <HelpCircle size={15} />
              <span>{questionCount} Questions</span>
            </div>
          )}
          {createdBy && (
            <div className="exam-card__meta-item">
              <User size={15} />
              <span>{createdBy}</span>
            </div>
          )}
        </div>
      </div>

      <div className="exam-card__actions">
        <button className="exam-card__start-btn" onClick={() => onStart(exam)} disabled={isOpening}>
          {isOpening ? (
            <Loader2 size={16} className="exam-card__spin" />
          ) : fileName ? (
            <Eye size={16} />
          ) : (
            <Eye size={16} />
          )}
          {isOpening ? "Opening…" : fileName ? "View Exam" : "Start Exam"}
        </button>
        {fileName && (
          <button className="exam-card__download-btn" onClick={() => onDownload(fileName)}>
            <Download size={16} />
            Download
          </button>
        )}
      </div>
    </article>
  );
};

export default memo(ExamCard);