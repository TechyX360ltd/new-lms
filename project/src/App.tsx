import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
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

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm onToggleForm={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggleForm={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(
    user?.role === 'admin' ? 'overview' : 'dashboard'
  );
  const [viewingCourseId, setViewingCourseId] = useState<string | null>(null);
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);

  // Handle course viewing
  const handleViewCourse = (courseId: string) => {
    setViewingCourseId(courseId);
  };

  const handleBackFromCourse = () => {
    setViewingCourseId(null);
    setActiveTab('dashboard');
  };

  // If viewing a course, show the course viewer
  if (viewingCourseId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CourseViewer courseId={viewingCourseId} onBack={handleBackFromCourse} />
      </div>
    );
  }

  // If showing certificate preview, show the modal
  if (showCertificatePreview) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 lg:p-8 overflow-auto">
            <CertificatePreview onClose={() => setShowCertificatePreview(false)} />
          </main>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (user?.role === 'admin') {
      switch (activeTab) {
        case 'overview':
          return <AdminOverview />;
        case 'users':
          return <UserManagement />;
        case 'courses':
          return <CourseManagement />;
        case 'schools':
          return <SchoolManagement />;
        case 'progress-tracking':
          return <ProgressTracking />;
        case 'notifications':
          return <NotificationCenter />;
        case 'certificates':
          setShowCertificatePreview(true);
          return null;
        case 'categories':
          return <div className="p-4 lg:p-8 text-center text-gray-500">Categories management coming soon...</div>;
        case 'payments':
          return <PaymentManagement />;
        case 'analytics':
          return <Analytics />;
        case 'settings':
          return <Settings />;
        default:
          return <AdminOverview />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard':
          return <LearnerDashboard onTabChange={setActiveTab} onViewCourse={handleViewCourse} />;
        case 'courses':
          return <CourseList onTabChange={setActiveTab} onViewCourse={handleViewCourse} />;
        case 'browse':
          return <BrowseCourses />;
        case 'notifications':
          return <LearnerNotificationCenter />;
        case 'certificates':
          return <Certificates />;
        case 'progress':
          return <Progress />;
        case 'profile':
          return <Profile />;
        default:
          return <LearnerDashboard onTabChange={setActiveTab} onViewCourse={handleViewCourse} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? <Dashboard /> : <AuthPage />}
      <SupabaseConnectionStatus />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;