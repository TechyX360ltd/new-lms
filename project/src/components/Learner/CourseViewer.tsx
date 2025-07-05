import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { PlayCircle, FileText, ChevronLeft, ChevronRight, CheckCircle, Calendar, Clock, AlertCircle, XCircle, ChevronDown, ChevronRight as ChevronRightIcon, Menu } from 'lucide-react';
import { Header } from '../Layout/Header';

export function CourseViewer() {
  const { courseId: courseIdParam } = useParams<{ courseId?: string }>();
  const courseId = courseIdParam || '';
  const navigate = useNavigate();
  const { getCourseById, loading } = useCourses();
  const { user } = useAuth();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const course = getCourseById(courseId);
  const lessons = course?.lessons || [];
  const assignments = course?.assignments || [];
  const modules = course?.modules && course.modules.length > 0
    ? course.modules
    : [{ id: 'default', title: 'Course Content', description: '', sort_order: 1, lessons, assignments: [] }];
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set([modules[0]?.id || 'default'])
  );
  const currentLesson = lessons[currentLessonIndex];
  const isLastLesson = currentLessonIndex === lessons.length - 1;
  const progress = lessons.length > 0 ? Math.round((completedLessons.size / lessons.length) * 100) : 0;

  const handleNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };
  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };
  const handleMarkComplete = () => {
    if (currentLesson && !completedLessons.has(currentLesson.id)) {
      setCompletedLessons(prev => new Set([...prev, currentLesson.id]));
    }
  };
  const handleLessonSelect = (idx: number) => {
    setCurrentLessonIndex(idx);
    setMobileSidebarOpen(false); // close sidebar on mobile after selecting
  };
  const handleModuleToggle = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  // Assignment status helpers (mocked for now)
  const getAssignmentStatus = (assignment: { dueDate: string }) => {
    const isOverdue = new Date() > new Date(assignment.dueDate);
    return isOverdue ? 'missing' : 'pending';
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'graded':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'late':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'missing':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'graded':
        return 'Graded';
      case 'late':
        return 'Late Submission';
      case 'missing':
        return 'Missing';
      default:
        return 'Pending';
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'graded':
        return 'bg-blue-100 text-blue-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'missing':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (!course) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Course not found</h3>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-700">
          Go back
        </button>
      </div>
    );
  }

  // Mobile sidebar (drawer)
  const MobileSidebar = () => (
    <div className={`fixed inset-0 z-50 bg-black bg-opacity-40 flex lg:hidden transition-opacity ${mobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}> 
      <div className={`bg-white w-72 max-w-full h-full shadow-xl transform transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="font-bold text-lg text-gray-900">Course Modules</span>
          <button onClick={() => setMobileSidebarOpen(false)} className="text-gray-500 hover:text-blue-600 p-2">
            <XCircle className="w-6 h-6" />
          </button>
              </div>
        <div className="p-4 overflow-y-auto">
            <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="border border-gray-100 rounded-xl shadow-sm">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-t-xl focus:outline-none hover:bg-blue-50 transition-colors"
                  onClick={() => handleModuleToggle(module.id)}
                >
                  <span className="font-semibold text-gray-800 text-left">{module.title}</span>
                  {expandedModules.has(module.id) ? (
                    <ChevronDown className="w-5 h-5 text-blue-600" />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedModules.has(module.id) && (
                  <ul className="py-2 px-2 space-y-1 bg-white rounded-b-xl">
                    {module.lessons.map((lesson, idx) => {
                      const globalIdx = lessons.findIndex((l) => l.id === lesson.id);
                      return (
                        <li key={lesson.id}>
                <button
                            onClick={() => handleLessonSelect(globalIdx)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                              globalIdx === currentLessonIndex
                                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            {lesson.videoUrl ? (
                              <PlayCircle className="w-5 h-5 text-blue-500" />
                            ) : (
                              <FileText className="w-5 h-5 text-gray-400" />
                            )}
                            <span className="font-medium truncate">{lesson.title}</span>
                            {completedLessons.has(lesson.id) && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Overlay click closes drawer */}
      <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
    </div>
  );

      return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <MobileSidebar />
      <div className="flex flex-1 flex-row">
        {/* Sidebar: Module/Lesson Accordion (desktop only) */}
        <aside className="hidden lg:block w-72 bg-white border-r border-gray-200 p-6 overflow-y-auto sticky top-0 h-[calc(100vh-64px)]">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Course Modules</h3>
          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="border border-gray-100 rounded-xl shadow-sm">
          <button
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-t-xl focus:outline-none hover:bg-blue-50 transition-colors"
                  onClick={() => handleModuleToggle(module.id)}
                >
                  <span className="font-semibold text-gray-800 text-left">{module.title}</span>
                  {expandedModules.has(module.id) ? (
                    <ChevronDown className="w-5 h-5 text-blue-600" />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  )}
          </button>
          {expandedModules.has(module.id) && (
                  <ul className="py-2 px-2 space-y-1 bg-white rounded-b-xl">
                    {module.lessons.map((lesson, idx) => {
                      const globalIdx = lessons.findIndex((l) => l.id === lesson.id);
                return (
                  <li key={lesson.id}>
                    <button
                            onClick={() => handleLessonSelect(globalIdx)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                              globalIdx === currentLessonIndex
                                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            {lesson.videoUrl ? (
                              <PlayCircle className="w-5 h-5 text-blue-500" />
                            ) : (
                              <FileText className="w-5 h-5 text-gray-400" />
                            )}
                            <span className="font-medium truncate">{lesson.title}</span>
                      {completedLessons.has(lesson.id) && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
          </div>
    </aside>
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center p-2 lg:p-4 w-full">
          <div className="w-full bg-white rounded-2xl shadow-xl p-4 lg:p-6">
            {/* Mobile: Back, Title/Desc (no hamburger here) */}
            <div className="flex items-center gap-2 mb-6 sm:gap-4">
              <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-700 whitespace-nowrap">&larr; Back</button>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight truncate">{course.title}</h1>
                <p className="text-gray-600 text-base leading-tight truncate">{course.description}</p>
              </div>
            </div>
            <div className="mb-8">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-blue-500 to-green-400" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-xs text-gray-500">Progress: {progress}%</div>
            </div>
            {currentLesson ? (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${currentLesson.videoUrl ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {currentLesson.videoUrl ? 'Video Lesson' : 'Text Lesson'}
                  </span>
                  <span className="text-gray-400 text-xs">Lesson {currentLessonIndex + 1} of {lessons.length}</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{currentLesson.title}</h2>
                {currentLesson.videoUrl ? (
                  <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-6">
                    <video controls className="w-full h-full object-contain rounded-xl">
                      <source src={currentLesson.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
      </div>
                ) : (
                  <div className="prose prose-blue max-w-none text-gray-800 mb-6 whitespace-pre-line">
                    {currentLesson.content}
      </div>
                )}
                {/* Mobile/Responsive Navigation Buttons */}
                <div className="flex gap-2 mt-4 justify-between">
          <button
            onClick={handlePreviousLesson}
            disabled={currentLessonIndex === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
                    <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <button
                    onClick={handleMarkComplete}
            disabled={completedLessons.has(currentLesson.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
          >
                    <CheckCircle className="w-4 h-4" />
            {completedLessons.has(currentLesson.id) ? 'Completed' : 'Mark as Complete'}
          </button>
                  {!isLastLesson ? (
          <button
            onClick={handleNextLesson}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => alert('Congratulations! You have completed the course.')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                    >
                      <CheckCircle className="w-4 h-4" /> Complete Course
          </button>
                  )}
                </div>
        </div>
            ) : (
              <div className="text-gray-500">No lessons found for this course.</div>
            )}
            {/* Assignment Section */}
            {assignments.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Assignments</h2>
            <div className="space-y-6">
                  {assignments.map((assignment) => {
                    const status = getAssignmentStatus(assignment);
                    return (
                      <div key={assignment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>{getStatusText(status)}</div>
                                {assignment.isRequired && (
                                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Required</div>
                                )}
    </div>
                              <p className="text-gray-600 mb-3">{assignment.description}</p>
        </div>
                            <div className="flex items-center gap-2 ml-4">{getStatusIcon(status)}</div>
            </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>Points: {assignment.maxPoints}</span>
              </div>
            </div>
                          <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">View / Submit Assignment</button>
          </div>
        </div>
                    );
                  })}
              </div>
              </section>
            )}
          </div>
        </main>
            </div>
      {/* Floating Hamburger (mobile only, top left below header, hidden when sidebar open) */}
      {!mobileSidebarOpen && (
              <button
          className="block lg:hidden fixed z-50 top-4 left-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-2 transition-colors"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open course modules"
        >
          <Menu className="w-5 h-5" />
              </button>
      )}
    </div>
  );
}