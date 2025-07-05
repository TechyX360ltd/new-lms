import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Mock session data
const mockSessions = [
  {
    id: 1,
    title: 'React Basics Live',
    start: new Date(2024, 6, 10, 10, 0),
    end: new Date(2024, 6, 10, 11, 0),
    platform: 'Zoom',
    instructor: 'Sarah Johnson',
    description: 'Intro to React and Q&A',
    joinLink: '#',
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
  },
];

interface CourseSessionCalendarProps {
  events?: any[];
}

export default function CourseSessionCalendar({ events }: CourseSessionCalendarProps) {
  const [selectedSession, setSelectedSession] = useState(null);
  const calendarEvents = events || mockSessions;

  return (
    <>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '70vh', width: '100%' }}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        defaultView={Views.WEEK}
        onSelectEvent={event => setSelectedSession(event)}
        popup
      />

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-2">{selectedSession.title}</h3>
            <p className="mb-1"><b>Instructor:</b> {selectedSession.instructor}</p>
            <p className="mb-1"><b>Platform:</b> {selectedSession.platform}</p>
            <p className="mb-1"><b>Time:</b> {format(selectedSession.start, 'PPpp')} - {format(selectedSession.end, 'PPpp')}</p>
            <p className="mb-3"><b>Description:</b> {selectedSession.description}</p>
            {/* TODO: Replace # with real join link */}
            <a
              href={selectedSession.joinLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-2"
            >
              Join Session
            </a>
            <button
              className="block w-full mt-2 text-gray-600 hover:text-gray-900"
              onClick={() => setSelectedSession(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* TODO: Integrate with real session data and join links */}
    </>
  );
} 