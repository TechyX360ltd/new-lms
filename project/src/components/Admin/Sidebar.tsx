import { BookOpen, Users, Settings, Layers } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const adminLinks = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'user-management', label: 'User Management', icon: Users },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'settings', label: 'Settings', icon: Settings },
];

{adminLinks.map(link => (
  <NavLink
    key={link.id}
    to={`/${link.id}`}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`
    }
  >
    <link.icon className="w-5 h-5" />
    {link.label}
  </NavLink>
))} 