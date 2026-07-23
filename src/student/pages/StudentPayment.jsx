// student/pages/StudentPayment.jsx
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  UploadCloud,
  Image as ImageIcon,
  X,
  RefreshCcw,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  Landmark,
  QrCode,
  Loader2,
  ImageOff,
  Inbox,
} from "lucide-react";

import { formatPrice, formatDate, normalizeId } from "../utils/helpers";
import useAuthImage from "../utils/useAuthImage";
import { paymentService, categoryService } from "../../services/api"; // adjust path to match your actual services/api.js location

import "./StudentPayment.css";

/* ============================================================
 * Static config — change account / QR details here only.
 * ============================================================ */
const PAYMENT_CONFIG = {
  accountName: "Utkrista Shikshya",
  walletNumber: "9812345678",
  bankName: "NIC Asia Bank",
  qrImage: "/assets/payment-qr.png",
  instructions:
    "Please complete the payment using your preferred method below and upload a clear screenshot of the transaction. Verification typically takes 12-24 hours.",
};

const PAYMENT_METHODS = [
  { id: "esewa_khalti", label: "eSewa / Khalti", icon: Wallet },
  { id: "bank_transfer", label: "Bank Transfer", icon: Landmark },
];

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

/* ============================================================
 * Toast — tiny self-contained toast system (no external lib)
 * ============================================================ */
const Toast = ({ toast, onDismiss }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: -12, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -12, scale: 0.95 }}
    className={`sp-toast sp-toast--${toast.type}`}
  >
    {toast.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
    <span>{toast.message}</span>
    <button className="sp-toast__close" onClick={() => onDismiss(toast.id)}>
      <X size={14} />
    </button>
  </motion.div>
);

const ToastStack = ({ toasts, onDismiss }) => (
  <div className="sp-toast-stack">
    <AnimatePresence>
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </AnimatePresence>
  </div>
);

/* ============================================================
 * Course review card
 * ============================================================ */
const ReviewOrderCard = ({ category, isLoading }) => {
  const { categoryTitle, categoryDescription, categoryType, price, imageName, mainCategory } =
    category ?? {};
  const { url: resolvedImage, isLoading: isImageLoading } = useAuthImage(
    imageName,
    categoryService.getImage
  );

  if (isLoading) {
    return (
      <div className="sp-card">
        <div className="sp-card__heading-row">
          <div className="skel-line skel-line--short" />
        </div>
        <div className="review-order__skeleton">
          <div className="skel-thumb" />
          <div className="review-order__skeleton-lines">
            <div className="skel-line skel-line--wide" />
            <div className="skel-line" />
            <div className="skel-line skel-line--short" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sp-card">
      <div className="sp-card__heading-row">
        <h2 className="sp-card__heading">Review Order</h2>
        {categoryType && <span className="sp-badge">{categoryType}</span>}
      </div>

      <div className="review-order">
        <div className="review-order__image-wrap">
          {resolvedImage ? (
            <img src={resolvedImage} alt={categoryTitle} className="review-order__image" />
          ) : (
            <div className={`review-order__image-fallback ${isImageLoading ? "sp-shimmer" : ""}`}>
              {!isImageLoading && <ImageOff size={22} />}
            </div>
          )}
        </div>

        <div className="review-order__info">
          <p className="review-order__title">{categoryTitle || "Untitled Course"}</p>
          {categoryDescription && (
            <p className="review-order__description">{categoryDescription}</p>
          )}
          {mainCategory && <p className="review-order__category">{mainCategory}</p>}
        </div>

        <div className="review-order__fee">
          <span className="review-order__fee-label">Course Fee</span>
          <span className="review-order__fee-value">{formatPrice(price)}</span>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
 * Payment methods (UI only — no gateway integration)
 * ============================================================ */
const PaymentMethods = ({ selected, onSelect }) => (
  <div className="sp-card">
    <h2 className="sp-card__heading">Payment Methods</h2>

    <div className="payment-methods">
      {PAYMENT_METHODS.map((method) => {
        const Icon = method.icon;
        const isActive = selected === method.id;
        return (
          <button
            key={method.id}
            type="button"
            className={`payment-method ${isActive ? "payment-method--active" : ""}`}
            onClick={() => onSelect(method.id)}
          >
            <span className="payment-method__icon">
              <Icon size={20} />
            </span>
            <span className="payment-method__label">{method.label}</span>
          </button>
        );
      })}
    </div>

    <div className="payment-instructions">
      <p className="payment-instructions__text">{PAYMENT_CONFIG.instructions}</p>

      <div className="payment-instructions__grid">
        <div className="account-details">
          <p className="account-details__label">Official Account Details</p>
          <ul className="account-details__list">
            <li>
              <span>Account Name</span>
              <strong>{PAYMENT_CONFIG.accountName}</strong>
            </li>
            <li>
              <span>Wallet Number</span>
              <strong>{PAYMENT_CONFIG.walletNumber}</strong>
            </li>
            <li>
              <span>Bank Name</span>
              <strong>{PAYMENT_CONFIG.bankName}</strong>
            </li>
          </ul>
        </div>

        <div className="qr-panel">
          <div className="qr-panel__frame">
            {PAYMENT_CONFIG.qrImage ? (
              <img src={PAYMENT_CONFIG.qrImage} alt="Scan to pay" className="qr-panel__image" />
            ) : (
              <QrCode size={48} />
            )}
          </div>
          <p className="qr-panel__caption">SCAN TO PAY</p>
        </div>
      </div>
    </div>
  </div>
);

/* ============================================================
 * Drag & drop screenshot uploader
 * ============================================================ */
const ScreenshotUploader = ({
  selectedFile,
  previewUrl,
  onFileSelect,
  onRemove,
  validDate,
  onDateChange,
  onSubmit,
  isSubmitting,
  uploadProgress,
  disabled,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const inputRef = useRef(null);

  const validateAndSetFile = (file) => {
    if (!file) return;
    setFileError("");

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Only JPG, JPEG, or PNG images are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File must be smaller than ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const handleBrowse = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
    e.target.value = ""; // allow re-selecting the same file
  };

  return (
    <div className="sp-card sp-card--sticky">
      <h2 className="sp-card__heading">Payment Verification</h2>

      <label className="sp-field">
        <span className="sp-field__label">Payment Date</span>
        <input
          type="date"
          className="sp-field__input"
          value={validDate}
          onChange={(e) => onDateChange(e.target.value)}
          disabled={disabled}
        />
      </label>

      {previewUrl ? (
        <div className="upload-preview">
          <img src={previewUrl} alt="Payment screenshot preview" className="upload-preview__image" />
          <div className="upload-preview__actions">
            <button
              type="button"
              className="upload-preview__btn"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              <RefreshCcw size={14} /> Replace
            </button>
            <button
              type="button"
              className="upload-preview__btn upload-preview__btn--danger"
              onClick={onRemove}
              disabled={disabled}
            >
              <X size={14} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`upload-dropzone ${isDragging ? "upload-dropzone--dragging" : ""} ${
            disabled ? "upload-dropzone--disabled" : ""
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <span className="upload-dropzone__icon">
            <UploadCloud size={26} />
          </span>
          <p className="upload-dropzone__title">Upload Screenshot</p>
          <p className="upload-dropzone__hint">
            Drag and drop your transaction receipt here, or click to browse
          </p>
          <p className="upload-dropzone__meta">JPG, JPEG, PNG — up to {MAX_FILE_SIZE_MB}MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="upload-dropzone__input"
        onChange={handleBrowse}
        disabled={disabled}
      />

      {fileError && <p className="sp-field__error">{fileError}</p>}

      {isSubmitting && (
        <div className="upload-progress">
          <div className="upload-progress__bar" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}

      <button
        type="button"
        className="sp-submit-btn"
        onClick={onSubmit}
        disabled={disabled || isSubmitting || !selectedFile || !validDate}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="sp-spin" /> Submitting...
          </>
        ) : (
          "Submit Payment Verification"
        )}
      </button>

      <p className="sp-submit-note">
        By submitting, you confirm that the attached screenshot is authentic. Verification typically
        takes 12-24 hours.
      </p>
    </div>
  );
};

/* ============================================================
 * Status cards — pending / approved / rejected
 * ============================================================ */
const StatusCard = ({ status, remarks, onGoToCourses, onReupload }) => {
  if (status === "PENDING") {
    return (
      <div className="status-card status-card--pending">
        <Clock size={20} />
        <div>
          <p className="status-card__title">Payment Under Review</p>
          <p className="status-card__text">
            Your payment has been submitted and is waiting for admin verification. Course access is
            disabled until verification is complete.
          </p>
        </div>
      </div>
    );
  }

  if (status === "APPROVED") {
    return (
      <div className="status-card status-card--approved">
        <CheckCircle2 size={20} />
        <div>
          <p className="status-card__title">Payment Approved</p>
          <p className="status-card__text">Your payment has been approved. You now have full course access.</p>
          <button className="status-card__action" onClick={onGoToCourses}>
            Go to My Courses
          </button>
        </div>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="status-card status-card--rejected">
        <XCircle size={20} />
        <div>
          <p className="status-card__title">Payment Rejected</p>
          <p className="status-card__text">{remarks || "Your payment could not be verified."}</p>
          <button className="status-card__action status-card__action--outline" onClick={onReupload}>
            Upload New Screenshot
          </button>
        </div>
      </div>
    );
  }

  return null;
};

/* ============================================================
 * Payment history table
 * ============================================================ */
const STATUS_BADGE = {
  PENDING: { label: "Pending", className: "history-badge--pending" },
  APPROVED: { label: "Approved", className: "history-badge--approved" },
  REJECTED: { label: "Rejected", className: "history-badge--rejected" },
};

// Payment screenshots are served through an authenticated blob endpoint
// (paymentService.getImage), same pattern as useAuthImage elsewhere in the
// app — so each row resolves its own thumbnail rather than using a raw <img src>.
const HistoryRow = ({ record }) => {
  const badge = STATUS_BADGE[record.status] || STATUS_BADGE.PENDING;
  const { url: thumbUrl, isLoading: isThumbLoading } = useAuthImage(
    record.screenshotFileName || record.screenshotName,
    paymentService.getImage
  );

  return (
    <tr>
      <td>{record.paymentId ?? "—"}</td>
      <td>{record.courseName ?? "—"}</td>
      <td>{record.amount != null ? formatPrice(record.amount) : "—"}</td>
      <td>{record.submittedDate ? formatDate(record.submittedDate) : "—"}</td>
      <td>
        {thumbUrl ? (
          <img src={thumbUrl} alt="screenshot" className="history-table__thumb" />
        ) : (
          <ImageIcon
            size={18}
            className={`history-table__thumb-placeholder ${isThumbLoading ? "sp-shimmer" : ""}`}
          />
        )}
      </td>
      <td>
        <span className={`history-badge ${badge.className}`}>{badge.label}</span>
      </td>
      <td>{record.remarks ?? "—"}</td>
    </tr>
  );
};

const PaymentHistory = ({ records = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="sp-card">
        <h2 className="sp-card__heading">Payment History</h2>
        <div className="skel-line skel-line--wide" style={{ marginTop: 16 }} />
        <div className="skel-line" />
        <div className="skel-line skel-line--short" />
      </div>
    );
  }

  if (!records.length) {
    return (
      <div className="sp-card">
        <h2 className="sp-card__heading">Payment History</h2>
        <div className="sp-empty">
          <Inbox size={28} />
          <p>No payment has been submitted yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sp-card">
      <h2 className="sp-card__heading">Payment History</h2>

      <div className="history-table__wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Course</th>
              <th>Amount</th>
              <th>Date Submitted</th>
              <th>Screenshot</th>
              <th>Status</th>
              <th>Admin Remarks</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <HistoryRow key={record.paymentId ?? index} record={record} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ============================================================
 * Page
 * ============================================================ */
const StudentPayment = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id);
  const [validDate, setValidDate] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [paymentStatus, setPaymentStatus] = useState(null); // PENDING | APPROVED | REJECTED | null
  const [statusRemarks, setStatusRemarks] = useState("");
  const [historyRecords, setHistoryRecords] = useState([]);
  const [isStatusLoading, setIsStatusLoading] = useState(true);

  const [toasts, setToasts] = useState([]);

  // Logged-in user id, read from localStorage once.
  const userId = useMemo(() => {
    try {
      const stored = localStorage.getItem("userId") || localStorage.getItem("user");
      if (!stored) return null;
      // Support either a raw id string, or a stored user object with an id field.
      try {
        const parsed = JSON.parse(stored);
        return parsed?.userId ?? parsed?.id ?? stored;
      } catch {
        return stored;
      }
    } catch {
      return null;
    }
  }, []);

  const pushToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ---------- Load course info ---------- */
  const loadCategory = useCallback(async () => {
    setIsCategoryLoading(true);
    setPageError(null);
    try {
      const res = await categoryService.getById(categoryId);
      setCategory(res?.data ?? null);
    } catch (err) {
      setPageError(err);
      pushToast("error", "Failed to load course details.");
    } finally {
      setIsCategoryLoading(false);
    }
  }, [categoryId, pushToast]);

  /* ---------- Load existing payment status ---------- */
  const loadPaymentStatus = useCallback(async () => {
    if (!userId) return;
    setIsStatusLoading(true);
    try {
      const res = await paymentService.checkPayment(userId, categoryId);
      const data = res?.data;

      // The check-payment endpoint returns the record(s) for this user/category.
      // Normalize to an array so the history table and status card can share one source.
      const records = Array.isArray(data) ? data : data ? [data] : [];
      setHistoryRecords(records);

      const latest = records[0];
      if (latest?.status) {
        setPaymentStatus(latest.status.toUpperCase());
        setStatusRemarks(latest.remarks || latest.rejectionReason || "");
      } else {
        setPaymentStatus(null);
      }
    } catch (err) {
      // Treat "not found" as: no payment submitted yet.
      setPaymentStatus(null);
      setHistoryRecords([]);
    } finally {
      setIsStatusLoading(false);
    }
  }, [userId, categoryId]);

  useEffect(() => {
    loadCategory();
    loadPaymentStatus();
  }, [loadCategory, loadPaymentStatus]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* ---------- File handling ---------- */
  const handleFileSelect = (file) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleReupload = () => {
    setPaymentStatus(null);
    handleRemoveFile();
  };

  /* ---------- Submit flow: create payment -> upload screenshot ---------- */
  const handleSubmit = async () => {
    if (!userId) {
      pushToast("error", "You must be logged in to submit a payment.");
      return;
    }
    if (!selectedFile || !validDate) return;

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      const payload = {
        paymentDto: {
          validDate,
          payment_screensort: "",
        },
        categoryIds: [Number(categoryId)],
      };

      // Step 1: create the payment record.
      // paymentService.create signature is (userId, categoryId, data, config) —
      // categoryId goes in the URL, payload is the request body.
      const response = await paymentService.create(userId, categoryId, payload);
      setUploadProgress(50);

      const paymentId = response?.data?.paymentId;
      if (!paymentId) {
        throw new Error("Payment was created but no paymentId was returned.");
      }

      // Step 2: upload the screenshot for that payment.
      const formData = new FormData();
      formData.append("file", selectedFile);
      await paymentService.uploadFile(paymentId, formData);

      setUploadProgress(100);
      pushToast("success", "Payment submitted successfully. Waiting for admin verification.");

      handleRemoveFile();
      setPaymentStatus("PENDING");
      loadPaymentStatus();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Something went wrong while submitting your payment.";
      pushToast("error", message);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setUploadProgress(0), 600);
    }
  };

  const handleGoToCourses = () => navigate("/student/my-courses");
  const handleBack = () => navigate(`/student/course/${categoryId}`);

  const isFormDisabled = paymentStatus === "PENDING" || paymentStatus === "APPROVED";

  if (pageError && !category) {
    return (
      <div className="student-payment student-payment--error">
        <div className="sp-error-state">
          <p>We couldn't load this course. It may have been removed, or something went wrong.</p>
          <button onClick={loadCategory}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-payment">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <button className="student-payment__back" onClick={handleBack}>
        <ArrowLeft size={16} /> Back to course
      </button>

      <div className="student-payment__header">
        <h1>Course Payment</h1>
        <p className="student-payment__breadcrumb">Dashboard / Payment Verification</p>
      </div>

      {!isStatusLoading && paymentStatus && (
        <StatusCard
          status={paymentStatus}
          remarks={statusRemarks}
          onGoToCourses={handleGoToCourses}
          onReupload={handleReupload}
        />
      )}

      <div className="student-payment__body">
        <div className="student-payment__main">
          <ReviewOrderCard category={category} isLoading={isCategoryLoading} />

          <PaymentMethods selected={selectedMethod} onSelect={setSelectedMethod} />

          <PaymentHistory records={historyRecords} isLoading={isStatusLoading} />
        </div>

        <div className="student-payment__sidebar">
          <ScreenshotUploader
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            onFileSelect={handleFileSelect}
            onRemove={handleRemoveFile}
            validDate={validDate}
            onDateChange={setValidDate}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            uploadProgress={uploadProgress}
            disabled={isFormDisabled}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentPayment;
