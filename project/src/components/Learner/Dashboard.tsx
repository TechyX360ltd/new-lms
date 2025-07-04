import React from 'react';
import { BookOpen, Clock, Award, TrendingUp, Users } from 'lucide-react';
import { useCourses } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { WelcomeModal } from './WelcomeModal';
import { supabase } from '../../lib/supabase';

interface LearnerDashboardProps {
  onTabChange?: (tab: string) => void;
  onViewCourse?: (courseId: string) => void;
}

export function LearnerDashboard({ onTabChange, onViewCourse }: LearnerDashboardProps) {
  const { courses, loading: coursesLoading } = useCourses();
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = React.useState(false);
  const [stats, setStats] = React.useState<{
    enrolled_courses: number;
    hours_completed: number;
    certificates: number;
    average_progress: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = React.useState(false);
  const [statsError, setStatsError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user?.role === 'learner') {
      const dismissed = localStorage.getItem('welcomeModalDismissed');
      if (!dismissed) setShowWelcome(true);
    }
  }, [user]);

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      setStatsLoading(true);
      setStatsError(null);
      try {
        const { data, error } = await supabase.rpc('get_learner_dashboard_stats', { user_id: user.id });
        if (error) throw error;
        if (data && data.length > 0) {
          setStats(data[0]);
        } else {
          setStats({ enrolled_courses: 0, hours_completed: 0, certificates: 0, average_progress: 0 });
        }
      } catch (err: any) {
        setStatsError('Failed to load stats.');
        setStats(null);
      } finally {
        setStatsLoading(false);
      }
    };
    if (user?.id) fetchStats();
  }, [user]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('welcomeModalDismissed', 'true');
  };

  if (coursesLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">{statsError}</div>
      </div>
    );
  }

  const enrolledCourses = courses.filter(course => user?.enrolledCourses.includes(course.id));

  const statsArray = [
    {
      title: 'Enrolled Courses',
      value: stats?.enrolled_courses ?? 0,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      title: 'Hours Completed',
      value: stats?.hours_completed ?? 0,
      icon: Clock,
      color: 'bg-green-500',
    },
    {
      title: 'Certificates',
      value: stats?.certificates ?? 0,
      icon: Award,
      color: 'bg-purple-500',
    },
    {
      title: 'Progress',
      value: stats ? `${Math.round(stats.average_progress)}%` : '0%',
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
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName}!
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
        {statsArray.map((stat, index) => {
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
      {stats?.enrolled_courses === 0 && (
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
              // You may want to fetch per-course progress from backend as well
              return (
                <div key={course.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-2">{course.description}</p>
                  </div>
                  <button
                    onClick={() => handleContinueCourse(course.id)}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}