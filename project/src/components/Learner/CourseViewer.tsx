import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, ChevronLeft, BookOpen, Video, FileText, Menu, X } from 'lucide-react';
import { useCourses, useUsers, useCourseStructure } from '../../hooks/useData';
import { Header } from '../Layout/Header';
import { Sidebar } from '../Layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { getLessonNote, upsertLessonNote, getLessonDiscussions, addLessonDiscussion, isValidUUID } from '../../lib/supabase';
import { Course, Module, Lesson, Assignment, User } from '../../types';

// Types for discussion and notes
interface Discussion {
  id: string;
  lesson_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  replies?: Discussion[];
}

interface LessonNote {
  id: string;
  lesson_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function CourseViewer() {
  const { courseSlug } = useParams<{ courseSlug?: string }>();
  const navigate = useNavigate();
  const { getCourseBySlug } = useCourses();
  const { user } = useAuth();
  const { users: allUsers, loading: usersLoading } = useUsers();

  // State management
  const [moduleIdx, setModuleIdx] = useState(0);
  const [lessonIdx, setLessonIdx] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'notes' | 'discussion'>('content');
  
  // Notes state
  const [notes, setNotes] = useState<{ [lessonId: string]: string }>({});
  const [notesSaved, setNotesSaved] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  
  // Discussion state
  const [discussionLoading, setDiscussionLoading] = useState(false);
  const [discussionError, setDiscussionError] = useState<string | null>(null);
  const [discussionInput, setDiscussionInput] = useState('');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [replyInputs, setReplyInputs] = useState<{ [parentId: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Course data fetching
  const course = getCourseBySlug(courseSlug || '');
  const courseId = course?.id;
  const shouldFetchStructure = courseId && isValidUUID(courseId);
  const { modules, loading: modulesLoading, error: modulesError } = useCourseStructure(shouldFetchStructure ? courseId : '');

  // Debug logging
  console.log('CourseViewer Debug:', {
    courseSlug,
    courseId,
    shouldFetchStructure,
    modules,
    modulesLoading,
    modulesError
  });

  // Current module and lesson
  const currentModule = modules[moduleIdx] || { lessons: [], assignments: [] };
  const lessons = currentModule.lessons || [];
  const currentLesson = lessons[lessonIdx];
  const isLastLesson = lessonIdx === lessons.length - 1;
  const isLastModule = moduleIdx === modules.length - 1;
  const showAssignment = isLastLesson && currentModule.assignments && currentModule.assignments.length > 0;

  // Navigation handlers
  const handleNext = () => {
    if (showAssignment) {
      alert('Assignment for this module!');
      return;
    }
    if (isLastLesson) {
      if (!isLastModule) {
        setModuleIdx(moduleIdx + 1);
        setLessonIdx(0);
      } else {
        setShowCompleteModal(true);
      }
    } else {
      setLessonIdx(lessonIdx + 1);
    }
  };

  const handlePrev = () => {
    if (lessonIdx > 0) {
      setLessonIdx(lessonIdx - 1);
    } else if (moduleIdx > 0) {
      const prevModule = modules[moduleIdx - 1];
      setModuleIdx(moduleIdx - 1);
      setLessonIdx((prevModule?.lessons?.length || 1) - 1);
    }
  };

  const handleSelectLesson = (modIdx: number, lesIdx: number) => {
    setModuleIdx(modIdx);
    setLessonIdx(lesIdx);
    setShowSidebar(false);
  };

  // Notes management
  useEffect(() => {
    if (!user || !currentLesson?.id) return;
    
    setNoteLoading(true);
    setNoteError(null);
    
    getLessonNote(user.id, currentLesson.id)
      .then((result) => {
        if (result && 'error' in result && result.error) {
          setNoteError(result.error.message);
        } else if (result && 'note' in result && result.note) {
          setNotes(prev => ({ ...prev, [currentLesson.id]: result.note.content || '' }));
        }
      })
      .catch(e => setNoteError(e.message))
      .finally(() => setNoteLoading(false));
  }, [user, currentLesson?.id]);

  const handleSaveNotes = async () => {
    if (!user || !currentLesson?.id) return;
    
    setNoteLoading(true);
    setNoteError(null);
    
    try {
      const { error } = await upsertLessonNote(user.id, currentLesson.id, notes[currentLesson.id] || '');
      if (error) setNoteError(error.message);
      else {
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 1200);
      }
    } catch (e: any) {
      setNoteError(e.message);
    } finally {
      setNoteLoading(false);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!currentLesson?.id) return;
    setNotes(prev => ({ ...prev, [currentLesson.id]: e.target.value }));
  };

  // Discussion management
  useEffect(() => {
    if (!currentLesson?.id) return;
    
    setDiscussionLoading(true);
    setDiscussionError(null);
    
    getLessonDiscussions(currentLesson.id)
      .then((result) => {
        if (result && 'error' in result && result.error) {
          setDiscussionError(result.error.message);
        } else if (result && 'discussions' in result && result.discussions) {
          setDiscussions(result.discussions);
        }
      })
      .catch(e => setDiscussionError(e.message))
      .finally(() => setDiscussionLoading(false));
  }, [currentLesson?.id]);

  const handleAddDiscussion = async () => {
    if (!user || !currentLesson?.id || !discussionInput.trim()) return;
    // Debug log for payload
    console.log('Posting discussion:', {
      user_id: user.id,
      lesson_id: currentLesson.id,
      content: discussionInput.trim()
    });
    try {
      const { error } = await addLessonDiscussion(user.id, currentLesson.id, discussionInput.trim());
      if (error) {
        setDiscussionError(error.message);
      } else {
        setDiscussionInput('');
        // Refresh discussions
        const result = await getLessonDiscussions(currentLesson.id);
        if (result && 'discussions' in result && result.discussions) {
          setDiscussions(result.discussions);
        }
      }
    } catch (e: any) {
      setDiscussionError(e.message);
    }
  };

  const handleReplyInputChange = (parentId: string, value: string) => {
    setReplyInputs(prev => ({ ...prev, [parentId]: value }));
  };

  const handleAddReply = async (parentId: string) => {
    if (!user || !currentLesson?.id || !replyInputs[parentId]?.trim()) return;
    try {
      const { error } = await addLessonDiscussion(user.id, currentLesson.id, replyInputs[parentId].trim(), parentId);
      if (error) {
        setDiscussionError(error.message);
      } else {
        setReplyInputs(prev => ({ ...prev, [parentId]: '' }));
        // Refresh discussions
        const result = await getLessonDiscussions(currentLesson.id);
        if (result && 'discussions' in result && result.discussions) {
          setDiscussions(result.discussions);
        }
      }
    } catch (e: any) {
      setDiscussionError(e.message);
    }
  };

  // Content rendering
  const renderContent = () => {
    if (!currentLesson) {
      return <div className="text-gray-600">No lesson found.</div>;
    }

    if (currentLesson.video_url && currentLesson.content) {
      return (
        <div>
          <div className="mb-4">
            <Video className="inline w-6 h-6 mr-2 text-blue-500" />
            <span className="font-bold">Video Lesson</span>
          </div>
          <video controls className="w-full rounded-xl mb-4">
            <source src={currentLesson.video_url} type="video/mp4" />
          </video>
          <div className="prose max-w-none text-gray-800 whitespace-pre-line">
            {currentLesson.content}
          </div>
        </div>
      );
    } else if (currentLesson.video_url) {
      return (
        <div>
          <div className="mb-4">
            <Video className="inline w-6 h-6 mr-2 text-blue-500" />
            <span className="font-bold">Video Lesson</span>
          </div>
          <video controls className="w-full rounded-xl">
            <source src={currentLesson.video_url} type="video/mp4" />
          </video>
        </div>
      );
    } else if (currentLesson.content) {
      return (
        <div>
          <div className="mb-4">
            <FileText className="inline w-6 h-6 mr-2 text-blue-500" />
            <span className="font-bold">Text Lesson</span>
          </div>
          <div className="prose max-w-none text-gray-800 whitespace-pre-line">
            {currentLesson.content}
          </div>
        </div>
      );
    }

    return <div className="text-gray-600">No content available for this lesson.</div>;
  };

  // Progress calculation
  const completedLessons = lessons.filter((_, idx) => idx < lessonIdx);
  const progress = lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0;

  // Loading and error states
  if (modulesLoading) {
    return (
      <>
        <Header />
        <div className="flex w-full h-full">
          <div className="flex-1 p-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (modulesError) {
    return (
      <>
        <Header />
        <div className="flex w-full h-full">
          <div className="flex-1 p-4">
            <div className="text-red-600 font-semibold">
              Error loading course content: {modulesError}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Header />
        <div className="flex w-full h-full">
          <div className="flex-1 p-4">
            <div className="text-red-600 font-semibold">
              Course not found.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex w-full h-full">
        {/* Modern Sidebar */}
        <aside className="w-72 bg-gray-50 p-4 h-full">
          <h2 className="font-bold text-lg mb-4">Course Modules</h2>
          {modules.map((module, modIdx) => (
            <div
              key={module.id}
              className="bg-white rounded-xl shadow-sm mb-4"
            >
              <div className="font-bold text-blue-700 px-4 pt-2 pb-1">
                {module.title}
              </div>
              <ul>
                {module.lessons && module.lessons.length > 0 ? (
                  module.lessons.map((lesson, lesIdx) => {
                    const isActive = modIdx === moduleIdx && lesIdx === lessonIdx;
                    return (
                      <li key={lesson.id}>
                        <button
                          className={`flex items-center gap-2 w-full text-left px-6 py-2 text-base rounded-lg transition-colors duration-150
                            ${isActive
                              ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-700 font-semibold'
                              : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          onClick={() => handleSelectLesson(modIdx, lesIdx)}
                        >
                          <span className="text-lg">📖</span>
                          <span className="truncate">{lesson.title}</span>
                        </button>
                      </li>
                    );
                  })
                ) : (
                  <li className="px-6 py-2 text-sm text-gray-400">No lessons in this module</li>
                )}
              </ul>
            </div>
          ))}
        </aside>
        {/* Main content */}
        <div className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-2">{course?.title}</h1>
          
          {/* Lesson navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrev}
              disabled={moduleIdx === 0 && lessonIdx === 0}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            
            <div className="text-center">
              <div className="text-sm text-gray-600">
                Lesson {lessonIdx + 1} of {lessons.length} in {currentModule.title}
              </div>
              <div className="text-lg font-semibold">
                {currentLesson?.title || 'No lesson selected'}
              </div>
            </div>
            
            <button
              onClick={handleNext}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isLastLesson && isLastModule ? 'Complete Course' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Content tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {['content', 'notes', 'discussion'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as 'content' | 'notes' | 'discussion')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab content */}
          <div className="min-h-[400px]">
            {activeTab === 'content' && (
              <div className="prose max-w-none">
                {renderContent()}
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <div className="mb-4">
                  <textarea
                    value={notes[currentLesson?.id || ''] || ''}
                    onChange={handleNotesChange}
                    placeholder="Take notes on this lesson..."
                    className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={noteLoading}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleSaveNotes}
                    disabled={noteLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {noteLoading ? 'Saving...' : notesSaved ? 'Saved!' : 'Save Notes'}
                  </button>
                  {noteError && <div className="text-red-600 text-sm">{noteError}</div>}
                </div>
              </div>
            )}

            {activeTab === 'discussion' && (
              <div>
                <div className="mb-4">
                  <textarea
                    value={discussionInput}
                    onChange={(e) => setDiscussionInput(e.target.value)}
                    placeholder="Start a discussion..."
                    className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddDiscussion}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Post Discussion
                  </button>
                </div>
                
                {discussionLoading && <div className="text-gray-600">Loading discussions...</div>}
                {discussionError && <div className="text-red-600 text-sm">{discussionError}</div>}
                
                <div className="space-y-4">
                  {discussions.map((discussion) => (
                    <div key={discussion.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                        <div>
                          <div className="font-medium">
                            {discussion.user?.first_name} {discussion.user?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(discussion.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-800 mb-3">{discussion.content}</div>
                      
                      {/* Reply button */}
                      <button
                        onClick={() => setReplyingTo(replyingTo === discussion.id ? null : discussion.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Reply
                      </button>
                      
                      {/* Reply input */}
                      {replyingTo === discussion.id && (
                        <div className="mt-3">
                          <textarea
                            value={replyInputs[discussion.id] || ''}
                            onChange={(e) => handleReplyInputChange(discussion.id, e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full h-20 p-2 border border-gray-300 rounded resize-none"
                          />
                          <button
                            onClick={() => handleAddReply(discussion.id)}
                            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
                          >
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Course Completed!</h3>
            <p className="text-gray-600 mb-6">
              Congratulations! You have completed all lessons in this course.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  navigate('/dashboard');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}image.png