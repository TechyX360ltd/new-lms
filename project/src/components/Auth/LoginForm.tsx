import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  onToggleForm: () => void;
}

export function LoginForm({ onToggleForm }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading, isSupabaseConnected } = useAuth();
  const [showEmailConfirmToast, setShowEmailConfirmToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorToastMessage, setErrorToastMessage] = useState('');

  useEffect(() => {
    if (localStorage.getItem('showEmailConfirmToast')) {
      setShowEmailConfirmToast(true);
      localStorage.removeItem('showEmailConfirmToast');
      const timer = setTimeout(() => setShowEmailConfirmToast(false), 120000); // 120 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  // Show error toast if sessionStorage has a message (persists across remounts)
  useEffect(() => {
    const msg = sessionStorage.getItem('loginErrorToastMessage');
    if (msg) {
      setErrorToastMessage(msg);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 8000);
      sessionStorage.removeItem('loginErrorToastMessage');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      console.log('Login error object:', err);
      let msg = 'Login failed. Please try again.';
      if (err?.message?.toLowerCase().includes('invalid login credentials')) {
        msg = 'Invalid email or password. Please try again.';
      } else if (err?.message?.toLowerCase().includes('email not confirmed') || err?.message?.toLowerCase().includes('user not confirmed')) {
        msg = 'Please confirm your email before logging in.';
      }
      setError(msg);
      setErrorToastMessage(msg);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 8000);
      // Persist error toast in sessionStorage so it survives remounts
      sessionStorage.setItem('loginErrorToastMessage', msg);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
      {showErrorToast && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg text-center font-medium shadow z-50">
          {errorToastMessage}
        </div>
      )}
      {showEmailConfirmToast && (
        <div className="mb-4 p-4 bg-orange-100 text-orange-800 rounded-lg text-center font-medium shadow">
          Please check your email and confirm your account to continue.
        </div>
      )}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <img 
            src="/BLACK-1-removebg-preview.png" 
            alt="TECHYX 360" 
            className="h-12 w-auto"
          />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your TECHYX 360 account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="john@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {isSupabaseConnected && (
          <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
            Connected to Supabase - Your login will be authenticated with the database
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onToggleForm}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}