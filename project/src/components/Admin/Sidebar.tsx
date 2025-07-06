import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Store, 
  Award, 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Bell, 
  School, 
  CreditCard, 
  FileText, 
  Plus,
  Edit,
  Eye,
  Target,
  UserPlus,
  FolderOpen,
  Calendar,
  TrendingUp
} from 'lucide-react';

export function AdminSidebar() {
  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 shadow-sm flex flex-col">
      <div className="px-6 py-6 flex items-center gap-2 text-2xl font-bold text-green-700">
        <LayoutDashboard className="w-7 h-7" /> Admin Panel
      </div>
      <nav className="flex-1 px-2 space-y-2 overflow-y-auto">
        {/* Dashboard */}
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" /> Overview
        </NavLink>

        {/* Analytics */}
        <NavLink
          to="/admin/analytics"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <BarChart3 className="w-5 h-5" /> Analytics
        </NavLink>

        {/* User Management */}
        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <Users className="w-5 h-5" /> User Management
        </NavLink>

        <NavLink
          to="/admin/add-user"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <UserPlus className="w-5 h-5" /> Add User
        </NavLink>

        {/* Course Management */}
        <NavLink
          to="/admin/courses"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <BookOpen className="w-5 h-5" /> Course Management
        </NavLink>

        <NavLink
          to="/admin/create-course"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <Plus className="w-5 h-5" /> Create Course
        </NavLink>

        <NavLink
          to="/admin/categories"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <FolderOpen className="w-5 h-5" /> Categories
        </NavLink>

        {/* School Management */}
        <NavLink
          to="/admin/schools"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-orange-100 text-orange-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <School className="w-5 h-5" /> School Management
        </NavLink>

        {/* Progress Tracking */}
        <NavLink
          to="/admin/progress"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-teal-100 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <Target className="w-5 h-5" /> Progress Tracking
        </NavLink>

        {/* Payment Management */}
        <NavLink
          to="/admin/payments"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <CreditCard className="w-5 h-5" /> Payment Management
        </NavLink>

        {/* Certificates */}
        <NavLink
          to="/admin/certificates"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <FileText className="w-5 h-5" /> Certificates
        </NavLink>

        {/* Assignments */}
        <NavLink
          to="/admin/assignments"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-cyan-100 text-cyan-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <Edit className="w-5 h-5" /> Assignment Creator
        </NavLink>

        {/* Sessions */}
        <NavLink
          to="/admin/sessions"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-violet-100 text-violet-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <Calendar className="w-5 h-5" /> Schedule Sessions
        </NavLink>

        {/* Gamification Section */}
        <div className="pt-4 pb-2">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Gamification
          </h3>
        </div>

        <NavLink
          to="/admin/store"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <Store className="w-5 h-5" /> Store Management
        </NavLink>

        <NavLink
          to="/admin/badges"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-yellow-100 text-yellow-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <Award className="w-5 h-5" /> Badge Management
        </NavLink>

        <NavLink
          to="/admin/moderation"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <ShieldCheck className="w-5 h-5" /> Gamification Moderation
        </NavLink>

        {/* System Section */}
        <div className="pt-4 pb-2">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            System
          </h3>
        </div>

        {/* Notifications */}
        <NavLink
          to="/admin/notifications"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <Bell className="w-5 h-5" /> Notifications
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive ? 'bg-gray-100 text-gray-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <Settings className="w-5 h-5" /> Settings
        </NavLink>
      </nav>
    </aside>
  );
} 