import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Eye,
  X,
  CalendarDays,
  Users,
  Layers,
  CalendarCheck2,
  RefreshCw,
  Inbox,
  Mail,
  Phone,
  User as UserIcon,
  BookOpen,
  Tag,
  BadgeDollarSign,
  Clock,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { bookingService } from "../../services/api"; // adjust path to match project structure
import "./Booking.css";

/* ----------------------------------------------------------------------- */
/*  Small reusable pieces (lightweight local versions)                     */
/* ----------------------------------------------------------------------- */

/** Stat card used in the top summary row */
const DashboardCard = ({ icon: Icon, label, value, hint, tone = "blue" }) => (
  <div className="stat-card">
    <div className={`stat-card__icon stat-card__icon--${tone}`}>
      <Icon size={22} />
    </div>
    <div className="stat-card__body">
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
      {hint && <span className="stat-card__hint">{hint}</span>}
    </div>
  </div>
);

/** Status / type badge */
const Badge = ({ children, variant = "default" }) => (
  <span className={`badge badge--${variant}`}>{children}</span>
);

/** Map a booking status string to a badge visual variant */
const statusVariant = (status) => {
  switch ((status || "").toUpperCase()) {
    case "BOOKED":
    case "CONFIRMED":
    case "PAID":
      return "success";
    case "PENDING":
      return "warning";
    case "CANCELLED":
    case "FAILED":
      return "danger";
    default:
      return "default";
  }
};

/** Generic centered modal */
const Modal = ({ open, onClose, title, children, footer }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

/** One skeleton row shown while data is loading */
const SkeletonRow = () => (
  <tr className="skeleton-row">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i}>
        <div className="skeleton-block" />
      </td>
    ))}
  </tr>
);

/* ----------------------------------------------------------------------- */
/*  Helpers                                                                 */
/* ----------------------------------------------------------------------- */

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isToday = (value) => {
  if (!value) return false;
  const d = new Date(value);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

/* ----------------------------------------------------------------------- */
/*  Main Page                                                               */
/* ----------------------------------------------------------------------- */

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Optional "Booked / Not Booked" verification badge shown inside the modal
  const [checkStatus, setCheckStatus] = useState(null); // null | "checking" | "booked" | "not-booked" | "error"

  /** Fetch every booking from the API */
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingService.getAll();
      // Support both a raw array response and a wrapped { data: [...] } response
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setBookings(data);
    } catch (err) {
      if (!err?.response) {
        toast.error("Network error. Please check your connection.");
      } else if (err.response.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("Loading failed. Could not fetch bookings.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* --------------------------- Derived stats --------------------------- */

  const stats = useMemo(() => {
    const totalBookings = bookings.length;

    const uniqueUsers = new Set(
      bookings.map((b) => b.user?.id).filter((id) => id !== undefined)
    );
    const uniqueCategories = new Set(
      bookings
        .map((b) => b.category?.categoryId)
        .filter((id) => id !== undefined)
    );
    const todaysBookings = bookings.filter((b) => isToday(b.bookingDate)).length;

    return {
      totalBookings,
      totalUsers: uniqueUsers.size,
      totalCategories: uniqueCategories.size,
      todaysBookings,
    };
  }, [bookings]);

  /* --------------------------- Search filter ---------------------------- */

  const filteredBookings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return bookings;
    return bookings.filter((b) => {
      const userName = b.user?.name?.toLowerCase() || "";
      const categoryTitle = b.category?.categoryTitle?.toLowerCase() || "";
      return userName.includes(term) || categoryTitle.includes(term);
    });
  }, [bookings, searchTerm]);

  /* ------------------------------ Actions -------------------------------- */

  const handleViewDetails = async (booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
    setCheckStatus("checking");

    // Optional verification call — never blocks the modal from opening
    try {
      const userId = booking.user?.id;
      const categoryId = booking.category?.categoryId;
      if (userId && categoryId) {
        const res = await bookingService.checkBooked(userId, categoryId);
        const booked = res.data === true || res.data?.booked === true;
        setCheckStatus(booked ? "booked" : "not-booked");
      } else {
        setCheckStatus(null);
      }
    } catch (err) {
      setCheckStatus("error");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBooking(null);
    setCheckStatus(null);
  };

  /* -------------------------------- Render -------------------------------- */

  return (
    <div className="booking-page">
      <ToastContainer position="top-right" autoClose={3500} />

      {/* Breadcrumb + title */}
      <div className="booking-page__top">
        <div>
          <p className="breadcrumb">Dashboard &gt; Bookings</p>
          <h1 className="page-title">Booking Management</h1>
        </div>
        <button className="btn btn--secondary" onClick={fetchBookings}>
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <DashboardCard
          icon={CalendarDays}
          label="Total Bookings"
          value={stats.totalBookings}
          hint="All-time bookings"
          tone="blue"
        />
        <DashboardCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          hint="Unique learners booked"
          tone="indigo"
        />
        <DashboardCard
          icon={Layers}
          label="Total Categories"
          value={stats.totalCategories}
          hint="Diverse learning paths"
          tone="gray"
        />
        <DashboardCard
          icon={CalendarCheck2}
          label="Today's Bookings"
          value={stats.todaysBookings}
          hint="New bookings today"
          tone="blue"
        />
      </div>

      {/* Search */}
      <div className="toolbar">
        <div className="search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by user name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-scroll">
          <table className="booking-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Category</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

              {!loading && filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <Inbox size={40} strokeWidth={1.5} />
                      <h3>No Bookings Found</h3>
                      <p>
                        {searchTerm
                          ? "Try a different search term."
                          : "There are no bookings to show yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                filteredBookings.map((b) => (
                  <tr key={b.bookedId}>
                    <td className="cell-strong">#BK-{b.bookedId}</td>
                    <td>
                      <div className="user-cell">
                        <span className="avatar-fallback">
                          {b.user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                        <span>{b.user?.name || "—"}</span>
                      </div>
                    </td>
                    <td className="cell-muted">{b.user?.email || "—"}</td>
                    <td>{b.category?.categoryTitle || "—"}</td>
                    <td>
                      <Badge
                        variant={
                          b.category?.categoryType === "PAID" ? "info" : "gray"
                        }
                      >
                        {b.category?.categoryType || "—"}
                      </Badge>
                    </td>
                    <td>{formatDate(b.bookingDate)}</td>
                    <td>
                      <Badge variant={statusVariant(b.status)}>
                        {b.status || "—"}
                      </Badge>
                    </td>
                    <td>
                      <button
                        className="btn-icon"
                        title="View Details"
                        onClick={() => handleViewDetails(b)}
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={
          selectedBooking ? `Booking #BK-${selectedBooking.bookedId}` : "Booking Details"
        }
        footer={
          <button className="btn btn--secondary" onClick={closeModal}>
            Close
          </button>
        }
      >
        {selectedBooking && (
          <div className="details-grid">
            {/* Verification badge (optional) */}
            {checkStatus && (
              <div className="verify-row">
                {checkStatus === "checking" && (
                  <Badge variant="gray">Checking...</Badge>
                )}
                {checkStatus === "booked" && (
                  <Badge variant="success">Booked</Badge>
                )}
                {checkStatus === "not-booked" && (
                  <Badge variant="danger">Not Booked</Badge>
                )}
                {checkStatus === "error" && (
                  <Badge variant="warning">Verification unavailable</Badge>
                )}
              </div>
            )}

            {/* User information */}
            <section className="details-section">
              <h4>
                <UserIcon size={16} /> User Information
              </h4>
              <div className="details-row">
                <span className="details-label">Name</span>
                <span className="details-value">
                  {selectedBooking.user?.name || "—"}
                </span>
              </div>
              <div className="details-row">
                <span className="details-label">
                  <Mail size={14} /> Email
                </span>
                <span className="details-value">
                  {selectedBooking.user?.email || "—"}
                </span>
              </div>
              <div className="details-row">
                <span className="details-label">
                  <Phone size={14} /> Phone
                </span>
                <span className="details-value">
                  {selectedBooking.user?.phoneNumber || "—"}
                </span>
              </div>
            </section>

            {/* Category information */}
            <section className="details-section">
              <h4>
                <BookOpen size={16} /> Category Information
              </h4>
              <div className="details-row">
                <span className="details-label">Title</span>
                <span className="details-value">
                  {selectedBooking.category?.categoryTitle || "—"}
                </span>
              </div>
              <div className="details-row">
                <span className="details-label">
                  <Tag size={14} /> Main Category
                </span>
                <span className="details-value">
                  {selectedBooking.category?.mainCategory || "—"}
                </span>
              </div>
              <div className="details-row">
                <span className="details-label">Type</span>
                <span className="details-value">
                  <Badge
                    variant={
                      selectedBooking.category?.categoryType === "PAID"
                        ? "info"
                        : "gray"
                    }
                  >
                    {selectedBooking.category?.categoryType || "—"}
                  </Badge>
                </span>
              </div>
              <div className="details-row">
                <span className="details-label">
                  <BadgeDollarSign size={14} /> Price
                </span>
                <span className="details-value">
                  {selectedBooking.category?.price
                    ? `NPR ${selectedBooking.category.price.toLocaleString()}`
                    : "Free"}
                </span>
              </div>
            </section>

            {/* Booking information */}
            <section className="details-section">
              <h4>
                <Clock size={16} /> Booking Information
              </h4>
              <div className="details-row">
                <span className="details-label">Booking Date</span>
                <span className="details-value">
                  {formatDateTime(selectedBooking.bookingDate)}
                </span>
              </div>
              <div className="details-row">
                <span className="details-label">Status</span>
                <span className="details-value">
                  <Badge variant={statusVariant(selectedBooking.status)}>
                    {selectedBooking.status || "—"}
                  </Badge>
                </span>
              </div>
            </section>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Booking;
