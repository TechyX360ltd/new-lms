import React from 'react';
import { BookOpen, Clock, Award, TrendingUp, Users, FolderOpen } from 'lucide-react';
import { useCourses } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { WelcomeModal } from './WelcomeModal';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';

interface LearnerDashboardProps {}

export function LearnerDashboard({}: LearnerDashboardProps) {
  const { courses, loading: coursesLoading } = useCourses();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { onViewCourse } = useOutletContext<{ onViewCourse: (courseId: string) => void }>();
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
    navigate('/dashboard/browse');
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
      {enrolledCourses.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Continue Learning</h2>
            <button
              onClick={() => navigate('/dashboard/courses')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm lg:text-base"
            >
              View All Courses →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {enrolledCourses.slice(0, 3).map((course) => (
              <div key={course.id} className="bg-gray-50 rounded-lg p-4 lg:p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base line-clamp-2 mb-2">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <Clock className="w-3 h-3" />
                      <span>{course.duration} hours</span>
                    </div>
                    <button
                      onClick={() => handleContinueCourse(course.id)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8 border border-gray-100">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/dashboard/courses')}
            className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
          >
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">My Courses</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/browse')}
            className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
          >
            <FolderOpen className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium text-gray-900">Browse Courses</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/certificates')}
            className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
          >
            <Award className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">Certificates</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/progress')}
            className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
          >
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-medium text-gray-900">Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
}