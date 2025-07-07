import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, ChevronLeft, BookOpen, Video, FileText, Menu, X } from 'lucide-react';
import { useCourses, useUsers, useCourseStructure } from '../../hooks/useData';
import { Header } from '../Layout/Header';
import { Sidebar } from '../Layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { getLessonNote, upsertLessonNote, getLessonDiscussions, addLessonDiscussion } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';

const demoCourse = {
  id: 'demo-1',
  slug: 'demo-course',
  title: 'Demo Course: Web Development',
  description: 'A demo course for web development. Learn the basics of HTML, CSS, and JavaScript.',
  instructor: 'Demo Instructor',
  enrolled_count: 0,
  price: 0,
  avg_rating: 5,
  num_reviews: 0,
  category: 'demo',
  format: 'self-paced',
  duration: 2,
  thumbnail: 'https://via.placeholder.com/600x300?text=Demo+Course',
  lessons: [],
  assignments: [],
  modules: [
    {
      id: 'mod-1',
      title: 'Introduction',
      description: 'Intro to the course',
      sort_order: 1,
      lessons: [
        { id: 'les-1', course_id: 'demo-1', title: 'Welcome', content: 'Welcome to the course! This is a demo lesson.', sort_order: 1, is_published: true, video_url: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'les-2', course_id: 'demo-1', title: 'What is Web Development?', content: 'Web development is the work involved in developing a website for the Internet.', sort_order: 2, is_published: true, video_url: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ],
      assignments: [
        { id: 'ass-1', course_id: 'demo-1', title: 'Intro Quiz', description: 'Take a short quiz on the introduction.', max_points: 10, is_required: true, due_date: new Date(Date.now() + 7*24*60*60*1000).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ]
    },
    {
      id: 'mod-2',
      title: 'HTML Basics',
      description: 'Learn HTML basics',
      sort_order: 2,
      lessons: [
        { id: 'les-3', course_id: 'demo-1', title: 'HTML Overview', content: 'HTML stands for HyperText Markup Language.', sort_order: 1, is_published: true, video_url: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'les-4', course_id: 'demo-1', title: 'HTML Elements', content: 'Elements are the building blocks of HTML.', sort_order: 2, is_published: true, video_url: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ],
      assignments: [
        { id: 'ass-2', course_id: 'demo-1', title: 'HTML Assignment', description: 'Build a simple HTML page.', max_points: 20, is_required: true, due_date: new Date(Date.now() + 14*24*60*60*1000).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ]
    }
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_published: true,
  instructor_id: 'demo-instructor',
  enrolledCourses: [],
  completedCourses: [],
  points: 0,
  coins: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: new Date().toISOString(),
  referral_code: '',
  referred_by: '',
  view_count: 0,
  category_id: 'demo-category',
};

// Helper: send notification (in-app and email placeholder)
async function sendMentionNotification(mentionedUser: any, fromUser: any, lesson: any, content: string) {
  // In-app notification (if you have a notifications table, insert here)
  // For now, just log to console
  console.log(`Notify ${mentionedUser.first_name} (${mentionedUser.email}): You were mentioned by ${fromUser.first_name} in lesson ${lesson.title}`);
  // Email notification (simulate)
  if (mentionedUser.email) {
    // Replace with real email sending logic if available
    console.log(`Send email to ${mentionedUser.email}: You were mentioned in a discussion: "${content}"`);
  }
}

// Helper: extract @mentions from text
function extractMentions(text: string) {
  const regex = /@([a-zA-Z]+)/g;
  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1].toLowerCase());
  }
  return matches;
}

export function CourseViewer() {
  const { courseSlug } = useParams<{ courseSlug?: string }>();
  const slug = courseSlug || '';
  const navigate = useNavigate();
  const { getCourseBySlug } = useCourses();
  const { user } = useAuth();
  const { users: allUsers, loading: usersLoading } = useUsers();
  //const { modules: realModules, loading: modulesLoading, error: modulesError } = useCourseStructure(slug || '');
  let course = getCourseBySlug(slug);
  // Use demo data if no course, no modules, or no lessons
  const hasLessons = course && Array.isArray(course.modules) && course.modules.some(m => Array.isArray(m.lessons) && m.lessons.length > 0);
  if (!course || !Array.isArray(course.modules) || course.modules.length === 0 || !hasLessons) course = demoCourse;

  // Get real courseId (from course object or fallback)
  const realCourseId = course && course.id !== demoCourse.id ? course.id : null;
  let realModules: any[] = [];
  let modulesLoading = false;
  let modulesError = null;
  if (realCourseId) {
    const structure = useCourseStructure(realCourseId);
    realModules = structure.modules;
    modulesLoading = structure.loading;
    modulesError = structure.error;
  }
  // Use real modules if available, else fallback to demo
  const modules = realCourseId && realModules.length > 0 ? realModules : course?.modules || [];
  const [moduleIdx, setModuleIdx] = useState(0);
  const [lessonIdx, setLessonIdx] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'notes' | 'discussion'>('content');
  const [notes, setNotes] = useState<{ [lessonId: string]: string }>(() => {
    // Load notes from localStorage if available
    try {
      const saved = localStorage.getItem('lessonNotes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [notesSaved, setNotesSaved] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [discussionLoading, setDiscussionLoading] = useState(false);
  const [discussionError, setDiscussionError] = useState<string | null>(null);
  const [discussionInput, setDiscussionInput] = useState('');
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [replyInputs, setReplyInputs] = useState<{ [parentId: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currentModule = modules[moduleIdx];
  const lessons = currentModule?.lessons || [];
  const isLastLesson = lessonIdx === lessons.length - 1;
  const isLastModule = moduleIdx === modules.length - 1;
  const showAssignment = isLastLesson && currentModule?.assignments && currentModule.assignments.length > 0;

  // Determine if this is a demo course (no real lessons in DB)
  const isDemoCourse = course === demoCourse;

  // Get enrolled users for this course (for mentions)
  const enrolledUserIds = (course?.enrolledUsers || course?.enrolledCourses || []);
  const enrolledUsers = allUsers.filter(u => enrolledUserIds.includes(u.id));

  // Navigation logic
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

  // Adaptive content area
  const lesson = lessons[lessonIdx];
  let contentArea = <div className="text-gray-600">No lesson found.</div>;
  if (lesson) {
    if (lesson.video_url && lesson.content) {
      contentArea = (
        <div>
          <div className="mb-4"><Video className="inline w-6 h-6 mr-2 text-blue-500" /> <span className="font-bold">Video Lesson</span></div>
          <video controls className="w-full rounded-xl mb-4"><source src={lesson.video_url} type="video/mp4" /></video>
          <div className="prose max-w-none text-gray-800 whitespace-pre-line">{lesson.content}</div>
        </div>
      );
    } else if (lesson.video_url) {
      contentArea = (
        <div>
          <div className="mb-4"><Video className="inline w-6 h-6 mr-2 text-blue-500" /> <span className="font-bold">Video Lesson</span></div>
          <video controls className="w-full rounded-xl"><source src={lesson.video_url} type="video/mp4" /></video>
        </div>
      );
    } else if (lesson.content) {
      contentArea = (
        <div>
          <div className="mb-4"><FileText className="inline w-6 h-6 mr-2 text-blue-500" /> <span className="font-bold">Text Lesson</span></div>
          <div className="prose max-w-none text-gray-800 whitespace-pre-line">{lesson.content}</div>
        </div>
      );
    }
  }

  // Progress tracking per module
  const completedLessons = lessons.filter((l, idx) => idx < lessonIdx);
  const progress = lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0;

  // Notes: fetch from backend when lesson changes
  useEffect(() => {
    if (!user || !lesson?.id) return;
    setNoteLoading(true);
    setNoteError(null);
    getLessonNote(user.id, lesson.id)
      .then(({ note, error }) => {
        if (error) setNoteError(error.message);
        setNotes({ ...notes, [lesson.id]: note?.content || '' });
      })
      .catch(e => setNoteError(e.message))
      .finally(() => setNoteLoading(false));
  }, [user, lesson?.id]);

  // Save note to backend
  const handleSaveNotes = async () => {
    if (!user || !lesson?.id) return;
    setNoteLoading(true);
    setNoteError(null);
    try {
      const { error } = await upsertLessonNote(user.id, lesson.id, notes[lesson.id] || '');
      if (error) setNoteError(error.message);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 1200);
    } catch (e: any) {
      setNoteError(e.message);
    } finally {
      setNoteLoading(false);
    }
  };

  // Discussion: fetch from backend when lesson changes
  useEffect(() => {
    if (!lesson?.id) return;
    setDiscussionLoading(true);
    setDiscussionError(null);
    getLessonDiscussions(lesson.id)
      .then(({ discussions, error }) => {
        if (error) setDiscussionError(error.message);
        setDiscussions(discussions || []);
      })
      .catch(e => setDiscussionError(e.message))
      .finally(() => setDiscussionLoading(false));
  }, [lesson?.id]);

  // Real-time updates for discussions
  useEffect(() => {
    if (!lesson?.id) return;
    const channel = supabase
      .channel('lesson_discussions_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lesson_discussions',
          filter: `lesson_id=eq.${lesson.id}`,
        },
        async () => {
          const { discussions, error } = await getLessonDiscussions(lesson.id);
          if (!error) setDiscussions(discussions || []);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [lesson?.id]);

  // Post a new discussion comment
  const handleAddDiscussion = async () => {
    if (!user || !lesson?.id || !discussionInput.trim() || isDemoCourse) return;
    setDiscussionLoading(true);
    setDiscussionError(null);
    try {
      const { error } = await addLessonDiscussion(user.id, lesson.id, discussionInput.trim());
      if (error) setDiscussionError(error.message);
      // Detect mentions and notify (only enrolled users)
      const mentions = extractMentions(discussionInput);
      mentions.forEach(m => {
        const mentionedUser = enrolledUsers.find(u => u.first_name && u.first_name.toLowerCase() === m);
        if (mentionedUser) sendMentionNotification(mentionedUser, user, lesson, discussionInput);
      });
      setDiscussionInput('');
      // Refresh discussions
      const { discussions, error: fetchError } = await getLessonDiscussions(lesson.id);
      if (fetchError) setDiscussionError(fetchError.message);
      setDiscussions(discussions || []);
    } catch (e: any) {
      setDiscussionError(e.message);
    } finally {
      setDiscussionLoading(false);
    }
  };

  // Notes handlers
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes({ ...notes, [lesson.id]: e.target.value });
    setNotesSaved(false);
  };

  // Helper: group discussions by parent_id
  const topLevelComments = discussions.filter(d => !d.parent_id);
  const repliesByParent: { [parentId: string]: any[] } = {};
  discussions.forEach(d => {
    if (d.parent_id) {
      if (!repliesByParent[d.parent_id]) repliesByParent[d.parent_id] = [];
      repliesByParent[d.parent_id].push(d);
    }
  });

  // Add reply handler
  const handleReplyInputChange = (parentId: string, value: string) => {
    setReplyInputs({ ...replyInputs, [parentId]: value });
  };
  const handleAddReply = async (parentId: string) => {
    if (!user || !lesson?.id || !replyInputs[parentId]?.trim() || isDemoCourse) return;
    setDiscussionLoading(true);
    setDiscussionError(null);
    try {
      const { error } = await addLessonDiscussion(user.id, lesson.id, replyInputs[parentId].trim(), parentId);
      if (error) setDiscussionError(error.message);
      // Detect mentions and notify (only enrolled users)
      const mentions = extractMentions(replyInputs[parentId]);
      mentions.forEach(m => {
        const mentionedUser = enrolledUsers.find(u => u.first_name && u.first_name.toLowerCase() === m);
        if (mentionedUser) sendMentionNotification(mentionedUser, user, lesson, replyInputs[parentId]);
      });
      setReplyInputs({ ...replyInputs, [parentId]: '' });
      setReplyingTo(null);
      // Refresh discussions
      const { discussions, error: fetchError } = await getLessonDiscussions(lesson.id);
      if (fetchError) setDiscussionError(fetchError.message);
      setDiscussions(discussions || []);
    } catch (e: any) {
      setDiscussionError(e.message);
    } finally {
      setDiscussionLoading(false);
    }
  };

  // Edit comment/reply
  const handleEdit = (id: string, content: string) => {
    setEditingCommentId(id);
    setEditingContent(content);
  };
  const handleEditSave = async (id: string) => {
    setDiscussionLoading(true);
    setDiscussionError(null);
    try {
      const { error } = await supabase
        .from('lesson_discussions')
        .update({ content: editingContent })
        .eq('id', id);
      if (error) setDiscussionError(error.message);
      setEditingCommentId(null);
      setEditingContent('');
      // Refresh discussions
      const { discussions, error: fetchError } = await getLessonDiscussions(lesson.id);
      if (fetchError) setDiscussionError(fetchError.message);
      setDiscussions(discussions || []);
    } catch (e: any) {
      setDiscussionError(e.message);
    } finally {
      setDiscussionLoading(false);
    }
  };
  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  // Delete comment/reply
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    setDiscussionLoading(true);
    setDiscussionError(null);
    try {
      const { error } = await supabase
        .from('lesson_discussions')
        .delete()
        .eq('id', id);
      if (error) setDiscussionError(error.message);
      // Refresh discussions
      const { discussions, error: fetchError } = await getLessonDiscussions(lesson.id);
      if (fetchError) setDiscussionError(fetchError.message);
      setDiscussions(discussions || []);
    } catch (e: any) {
      setDiscussionError(e.message);
    } finally {
      setDiscussionLoading(false);
    }
  };

  // Replace {d.content} and {r.content} with highlighted JSX
  function highlightMentions(text: string) {
    return text.split(/(@[a-zA-Z]+)/g).map((part, i) => {
      if (/^@[a-zA-Z]+$/.test(part)) {
        return <span key={i} className="bg-yellow-100 text-yellow-800 font-semibold px-1 rounded">{part}</span>;
      }
      return part;
    });
  }

  // Tabbed content area
  let tabContent = null;
  if (activeTab === 'content') {
    tabContent = contentArea;
  } else if (activeTab === 'notes') {
    tabContent = (
      <div className="mt-4">
        {noteLoading ? (
          <div className="text-blue-500">Loading note...</div>
        ) : noteError ? (
          <div className="text-red-500">{noteError}</div>
        ) : null}
        <textarea
          className="w-full min-h-[120px] border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Write your notes for this lesson..."
          value={notes[lesson.id] || ''}
          onChange={handleNotesChange}
          disabled={noteLoading}
        />
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleSaveNotes}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={noteLoading}
          >Save Notes</button>
          {notesSaved && <span className="text-green-600 text-sm">Saved!</span>}
        </div>
      </div>
    );
  } else if (activeTab === 'discussion') {
    tabContent = (
      <div className="mt-4">
        {isDemoCourse && (
          <div className="text-yellow-700 bg-yellow-100 border border-yellow-200 rounded p-3 mb-4 text-center">
            Discussion is only available for real courses.
          </div>
        )}
        {discussionLoading || usersLoading ? (
          <div className="text-blue-500">Loading discussion...</div>
        ) : discussionError ? (
          <div className="text-red-500">{discussionError}</div>
        ) : null}
        <div className="mb-4">
          <textarea
            className="w-full min-h-[60px] border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={isDemoCourse ? 'Discussion is disabled for demo courses.' : 'Ask a question or start a discussion...'}
            value={discussionInput}
            onChange={e => setDiscussionInput(e.target.value)}
            disabled={discussionLoading || isDemoCourse}
          />
          <button
            onClick={handleAddDiscussion}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={discussionLoading || !discussionInput.trim() || isDemoCourse}
          >Post</button>
        </div>
        <div className="space-y-4">
          {topLevelComments.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600">No comments yet. Be the first to ask a question or start a discussion!</div>
          ) : (
            topLevelComments.map((d, idx) => {
              const user = allUsers.find(u => u.id === d.user_id);
              const displayName = (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '') || user?.email || d.user_id;
              const avatarAlt = displayName;
              const avatarLetter = displayName ? displayName[0] : '?';
              const replies = repliesByParent[d.id] || [];
              return (
                <div key={d.id || idx} className="bg-white border border-gray-200 rounded-lg p-3 flex items-start gap-3 flex-col">
                  <div className="flex items-start gap-3 w-full">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={avatarAlt} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-bold bg-gray-100">
                          {avatarLetter}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-blue-700 mb-1">{displayName}</div>
                      {editingCommentId === d.id ? (
                        <>
                          <textarea
                            className="w-full min-h-[40px] border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={editingContent}
                            onChange={e => setEditingContent(e.target.value)}
                            disabled={discussionLoading}
                          />
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={() => handleEditSave(d.id)}
                              className="bg-blue-600 text-white px-3 py-1 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                              disabled={discussionLoading || !editingContent.trim()}
                            >Save</button>
                            <button
                              onClick={handleEditCancel}
                              className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg font-medium hover:bg-gray-300"
                            >Cancel</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-gray-800 whitespace-pre-line">{highlightMentions(d.content)}</div>
                          <div className="text-xs text-gray-400 mt-1">{new Date(d.created_at).toLocaleString()}</div>
                          {user?.id === d.user_id && (
                            <div className="flex gap-2 mt-1">
                              <button
                                className="text-xs text-blue-600 hover:underline"
                                onClick={() => handleEdit(d.id, d.content)}
                              >Edit</button>
                              <button
                                className="text-xs text-red-600 hover:underline"
                                onClick={() => handleDelete(d.id)}
                              >Delete</button>
                            </div>
                          )}
                          <button
                            className="text-xs text-blue-600 mt-1 hover:underline"
                            onClick={() => setReplyingTo(d.id)}
                          >Reply</button>
                          {replyingTo === d.id && (
                            <div className="mt-2">
                              <textarea
                                className="w-full min-h-[40px] border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Write a reply..."
                                value={replyInputs[d.id] || ''}
                                onChange={e => handleReplyInputChange(d.id, e.target.value)}
                                disabled={discussionLoading}
                              />
                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={() => handleAddReply(d.id)}
                                  className="bg-blue-600 text-white px-3 py-1 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                  disabled={discussionLoading || !(replyInputs[d.id] || '').trim()}
                                >Post Reply</button>
                                <button
                                  onClick={() => setReplyingTo(null)}
                                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg font-medium hover:bg-gray-300"
                                >Cancel</button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {/* Replies */}
                  {replies.length > 0 && (
                    <div className="mt-3 space-y-2 pl-8 border-l-2 border-blue-100">
                      {replies.map((r, ridx) => {
                        const replyUser = allUsers.find(u => u.id === r.user_id);
                        const replyDisplayName = (replyUser?.first_name && replyUser?.last_name ? `${replyUser.first_name} ${replyUser.last_name}` : '') || replyUser?.email || r.user_id;
                        const replyAvatarAlt = replyDisplayName;
                        const replyAvatarLetter = replyDisplayName ? replyDisplayName[0] : '?';
                        return (
                          <div key={r.id || ridx} className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                              {replyUser?.avatar ? (
                                <img src={replyUser.avatar} alt={replyAvatarAlt} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-bold bg-gray-100">
                                  {replyAvatarLetter}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-blue-700 mb-0.5">{replyDisplayName}</div>
                              {editingCommentId === r.id ? (
                                <>
                                  <textarea
                                    className="w-full min-h-[32px] border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={editingContent}
                                    onChange={e => setEditingContent(e.target.value)}
                                    disabled={discussionLoading}
                                  />
                                  <div className="flex gap-2 mt-1">
                                    <button
                                      onClick={() => handleEditSave(r.id)}
                                      className="bg-blue-600 text-white px-3 py-1 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                      disabled={discussionLoading || !editingContent.trim()}
                                    >Save</button>
                                    <button
                                      onClick={handleEditCancel}
                                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg font-medium hover:bg-gray-300"
                                    >Cancel</button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="text-gray-800 whitespace-pre-line">{highlightMentions(r.content)}</div>
                                  <div className="text-xs text-gray-400 mt-0.5">{new Date(r.created_at).toLocaleString()}</div>
                                  {user?.id === r.user_id && (
                                    <div className="flex gap-2 mt-1">
                                      <button
                                        className="text-xs text-blue-600 hover:underline"
                                        onClick={() => handleEdit(r.id, r.content)}
                                      >Edit</button>
                                      <button
                                        className="text-xs text-red-600 hover:underline"
                                        onClick={() => handleDelete(r.id)}
                                      >Delete</button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Show loading/error states for modules
  if (modulesLoading) return <div className="p-8 text-blue-600 text-lg">Loading course structure...</div>;
  if (modulesError) return <div className="p-8 text-red-600 text-lg">{modulesError}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex-1 flex flex-col items-stretch px-0 min-h-0">
          <div className="flex flex-1 min-h-0">
            {/* Sidebar (collapsible) */}
            <div className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity md:hidden ${showSidebar ? 'block' : 'hidden'}`} onClick={() => setShowSidebar(false)} />
            <aside className={`z-50 md:static md:block bg-gray-100 w-72 flex-shrink-0 h-full overflow-y-auto border-r border-gray-200 transition-transform duration-300 ${showSidebar ? 'translate-x-0 fixed left-0 top-0 h-full' : '-translate-x-full md:translate-x-0'}`}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 md:hidden">
                <span className="font-bold text-lg text-gray-900">Course Modules</span>
                <button onClick={() => setShowSidebar(false)} className="text-gray-500 hover:text-blue-600 p-2"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4 hidden md:block">Course Modules</h3>
                <div className="space-y-4">
                  {modules.map((mod, modIdx) => (
                    <div key={modIdx} className="border border-gray-200 rounded-xl shadow-sm">
                      <div className="px-4 py-3 bg-gray-50 rounded-t-xl font-semibold text-blue-700">{mod.title}</div>
                      <ul className="py-2 px-2 space-y-1 bg-white rounded-b-xl">
                        {(mod.lessons || []).map((les, lesIdx) => (
                          <li key={lesIdx}>
                            <button
                              onClick={() => handleSelectLesson(modIdx, lesIdx)}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${modIdx === moduleIdx && lesIdx === lessonIdx ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                              {les.video_url ? <Video className="w-4 h-4 text-blue-500" /> : <BookOpen className="w-4 h-4 text-gray-400" />}
                              <span className="font-medium truncate">{les.title}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center p-4 md:p-8 w-full min-h-0">
              {/* Mobile: Hamburger to open sidebar */}
              <button
                className="block md:hidden fixed z-50 top-4 left-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-2 transition-colors"
                onClick={() => setShowSidebar(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="w-full max-w-5xl px-4 md:px-8">
                {/* Progress Bar */}
                <div className="w-full mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-blue-700">Module Progress</span>
                    <span className="text-xs text-gray-500">{completedLessons.length} of {lessons.length} lessons completed</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-green-400" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Progress: {progress}%</div>
                </div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                    <div className="text-gray-500 text-sm">Module: <span className="font-semibold text-blue-700">{currentModule?.title}</span></div>
                    <div className="text-gray-500 text-sm">Lesson: <span className="font-semibold text-blue-700">{lesson?.title}</span></div>
                  </div>
                </div>
                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200 flex gap-2">
                  <button
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === 'content' ? 'bg-white border-x border-t border-gray-200 text-blue-700 -mb-px' : 'text-gray-500 hover:text-blue-700'}`}
                    onClick={() => setActiveTab('content')}
                  >Content</button>
                  <button
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === 'notes' ? 'bg-white border-x border-t border-gray-200 text-blue-700 -mb-px' : 'text-gray-500 hover:text-blue-700'}`}
                    onClick={() => setActiveTab('notes')}
                  >Notes</button>
                  <button
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === 'discussion' ? 'bg-white border-x border-t border-gray-200 text-blue-700 -mb-px' : 'text-gray-500 hover:text-blue-700'}`}
                    onClick={() => setActiveTab('discussion')}
                  >Discussion</button>
                </div>
                {/* Tab Content */}
                <div className="mb-8">{tabContent}</div>
                <div className="flex gap-2 justify-between">
                  <button
                    onClick={handlePrev}
                    disabled={moduleIdx === 0 && lessonIdx === 0}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2 justify-center"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  {isLastModule && isLastLesson ? (
                    <button
                      onClick={() => setShowCompleteModal(true)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2 justify-center"
                    >
                      <CheckCircle className="w-5 h-5" /> Complete Lesson
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 justify-center"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </main>
          </div>
          {/* Complete Modal Placeholder */}
          {showCompleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 max-w-sm w-full text-center shadow-2xl">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Complete this course?</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to mark this course as complete? This action cannot be undone.</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setShowCompleteModal(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300"
                  >Cancel</button>
                  <button
                    onClick={() => { setShowCompleteModal(false); setShowCelebration(true); }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                  >Yes, Complete</button>
                </div>
              </div>
            </div>
          )}
          {/* Celebration Modal Placeholder */}
          {showCelebration && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl relative">
                {/* Confetti and coin animation placeholders */}
                <div className="absolute inset-0 pointer-events-none z-0">🎉🎊💰</div>
                <h2 className="text-2xl font-bold mb-4 z-10 relative">Congratulations!</h2>
                <p className="text-gray-700 mb-6 z-10 relative">You've completed <span className="font-semibold text-blue-700">{course.title}</span>!<br />Download your certificate and celebrate your achievement!</p>
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 z-10 relative"
                  onClick={() => setShowCelebration(false)}
                >Download Certificate</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}