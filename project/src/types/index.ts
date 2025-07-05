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
  createdAt: string;
  // Instructor-specific fields
  payoutEmail?: string;
  expertise?: string;
  isApproved?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  category: string;
  format: 'text' | 'video' | 'mixed';
  duration: number; // in hours
  thumbnail: string;
  lessons: Lesson[];
  modules?: Module[]; // Add modules support
  assignments?: Assignment[]; // Add assignments support
  price: number;
  isPublished: boolean;
  enrolledCount: number;
  createdAt: string;
  rating?: number;
  /**
   * Use 'certificateTemplate' for UI/state, and 'certificatetemplate' for DB sync (matches DB column).
   */
  certificateTemplate?: 'default' | 'modern' | 'elegant';
  certificatetemplate?: 'default' | 'modern' | 'elegant';
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
  createdAt: string;
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
  createdAt: string;
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
  createdAt: string;
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
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}