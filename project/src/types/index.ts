export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'learner' | 'admin' | 'instructor';
  avatar?: string | null;
  bio?: string;
  location?: string;
  occupation?: string;
  education?: string;
  enrolledCourses: string[];
  completedCourses: string[]; // Add completed courses tracking
  created_at: string;
  // Instructor-specific fields
  payoutEmail?: string;
  expertise?: string;
  isApproved?: boolean;
  // Gamification fields
  points?: number;
  coins?: number;
  currentStreak?: number;
  longestStreak?: number;
  lastActiveDate?: string;
  // Referral fields
  referral_code?: string;
  referred_by?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string; // URL-friendly slug for course
  description: string;
  instructor: string;
  category: string;
  format: string;
  duration: number;
  thumbnail: string;
  price: number;
  is_published: boolean;
  enrolled_count: number;
  created_at: string;
  updated_at: string;
  view_count: number;
  category_id: string;
  instructor_id: string;
  certificatetemplate?: string;
  certificate_template?: string;
  level?: string;
  // lessons?: Lesson[];
  // modules?: Module[];
  // assignments?: Assignment[];
  // rating?: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  lessons: Lesson[];
  assignments?: Assignment[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration?: number; // in minutes
  sort_order: number;
  isCompleted?: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: string;
  maxPoints: number;
  allowedFileTypes: string[];
  maxFileSize: number; // in MB
  moduleId?: string;
  courseId: string;
  isRequired: boolean;
  created_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  courseId: string;
  submittedAt: string;
  files: SubmissionFile[];
  textSubmission?: string;
  status: 'submitted' | 'graded' | 'late' | 'missing';
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
}

export interface SubmissionFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  senderId: string;
  senderName: string;
  recipients: NotificationRecipient[];
  courseId?: string;
  created_at: string;
  scheduledFor?: string;
  isRead?: boolean;
  attachments?: NotificationAttachment[];
  replies?: NotificationReply[];
}

export interface NotificationRecipient {
  userId: string;
  userName: string;
  isRead: boolean;
  readAt?: string;
  isStarred?: boolean;
  starredAt?: string;
}

export interface NotificationReply {
  id: string;
  notificationId: string;
  userId: string;
  userName: string;
  message: string;
  attachments?: NotificationAttachment[];
  created_at: string;
}

export interface NotificationAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  courseCount: number;
}

export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}