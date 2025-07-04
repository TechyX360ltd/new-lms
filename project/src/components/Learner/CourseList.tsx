import React, { useState } from 'react';
import { Clock, Users, Star, Play, Eye, Award, CheckCircle } from 'lucide-react';
import { useCourses } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';

interface CourseListProps {
  onTabChange?: (tab: string) => void;
  onViewCourse?: (courseId: string) => void;
}

export function CourseList({ onTabChange, onViewCourse }: CourseListProps) {
  const { courses, loading } = useCourses();
  const { user } = useAuth();
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
    if (onTabChange) {
      onTabChange('browse');
    }
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
    if (onTabChange) {
      onTabChange('certificates');
    }
  };

  const handleJoinCommunity = () => {
    window.open('https://chat.whatsapp.com/Beu0xCMTdVu3ZVxoUOjSwN', '_blank');
  };

  const currentCourses = activeTab === 'active' ? enrolledCourses : completedCourses;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">Track your progress and continue learning</p>
        </div>
        <button
          onClick={handleJoinCommunity}
          className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Users className="w-5 h-5" />
          <span className="hidden sm:inline">Join Community</span>
          <span className="sm:hidden">Community</span>
        </button>
      </div>

      {enrolledCourses.length === 0 && completedCourses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 lg:p-12 text-center border border-gray-100">
          <Play className="w-12 lg:w-16 h-12 lg:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled</h3>
          <p className="text-gray-600 mb-6">Start your learning journey by enrolling in courses</p>
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
      ) : (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentCourses.map((course, index) => {
                const isCompleted = activeTab === 'completed';
                // Generate different progress for each course for demo
                const courseProgress = isCompleted ? 100 : Math.max(20, Math.min(95, 68 + (index * 10) - 15));
                
                return (
                  <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className={`w-full h-40 sm:h-48 object-cover ${isCompleted ? 'opacity-90' : ''}`}
                      />
                      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        {course.format}
                      </div>
                      <div className={`absolute bottom-4 left-4 px-2 py-1 rounded text-sm font-medium flex items-center gap-1 ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        {isCompleted ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Completed
                          </>
                        ) : (
                          'In Progress'
                        )}
                      </div>
                      {isCompleted && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-10"></div>
                      )}
                    </div>
                    
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
                          <p className="text-gray-600 mb-3 line-clamp-2 text-sm">{course.description}</p>
                          <p className="text-sm text-gray-500">by {course.instructor}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course.enrolledCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>4.8</span>
                        </div>
                        <div className="text-green-600 font-medium">
                          ₦{course.price.toLocaleString()}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className={`text-sm font-medium ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                            {courseProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${courseProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      {isCompleted && (
                        <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                            <span className="font-medium text-green-900">Course Completed!</span>
                          </div>
                          <p className="text-xs sm:text-sm text-green-700">
                            You've earned a certificate for completing this course. 
                            Content access is now restricted as per completion policy.
                          </p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {isCompleted ? (
                          <>
                            <button 
                              onClick={handleViewCertificate}
                              className="flex-1 bg-green-600 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <Award className="w-4 h-4" />
                              View Certificate
                            </button>
                            <button 
                              onClick={() => handleViewDetails(course.id)}
                              className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                              title="View Course Info"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="hidden sm:inline">Info</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleContinueCourse(course.id)}
                              className="flex-1 bg-blue-600 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <Play className="w-4 h-4" />
                              <span className="hidden sm:inline">Continue Learning</span>
                              <span className="sm:hidden">Continue</span>
                            </button>
                            <button 
                              onClick={() => handleViewDetails(course.id)}
                              className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                              title="View Course Details"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="hidden sm:inline">Details</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
      )}
    </div>
  );
}