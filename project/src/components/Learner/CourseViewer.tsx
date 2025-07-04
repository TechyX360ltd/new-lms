import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, CheckCircle, Clock, BookOpen, FileText, Video, Download, Award, ChevronDown, ChevronRight, Upload, Timer, Lock, AlertCircle } from 'lucide-react';
import { Course, Lesson, Assignment, AssignmentSubmission } from '../../types';
import { useCourses } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { AssignmentList } from './AssignmentList';
import { AssignmentSubmissionComponent } from './AssignmentSubmission';

interface CourseViewerProps {
  courseId: string;
  onBack: () => void;
}

// Timer Component
function StudyTimer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(time => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTime(0);
    setIsRunning(false);
  };

  return (
    <div className="flex items-center gap-2 lg:gap-3 bg-blue-50 px-3 lg:px-4 py-2 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2">
        <Timer className="w-4 lg:w-5 h-4 lg:h-5 text-blue-600" />
        <span className="text-base lg:text-lg font-mono font-bold text-blue-800">
          {formatTime(time)}
        </span>
      </div>
      <div className="flex gap-1">
        <button
          onClick={toggleTimer}
          className={`px-2 lg:px-3 py-1 rounded text-xs font-medium transition-colors ${
            isRunning 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          className="px-2 lg:px-3 py-1 rounded text-xs font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export function CourseViewer({ courseId, onBack }: CourseViewerProps) {
  const { getCourseById } = useCourses();
  const { user, completeCourse } = useAuth();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [showCertificateRequest, setShowCertificateRequest] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'lessons' | 'assignments'>('lessons');
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const course = getCourseById(courseId);

  // Check if course is completed
  const isCourseCompleted = user?.completedCourses?.includes(courseId) || false;

  // Move the useEffect hook to the top, before any conditional returns
  useEffect(() => {
    if (course) {
      // Get modules or create default structure
      const modules = (course as any).modules || [{
        id: 'default-module',
        title: 'Course Content',
        description: 'Main course content',
        sort_order: 1,
        lessons: course.lessons
      }];
      
      // Expand all modules by default
      setExpandedModules(new Set(modules.map((m: any) => m.id)));
    }
  }, [course]);

  if (!course) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Course not found</h3>
        <button onClick={onBack} className="text-blue-600 hover:text-blue-700">
          Go back
        </button>
      </div>
    );
  }

  // If course is completed, show completion message and restrict access
  if (isCourseCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 lg:p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 border border-gray-200">
            <div className="mb-6">
              <div className="w-16 lg:w-20 h-16 lg:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 lg:w-10 h-8 lg:h-10 text-green-600" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Course Completed! 🎉</h1>
              <p className="text-base lg:text-lg text-gray-600 mb-4">
                Congratulations! You have successfully completed <strong>{course.title}</strong>
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 lg:p-6 border border-green-200 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-5 lg:w-6 h-5 lg:h-6 text-green-600" />
                <h3 className="text-base lg:text-lg font-semibold text-green-900">What you've achieved:</h3>
              </div>
              <ul className="text-left space-y-2 text-sm lg:text-base text-green-800">
                <li>✓ Completed all course lessons</li>
                <li>✓ Earned your certificate of completion</li>
                <li>✓ Gained valuable skills and knowledge</li>
                <li>✓ Ready to apply what you've learned</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 lg:p-6 border border-blue-200 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-5 lg:w-6 h-5 lg:h-6 text-blue-600" />
                <h3 className="text-base lg:text-lg font-semibold text-blue-900">Course Access</h3>
              </div>
              <p className="text-sm lg:text-base text-blue-800">
                Since you've completed this course, the content is no longer accessible. 
                This helps maintain the integrity of your achievement and encourages you to explore new learning opportunities.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <Award className="w-6 lg:w-8 h-6 lg:h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-purple-900 mb-1">Your Certificate</h4>
                  <p className="text-sm text-purple-700">Download and share your achievement</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                  <BookOpen className="w-6 lg:w-8 h-6 lg:h-8 text-indigo-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-indigo-900 mb-1">Explore More</h4>
                  <p className="text-sm text-indigo-700">Discover new courses to continue learning</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={onBack}
                  className="bg-blue-600 text-white px-6 lg:px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Dashboard
                </button>
                <button
                  onClick={() => {
                    onBack();
                  }}
                  className="bg-purple-600 text-white px-6 lg:px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5" />
                  View Certificate
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Course completed on {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get modules or create default structure
  const modules = (course as any).modules || [{
    id: 'default-module',
    title: 'Course Content',
    description: 'Main course content',
    sort_order: 1,
    lessons: course.lessons
  }];

  const allLessons = modules.flatMap((module: any) => module.lessons);
  const currentLesson = allLessons[currentLessonIndex];
  const progressPercentage = Math.round((completedLessons.size / allLessons.length) * 100);
  const isLastLesson = currentLessonIndex === allLessons.length - 1;
  const allLessonsCompleted = completedLessons.size === allLessons.length;

  const handleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const handleCompleteCourse = () => {
    setShowCertificateRequest(true);
  };

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleViewAssignment = (assignment: Assignment) => {
    setViewingAssignment(assignment);
  };

  const handleSubmitAssignment = (assignment: Assignment) => {
    setSubmittingAssignment(assignment);
  };

  const handleAssignmentSubmission = (submission: Omit<AssignmentSubmission, 'id' | 'submittedAt'>) => {
    // Save submission to localStorage
    const newSubmission: AssignmentSubmission = {
      ...submission,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString()
    };

    const existingSubmissions = JSON.parse(localStorage.getItem(`submissions-${user?.id}`) || '[]');
    localStorage.setItem(`submissions-${user?.id}`, JSON.stringify([...existingSubmissions, newSubmission]));

    setSubmittingAssignment(null);
    alert('Assignment submitted successfully!');
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-blue-300 pl-4 italic text-gray-600 my-4">$1</blockquote>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-6 mb-4">$1</h2>')
      .replace(/^• (.*$)/gm, '<li class="ml-6 mb-2">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-6 mb-2">$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline hover:text-blue-800">$1</a>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>');
  };

  if (showCertificateRequest) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CertificateRequest 
          course={course} 
          user={user} 
          onBack={() => setShowCertificateRequest(false)}
          onReturnToDashboard={onBack}
          onCompleteCourse={() => completeCourse(courseId)}
        />
      </div>
    );
  }

  if (submittingAssignment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AssignmentSubmissionComponent
          assignment={submittingAssignment}
          onBack={() => setSubmittingAssignment(null)}
          onSubmit={handleAssignmentSubmission}
        />
      </div>
    );
  }

  if (viewingAssignment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4 lg:p-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setViewingAssignment(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Course
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">{viewingAssignment.title}</h1>
            <p className="text-gray-600 mb-6">{viewingAssignment.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Due: {new Date(viewingAssignment.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Points: {viewingAssignment.maxPoints}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>{viewingAssignment.isRequired ? 'Required' : 'Optional'}</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
              <div 
                className="text-blue-800 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: viewingAssignment.instructions.replace(/\n/g, '<br>') }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSubmittingAssignment(viewingAssignment)}
                className="bg-blue-600 text-white px-4 lg:px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Submit Assignment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header with Enhanced Design and Timer */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 lg:p-6 z-30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium hidden sm:inline">Back to Dashboard</span>
              <span className="font-medium sm:hidden">Back</span>
            </button>
            
            {/* Enhanced Course Title */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-lg blur-xl"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-lg px-3 lg:px-6 py-2 lg:py-3 border border-gray-200/50 shadow-sm">
                <h1 className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                  {course.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                  <p className="text-sm lg:text-base text-gray-600 font-medium">by {course.instructor}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-6">
            {/* Study Timer */}
            <StudyTimer />
            
            {/* Progress Display */}
            <div className="text-right">
              <p className="text-sm text-gray-600 font-medium">Progress</p>
              <div className="flex items-center gap-2">
                <div className="w-12 lg:w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500 shadow-sm" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-lg lg:text-xl font-bold text-blue-600">{progressPercentage}%</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-700 shadow-lg relative overflow-hidden" 
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Started</span>
            <span>{completedLessons.size} of {allLessons.length} lessons completed</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'lessons'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-white border border-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Lessons</span>
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'assignments'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-white border border-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Assignments</span>
          </button>
        </div>
      </div>

      <div className="flex pt-44 lg:pt-52">
        {/* Mobile Sidebar Toggle */}
        {activeTab === 'lessons' && (
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden fixed bottom-4 right-4 z-30 p-3 bg-blue-600 text-white rounded-full shadow-lg"
          >
            <BookOpen className="w-6 h-6" />
          </button>
        )}

        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Fixed Sidebar - Module-Based Course Content */}
        {activeTab === 'lessons' && (
          <div className={`
            fixed lg:static top-44 lg:top-52 bottom-0 left-0 z-20
            w-80 bg-white border-r border-gray-200 overflow-y-auto shadow-lg
            transform transition-transform duration-300 ease-in-out
            ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="p-4 lg:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Course Content
              </h2>
              <div className="space-y-3">
                {modules.map((module: any, moduleIndex: number) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    {/* Module Header */}
                    <button
                      onClick={() => toggleModuleExpansion(module.id)}
                      className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                          {moduleIndex + 1}
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{module.title}</h3>
                          <p className="text-xs text-gray-500">{module.lessons.length} lessons</p>
                        </div>
                      </div>
                      <div className="transform transition-transform duration-200 group-hover:scale-110">
                        {expandedModules.has(module.id) ? 
                          <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        }
                      </div>
                    </button>

                    {/* Module Lessons */}
                    {expandedModules.has(module.id) && (
                      <div className="border-t border-gray-200 bg-white">
                        {module.lessons.map((lesson: any, lessonIndex: number) => {
                          const globalLessonIndex = allLessons.findIndex(l => l.id === lesson.id);
                          const isCompleted = completedLessons.has(lesson.id);
                          const isCurrent = globalLessonIndex === currentLessonIndex;
                          
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => {
                                setCurrentLessonIndex(globalLessonIndex);
                                setShowSidebar(false);
                              }}
                              className={`w-full text-left p-3 transition-all duration-200 border-b border-gray-100 last:border-b-0 group ${
                                isCurrent 
                                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 shadow-sm' 
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-3 ml-4">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                                  isCompleted 
                                    ? 'bg-green-100 text-green-600 shadow-sm' 
                                    : isCurrent 
                                      ? 'bg-blue-100 text-blue-600 shadow-sm scale-110' 
                                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                }`}>
                                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : lessonIndex + 1}
                                </div>
                                <div className="flex-1">
                                  <h4 className={`font-medium text-sm transition-colors ${
                                    isCurrent ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-600'
                                  }`}>
                                    {lesson.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">{lesson.duration || 15} min</span>
                                    {lesson.videoUrl && <Video className="w-3 h-3 text-purple-400" />}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area - Scrollable */}
        <div className={`flex-1 ${activeTab === 'lessons' ? 'lg:ml-80' : ''} bg-gray-50 min-h-screen`}>
          <div className="p-4 lg:p-8">
            {activeTab === 'lessons' ? (
              currentLesson ? (
                <div className="bg-white rounded-xl shadow-sm p-4 lg:p-8 border border-gray-100">
                  <div className="mb-6 lg:mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                        Lesson {currentLessonIndex + 1} of {allLessons.length}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {currentLesson.duration || 15} minutes
                      </span>
                    </div>
                    
                    {/* Enhanced Lesson Title */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/5 to-gray-700/5 rounded-lg blur-xl"></div>
                      <h1 className="relative text-2xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent leading-tight">
                        {currentLesson.title}
                      </h1>
                      <div className="mt-2 h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Video Player (if video URL exists) */}
                  {currentLesson.videoUrl && (
                    <div className="mb-6 lg:mb-8">
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl aspect-video flex items-center justify-center shadow-2xl border border-gray-700">
                        <div className="text-center text-white">
                          <div className="w-16 lg:w-20 h-16 lg:h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Play className="w-8 lg:w-10 h-8 lg:h-10 text-white ml-1" />
                          </div>
                          <p className="text-lg lg:text-xl font-semibold mb-2">Video Player</p>
                          <p className="text-sm opacity-70">Video URL: {currentLesson.videoUrl}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Lesson Content */}
                  <div className="prose max-w-none mb-6 lg:mb-8">
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 lg:p-8 border border-blue-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
                        </div>
                        <h3 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                          Lesson Content
                        </h3>
                      </div>
                      <div 
                        className="text-gray-700 leading-relaxed text-base lg:text-lg"
                        dangerouslySetInnerHTML={{
                          __html: `<div class="mb-4">${formatContent(currentLesson.content || 'This lesson content will be available soon. Please check back later for updates.')}</div>`
                        }}
                      />
                    </div>
                  </div>

                  {/* Rich Text Formatting Examples */}
                  <div className="bg-green-50 rounded-xl p-4 lg:p-6 mb-6 lg:mb-8 border border-green-100">
                    <h4 className="text-base lg:text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      Rich Text Formatting Examples
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                      <div className="space-y-2">
                        <p><strong>**Bold text**</strong> → <strong>Bold text</strong></p>
                        <p><em>*Italic text*</em> → <em>Italic text</em></p>
                        <p><u>__Underlined text__</u> → <u>Underlined text</u></p>
                        <p><code>`Code text`</code> → <code className="bg-gray-100 px-1 rounded">Code text</code></p>
                      </div>
                      <div className="space-y-2">
                        <p>## Heading → <strong>Large Heading</strong></p>
                        <p>• Bullet point → • Bullet point</p>
                        <p>&gt; Quote → <em>Quoted text</em></p>
                        <p>[Link](url) → <span className="text-blue-600 underline">Link</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Lesson Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-6 lg:pt-8 border-t border-gray-200 gap-4">
                    <button
                      onClick={handlePreviousLesson}
                      disabled={currentLessonIndex === 0}
                      className="w-full sm:w-auto px-6 lg:px-8 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      Previous Lesson
                    </button>

                    <div className="flex flex-col sm:flex-row gap-4">
                      {!completedLessons.has(currentLesson.id) && (
                        <button
                          onClick={() => handleLessonComplete(currentLesson.id)}
                          className="px-6 lg:px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg transform hover:scale-105"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Mark Complete
                        </button>
                      )}

                      {isLastLesson && allLessonsCompleted ? (
                        <button
                          onClick={handleCompleteCourse}
                          className="px-6 lg:px-8 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-xl transform hover:scale-105"
                        >
                          <Award className="w-5 h-5" />
                          Complete Course
                        </button>
                      ) : (
                        <button
                          onClick={handleNextLesson}
                          disabled={currentLessonIndex === allLessons.length - 1}
                          className="px-6 lg:px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 group"
                        >
                          Next Lesson
                          <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No lesson selected</h3>
                  <p className="text-gray-600">Select a lesson from the sidebar to start learning</p>
                </div>
              )
            ) : (
              <AssignmentList
                courseId={courseId}
                onViewAssignment={handleViewAssignment}
                onSubmitAssignment={handleSubmitAssignment}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Certificate Request Component
function CertificateRequest({ course, user, onBack, onReturnToDashboard, onCompleteCourse }: {
  course: Course;
  user: any;
  onBack: () => void;
  onReturnToDashboard: () => void;
  onCompleteCourse: () => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificateGenerated, setCertificateGenerated] = useState(false);

  const handleGenerateCertificate = async () => {
    setIsGenerating(true);
    
    // Simulate certificate generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Save certificate to localStorage
    const certificate = {
      id: Date.now().toString(),
      courseId: course.id,
      courseName: course.title,
      userName: user?.name,
      instructor: course.instructor,
      completionDate: new Date().toISOString(),
      certificateUrl: `certificate-${course.id}-${user?.id}.pdf`
    };
    
    const existingCertificates = JSON.parse(localStorage.getItem('userCertificates') || '[]');
    localStorage.setItem('userCertificates', JSON.stringify([...existingCertificates, certificate]));
    
    // Mark course as completed
    onCompleteCourse();
    
    setIsGenerating(false);
    setCertificateGenerated(true);
  };

  const handleDownloadPDF = () => {
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${course.title}-Certificate.pdf`;
    link.click();
    alert('Certificate downloaded as PDF!');
  };

  const handleDownloadPNG = () => {
    // Simulate PNG download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${course.title}-Certificate.png`;
    link.click();
    alert('Certificate downloaded as PNG!');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8">
      <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
        <div className="text-center mb-6 lg:mb-8">
          <Award className="w-12 lg:w-16 h-12 lg:h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Congratulations!</h1>
          <p className="text-gray-600">You have successfully completed the course</p>
        </div>

        {/* Certificate Preview */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-4 border-blue-200 rounded-lg p-6 lg:p-8 mb-6 lg:mb-8">
          <div className="text-center">
            <div className="mb-6">
              <img 
                src="/BLACK-1-removebg-preview.png" 
                alt="TECHYX 360" 
                className="h-8 lg:h-12 w-auto mx-auto mb-4"
              />
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Certificate of Completion</h2>
            </div>
            
            <div className="mb-6">
              <p className="text-base lg:text-lg text-gray-700 mb-2">This is to certify that</p>
              <h3 className="text-2xl lg:text-3xl font-bold text-blue-900 mb-2">{user?.name}</h3>
              <p className="text-base lg:text-lg text-gray-700 mb-2">has successfully completed the course</p>
              <h4 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">{course.title}</h4>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-600">Instructor</p>
                <p className="font-semibold text-gray-900">{course.instructor}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {!certificateGenerated ? (
          <div className="text-center">
            <div className="bg-yellow-50 rounded-lg p-4 lg:p-6 border border-yellow-200 mb-6">
              <div className="flex items-center gap-3 justify-center">
                <AlertCircle className="w-5 lg:w-6 h-5 lg:h-6 text-yellow-600" />
                <p className="text-sm lg:text-base text-yellow-800 font-medium">
                  Generating your certificate will complete this course and restrict further access to the content.
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerateCertificate}
              disabled={isGenerating}
              className="bg-blue-600 text-white px-6 lg:px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              <Award className="w-5 h-5" />
              {isGenerating ? 'Generating Certificate...' : 'Generate Certificate & Complete Course'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-green-600 font-medium mb-4">✓ Certificate generated successfully!</p>
              <p className="text-sm text-gray-600 mb-4">
                Course completed! You can no longer access the course content, but you can download your certificate anytime.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleDownloadPDF}
                className="bg-red-600 text-white px-4 lg:px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <button
                onClick={handleDownloadPNG}
                className="bg-green-600 text-white px-4 lg:px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PNG
              </button>
            </div>
            
            <div className="text-center mt-6">
              <button
                onClick={onReturnToDashboard}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
        
        <div className="flex justify-center mt-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-700 font-medium"
          >
            ← Back to Course
          </button>
        </div>
      </div>
    </div>
  );
}