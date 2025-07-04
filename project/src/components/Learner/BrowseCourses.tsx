import React, { useState, useEffect } from 'react';
import { Clock, Users, Star, CheckCircle, Award } from 'lucide-react';
import { useCategories } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const FILTERS = [
  { key: 'recentlyViewed', label: 'Based on your recent views' },
  { key: 'highestRated', label: 'Course rating (by stars)' },
  { key: 'basicCourses', label: 'Basic courses' },
  { key: 'newest', label: 'Newest' },
  { key: 'skillsUnder2h', label: 'Skills under 2 hours' },
  { key: 'mostPopular', label: 'Most popular' },
];

function useCourseFilters(selectedCategory, userId) {
  const [filters, setFilters] = useState({
    mostPopular: [],
    newest: [],
    basicCourses: [],
    skillsUnder2h: [],
    highestRated: [],
    recentlyViewed: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchFilters() {
      setFilters(f => ({ ...f, loading: true, error: null }));
      try {
        const categoryParam = selectedCategory === 'all' ? null : selectedCategory;
        const [
          { data: mostPopular },
          { data: newest },
          { data: basicCourses },
          { data: skillsUnder2h },
          { data: highestRated },
          { data: recentlyViewed },
        ] = await Promise.all([
          supabase.rpc('get_most_popular_courses', { category_id: categoryParam, limit_count: 6 }),
          supabase.rpc('get_newest_courses', { category_id: categoryParam, limit_count: 6 }),
          supabase.rpc('get_basic_courses', { category_id: categoryParam, limit_count: 6 }),
          supabase.rpc('get_skills_under_2h_courses', { category_id: categoryParam, limit_count: 6 }),
          supabase.rpc('get_highest_rated_courses', { category_id: categoryParam, limit_count: 6 }),
          userId
            ? supabase.rpc('get_recently_viewed_courses', { user_id: userId, category_id: categoryParam, limit_count: 6 })
            : { data: [] },
        ]);
        setFilters({
          mostPopular: mostPopular || [],
          newest: newest || [],
          basicCourses: basicCourses || [],
          skillsUnder2h: skillsUnder2h || [],
          highestRated: highestRated || [],
          recentlyViewed: recentlyViewed || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        setFilters(f => ({ ...f, loading: false, error: error.message }));
      }
    }
    fetchFilters();
  }, [selectedCategory, userId]);

  return filters;
}

export function BrowseCourses() {
  const { categories, loading: categoriesLoading } = useCategories();
  const { user, updateUserEnrollment } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [enrollingCourses, setEnrollingCourses] = useState<Set<string>>(new Set());
  const filters = useCourseFilters(selectedCategory, user?.id);

  if (categoriesLoading || filters.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (filters.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">{filters.error}</div>
      </div>
    );
  }

  // --- Category Tabs ---
  const categoryTabs = [
    { id: 'all', name: 'All' },
    ...categories,
  ];

  const handleEnrollCourse = async (courseId: string) => {
    if (!user) return;
    if (user.enrolledCourses.includes(courseId)) {
      alert('You are already enrolled in this course!');
      return;
    }
    if (user.completedCourses?.includes(courseId)) {
      alert('You have already completed this course!');
      return;
    }
    setEnrollingCourses(prev => new Set([...prev, courseId]));
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedEnrolledCourses = [...user.enrolledCourses, courseId];
      if (updateUserEnrollment) {
        updateUserEnrollment(updatedEnrolledCourses);
      }
      alert('Successfully enrolled! Check your dashboard to start learning.');
    } catch (error) {
      alert('Enrollment failed. Please try again.');
    } finally {
      setEnrollingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  // --- Course Card ---
  const CourseCard = ({ course }: { course: any }) => {
    const isEnrolled = user?.enrolledCourses.includes(course.id);
    const isCompleted = user?.completedCourses?.includes(course.id);
    const isEnrolling = enrollingCourses.has(course.id);
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow min-w-[270px] max-w-xs flex-shrink-0">
        <div className="relative">
          <img
            src={course.thumbnail}
            alt={course.title}
            className={`w-full h-40 object-cover ${isCompleted ? 'opacity-90' : ''}`}
          />
          <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded text-xs font-medium">
            {course.format}
          </div>
          <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
            ₦{course.price?.toLocaleString?.() ?? course.price}
          </div>
          {isEnrolled && (
            <div className="absolute bottom-4 left-4 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
              Enrolled
            </div>
          )}
          {isCompleted && (
            <div className="absolute bottom-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <Award className="w-3 h-3" />
              Completed
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
          <p className="text-gray-600 mb-2 text-xs line-clamp-2">{course.description}</p>
          <p className="text-xs text-gray-500 mb-2">by {course.instructor}</p>
          <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
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
              <span>{course.rating || 4.8}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-green-600 font-bold">
              <span>₦{course.price?.toLocaleString?.() ?? course.price}</span>
            </div>
            {isCompleted ? (
              <button disabled className="bg-green-400 text-white px-3 py-1 rounded-lg font-medium cursor-not-allowed flex items-center gap-2 text-xs">
                <CheckCircle className="w-4 h-4" /> Completed
              </button>
            ) : isEnrolled ? (
              <button disabled className="bg-gray-400 text-white px-3 py-1 rounded-lg font-medium cursor-not-allowed text-xs">
                Already Enrolled
              </button>
            ) : (
              <button
                onClick={() => handleEnrollCourse(course.id)}
                disabled={isEnrolling}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg font-medium hover:bg-blue-700 transition-colors text-xs flex items-center gap-2"
              >
                {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Courses</h1>
        <p className="text-gray-600">Discover new skills and expand your knowledge</p>
      </div>
      {/* Category Tabs */}
      <div className="flex gap-2 md:gap-4 border-b border-gray-200 pb-2 overflow-x-auto">
        {categoryTabs.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${selectedCategory === category.id ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {category.name}
          </button>
        ))}
      </div>
      {/* Filter Sections */}
      <div className="flex flex-col gap-8">
        {FILTERS.map(filter => (
          <div key={filter.key} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{filter.label}</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {filters[filter.key].length === 0 ? (
                <div className="text-gray-400 italic">No courses found.</div>
              ) : (
                filters[filter.key].map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}