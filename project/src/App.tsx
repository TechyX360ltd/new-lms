import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { ResetPasswordPage } from './components/Auth/ResetPasswordPage';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { LearnerDashboard } from './components/Learner/Dashboard';
import { CourseList } from './components/Learner/CourseList';
import { BrowseCourses } from './components/Learner/BrowseCourses';
import { CourseViewer } from './components/Learner/CourseViewer';
import { Certificates } from './components/Learner/Certificates';
import { Progress } from './components/Learner/Progress';
import { Profile } from './components/Learner/Profile';
import { LearnerNotificationCenter } from './components/Learner/NotificationCenter';
import { AdminOverview } from './components/Admin/Overview';
import { UserManagement } from './components/Admin/UserManagement';
import { CourseManagement } from './components/Admin/CourseManagement';
import { SchoolManagement } from './components/Admin/SchoolManagement';
import { ProgressTracking } from './components/Admin/ProgressTracking';
import { NotificationCenter } from './components/Admin/NotificationCenter';
import { CertificatePreview } from './components/Admin/CertificatePreview';
import { Analytics } from './components/Admin/Analytics';
import { Settings } from './components/Admin/Settings';
import { PaymentManagement } from './components/Admin/PaymentManagement';
import { SupabaseConnectionStatus } from './components/SupabaseConnectionStatus';
import { InstructorProfile } from './components/Learner/InstructorProfile';
import { InstructorDashboard } from './components/Instructor/InstructorDashboard';
import { ToastProvider } from './components/Auth/ToastContext';
import { CategoryManagement } from './components/Admin/CategoryManagement';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import { InstructorProfilePage } from './components/Learner/InstructorProfilePage';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm
            onToggleForm={() => setIsLogin(false)}
            formData={formData}
            setFormData={setFormData}
            error={error}
            setError={setError}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        ) : (
          <RegisterForm onToggleForm={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}

// Dashboard Layout Component
function DashboardLayout() {
  const { user } = useAuth();
  const [viewingCourseId, setViewingCourseId] = useState<string | null>(null);
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);

  // Handle course viewing
  const handleViewCourse = (courseId: string) => {
    setViewingCourseId(courseId);
  };

  const handleBackFromCourse = () => {
    setViewingCourseId(null);
  };

  // If viewing a course, show the course viewer
  if (viewingCourseId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CourseViewer />
      </div>
    );
  }

  // If showing certificate preview, show the modal
  if (showCertificatePreview) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 lg:p-8 overflow-auto">
            <CertificatePreview onClose={() => setShowCertificatePreview(false)} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet context={{ onViewCourse: handleViewCourse, setShowCertificatePreview }} />
        </main>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (!allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth Route */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate 
                to={user?.role === 'admin' ? '/admin/overview' : '/dashboard'} 
                replace 
              />
            ) : (
              <AuthPage />
            )
          }
        />

        {/* Reset Password Route */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Instructor Routes */}
        <Route
          path="/instructor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/profile"
          element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <InstructorProfile />
            </ProtectedRoute>
          }
        />
        {/* Public Instructor Profile Route */}
        <Route
          path="/instructor/:instructorId"
          element={<InstructorProfilePage />}
        />

        {/* Learner Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['learner', 'instructor']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<LearnerDashboard />} />
          <Route path="courses" element={<CourseList />} />
          <Route path="browse" element={<BrowseCourses />} />
          <Route path="notifications" element={<LearnerNotificationCenter />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="progress" element={<Progress />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="overview" element={<AdminOverview />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="schools" element={<SchoolManagement />} />
          <Route path="progress-tracking" element={<ProgressTracking />} />
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="payments" element={<PaymentManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Course Viewer Route */}
        <Route path="/course/:courseId" element={<CourseViewer />} />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SupabaseConnectionStatus />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;