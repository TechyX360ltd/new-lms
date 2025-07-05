import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './ToastContext';

interface LoginFormProps {
  onToggleForm: () => void;
  formData: any;
  setFormData: any;
  error: string;
  setError: any;
  showPassword: boolean;
  setShowPassword: any;
}

export function LoginForm({
  onToggleForm,
  formData,
  setFormData,
  error,
  setError,
  showPassword,
  setShowPassword
}: LoginFormProps) {
  const { login, isLoading, isSupabaseConnected, resetPassword } = useAuth();
  const { showToast } = useToast();
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Prefill email if remembered
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData((prev: any) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, [setFormData]);

  useEffect(() => {
    if (localStorage.getItem('showEmailConfirmToast')) {
      showToast('Please check your email and confirm your account to continue.', 'confirmation', 20000);
      localStorage.removeItem('showEmailConfirmToast');
    }
  }, [showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', formData.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    try {
      await login(formData.email, formData.password);
      showToast('Login successful!', 'success', 4000);
    } catch (err: any) {
      let msg = 'Login failed. Please try again.';
      let details = '';
      let type = 'error';
      if (err?.message?.toLowerCase().includes('invalid login credentials')) {
        details = 'Invalid email or password.';
      } else if (err?.message?.toLowerCase().includes('email not confirmed') || err?.message?.toLowerCase().includes('user not confirmed')) {
        msg = 'Login failed.';
        details = 'Please confirm your email before logging in.';
        type = 'confirmation';
      }
      setError(details || msg);
      showToast(msg, type as any, type === 'confirmation' ? 20000 : 5000, details);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotModal(true);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(forgotEmail)) {
      setForgotError('Please enter a valid email address.');
      return;
    }
    try {
      await resetPassword(forgotEmail);
      setForgotSuccess(true);
      showToast('A link to reset your password has been sent to your mail', 'success', 6000);
    } catch (err: any) {
      setForgotError(err?.message || 'Failed to send reset link. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
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
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev: boolean) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center text-sm text-gray-700 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600 rounded mr-2"
              />
              Remember Me
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Forgot Password?
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
      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => {
                setShowForgotModal(false);
                setForgotSuccess(false);
                setForgotEmail('');
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h2>
            {forgotSuccess ? (
              <div className="text-green-700 bg-green-50 p-4 rounded-lg text-center font-medium">
                A link to reset your password has been sent to your mail
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
                {forgotError && <div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{forgotError}</div>}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}