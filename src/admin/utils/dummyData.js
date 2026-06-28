// Centralized dummy/mock data used across the admin dashboard.
// Replace with real API calls (see services/) once the backend is ready.

export const statsData = {
  totalUsers: 12482,
  teachers: 84,
  students: 11320,
  categories: 15,
  pendingPayments: 120,
  monthlyRevenue: 4.2, // in lakhs / displayed as "Rs 4.2M" style label
  liveClasses: 6,
  exams: 24,
}

export const revenueTrend = [12, 19, 14, 22, 28, 24, 30, 26, 34, 31, 38, 42]
export const registrationTrend = [40, 55, 48, 70, 65, 80, 76, 90, 85, 95, 100, 110]

export const paymentStatusBreakdown = [
  { label: 'Approved', value: 68, color: 'var(--success)' },
  { label: 'Pending', value: 22, color: 'var(--warning)' },
  { label: 'Rejected', value: 10, color: 'var(--danger)' },
]

export const enrollmentDistribution = [
  { name: 'NEB Grade 12 Physics', value: 3105 },
  { name: 'IOE Entrance Preparation', value: 2410 },
  { name: 'CMAT Entrance Prep', value: 1380 },
  { name: 'Class 10 Compulsory Math', value: 980 },
]

export const recentUsers = [
  { id: 1, name: 'Aayush Shrestha', email: 'aayush.s@gmail.com', avatar: 'AS', joined: '2 hours ago', role: 'Student' },
  { id: 2, name: 'Sita Thapa', email: 'sita.thapa@gmail.com', avatar: 'ST', joined: '5 hours ago', role: 'Teacher' },
  { id: 3, name: 'Bipin Karki', email: 'bipin.k@gmail.com', avatar: 'BK', joined: '1 day ago', role: 'Student' },
]

export const recentPayments = [
  { id: 1, student: 'Anish Sharma', course: 'NEB Grade 12 Physics', amount: 'Rs 3,500', status: 'Pending' },
  { id: 2, student: 'Riya Karki', course: 'IOE Entrance Prep', amount: 'Rs 5,200', status: 'Approved' },
  { id: 3, student: 'Suresh Pandey', course: 'CMAT Prep', amount: 'Rs 2,800', status: 'Pending' },
]

export const recentActivities = [
  { id: 1, text: 'Dr. Hemant Sharma published "Vector Calculus Masterclass"', time: '12 minutes ago' },
  { id: 2, text: 'System Admin removed draft content "Intro to Bio-Chemistry"', time: '1 hour ago' },
  { id: 3, text: 'Ms. Pooja Verma updated "The Great Gatsby Analysis" PDF', time: '3 hours ago' },
]

export const upcomingLiveClasses = [
  { id: 1, title: 'Advanced Quantum Lecture III', teacher: 'Dr. Hemant', time: 'Today, 4:00 PM' },
  { id: 2, title: 'Newton\'s Laws Workshop', teacher: 'Sarah Miller', time: 'Tomorrow, 10:00 AM' },
]

// ----- USERS -----
export const usersData = [
  { id: 1, name: 'Akhilesh Sharma', email: 'akhilesh.sharma@gmail.com', college: 'Kathmandu University', role: 'Student', status: 'Active', joined: 'Jan 12, 2024', lastLogin: '2 hours ago', avatar: 'AS' },
  { id: 2, name: 'Dr. Sarita Thapa', email: 'sarita.thapa@gmail.com', college: 'Tribhuvan University', role: 'Teacher', status: 'Active', joined: 'Feb 02, 2024', lastLogin: '5 hours ago', avatar: 'ST' },
  { id: 3, name: 'Mitesh Pandey', email: 'mitesh.p@gmail.com', college: 'Patan College', role: 'Student', status: 'Inactive', joined: 'Mar 18, 2024', lastLogin: '4 days ago', avatar: 'MP' },
  { id: 4, name: 'Anjali KC', email: 'anjali.kc@gmail.com', college: 'St. Xavier\'s College', role: 'Student', status: 'Active', joined: 'Apr 09, 2024', lastLogin: '1 hour ago', avatar: 'AK' },
  { id: 5, name: 'Prof. Bina Karki', email: 'bina.karki@gmail.com', college: 'Kathmandu University', role: 'Teacher', status: 'Active', joined: 'May 06, 2024', lastLogin: '30 minutes ago', avatar: 'BK' },
  { id: 6, name: 'Rohan Maharjan', email: 'rohan.m@gmail.com', college: 'Patan College', role: 'Student', status: 'Suspended', joined: 'Jun 15, 2024', lastLogin: '2 weeks ago', avatar: 'RM' },
]

export const collegesList = ['Kathmandu University', 'Tribhuvan University', 'Patan College', "St. Xavier's College"]

// ----- CATEGORIES -----
export const categoriesData = [
  { id: 1, name: 'NEB Physics Grade 12', description: 'Foundations of Mechanics, Optics & Electromagnetism for NEB board.', students: 3105, posts: 48, status: 'Active', color: '#2563EB' },
  { id: 2, name: 'IOE Entrance Preparation', description: 'Engineering entrance prep: Math, Physics & Chemistry combined.', students: 2410, posts: 65, status: 'Active', color: '#7C3AED' },
  { id: 3, name: 'NEB Business Studies', description: 'Principles of management, accounting & finance for grade 11/12.', students: 1740, posts: 31, status: 'Active', color: '#16A34A' },
  { id: 4, name: 'CMAT Entrance Prep', description: 'Complete management aptitude test preparation course.', students: 1380, posts: 27, status: 'Draft', color: '#D97706' },
  { id: 5, name: 'Class 10 Compulsory Math', description: 'SEE board complete syllabus with model questions.', students: 980, posts: 40, status: 'Active', color: '#DC2626' },
  { id: 6, name: 'Organic Chemistry Basics', description: 'Reaction mechanisms and named reactions, simplified.', students: 760, posts: 19, status: 'Inactive', color: '#0891B2' },
]

// ----- CONTENT -----
export const contentData = [
  { id: 1, title: 'Calculus III: Multiple Integrals', category: 'NEB Physics Grade 12', type: 'PDF', teacher: 'Dr. Hemant Sharma', uploaded: '24 Jan 2024', views: 482 },
  { id: 2, title: 'Introduction to Quantum Physics', category: 'NEB Physics Grade 12', type: 'Video', teacher: 'Prof. Rajesh Karki', uploaded: '20 Jan 2024', views: 951 },
  { id: 3, title: 'Monthly Science Assessment - October', category: 'Class 10 Compulsory Math', type: 'Exam', teacher: 'System Admin', uploaded: '18 Jan 2024', views: 1320 },
  { id: 4, title: 'Advanced English Literature Review', category: 'NEB Business Studies', type: 'Notes', teacher: 'Ms. Pooja Verma', uploaded: '15 Jan 2024', views: 274 },
  { id: 5, title: 'Mobile App Launch Demo', category: 'IOE Entrance Preparation', type: 'Video', teacher: 'Sarah Miller', uploaded: '11 Jan 2024', views: 633 },
]

export const contentTabs = ['All', 'Posts', 'Notes', 'PDFs', 'Videos', 'Exams']

// ----- PAYMENTS -----
export const paymentsData = [
  { id: 1, student: 'Anish Sharma', studentId: 'STU-2024-4413', course: 'NEB Grade 12 Physics', amount: 'Rs 3,500', date: 'Jan 24, 2024', status: 'Pending', method: 'eSewa', screenshot: true },
  { id: 2, student: 'Rina Thapa', studentId: 'STU-2024-2210', course: 'IOE Entrance Prep', amount: 'Rs 5,200', date: 'Jan 23, 2024', status: 'Approved', method: 'Khalti', screenshot: true },
  { id: 3, student: 'Suresh Pandey', studentId: 'STU-2024-9091', course: 'CMAT Prep', amount: 'Rs 2,800', date: 'Jan 22, 2024', status: 'Rejected', method: 'Bank Transfer', screenshot: true },
  { id: 4, student: 'Kiran KC', studentId: 'STU-2024-1145', course: 'NEB Business Studies', amount: 'Rs 1,900', date: 'Jan 21, 2024', status: 'Pending', method: 'eSewa', screenshot: true },
]

export const paymentStats = { pending: 120, approved: 980, rejected: 64, revenue: '4.2M' }

// ----- GRADING -----
export const gradingSubmissions = [
  { id: 1, student: 'Aayush Shrestha', exam: 'Monthly Test Mid-Term 2024', marks: null, status: 'Pending', avatar: 'AS' },
  { id: 2, student: 'Bibek Bhattarai', exam: 'Monthly Test Mid-Term 2024', marks: 78, status: 'Graded', avatar: 'BB' },
  { id: 3, student: 'Rakshya Gurung', exam: 'Monthly Test Mid-Term 2024', marks: null, status: 'Pending', avatar: 'RG' },
  { id: 4, student: 'Manish Koirala', exam: 'Monthly Test Mid-Term 2024', marks: 88, status: 'Graded', avatar: 'MK' },
]
export const gradingStats = { pending: 14, graded: 226, average: 68.5 }

// ----- LIVE CLASSES -----
export const liveClassesData = [
  { id: 1, title: 'Quantum Mechanics Foundations', teacher: 'Dr. Hemant Sharma', category: 'NEB Physics Grade 12', date: 'Jan 25, 2024', time: '10:00 AM', status: 'Upcoming', link: 'meet.us/edu842...' },
  { id: 2, title: 'Microeconomics Principles', teacher: 'Sarah Miller', category: 'NEB Business Studies', date: 'Jan 25, 2024', time: '02:00 PM', status: 'Ongoing', link: 'teams.us/edu...' },
  { id: 3, title: 'Monthly Science Assessment - October', teacher: 'System Admin', category: 'Class 10 Compulsory Math', date: 'Jan 24, 2024', time: '04:00 PM', status: 'Completed', link: '-' },
  { id: 4, title: 'Advanced English Literature Discussion', teacher: 'Anil Pradhan', category: 'NEB Business Studies', date: 'Jan 23, 2024', time: 'Yesterday', status: 'Completed', link: '-' },
]
export const liveClassStats = { upcoming: 54, ongoing: 1, completed: 98 }

// ----- BANNERS -----
export const bannersData = [
  { id: 1, title: 'Back to School Campaign', uploaded: 'Jan 21, 2024', status: 'Active' },
  { id: 2, title: 'Winter Admission Live', uploaded: 'Jan 18, 2024', status: 'Active' },
  { id: 3, title: 'Summer Scholarship', uploaded: 'Jan 10, 2024', status: 'Inactive' },
  { id: 4, title: 'Mobile App Launch', uploaded: 'Jan 02, 2024', status: 'Active' },
]
