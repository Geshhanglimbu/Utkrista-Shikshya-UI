import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Users, GraduationCap, ClipboardList, Video } from "lucide-react";

import {
  userService,
  categoryService, // eslint-disable-line no-unused-vars -- kept per required import list, not used directly on this page yet
  examService,
  liveClassService,
  bookingService,
  notificationService,
} from "../../services/api";

import StatsCard from "../../teacher/components/StatsCard";
import UpcomingExamTable from "../../teacher/components/UpcomingExamTable";
import LiveClassCard from "../../teacher/components/LiveClassCard";
import BookingTable from "../../teacher/components/BookingTable";
import ActivityTimeline from "../../teacher/components/ActivityTimeline";
import NotificationPanel from "../../teacher/components/NotificationPanel";
import DashboardSkeleton from "../../teacher/components/DashboardSkeleton";

import "./Dashboard.css";

// NOTE: replace this with however your app already exposes the logged-in
// teacher's id (auth context / hook). Left as a small local helper so this
// file has no dependency on an auth implementation that isn't shown here.
const getCurrentUserId = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored)?.id ?? JSON.parse(stored)?.userId : null;
  } catch {
    return null;
  }
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [exams, setExams] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const userId = useMemo(() => getCurrentUserId(), []);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [
          teachersAndSubscribersRes,
          facultiesRes,
          examsRes,
          liveClassesRes,
          bookingsRes,
          notificationsRes,
        ] = await Promise.all([
          userService.getTeachersAndSubscribers(userId).catch(() => null),
          examService.getAll().catch(() => null),
          liveClassService.getAll().catch(() => null),
          bookingService.getByUserId(userId).catch(() => null),
          userId
            ? notificationService.getAllForUser(userId).catch(() => null)
            : Promise.resolve(null),
        ]);

        if (!isMounted) return;

        // ---- Total Students ----
        // NOTE: adjust this once the real shape of getTeachersAndSubscribers()
        // is confirmed. Assumed shape: an array of { teacherId, subscribers: [] }
        // grouped by teacher, or a flat array of subscriber users.
        const teacherEntries = teachersAndSubscribersRes?.data || [];
        const currentTeacher = teacherEntries.find(
          (item) => item.id === userId
        );

        setFaculties(currentTeacher?.facult || []);
        setTeacherStudents(teacherEntries);

        // ---- My Faculties ----
        setFaculties(facultiesRes?.data || []);

        // ---- Upcoming Exams (future only) ----
        const allExams = examsRes?.data || [];
        const now = new Date();
        const upcomingExams = allExams.filter((exam) => {
          const examDate = new Date(exam.startTime || exam.date);
          return !Number.isNaN(examDate.getTime()) && examDate >= now;
        });
        setExams(upcomingExams);

        // ---- Live Classes (today only) ----
        const allLiveClasses = liveClassesRes?.data || [];
        const todayStr = new Date().toDateString();
        const todaysClasses = allLiveClasses.filter((liveClass) => {
          const classDate = new Date(liveClass.meetingTime || liveClass.startTime);
          return !Number.isNaN(classDate.getTime()) && classDate.toDateString() === todayStr;
        });
        setLiveClasses(todaysClasses);

        // ---- Booking Requests (latest 5) ----
        const allBookings = bookingsRes?.data || [];
        setBookings(allBookings.slice(0, 5));

        // ---- Notifications (latest 5) ----
        const allNotifications = notificationsRes?.data || [];
        setNotifications(allNotifications.slice(0, 5));
      } catch (error) {
        toast.error("Could not load dashboard data. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // ---- Derived stats ----
  const totalStudents = useMemo(() => {
    // NOTE: adjust once the real API shape is confirmed. Falls back to
    // counting the flat array length if it isn't grouped by teacher.
    if (!teacherStudents.length) return 0;
    if (teacherStudents[0]?.subscribers) {
      const mine = teacherStudents.find((entry) => entry.teacherId === userId);
      return mine?.subscribers?.length ?? 0;
    }
    return teacherStudents.length;
  }, [teacherStudents, userId]);

  const liveClassesHappeningNow = liveClasses.filter((c) => c.isLiveNow).length;

  // Placeholder recent activity feed — wire up to a real activity/audit
  // endpoint once one exists on the backend.
  const recentActivity = [
    {
      id: 1,
      studentName: "Student",
      action: "submitted an assignment",
      context: "Recent course",
      timestamp: "Just now",
    },
  ];

  if (loading) {
    return (
      <div className="teacher-dashboard">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      <div className="teacher-dashboard__header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome back, Professor. Here's what's happening today.</p>
        </div>
      </div>

      <div className="teacher-dashboard__stats">
        <StatsCard
          icon={Users}
          iconVariant="blue"
          label="Total Students"
          value={totalStudents}
          helper="Assigned to you"
        />
        <StatsCard
          icon={GraduationCap}
          iconVariant="purple"
          label="My Faculties"
          value={faculties.length}
          helper="Assigned Courses"
        />
        <StatsCard
          icon={ClipboardList}
          iconVariant="teal"
          label="Upcoming Exams"
          value={exams.length}
          helper="This Week"
        />
        <StatsCard
          icon={Video}
          iconVariant="red"
          label="Live Classes Today"
          value={liveClasses.length}
          badge={liveClassesHappeningNow > 0 ? `${liveClassesHappeningNow} Live` : undefined}
          helper="Today's Schedule"
        />
      </div>

      <div className="teacher-dashboard__row">
        <div className="teacher-dashboard__col-wide">
          <UpcomingExamTable exams={exams} />
        </div>
        <div className="teacher-dashboard__col-narrow">
          <div className="live-classes-panel">
            <h3 className="live-classes-panel__title">Today's Live Classes</h3>
            {liveClasses.length === 0 ? (
              <p className="live-classes-panel__empty">No live classes scheduled today.</p>
            ) : (
              liveClasses.map((liveClass) => (
                <LiveClassCard
                  key={liveClass.liveClassId || liveClass.id}
                  liveClass={liveClass}
                  onStart={(item) => {
                    // NOTE: hook this up to your actual meeting-start flow
                    toast.success(`Starting ${item.title || "class"}...`);
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="teacher-dashboard__row">
        
        <div className="teacher-dashboard__col-narrow">
          <BookingTable bookings={bookings} />
        </div>
      </div>

      <div className="teacher-dashboard__row">
        <div className="teacher-dashboard__col-wide">
          <ActivityTimeline activities={recentActivity} />
        </div>
        <div className="teacher-dashboard__col-narrow">
          <NotificationPanel notifications={notifications} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
