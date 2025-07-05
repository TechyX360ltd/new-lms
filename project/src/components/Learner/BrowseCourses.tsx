import React, { useState, useEffect } from 'react';
import { Clock, Users, Star, CheckCircle, Award } from 'lucide-react';
import { useCategories } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { PaystackButton } from 'react-paystack';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const FILTERS = [
  { key: 'recentlyViewed', label: 'Based on your recent views' },
  { key: 'highestRated', label: 'Course rating (by stars)' },
  { key: 'basicCourses', label: 'Basic courses' },
  { key: 'newest', label: 'Newest' },
  { key: 'skillsUnder2h', label: 'Skills under 2 hours' },
  { key: 'mostPopular', label: 'Most popular' },
];

export function BrowseCourses() {
  const { categories, loading: categoriesLoading } = useCategories();
  const { user, updateUserEnrollment } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [enrollingCourses, setEnrollingCourses] = useState<Set<string>>(new Set());
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const PAYSTACK_PUBLIC_KEY = 'pk_test_78329ea72cb43b6435a12075cb3a2bca07ec53be'; // TODO: Replace with your real key
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setError(null);
      let query = supabase.from('courses').select('*').eq('is_published', true);
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }
      const { data, error } = await query;
      if (error) {
        setError(error.message);
        setCourses([]);
      } else {
        setCourses(data || []);
      }
      setLoading(false);
    }
    fetchCourses();
  }, [selectedCategory]);

  if (categoriesLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  // --- Category Tabs ---
  const categoryTabs = [
    { id: 'all', name: 'All', courseCount: null },
    ...categories,
  ];

  const handleEnrollCourse = (course: any) => {
    setSelectedCourse(course);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (reference: any) => {
    // Call your enrollment logic here (e.g., updateUserEnrollment)
    if (user && selectedCourse) {
      if (updateUserEnrollment) {
        updateUserEnrollment([...user.enrolledCourses, selectedCourse.id]);
      }
    }
    setShowPaymentModal(false);
    setSelectedCourse(null);
    setShowSuccessModal(true);
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    setSelectedCourse(null);
  };

  const handleStartLearning = () => {
    setShowSuccessModal(false);
    navigate('/my-courses'); // Adjust this route if your "My Courses" page uses a different path
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
          <p className="text-xs mb-2">
            by{' '}
            <Link
              to={`/instructor/${course.instructorId}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {course.instructor}
            </Link>
          </p>
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
                      onClick={() => handleEnrollCourse(course)}
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
            {category.id !== 'all' && typeof category.courseCount === 'number' && (
              <span className="ml-1 text-xs text-gray-500">({category.courseCount})</span>
            )}
          </button>
        ))}
        </div>
      {/* Filter Sections */}
      <div className="flex flex-col gap-8">
        {FILTERS.map(filter => (
          <div key={filter.key} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{filter.label}</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {courses.length === 0 ? (
                <div className="text-gray-400 italic">No courses found.</div>
              ) : (
                courses.map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Payment Modal */}
      {showPaymentModal && selectedCourse && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Proceed to Payment</h2>
            <div className="w-12 h-1 bg-blue-100 rounded-full mb-4"></div>
            <p className="text-gray-700 text-center mb-6">
              You are about to enroll in <span className="font-semibold text-blue-700">{selectedCourse.title}</span>
              <br />
              <span className="text-lg font-bold text-green-700 mt-2 block">
                ₦{selectedCourse.price?.toLocaleString?.() ?? selectedCourse.price}
              </span>
            </p>
            <PaystackButton
              publicKey={PAYSTACK_PUBLIC_KEY}
              email={user?.email || 'test@example.com'}
              amount={selectedCourse.price * 100}
              currency="NGN"
              text="Pay with Paystack"
              onSuccess={handlePaymentSuccess}
              onClose={handlePaymentClose}
              metadata={{ courseId: selectedCourse.id, userId: user?.id }}
              className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-6 py-3 rounded-lg font-semibold text-lg w-full mb-3"
            />
            <button
              onClick={handlePaymentClose}
              className="w-full py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          {/* Confetti Animation */}
          <Confetti width={width} height={height} numberOfPieces={250} recycle={false} />
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center animate-scale-in">
            <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M8 12l2 2l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">Congratulations!</h2>
            <div className="w-12 h-1 bg-green-100 rounded-full mb-4"></div>
            <p className="text-gray-700 text-center mb-6">
              You have just taken the <span className="font-semibold text-green-700">first step to success</span>.<br />
              Your enrollment was successful. Start learning now and unlock your full potential!
            </p>
            <button
              onClick={handleStartLearning}
              className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-lg transition-colors shadow-md"
            >
              Start Learning
            </button>
          </div>
        </div>
      )}
    </div>
  );
}