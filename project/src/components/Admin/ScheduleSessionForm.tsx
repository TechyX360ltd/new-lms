import React, { useState } from 'react';
import InviteeSelector from './InviteeSelector';

const mockCourses = [
  { id: 'course-1', title: 'React Basics' },
  { id: 'course-2', title: 'UI/UX Design' },
];

const platforms = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'google_meet', label: 'Google Meet' },
];

const recurrenceOptions = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' },
];

type Learner = { id: string; name: string; email: string };
const learnersByCourse: { [courseId: string]: Learner[] } = {
  'course-1': [
    { id: 'learner-1', name: 'Jane Doe', email: 'jane@example.com' },
    { id: 'learner-2', name: 'John Smith', email: 'john@example.com' },
  ],
  'course-2': [
    { id: 'learner-3', name: 'Alice Johnson', email: 'alice@example.com' },
    { id: 'learner-4', name: 'Bob Lee', email: 'bob@example.com' },
  ],
};

export default function ScheduleSessionForm() {
  const [form, setForm] = useState({
    courseId: '',
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    platform: '',
    recurrence: 'none',
    customRecurrence: '',
    invitees: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleInviteesChange = (invitees: string[]) => {
    setForm(prev => ({ ...prev, invitees }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    // TODO: Integrate with backend to create session, recurrence, and invitees
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setForm({
        courseId: '',
        title: '',
        description: '',
        date: '',
        time: '',
        duration: '',
        platform: '',
        recurrence: 'none',
        customRecurrence: '',
        invitees: [],
      });
    }, 1000);
  };

  // Get learners for the selected course
  const learners = form.courseId ? learnersByCourse[form.courseId] || [] : [];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8 border border-gray-100">
      <h2 className="text-xl font-bold mb-6">Schedule Live Session</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course - full width */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Course</label>
          <select
            name="courseId"
            value={form.courseId}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select a course</option>
            {mockCourses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>
        {/* Session Title - full width */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Session Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        {/* Description - full width */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={2}
          />
        </div>
        {/* Date & Time */}
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        {/* Duration & Platform */}
        <div>
          <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            value={form.duration}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            min={1}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Platform</label>
          <select
            name="platform"
            value={form.platform}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select platform</option>
            {platforms.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        {/* Recurrence - full width */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Recurrence</label>
          <select
            name="recurrence"
            value={form.recurrence}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            {recurrenceOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {form.recurrence === 'custom' && (
            <input
              type="text"
              name="customRecurrence"
              value={form.customRecurrence}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-2"
              placeholder="Describe custom recurrence (e.g. every 2 weeks)"
            />
          )}
        </div>
        {/* Invitees - full width */}
        {form.courseId && (
          <div className="md:col-span-2">
            <InviteeSelector
              learners={learners}
              selected={form.invitees}
              onChange={handleInviteesChange}
            />
          </div>
        )}
        {/* Error/Success - full width */}
        {error && <div className="md:col-span-2 text-red-600 text-sm">{error}</div>}
        {success && <div className="md:col-span-2 text-green-600 text-sm">Session scheduled successfully!</div>}
        {/* Submit Button - full width on mobile, right on desktop */}
        <div className="md:col-span-2 flex flex-col md:flex-row md:justify-end gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-60 w-full md:w-auto"
            disabled={submitting}
          >
            {submitting ? 'Scheduling...' : 'Schedule Session'}
          </button>
        </div>
      </form>
    </div>
  );
} 