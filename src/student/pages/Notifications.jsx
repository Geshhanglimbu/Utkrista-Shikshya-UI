import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import {
  FiBell,
  FiSearch,
  FiRefreshCw,
  FiMail,
  FiCalendar,
  FiFilter,
  FiX,
} from "react-icons/fi";
import { notificationService } from "../../services/api";
import NotificationCard from "../components/NotificationCard";
import NotificationDrawer from "../components/NotificationDrawer";
import Pagination from "../components/Pagination";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";
import "./Notifications.css";

const PAGE_SIZE = 10;

// Normalizes Java LocalDateTime array [y, m, d, h, mi, s] or ISO string into a JS Date
const parseNoticeDate = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    return new Date(year, (month || 1) - 1, day || 1, hour, minute, second);
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value) => {
  const date = parseNoticeDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (value) => {
  const date = parseNoticeDate(value);
  if (!date) return "—";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isToday = (value) => {
  const date = parseNoticeDate(value);
  if (!date) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("NEWEST");
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [readMap, setReadMap] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);
  const userId = user?.id;

  const loadReadStatuses = useCallback(
    async (list) => {
      if (!userId || !list.length) return {};
      const entries = await Promise.all(
        list.map(async (notice) => {
          try {
            const res = await notificationService.checkSeen(
              userId,
              notice.noticeId
            );
            const seen = res?.data === true || res?.data?.seen === true;
            return [notice.noticeId, seen];
          } catch {
            return [notice.noticeId, false];
          }
        })
      );
      return Object.fromEntries(entries);
    },
    [userId]
  );

  const fetchData = useCallback(async () => {
    if (!userId) {
      setError("No logged in user found.");
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const [noticesRes, unreadRes] = await Promise.all([
        notificationService.getAllForUser(userId),
        notificationService.getUnreadCount(userId),
      ]);
      const list = Array.isArray(noticesRes?.data)
        ? noticesRes.data
        : noticesRes?.data?.content || [];
      const statuses = await loadReadStatuses(list);
      setReadMap(statuses);
      setNotifications(list);
      setUnreadCount(
        typeof unreadRes?.data === "number"
          ? unreadRes.data
          : unreadRes?.data?.count ?? 0
      );
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, loadReadStatuses]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    toast.success("Notifications refreshed.");
  };

  const facultyOptions = useMemo(() => {
    const set = new Set(
      notifications.map((n) => n.facultyName || n.faculty).filter(Boolean)
    );
    return ["ALL", ...Array.from(set)];
  }, [notifications]);

  const handleFacultyChange = async (value) => {
    setFaculty(value);
    setCurrentPage(1);
    if (value === "ALL" || !userId) return;
    try {
      const res = await notificationService.getByFaculty(userId, value);
      const list = Array.isArray(res?.data) ? res.data : res?.data?.content || [];
      const statuses = await loadReadStatuses(list);
      setReadMap((prev) => ({ ...prev, ...statuses }));
      setNotifications(list);
    } catch (err) {
      console.error("Failed to filter by faculty:", err);
      toast.error("Couldn't load notifications for that faculty.");
    }
  };

  useEffect(() => {
    let result = [...notifications];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.description?.toLowerCase().includes(q)
      );
    }

    if (status !== "ALL") {
      result = result.filter((n) => {
        const read = !!readMap[n.noticeId];
        return status === "READ" ? read : !read;
      });
    }

    result.sort((a, b) => {
      const dateA = parseNoticeDate(a.createdAt || a.createdDate)?.getTime() || 0;
      const dateB = parseNoticeDate(b.createdAt || b.createdDate)?.getTime() || 0;
      return sort === "NEWEST" ? dateB - dateA : dateA - dateB;
    });

    setFilteredNotifications(result);
  }, [notifications, search, status, sort, readMap]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / PAGE_SIZE)
  );
  const pagedNotifications = filteredNotifications.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const readCount = notifications.length - unreadCount;
  const todayCount = notifications.filter((n) =>
    isToday(n.createdAt || n.createdDate)
  ).length;

  const clearFilters = () => {
    setSearch("");
    setFaculty("ALL");
    setStatus("ALL");
    setSort("NEWEST");
    setCurrentPage(1);
    if (faculty !== "ALL") {
      fetchData();
    }
  };

  const handleOpenNotification = (notice) => {
    setSelectedNotification(notice);
  };

  const handleCloseDrawer = () => setSelectedNotification(null);

  const handleMarkAsRead = async (notice) => {
    if (!userId) return;
    try {
      await notificationService.markAsRead(userId, notice.noticeId);
      setReadMap((prev) => ({ ...prev, [notice.noticeId]: true }));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Notification marked as read.");
    } catch (err) {
      console.error("Failed to mark as read:", err);
      toast.error("Couldn't mark notification as read.");
    }
  };

  return (
    <div className="notif-page">
      <header className="notif-header">
        <div className="notif-header-titles">
          <h1>Notifications</h1>
          <p>
            Stay updated with announcements, course updates, live classes,
            exam schedules, and important notices.
          </p>
        </div>
        <div className="notif-header-actions">
          <div className="notif-search-box">
            <FiSearch className="notif-search-icon" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button
            className="notif-icon-btn"
            onClick={handleRefresh}
            aria-label="Refresh notifications"
          >
            <FiRefreshCw className={refreshing ? "spin" : ""} />
          </button>
          <button className="notif-bell-btn" aria-label="Notifications">
            <FiBell />
            {unreadCount > 0 && <span className="notif-bell-dot" />}
          </button>
          {user && (
            <div className="notif-user">
              <div className="notif-avatar">
                {(user.name || user.fullName || "S").charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="notif-stats">
        <div className="notif-stat-card">
          <div className="notif-stat-icon total">
            <FiBell />
          </div>
          <div>
            <span className="notif-stat-label">Total</span>
            <span className="notif-stat-value">{notifications.length}</span>
          </div>
        </div>
        <div className="notif-stat-card unread">
          <div className="notif-stat-icon unread-icon">
            <FiMail />
          </div>
          <div>
            <span className="notif-stat-label">Unread</span>
            <span className="notif-stat-value">{unreadCount}</span>
          </div>
        </div>
        <div className="notif-stat-card read">
        <div className="notif-stat-icon read-icon">
            <FiBell />
        </div>
        <div>
            <span className="notif-stat-label">Read</span>
            <span className="notif-stat-value">{Math.max(0, readCount)}</span>
        </div>
        </div>
        <div className="notif-stat-card">
          <div className="notif-stat-icon today">
            <FiCalendar />
          </div>
          <div>
            <span className="notif-stat-label">New Today</span>
            <span className="notif-stat-value">{todayCount}</span>
          </div>
        </div>
      </section>

      <section className="notif-filters">
        <div className={`notif-filters-row ${filtersOpen ? "open" : ""}`}>
          <select
            value={faculty}
            onChange={(e) => handleFacultyChange(e.target.value)}
          >
            {facultyOptions.map((f) => (
              <option key={f} value={f}>
                {f === "ALL" ? "All Faculties" : f}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">All</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
          </select>
          <button className="notif-outline-btn" onClick={handleRefresh}>
            <FiRefreshCw className={refreshing ? "spin" : ""} />
            Refresh
          </button>
          <button className="notif-link-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
        <button
          className="notif-mobile-filter-toggle"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          <FiFilter /> Filters
        </button>
      </section>

      <main className="notif-list">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="notif-error-card">
            <FiX className="notif-error-icon" />
            <p>{error}</p>
            <button onClick={fetchData}>Retry</button>
          </div>
        ) : pagedNotifications.length === 0 ? (
          <EmptyState onRefresh={handleRefresh} />
        ) : (
          <>
            {pagedNotifications.map((notice) => (
              <NotificationCard
                key={notice.noticeId}
                notification={notice}
                isRead={!!readMap[notice.noticeId]}
                formatDate={formatDate}
                formatTime={formatTime}
                onClick={() => handleOpenNotification(notice)}
              />
            ))}
            {filteredNotifications.length > 0 && (
              <p className="notif-showing-text">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filteredNotifications.length)}{" "}
                of {filteredNotifications.length} notifications
              </p>
            )}
          </>
        )}
      </main>

      {!loading && !error && filteredNotifications.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <NotificationDrawer
        notification={selectedNotification}
        isRead={selectedNotification ? !!readMap[selectedNotification.noticeId] : false}
        formatDate={formatDate}
        formatTime={formatTime}
        onClose={handleCloseDrawer}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
}
