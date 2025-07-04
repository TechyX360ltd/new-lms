import React from 'react';
import { Users, BookOpen, TrendingUp, Clock, Award } from 'lucide-react';
import { useCourses, useUsers, usePayments } from '../../hooks/useData';

export function AdminOverview() {
  const { courses, loading: coursesLoading } = useCourses();
  const { users, loading: usersLoading } = useUsers();
  const { payments, loading: paymentsLoading } = usePayments();

  if (coursesLoading || usersLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    {
      title: 'Total Users',
      value: users.length.toString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Active Courses',
      value: courses.filter(c => c.isPublished).length.toString(),
      icon: BookOpen,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Total Revenue',
      value: `₦${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+23%',
    },
    {
      title: 'Enrollments',
      value: courses.reduce((sum, c) => sum + c.enrolledCount, 0).toString(),
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+15%',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Overview</h1>
          <p className="text-gray-600">Monitor your TECHYX 360 platform performance</p>
        </div>
        <div className="hidden md:block">
          <img 
            src="/BLACK-1-removebg-preview.png" 
            alt="TECHYX 360" 
            className="h-10 w-auto opacity-60"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Courses */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Popular Courses</h2>
          <div className="space-y-4">
            {courses
              .sort((a, b) => b.enrolledCount - a.enrolledCount)
              .slice(0, 5)
              .map((course) => (
                <div key={course.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500">{course.enrolledCount} enrollments</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">₦{course.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Payments</h2>
          <div className="space-y-4">
            {payments
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((payment) => {
                const user = users.find(u => u.id === payment.userId);
                const course = courses.find(c => c.id === payment.courseId);
                
                return (
                  <div key={payment.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{user?.name}</h3>
                      <p className="text-sm text-gray-500">{course?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₦{payment.amount.toLocaleString()}</p>
                      <p className={`text-xs ${
                        payment.status === 'completed' ? 'text-green-600' : 
                        payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {payment.status}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}