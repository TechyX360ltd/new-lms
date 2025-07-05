import React from 'react';
import CourseSessionCalendar from '../components/Course/CourseSessionCalendar';

// Mock current user (replace with real auth context)
const currentUser = {
  id: 'learner-1',
  name: 'Jane Doe',
  enrolledCourses: ['course-1', 'course-2'],
};

// Mock all sessions (replace with backend fetch)
const allSessions = [
  {
    id: 1,
    title: 'React Basics Live',
    start: new Date(2024, 6, 10, 10, 0),
    end: new Date(2024, 6, 10, 11, 0),
    platform: 'Zoom',
    instructor: 'Sarah Johnson',
    description: 'Intro to React and Q&A',
    joinLink: '#',
    courseId: 'course-1',
  },
  {
    id: 2,
    title: 'UI/UX Q&A',
    start: new Date(2024, 6, 12, 14, 0),
    end: new Date(2024, 6, 12, 15, 0),
    platform: 'Google Meet',
    instructor: 'Mike Chen',
    description: 'Live Q&A on UI/UX',
    joinLink: '#',
    courseId: 'course-2',
  },
  {
    id: 3,
    title: 'Business Strategy Live',
    start: new Date(2024, 6, 15, 16, 0),
    end: new Date(2024, 6, 15, 17, 0),
    platform: 'Zoom',
    instructor: 'Alex Smith',
    description: 'Business strategy session',
    joinLink: '#',
    courseId: 'course-3', // Not enrolled
  },
];

// Filter sessions for only the learner's enrolled courses
const learnerSessions = allSessions.filter(session =>
  currentUser.enrolledCourses.includes(session.courseId)
);

export default function LearnerCalendarPage() {
  return (
    <div className="w-full max-w-full mx-auto p-0">
      <div className="mt-2 mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold mb-0 ml-2">My Events</h1>
      </div>
      <div className="w-full">
        <CourseSessionCalendar events={learnerSessions} />
      </div>
    </div>
  );
} 