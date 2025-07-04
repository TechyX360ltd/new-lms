import React from 'react';
import { BookOpen, Clock, Award, TrendingUp, Users } from 'lucide-react';
import { useCourses } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { WelcomeModal } from './WelcomeModal';

interface LearnerDashboardProps {
  onTabChange?: (tab: string) => void;
  onViewCourse?: (courseId: string) => void;
}

export function LearnerDashboard({ onTabChange, onViewCourse }: LearnerDashboardProps) {
  const { courses, loading } = useCourses();
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = React.useState(false);

  React.useEffect(() => {
    if (user?.role === 'learner') {
      const dismissed = localStorage.getItem('welcomeModalDismissed');
      if (!dismissed) setShowWelcome(true);
    }
  }, [user]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('welcomeModalDismissed', 'true');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const enrolledCourses = courses.filter(course => 
    user?.enrolledCourses.includes(course.id)
  );

  // Calculate real-time statistics based on user's actual data
  const totalEnrolledCourses = enrolledCourses.length;
  
  // Calculate total hours from enrolled courses
  const totalHours = enrolledCourses.reduce((total, course) => total + course.duration, 0);
  
  // For demo purposes, assume 68% average progress across enrolled courses
  const averageProgress = totalEnrolledCourses > 0 ? 68 : 0;
  
  // Calculate completed hours based on progress
  const completedHours = Math.round((totalHours * averageProgress) / 100);
  
  // Calculate certificates (assume 1 certificate per completed course)
  // For demo, assume courses with >80% progress are completed
  const completedCourses = averageProgress > 80 ? totalEnrolledCourses : 0;

  const stats = [
    {
      title: 'Enrolled Courses',
      value: totalEnrolledCourses,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      title: 'Hours Completed',
      value: completedHours,
      icon: Clock,
      color: 'bg-green-500',
    },
    {
      title: 'Certificates',
      value: completedCourses,
      icon: Award,
      color: 'bg-purple-500',
    },
    {
      title: 'Progress',
      value: totalEnrolledCourses > 0 ? `${averageProgress}%` : '0%',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  const handleBrowseCourses = () => {
    if (onTabChange) {
      onTabChange('browse');
    }
  };

  const handleJoinCommunity = () => {
    // Updated WhatsApp community link
    window.open('https://chat.whatsapp.com/Beu0xCMTdVu3ZVxoUOjSwN', '_blank');
  };

  const handleContinueCourse = (courseId: string) => {
    if (onViewCourse) {
      onViewCourse(courseId);
    }
  };

  return (
    <div className="space-y-8">
      {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Continue your learning journey with TECHYX 360</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleJoinCommunity}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-lg transform hover:scale-105"
          >
            <Users className="w-5 h-5" />
            <span className="hidden sm:inline">Join WhatsApp Community</span>
            <span className="sm:hidden">Join Community</span>
          </button>
          <div className="hidden md:block">
            <img 
              src="/BLACK-1-removebg-preview.png" 
              alt="TECHYX 360" 
              className="h-10 w-auto opacity-60"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 lg:w-12 lg:h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Welcome Message for New Users */}
      {totalEnrolledCourses === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 lg:p-8 border border-blue-100">
          <div className="text-center">
            <BookOpen className="w-12 lg:w-16 h-12 lg:h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Start Your Learning Journey!</h3>
            <p className="text-gray-600 mb-6">
              Welcome to TECHYX 360! You haven't enrolled in any courses yet. 
              Browse our extensive catalog and start learning today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleBrowseCourses}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Browse Courses
              </button>
              <button
                onClick={handleJoinCommunity}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                Join Community
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Courses */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Continue Learning</h2>
        
        {enrolledCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 lg:w-16 h-12 lg:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled</h3>
            <p className="text-gray-600 mb-6">Browse our course catalog to get started</p>
            <button 
              onClick={handleBrowseCourses}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {enrolledCourses.map((course, index) => {
              // Generate different progress for each course for demo
              const courseProgress = Math.max(20, Math.min(95, averageProgress + (index * 10) - 15));
              
              return (
                <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-36 sm:h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">{course.instructor}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">{course.duration}h</span>
                      <span className="text-sm font-medium text-blue-600">Progress: {courseProgress}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${courseProgress}%` }}
                      ></div>
                    </div>
                    
                    <button 
                      onClick={() => handleContinueCourse(course.id)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Continue Course
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Learning Tips for New Users */}
      {totalEnrolledCourses > 0 && totalEnrolledCourses <= 2 && (
        <div className="bg-green-50 rounded-xl p-4 lg:p-6 border border-green-100">
          <h3 className="text-lg font-bold text-green-900 mb-2">💡 Learning Tips</h3>
          <div className="text-sm text-green-800 space-y-2">
            <p>• Set aside dedicated time each day for learning</p>
            <p>• Take notes and practice what you learn</p>
            <p>• Join our WhatsApp community for discussions and support</p>
            <p>• Complete courses to earn certificates and boost your profile</p>
          </div>
          <div className="mt-4">
            <button
              onClick={handleJoinCommunity}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Join Our Community
            </button>
          </div>
        </div>
      )}
    </div>
  );
}