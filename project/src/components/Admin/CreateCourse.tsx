import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  FileText, 
  Video, 
  Image, 
  ChevronDown,
  ChevronRight,
  Clock,
  BookOpen,
  Award,
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  Link,
  Eye,
  Minimize2,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { useCategories } from '../../hooks/useData';
import { uploadToCloudinary } from '../../lib/cloudinary';

interface Module {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  contentType: 'text' | 'video' | 'document' | 'image';
  attachments: string[];
  duration: number;
  sort_order: number;
  videoUrl?: string;
}

interface CreateCourseProps {
  onSave: (courseData: any) => void;
  onCancel: () => void;
}

// Add a modal component for video upload
function VideoUploadModal({ open, onClose, onUpload, progress, error }: {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  progress: number;
  error: string | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          aria-label="Close"
        >×</button>
        <h2 className="text-xl font-bold mb-4">Upload Lesson Video</h2>
        <input
          type="file"
          accept="video/mp4,video/x-matroska"
          ref={fileInputRef}
          className="mb-4"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
        <div className="mb-2 text-xs text-gray-500">Max size: 50MB. Formats: mp4, mkv.</div>
        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      </div>
    </div>
  );
}

export function CreateCourse({ onSave, onCancel }: CreateCourseProps) {
  const { categories, refreshCategories, loading: categoriesLoading } = useCategories();
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    instructor: '',
    category: '',
    format: 'mixed' as 'text' | 'video' | 'mixed',
    duration: 0,
    price: 0,
    thumbnail: null as File | null,
    isPublished: false,
    certificateTemplate: 'default' as 'default' | 'modern' | 'elegant',
  });

  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [minimizedLessons, setMinimizedLessons] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeEditor, setActiveEditor] = useState<string | null>(null);
  const [refreshingSchools, setRefreshingSchools] = useState(false);
  const [videoModal, setVideoModal] = useState<{ open: boolean; moduleId: string | null; lessonId: string | null; }>(
    { open: false, moduleId: null, lessonId: null }
  );
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const certificateTemplates = [
    { id: 'default', name: 'Default Template', description: 'Classic blue and white design' },
    { id: 'modern', name: 'Modern Template', description: 'Sleek contemporary design' },
    { id: 'elegant', name: 'Elegant Template', description: 'Sophisticated gold accents' },
  ];

  // Refresh schools/categories when component mounts or when user clicks refresh
  useEffect(() => {
    refreshCategories();
  }, []);

  const handleRefreshSchools = async () => {
    setRefreshingSchools(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
      refreshCategories();
    } finally {
      setRefreshingSchools(false);
    }
  };

  // Mark form as dirty on any change
  useEffect(() => {
    setIsDirty(true);
  }, [
    courseData.title,
    courseData.description,
    courseData.instructor,
    courseData.category,
    courseData.price,
    modules,
    // add any other fields you want to track
  ]);

  // Warn on tab close if form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Rich Text Formatting Functions
  const formatText = (moduleId: string, lessonId: string, format: string) => {
    const textareaId = `lesson-content-${moduleId}-${lessonId}`;
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    let formattedText = '';
    let newCursorPos = start;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        newCursorPos = start + (selectedText ? 2 : 2);
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        newCursorPos = start + (selectedText ? 1 : 1);
        break;
      case 'underline':
        formattedText = `__${selectedText || 'underlined text'}__`;
        newCursorPos = start + (selectedText ? 2 : 2);
        break;
      case 'code':
        formattedText = `\`${selectedText || 'code'}\``;
        newCursorPos = start + (selectedText ? 1 : 1);
        break;
      case 'quote':
        formattedText = `> ${selectedText || 'quoted text'}`;
        newCursorPos = start + (selectedText ? 2 : 2);
        break;
      case 'bullet':
        formattedText = `\n• ${selectedText || 'bullet point'}`;
        newCursorPos = start + (selectedText ? 3 : 3);
        break;
      case 'numbered':
        formattedText = `\n1. ${selectedText || 'numbered item'}`;
        newCursorPos = start + (selectedText ? 4 : 4);
        break;
      case 'heading':
        formattedText = `\n## ${selectedText || 'Heading'}\n`;
        newCursorPos = start + (selectedText ? 4 : 4);
        break;
      case 'link':
        formattedText = `[${selectedText || 'link text'}](url)`;
        newCursorPos = start + (selectedText ? selectedText.length + 3 : 9);
        break;
      case 'indent':
        formattedText = `    ${selectedText}`;
        newCursorPos = start + 4;
        break;
      default:
        return;
    }

    const newContent = beforeText + formattedText + afterText;
    
    // Update the lesson content
    updateLesson(moduleId, lessonId, 'content', newContent);
    
    // Set cursor position after update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!courseData.title.trim()) {
      newErrors.title = 'Course title is required';
    }

    if (!courseData.description.trim()) {
      newErrors.description = 'Course description is required';
    }

    if (!courseData.instructor.trim()) {
      newErrors.instructor = 'Instructor name is required';
    }

    if (!courseData.category) {
      newErrors.category = 'Category is required';
    }

    if (courseData.price <= 0) {
      newErrors.price = 'Course price must be greater than 0';
    }

    if (modules.length === 0) {
      newErrors.modules = 'At least one module is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      title: '',
      description: '',
      sort_order: modules.length + 1,
      lessons: [],
    };
    setModules([...modules, newModule]);
    setExpandedModules(new Set([...expandedModules, newModule.id]));
  };

  const updateModule = (moduleId: string, field: string, value: string) => {
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, [field]: value } : module
    ));
  };

  const deleteModule = (moduleId: string) => {
    setModules(modules.filter(module => module.id !== moduleId));
    const newExpanded = new Set(expandedModules);
    newExpanded.delete(moduleId);
    setExpandedModules(newExpanded);
  };

  const addLesson = (moduleId: string) => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: '',
      content: '',
      contentType: 'text',
      attachments: [],
      duration: 0,
      sort_order: 1,
    };

    setModules(modules.map(module => {
      if (module.id === moduleId) {
        return {
          ...module,
          lessons: [...module.lessons, { ...newLesson, sort_order: module.lessons.length + 1 }]
        };
      }
      return module;
    }));
  };

  const updateLesson = (moduleId: string, lessonId: string, field: string, value: any) => {
    setModules(modules.map(module => {
      if (module.id === moduleId) {
        return {
          ...module,
          lessons: module.lessons.map(lesson =>
            lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
          )
        };
      }
      return module;
    }));
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(module => {
      if (module.id === moduleId) {
        return {
          ...module,
          lessons: module.lessons.filter(lesson => lesson.id !== lessonId)
        };
      }
      return module;
    }));
  };

  const toggleLessonMinimize = (lessonId: string) => {
    const newMinimized = new Set(minimizedLessons);
    if (newMinimized.has(lessonId)) {
      newMinimized.delete(lessonId);
    } else {
      newMinimized.add(lessonId);
    }
    setMinimizedLessons(newMinimized);
  };

  const handleFileUpload = async (moduleId: string, lessonId: string, files: FileList) => {
    const fileArray = Array.from(files);
    // Upload all files to Cloudinary and store their URLs
    const uploadedUrls: string[] = [];
    for (const file of fileArray) {
      try {
        const uploadResult = await uploadToCloudinary(file, 'lesson-media');
        uploadedUrls.push(uploadResult.secure_url);
      } catch (err) {
        alert('Failed to upload file to Cloudinary.');
      }
    }
    updateLesson(moduleId, lessonId, 'attachments', uploadedUrls);
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

  const calculateTotalDuration = () => {
    return modules.reduce((total, module) => 
      total + module.lessons.reduce((moduleTotal, lesson) => moduleTotal + lesson.duration, 0), 0
    );
  };

  const previewFormattedText = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">$1</blockquote>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-gray-900 mt-4 mb-2">$1</h2>')
      .replace(/^• (.*$)/gm, '<li class="ml-4 mb-2">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 mb-2">$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline hover:text-blue-800">$1</a>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>');
  };

  const handleVideoUpload = async (file: File) => {
    setVideoUploadError(null);
    if (!file) return;
    if (!['video/mp4', 'video/x-matroska'].includes(file.type)) {
      setVideoUploadError('Only mp4 and mkv files are allowed.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setVideoUploadError('File size must be 50MB or less.');
      return;
    }
    setVideoUploadProgress(0);
    try {
      // Use XMLHttpRequest for progress
      const url = `https://api.cloudinary.com/v1_1/dx9hdygy3/upload`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'techyx360lms');
      formData.append('folder', 'lesson-videos');
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setVideoUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200) {
            const res = JSON.parse(xhr.responseText);
            // Save the video URL to the lesson
            if (videoModal.moduleId && videoModal.lessonId) {
              updateLesson(videoModal.moduleId, videoModal.lessonId, 'videoUrl', res.secure_url);
            }
            setVideoModal({ open: false, moduleId: null, lessonId: null });
            setVideoUploadProgress(0);
            resolve();
          } else {
            setVideoUploadError('Upload failed.');
            reject();
          }
        };
        xhr.onerror = () => {
          setVideoUploadError('Upload failed.');
          reject();
        };
        xhr.send(formData);
      });
    } catch (err) {
      setVideoUploadError('Upload failed.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const totalDuration = calculateTotalDuration();
      let thumbnailUrl = courseData.thumbnail;
      if (courseData.thumbnail instanceof File) {
        const uploadResult = await uploadToCloudinary(courseData.thumbnail, 'course-thumbnails');
        thumbnailUrl = uploadResult.secure_url;
      }
      const coursePayload = {
        ...courseData,
        id: Date.now().toString(),
        duration: Math.ceil(totalDuration / 60), // Convert minutes to hours
        modules,
        enrolledCount: 0,
        thumbnail: thumbnailUrl || 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=600',
        lessons: modules.flatMap(module => module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration,
          sort_order: lesson.sort_order
        }))),
        createdAt: new Date().toISOString(),
        certificatetemplate: courseData.certificateTemplate,
      };

      await onSave(coursePayload);
      setIsDirty(false); // Reset dirty state after successful save
    } catch (error) {
      console.error('Error creating course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Course</h1>
          <p className="text-gray-600">Build a comprehensive learning experience</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Course Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Course Information</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                value={courseData.title}
                onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter course title"
                required
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructor *
              </label>
              <input
                type="text"
                value={courseData.instructor}
                onChange={(e) => setCourseData({...courseData, instructor: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.instructor ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Instructor name"
                required
              />
              {errors.instructor && <p className="text-red-600 text-sm mt-1">{errors.instructor}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Course Category *
                </label>
                <button
                  type="button"
                  onClick={handleRefreshSchools}
                  disabled={refreshingSchools || categoriesLoading}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                  title="Refresh schools list"
                >
                  <RefreshCw className={`w-3 h-3 ${refreshingSchools ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              <select
                value={courseData.category}
                onChange={(e) => setCourseData({...courseData, category: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
                required
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? 'Loading schools...' : 'Select a category'}
                </option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
              {categories.length === 0 && !categoriesLoading && (
                <p className="text-amber-600 text-sm mt-1">
                  No active schools found. Please create a school first or activate existing ones.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Format *
              </label>
              <select
                value={courseData.format}
                onChange={(e) => setCourseData({...courseData, format: e.target.value as any})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="text">Text Only</option>
                <option value="video">Video Only</option>
                <option value="mixed">Mixed Content</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₦) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">₦</span>
                <input
                  type="number"
                  value={courseData.price}
                  onChange={(e) => setCourseData({...courseData, price: Number(e.target.value)})}
                  className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
              {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Thumbnail
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCourseData({...courseData, thumbnail: e.target.files?.[0] || null})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Description *
            </label>
            <textarea
              value={courseData.description}
              onChange={(e) => setCourseData({...courseData, description: e.target.value})}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe what students will learn in this course"
              required
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Total Duration: {Math.ceil(calculateTotalDuration() / 60)} hours
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {modules.length} modules, {modules.reduce((total, module) => total + module.lessons.length, 0)} lessons
              </span>
            </div>
          </div>
        </div>

        {/* Certificate Template Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Certificate Template</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {certificateTemplates.map((template) => (
              <div
                key={template.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  courseData.certificateTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCourseData({...courseData, certificateTemplate: template.id})}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-6 h-6 text-blue-600" />
                  <h3 className="font-medium text-gray-900">{template.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Course Curriculum */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Course Curriculum</h2>
            <button
              type="button"
              onClick={addModule}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Module
            </button>
          </div>

          {errors.modules && <p className="text-red-600 text-sm mb-4">{errors.modules}</p>}

          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="mb-6 border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={module.title}
                    onChange={e => updateModule(module.id, 'title', e.target.value)}
                    className="flex-1 px-4 py-2 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Module Title"
                        />
                        <input
                          type="text"
                          value={module.description}
                    onChange={e => updateModule(module.id, 'description', e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Module Description"
                  />
                  <button onClick={() => deleteModule(module.id)} className="text-red-600 hover:bg-red-50 rounded p-2 ml-2">
                    <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                <div className="ml-4">
                  <h4 className="font-semibold mb-2">Lessons</h4>
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="mb-4 p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                                  <input
                                    type="text"
                                    value={lesson.title}
                          onChange={e => updateLesson(module.id, lesson.id, 'title', e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Lesson Title"
                        />
                                  <select
                                    value={lesson.contentType}
                          onChange={e => updateLesson(module.id, lesson.id, 'contentType', e.target.value)}
                          className="px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="text">Text</option>
                                    <option value="video">Video</option>
                          <option value="mixed">Mixed</option>
                                  </select>
                        <button onClick={() => deleteLesson(module.id, lesson.id)} className="text-red-600 hover:bg-red-50 rounded p-2 ml-2">
                          <Trash2 className="w-5 h-5" />
                        </button>
                                </div>
                      {/* ContentType logic */}
                      {(lesson.contentType === 'text' || lesson.contentType === 'mixed') && (
                                <div className="mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span className="font-semibold text-blue-700">Text Content</span>
                                  </div>
                          {/* Rich text formatting buttons */}
                          <div className="flex gap-2 mb-1">
                            <button type="button" onClick={() => formatText(module.id, lesson.id, 'bold')} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 font-bold">B</button>
                            <button type="button" onClick={() => formatText(module.id, lesson.id, 'italic')} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 italic">I</button>
                            <button type="button" onClick={() => formatText(module.id, lesson.id, 'underline')} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 underline">U</button>
                            <button type="button" onClick={() => formatText(module.id, lesson.id, 'code')} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 font-mono">&lt;/&gt;</button>
                            <button type="button" onClick={() => formatText(module.id, lesson.id, 'quote')} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">"</button>
                            <button type="button" onClick={() => formatText(module.id, lesson.id, 'bullet')} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">•</button>
                            <button type="button" onClick={() => formatText(module.id, lesson.id, 'numbered')} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">1.</button>
                            <button type="button" onClick={() => formatText(module.id, lesson.id, 'heading')} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 font-bold">H2</button>
                            <button type="button" onClick={() => formatText(module.id, lesson.id, 'link')} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-blue-600">🔗</button>
                                </div>
                                <textarea
                                  id={`lesson-content-${module.id}-${lesson.id}`}
                                  value={lesson.content}
                            onChange={e => updateLesson(module.id, lesson.id, 'content', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                            placeholder="Lesson Content (supports rich text formatting)"
                            rows={4}
                                    />
                                  </div>
                                )}
                      {(lesson.contentType === 'video' || lesson.contentType === 'mixed') && (
                        <div className="mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Video className="w-4 h-4 text-purple-500" />
                            <span className="font-semibold text-purple-700">Video Content</span>
                                    </div>
                          <button
                            type="button"
                            onClick={() => setVideoModal({ open: true, moduleId: module.id, lessonId: lesson.id })}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-medium hover:bg-blue-200"
                          >
                            {lesson.videoUrl ? 'Replace Video' : 'Upload Video'}
                          </button>
                          {lesson.videoUrl && (
                            <video src={lesson.videoUrl} controls className="w-full mt-2 rounded" />
                          )}
                              </div>
                            )}
                          </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addLesson(module.id)}
                    className="mt-2 bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-medium hover:bg-green-200"
                  >
                    + Add Lesson
                  </button>
                    </div>
              </div>
            ))}
          </div>
        </div>

          <button
            type="submit"
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg mt-8 hover:bg-blue-700 transition-all duration-200"
            disabled={isLoading}
          >
          {isLoading ? 'Adding...' : 'Add Course'}
          </button>
      </form>

      <VideoUploadModal
        open={videoModal.open}
        onClose={() => setVideoModal({ open: false, moduleId: null, lessonId: null })}
        onUpload={handleVideoUpload}
        progress={videoUploadProgress}
        error={videoUploadError}
      />
    </div>
  );
}