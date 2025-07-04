import React, { useState } from 'react';
import { Clock, Users, Star, Play, Eye, Award, CheckCircle } from 'lucide-react';
import { useCourses } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';

interface CourseListProps {}

export function CourseList({}: CourseListProps) {
  const { courses, loading } = useCourses();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { onViewCourse } = useOutletContext<{ onViewCourse: (courseId: string) => void }>();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

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

  const completedCourses = courses.filter(course => 
    user?.completedCourses?.includes(course.id)
  );

  const handleBrowseCourses = () => {
    navigate('/dashboard/browse');
  };

  const handleContinueCourse = (courseId: string) => {
    if (onViewCourse) {
      onViewCourse(courseId);
    }
  };

  const handleViewDetails = (courseId: string) => {
    if (onViewCourse) {
      onViewCourse(courseId);
    }
  };

  const handleViewCertificate = () => {
    navigate('/dashboard/certificates');
  };

  const handleJoinCommunity = () => {
    window.open('https://chat.whatsapp.com/Beu0xCMTdVu3ZVxoUOjSwN', '_blank');
  };

  const currentCourses = activeTab === 'active' ? enrolledCourses : completedCourses;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">Track your learning progress and continue where you left off</p>
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

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedCourses.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {enrolledCourses.length + completedCourses.length > 0 
                  ? Math.round((completedCourses.length / (enrolledCourses.length + completedCourses.length)) * 100)
                  : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="space-y-6">
        {/* Enhanced Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
          <div className="flex">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'active'
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Play className="w-5 h-5" />
              <span>Active Courses</span>
              {enrolledCourses.length > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === 'active' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {enrolledCourses.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'completed'
                  ? 'bg-green-600 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Award className="w-5 h-5" />
              <span>Completed</span>
              {completedCourses.length > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === 'completed' ? 'bg-white text-green-600' : 'bg-green-100 text-green-600'
                }`}>
                  {completedCourses.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Course Grid */}
        {currentCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  {activeTab === 'completed' && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      {course.duration} hours
                    </div>
                  </div>
                </div>
                
                <div className="p-4 lg:p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                                     <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2 text-sm text-gray-500">
                       <Users className="w-4 h-4" />
                       <span>{course.enrolledCount} students</span>
                     </div>
                     <div className="flex items-center gap-1">
                       <Star className="w-4 h-4 text-yellow-400 fill-current" />
                       <span className="text-sm font-medium text-gray-900">4.8</span>
                     </div>
                   </div>

                  <div className="flex gap-2">
                    {activeTab === 'active' ? (
                      <button
                        onClick={() => handleContinueCourse(course.id)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Continue
                      </button>
                    ) : (
                      <button
                        onClick={handleViewCertificate}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Award className="w-4 h-4" />
                        View Certificate
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDetails(course.id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            {activeTab === 'active' ? (
              <>
                <Play className="w-12 lg:w-16 h-12 lg:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active courses</h3>
                <p className="text-gray-600 mb-6">Start learning by enrolling in new courses</p>
                <button 
                  onClick={handleBrowseCourses}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Browse Courses
                </button>
              </>
            ) : (
              <>
                <Award className="w-12 lg:w-16 h-12 lg:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No completed courses yet</h3>
                <p className="text-gray-600 mb-6">Complete your active courses to earn certificates</p>
                <button 
                  onClick={() => setActiveTab('active')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  View Active Courses
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}