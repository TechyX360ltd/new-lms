import React, { useState } from 'react';
import { Search, Filter, Clock, Users, Star, CheckCircle, Award } from 'lucide-react';
import { useCourses, useCategories } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';

export function BrowseCourses() {
  const { courses, loading: coursesLoading } = useCourses();
  const { categories, loading: categoriesLoading } = useCategories();
  const { user, updateUserEnrollment } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [enrollingCourses, setEnrollingCourses] = useState<Set<string>>(new Set());

  if (coursesLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleEnrollCourse = async (courseId: string) => {
    if (!user) return;
    
    // Check if already enrolled
    if (user.enrolledCourses.includes(courseId)) {
      alert('You are already enrolled in this course!');
      return;
    }

    // Check if already completed
    if (user.completedCourses?.includes(courseId)) {
      alert('You have already completed this course!');
      return;
    }

    setEnrollingCourses(prev => new Set([...prev, courseId]));
    
    try {
      // Simulate enrollment process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user's enrolled courses
      const updatedEnrolledCourses = [...user.enrolledCourses, courseId];
      
      // Update the user in localStorage and context
      if (updateUserEnrollment) {
        updateUserEnrollment(updatedEnrolledCourses);
      }
      
      // Update course enrollment count
      const course = courses.find(c => c.id === courseId);
      if (course) {
        // Here you would typically update the course enrollment count in your backend
        console.log(`Enrolled in course: ${course.title}`);
        alert(`Successfully enrolled in "${course.title}"! Check your dashboard to start learning.`);
      }
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert('Enrollment failed. Please try again.');
    } finally {
      setEnrollingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesFormat = selectedFormat === 'all' || course.format === selectedFormat;
    
    return matchesSearch && matchesCategory && matchesFormat && course.isPublished;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Courses</h1>
        <p className="text-gray-600">Discover new skills and expand your knowledge</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Schools</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Formats</option>
              <option value="text">Text Only</option>
              <option value="video">Video Only</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const isEnrolled = user?.enrolledCourses.includes(course.id);
          const isCompleted = user?.completedCourses?.includes(course.id);
          const isEnrolling = enrollingCourses.has(course.id);
          
          return (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className={`w-full h-48 object-cover ${isCompleted ? 'opacity-90' : ''}`}
                />
                <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded text-sm font-medium">
                  {course.format}
                </div>
                <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                  ₦{course.price.toLocaleString()}
                </div>
                {isEnrolled && (
                  <div className="absolute bottom-4 left-4 bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium">
                    Enrolled
                  </div>
                )}
                {isCompleted && (
                  <div className="absolute bottom-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Completed
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-gray-600 mb-3 text-sm line-clamp-2">{course.description}</p>
                <p className="text-sm text-gray-500 mb-4">by {course.instructor}</p>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
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
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-green-600 font-bold">
                    <span>₦{course.price.toLocaleString()}</span>
                  </div>
                  {isCompleted ? (
                    <button 
                      disabled
                      className="bg-green-400 text-white px-4 py-2 rounded-lg font-medium cursor-not-allowed flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </button>
                  ) : isEnrolled ? (
                    <button 
                      disabled
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg font-medium cursor-not-allowed"
                    >
                      Already Enrolled
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleEnrollCourse(course.id)}
                      disabled={isEnrolling}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}