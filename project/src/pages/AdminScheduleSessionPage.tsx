import React from 'react';
import ScheduleSessionForm from '../components/Admin/ScheduleSessionForm';

export default function AdminScheduleSessionPage() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4">Schedule a Live Session</h1>
      <div className="max-w-md w-full pl-0">
        <ScheduleSessionForm />
      </div>
    </div>
  );
} 