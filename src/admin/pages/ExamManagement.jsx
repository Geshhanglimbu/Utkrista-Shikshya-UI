import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  RotateCcw,
  Pencil,
  Trash2,
  Upload,
  ImageOff,
  ImagePlus,
  Loader2,
  Calendar,
  Clock3,
  ClipboardList,
  ArrowLeft,
  CalendarClock,
  LayoutGrid,
  X,
  FileText,
  FileSpreadsheet,
  FileArchive,
  File as FileIcon,
  ExternalLink,
  Download,
  Maximize2,
} from "lucide-react";
import { examService, categoryService } from "../../services/api";
import "./ExamManagement.css";

// TODO: replace with the actual logged-in admin's id from your auth context.
const CURRENT_USER_ID = 13;

// Confirmed from the backend: exam type must be one of these three, exactly
// (case-sensitive). A mismatch here is what caused the 400 error before.
const EXAM_TYPE_OPTIONS = ["ASSIGNMENT", "EXAM", "TEST"];

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png"];
const PDF_EXTENSIONS = ["pdf"];
const UPLOADABLE_EXTENSIONS = [...IMAGE_EXTENSIONS, ...PDF_EXTENSIONS];
const DOC_EXTENSIONS = ["doc", "docx", "txt", "rtf"];
const SHEET_EXTENSIONS = ["xls", "xlsx", "csv"];
const ARCHIVE_EXTENSIONS = ["zip", "rar", "7z"];

function getFileExtension(fileName) {
  if (!fileName) return "";
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function isImageFile(fileName) {
  return IMAGE_EXTENSIONS.includes(getFileExtension(fileName));
}

function isUploadableFile(fileName) {
  return UPLOADABLE_EXTENSIONS.includes(getFileExtension(fileName));
}

// Classifies any uploaded file so the UI can pick the right icon/label,
// regardless of whether it's the cover image or a document attachment.
function getFileKind(fileName) {
  const ext = getFileExtension(fileName);
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (PDF_EXTENSIONS.includes(ext)) return "pdf";
  if (SHEET_EXTENSIONS.includes(ext)) return "sheet";
  if (ARCHIVE_EXTENSIONS.includes(ext)) return "archive";
  if (DOC_EXTENSIONS.includes(ext)) return "doc";
  return "other";
}

function FileKindIcon({ fileName, size = 22 }) {
  const kind = getFileKind(fileName);
  if (kind === "pdf") return <FileText size={size} />;
  if (kind === "sheet") return <FileSpreadsheet size={size} />;
  if (kind === "archive") return <FileArchive size={size} />;
  if (kind === "doc") return <FileText size={size} />;
  return <FileIcon size={size} />;
}

// Backend sends Java LocalDateTime as [yyyy, MM, dd, HH, mm, ss(, nano)]
// (month is 1-indexed, seconds/nanos are optional depending on the field).
function normalizeDate(value) {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    return new Date(year, (month || 1) - 1, day || 1, hour, minute, second);
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateTime(value) {
  const date = normalizeDate(value);
  if (!date) return "—";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(value) {
  const date = normalizeDate(value);
  if (!date) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Converts a backend LocalDateTime array/string into the value a
// <input type="datetime-local"> expects: "YYYY-MM-DDTHH:mm"
function toDatetimeLocalValue(value) {
  const date = normalizeDate(value);
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

// Converts a <input type="datetime-local"> value ("2024-10-30T09:00") into
// the "2024-10-30T09:00:00.000" string format the backend expects.
// Returns null for an empty value (used for the optional `deadline` field).
function toBackendDateTimeString(datetimeLocalValue) {
  if (!datetimeLocalValue) return null;
  return `${datetimeLocalValue}:00.000`;
}

// Returns the exam's own category id, whichever shape the backend sent it in.
function getExamCategoryId(exam) {
  const id = exam?.category?.categoryId ?? exam?.categoryId ?? null;
  return id == null ? null : String(id);
}

const EMPTY_FORM = {
  title: "",
  categoryId: "",
  examType: "EXAM",
  startTime: "",
  endTime: "",
  deadline: "",
};

export default function ExamManagement() {
  // Core data
  const [exams, setExams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter / search
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // View: "list" shows the card grid, "detail" shows the single-exam page
  const [view, setView] = useState("list");
  const [selectedExamId, setSelectedExamId] = useState(null);

  // Create / Edit modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [activeExamId, setActiveExamId] = useState(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Uploaded file (cover image / document) — blob URLs + progress
  const [uploadingId, setUploadingId] = useState(null);
  const [fileUrls, setFileUrls] = useState({}); // { [examId]: objectUrl }
  const [uploadTargetExam, setUploadTargetExam] = useState(null);
  const sharedFileInputRef = useRef(null);
  const objectUrlsRef = useRef([]);

  // Lightbox for full-size image preview
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // ---------- Fetch categories (for dropdowns + name lookup) ----------
  const loadCategories = useCallback(async () => {
    setCategoriesError(null);
    try {
      const res = await categoryService.getAll();
      const list = Array.isArray(res?.data) ? res.data : res?.data?.content || [];
      setCategories(list);
      if (list.length === 0) {
        console.warn("categoryService.getAll() returned an empty list.");
      }
    } catch (err) {
      console.error("Failed to load categories:", err.response?.data || err.message);
      setCategoriesError("Could not load categories");
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ---------- Fetch exams ----------
  // categoryId is optional. Even when we ask the backend to filter server-side,
  // we still apply a client-side filter below as a safeguard — this is what
  // makes the category dropdown reliably work even if `/exams/{categoryId}`
  // ever returns an unfiltered list.
  const loadExams = useCallback(async (categoryId) => {
    setLoading(true);
    setError(null);
    try {
      const res = categoryId
        ? await examService.getByCategory(categoryId)
        : await examService.getAll();
      const list = Array.isArray(res?.data) ? res.data : res?.data?.content || [];
      setExams(list);
    } catch (err) {
      console.error("Failed to load exams:", err.response?.data || err.message);
      setError("Could not load exams. Please try again.");
      toast.error("Network error while loading exams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  // ---------- Category filter (auto-applies as soon as you pick one) ----------
  function handleFilterChange(value) {
    setFilterCategoryId(value);
    loadExams(value || undefined);
  }

  function handleResetFilter() {
    setFilterCategoryId("");
    setSearchQuery("");
    loadExams();
  }

  // ---------- Load uploaded files (images or documents) as blobs ----------
  useEffect(() => {
    let cancelled = false;

    async function loadFiles() {
      const toFetch = exams.filter((exam) => {
        const id = exam.examId ?? exam.id;
        return exam.imageName && !fileUrls[id];
      });

      for (const exam of toFetch) {
        const id = exam.examId ?? exam.id;
        try {
          const res = await examService.getFile(exam.imageName);
          const url = URL.createObjectURL(res.data);
          objectUrlsRef.current.push(url);
          if (!cancelled) {
            setFileUrls((prev) => ({ ...prev, [id]: url }));
          }
        } catch (err) {
          console.error(`Failed to load file for exam ${id}`, err);
        }
      }
    }

    if (exams.length) loadFiles();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exams]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[String(c.categoryId)] = c.categoryTitle;
    });
    return map;
  }, [categories]);

  function getCategoryTitle(exam) {
    return exam?.category?.categoryTitle || categoryMap[getExamCategoryId(exam)] || "—";
  }

  // Client-side safeguard: always narrow down to the selected category
  // (and the search query) even if the backend response wasn't pre-filtered.
  const visibleExams = useMemo(() => {
    let list = exams;
    if (filterCategoryId) {
      list = list.filter((exam) => getExamCategoryId(exam) === String(filterCategoryId));
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter((exam) => (exam.title || "").toLowerCase().includes(query));
    }
    return list;
  }, [exams, filterCategoryId, searchQuery]);

  const selectedExam = useMemo(() => {
    if (selectedExamId == null) return null;
    return exams.find((exam) => (exam.examId ?? exam.id) === selectedExamId) || null;
  }, [exams, selectedExamId]);

  // ---------- Navigation between list / detail ----------
  function openDetail(exam) {
    setSelectedExamId(exam.examId ?? exam.id);
    setView("detail");
  }

  function closeDetail() {
    setView("list");
    setSelectedExamId(null);
  }

  // ---------- Form (create / edit) ----------
  function openCreateModal() {
    setFormMode("create");
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setActiveExamId(null);
    setShowFormModal(true);
  }

  function openEditModal(exam) {
    const id = exam.examId ?? exam.id;
    setFormMode("edit");
    setActiveExamId(id);
    setFormData({
      title: exam.title || "",
      categoryId: getExamCategoryId(exam) ?? "",
      examType: exam.examType || "EXAM",
      startTime: toDatetimeLocalValue(exam.startTime),
      endTime: toDatetimeLocalValue(exam.endTime),
      deadline: toDatetimeLocalValue(exam.deadline),
    });
    setFormErrors({});
    setShowFormModal(true);
  }

  function closeFormModal() {
    if (submitting) return;
    setShowFormModal(false);
  }

  function handleFieldChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validateForm(data) {
    const errors = {};
    if (!data.title.trim()) errors.title = "Title is required";
    if (formMode === "create" && !data.categoryId) errors.categoryId = "Category is required";
    if (!data.examType) errors.examType = "Exam type is required";
    if (!data.startTime) errors.startTime = "Start time is required";
    if (!data.endTime) errors.endTime = "End time is required";

    if (data.startTime && data.endTime) {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      if (end <= start) {
        errors.endTime = "End time must be after start time";
      }
    }

    if (data.deadline && data.endTime) {
      const end = new Date(data.endTime);
      const deadline = new Date(data.deadline);
      if (deadline < end) {
        errors.deadline = "Deadline can't be before the end time";
      }
    }

    return errors;
  }

  async function handleSubmitForm(e) {
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    // categoryId is intentionally NOT sent in the body — it's part of the
    // URL for create (`/user/{userId}/category/{categoryId}/exams`), and the
    // backend's exam DTO only accepts title/examType/startTime/endTime/deadline.
    const payload = {
      title: formData.title.trim(),
      examType: formData.examType,
      startTime: toBackendDateTimeString(formData.startTime),
      endTime: toBackendDateTimeString(formData.endTime),
      deadline: toBackendDateTimeString(formData.deadline),
    };

    setSubmitting(true);
    try {
      if (formMode === "create") {
        await examService.create(CURRENT_USER_ID, formData.categoryId, payload);
        toast.success("Exam Created Successfully");
      } else {
        await examService.update(activeExamId, payload);
        toast.success("Updated Successfully");
      }
      setShowFormModal(false);
      loadExams(filterCategoryId || undefined);
    } catch (err) {
      console.error("Failed to save exam:", err.response?.data || err.message);
      const backendMessage =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : null);
      toast.error(
        backendMessage ||
          (formMode === "create" ? "Failed to create exam" : "Failed to update exam")
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- Delete ----------
  function requestDelete(exam) {
    setDeleteTarget(exam);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.examId ?? deleteTarget.id;
    setDeleting(true);
    try {
      await examService.remove(id);
      toast.success("Deleted Successfully");
      setDeleteTarget(null);
      if (selectedExamId === id) closeDetail();
      loadExams(filterCategoryId || undefined);
    } catch (err) {
      console.error("Failed to delete exam:", err.response?.data || err.message);
      toast.error("Failed to delete exam");
    } finally {
      setDeleting(false);
    }
  }

  // ---------- File upload (cover image) ----------
  function triggerFileInput(exam) {
    setUploadTargetExam(exam);
    // Reset the input value first so selecting the same file twice still fires onChange.
    if (sharedFileInputRef.current) sharedFileInputRef.current.value = "";
    sharedFileInputRef.current?.click();
  }

  async function handleImageSelect(fileList) {
    const exam = uploadTargetExam;
    const file = fileList?.[0];
    if (!file || !exam) return;

    if (!isUploadableFile(file.name)) {
      toast.error("Only JPG, JPEG, PNG, or PDF files are allowed");
      return;
    }

    const id = exam.examId ?? exam.id;
    const formDataObj = new FormData();
    formDataObj.append("file", file);

    setUploadingId(id);
    try {
      await examService.uploadFile(id, formDataObj);
      toast.success("File Uploaded Successfully");

      const localUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(localUrl);
      setFileUrls((prev) => ({ ...prev, [id]: localUrl }));

      loadExams(filterCategoryId || undefined);
    } catch (err) {
      console.error("Failed to upload file:", err.response?.data || err.message);
      toast.error("Failed to Upload File");
    } finally {
      setUploadingId(null);
      setUploadTargetExam(null);
    }
  }

  // ---------- View / download an uploaded file ----------
  function handleOpenFile(url) {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const isFiltered = Boolean(filterCategoryId);

  return (
    <div className="exam-page">
      {view === "detail" && selectedExam ? (
        <ExamDetailView
          exam={selectedExam}
          categoryTitle={getCategoryTitle(selectedExam)}
          fileUrl={fileUrls[selectedExamId]}
          uploading={uploadingId === selectedExamId}
          onBack={closeDetail}
          onEdit={() => openEditModal(selectedExam)}
          onDelete={() => requestDelete(selectedExam)}
          onUpload={() => triggerFileInput(selectedExam)}
          onOpenFile={handleOpenFile}
          onPreviewImage={setLightboxUrl}
        />
      ) : (
        <>
          <header className="exam-page__header">
            <div>
              <h1 className="exam-page__title">Exam Management</h1>
              <p className="exam-page__subtitle">
                Create, organize, and monitor every exam on the platform.
              </p>
            </div>
            <button className="btn btn--primary" onClick={openCreateModal}>
              <Plus size={18} />
              Create Exam
            </button>
          </header>

          <section className="exam-toolbar">
            <div className="exam-toolbar__search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search exams by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="exam-toolbar__filter">
              <select
                value={filterCategoryId}
                onChange={(e) => handleFilterChange(e.target.value)}
                disabled={Boolean(categoriesError)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryTitle}
                  </option>
                ))}
              </select>
              {isFiltered && (
                <button className="btn btn--ghost" onClick={handleResetFilter} title="Reset filter">
                  <RotateCcw size={16} />
                  Reset
                </button>
              )}
            </div>
          </section>

          {categoriesError && (
            <button type="button" className="exam-toolbar__retry" onClick={loadCategories}>
              {categoriesError} — click to retry
            </button>
          )}

          {loading ? (
            <SkeletonGrid />
          ) : error ? (
            <div className="exam-empty">
              <X size={32} />
              <p>{error}</p>
              <button className="btn btn--secondary" onClick={() => loadExams(filterCategoryId)}>
                Retry
              </button>
            </div>
          ) : visibleExams.length === 0 ? (
            <div className="exam-empty">
              <ClipboardList size={32} />
              <p>
                {exams.length === 0
                  ? "No exams found. Create your first exam to get started."
                  : "No exams match your current filter or search."}
              </p>
            </div>
          ) : (
            <section className="exam-grid">
              {visibleExams.map((exam) => {
                const id = exam.examId ?? exam.id;
                return (
                  <ExamCard
                    key={id}
                    exam={exam}
                    fileUrl={fileUrls[id]}
                    uploading={uploadingId === id}
                    categoryTitle={getCategoryTitle(exam)}
                    onView={() => openDetail(exam)}
                    onEdit={() => openEditModal(exam)}
                    onUpload={() => triggerFileInput(exam)}
                    onDelete={() => requestDelete(exam)}
                  />
                );
              })}
            </section>
          )}
        </>
      )}

      {showFormModal && (
        <FormModal
          mode={formMode}
          formData={formData}
          errors={formErrors}
          categories={categories}
          submitting={submitting}
          onChange={handleFieldChange}
          onSubmit={handleSubmitForm}
          onClose={closeFormModal}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          exam={deleteTarget}
          deleting={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}

      {lightboxUrl && (
        <div className="lightbox-overlay" onClick={() => setLightboxUrl(null)}>
          <button className="lightbox-close" onClick={() => setLightboxUrl(null)}>
            <X size={20} />
          </button>
          <img src={lightboxUrl} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Single shared file input for cover-image uploads — avoids the
          duplicate-ref bug from having one per row/breakpoint/detail page. */}
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,application/pdf"
        ref={sharedFileInputRef}
        onChange={(e) => handleImageSelect(e.target.files)}
        hidden
      />
    </div>
  );
}

// ---------------- Subcomponents ----------------

function ExamTypeBadge({ examType }) {
  const map = {
    EXAM: "badge--exam",
    TEST: "badge--test",
    ASSIGNMENT: "badge--assignment",
  };
  const className = map[examType] || "badge--test";
  return <span className={`badge ${className}`}>{examType || "—"}</span>;
}

function ExamCard({ exam, fileUrl, uploading, categoryTitle, onView, onEdit, onUpload, onDelete }) {
  const kind = exam.imageName ? getFileKind(exam.imageName) : null;

  return (
    <article className="exam-card-item" onClick={onView}>
      <div className="exam-card-item__media">
        {uploading ? (
          <Loader2 size={24} className="spin" />
        ) : fileUrl && kind === "image" ? (
          <img src={fileUrl} alt="" />
        ) : exam.imageName ? (
          <div className="exam-card-item__file-chip">
            <FileKindIcon fileName={exam.imageName} size={22} />
            <span>{getFileExtension(exam.imageName).toUpperCase()}</span>
          </div>
        ) : (
          <ImageOff size={24} />
        )}
        <span className="exam-card-item__badge">
          <ExamTypeBadge examType={exam.examType} />
        </span>
      </div>

      <div className="exam-card-item__body">
        <h3 className="exam-card-item__title" title={exam.title}>
          {exam.title}
        </h3>
        <p className="exam-card-item__category">{categoryTitle}</p>

        <div className="exam-card-item__dates">
          <span>
            <Calendar size={13} /> {formatDateShort(exam.startTime)}
          </span>
          <span>
            <Clock3 size={13} /> {formatDateShort(exam.endTime)}
          </span>
        </div>
      </div>

      <div className="exam-card-item__footer" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" title="Upload file" onClick={onUpload} disabled={uploading}>
          {uploading ? <Loader2 size={15} className="spin" /> : <Upload size={15} />}
        </button>
        <button className="icon-btn" title="Edit exam" onClick={onEdit}>
          <Pencil size={15} />
        </button>
        <button className="icon-btn icon-btn--danger" title="Delete exam" onClick={onDelete}>
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}

function SkeletonGrid() {
  return (
    <div className="exam-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="exam-skeleton-card" key={i}>
          <div className="exam-skeleton-card__media" />
          <div className="exam-skeleton-card__line" style={{ width: "70%" }} />
          <div className="exam-skeleton-card__line" style={{ width: "45%" }} />
          <div className="exam-skeleton-card__line" style={{ width: "55%" }} />
        </div>
      ))}
    </div>
  );
}

function FormModal({ mode, formData, errors, categories, submitting, onChange, onSubmit, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>{mode === "create" ? "Create Exam" : "Edit Exam"}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal__body" onSubmit={onSubmit}>
          <div className="form-field">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => onChange("title", e.target.value)}
              placeholder="e.g. Midterm Exam of Opt Math"
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {mode === "create" && (
            <div className="form-field">
              <label htmlFor="categoryId">Category *</label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => onChange("categoryId", e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryTitle}
                  </option>
                ))}
              </select>
              {errors.categoryId && <span className="form-error">{errors.categoryId}</span>}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="examType">Exam Type *</label>
            <select
              id="examType"
              value={formData.examType}
              onChange={(e) => onChange("examType", e.target.value)}
            >
              {EXAM_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {errors.examType && <span className="form-error">{errors.examType}</span>}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="startTime">Start Time *</label>
              <input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => onChange("startTime", e.target.value)}
              />
              {errors.startTime && <span className="form-error">{errors.startTime}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="endTime">End Time *</label>
              <input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => onChange("endTime", e.target.value)}
              />
              {errors.endTime && <span className="form-error">{errors.endTime}</span>}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="deadline">Deadline (optional)</label>
            <input
              id="deadline"
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => onChange("deadline", e.target.value)}
            />
            {errors.deadline && <span className="form-error">{errors.deadline}</span>}
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting && <Loader2 size={16} className="spin" />}
              {mode === "create" ? "Save Exam" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ exam, deleting, onCancel, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal--small" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Delete Exam</h2>
          <button className="icon-btn" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>
        <div className="modal__body">
          <p>
            Are you sure you want to delete <strong>{exam.title}</strong>? This action cannot be
            undone.
          </p>
        </div>
        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button className="btn btn--danger" onClick={onConfirm} disabled={deleting}>
            {deleting && <Loader2 size={16} className="spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ExamDetailView({
  exam,
  categoryTitle,
  fileUrl,
  uploading,
  onBack,
  onEdit,
  onDelete,
  onUpload,
  onOpenFile,
  onPreviewImage,
}) {
  const kind = exam.imageName ? getFileKind(exam.imageName) : null;
  const isImage = kind === "image";

  return (
    <div className="exam-detail">
      <div className="exam-detail__topbar">
        <button className="btn btn--ghost" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to all exams
        </button>
        <div className="exam-detail__topbar-actions">
          <button className="btn btn--secondary" onClick={onEdit}>
            <Pencil size={15} />
            Edit
          </button>
          <button className="btn btn--ghost btn--danger" onClick={onDelete}>
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>

      <div className="exam-detail__heading">
        <div>
          <ExamTypeBadge examType={exam.examType} />
          <h1>{exam.title}</h1>
          <p className="exam-detail__breadcrumb">
            <LayoutGrid size={14} /> {categoryTitle}
          </p>
        </div>
      </div>

      <div className="exam-detail__layout">
        <div className="exam-detail__media-card">
          <h2 className="exam-detail__info-title">Attachment</h2>

          {uploading ? (
            <div className="exam-detail__media">
              <Loader2 size={32} className="spin" />
            </div>
          ) : fileUrl && isImage ? (
            <div
              className="exam-detail__media exam-detail__media--clickable"
              onClick={() => onPreviewImage(fileUrl)}
            >
              <img src={fileUrl} alt="" />
              <span className="exam-detail__media-zoom">
                <Maximize2 size={16} />
              </span>
            </div>
          ) : fileUrl && exam.imageName ? (
            <div className="exam-detail__file-card">
              <div className="exam-detail__file-icon">
                <FileKindIcon fileName={exam.imageName} size={28} />
              </div>
              <div className="exam-detail__file-info">
                <span className="exam-detail__file-name" title={exam.imageName}>
                  {exam.imageName}
                </span>
                <span className="exam-detail__file-kind">
                  {getFileExtension(exam.imageName).toUpperCase()} file
                </span>
              </div>
              <div className="exam-detail__file-actions">
                <button className="btn btn--secondary" onClick={() => onOpenFile(fileUrl)}>
                  <ExternalLink size={14} />
                  View
                </button>
                <a className="btn btn--ghost" href={fileUrl} download={exam.imageName}>
                  <Download size={14} />
                  Download
                </a>
              </div>
            </div>
          ) : (
            <div className="exam-detail__media">
              <div className="exam-detail__media-placeholder">
                <ImageOff size={32} />
                <span>No file uploaded yet</span>
              </div>
            </div>
          )}

          <button
            className="btn btn--secondary exam-detail__upload-btn"
            onClick={onUpload}
            disabled={uploading}
          >
            {uploading ? <Loader2 size={16} className="spin" /> : <ImagePlus size={16} />}
            {exam.imageName ? "Replace File" : "Upload File"}
          </button>
          <p className="exam-detail__upload-hint">JPG, JPEG, PNG, or PDF.</p>
        </div>

        <div className="exam-detail__info-card">
          <h2 className="exam-detail__info-title">Exam Details</h2>
          <div className="exam-detail__grid">
            <div className="exam-detail__field">
              <span className="exam-detail__label">Category</span>
              <span className="exam-detail__value">{categoryTitle}</span>
            </div>
            <div className="exam-detail__field">
              <span className="exam-detail__label">Exam Type</span>
              <span className="exam-detail__value">
                <ExamTypeBadge examType={exam.examType} />
              </span>
            </div>
            <div className="exam-detail__field">
              <span className="exam-detail__label">
                <Calendar size={13} /> Start Time
              </span>
              <span className="exam-detail__value">{formatDateTime(exam.startTime)}</span>
            </div>
            <div className="exam-detail__field">
              <span className="exam-detail__label">
                <Clock3 size={13} /> End Time
              </span>
              <span className="exam-detail__value">{formatDateTime(exam.endTime)}</span>
            </div>
            <div className="exam-detail__field">
              <span className="exam-detail__label">
                <CalendarClock size={13} /> Deadline
              </span>
              <span className="exam-detail__value">{formatDateTime(exam.deadline)}</span>
            </div>
            <div className="exam-detail__field">
              <span className="exam-detail__label">Created</span>
              <span className="exam-detail__value">{formatDateTime(exam.addedDate)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
