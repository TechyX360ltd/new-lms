import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, UploadCloud } from 'lucide-react';

export function InstructorProfile() {
  const { user, updateUserProfile } = useAuth();
  const [bio, setBio] = useState(user?.bio || '');
  const [expertise, setExpertise] = useState(user?.expertise || '');
  const [payoutEmail, setPayoutEmail] = useState(user?.payoutEmail || '');
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null);
  const [nationalIdUrl, setNationalIdUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load national ID from localStorage if present
    const stored = localStorage.getItem('instructorNationalId');
    if (stored) setNationalIdUrl(stored);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNationalIdFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setNationalIdUrl(ev.target.result as string);
          localStorage.setItem('instructorNationalId', ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Save to localStorage (or call updateUserProfile if available)
    const updated = {
      bio,
      expertise,
      payoutEmail,
      nationalIdUrl,
    };
    localStorage.setItem('instructorProfile', JSON.stringify(updated));
    if (updateUserProfile) {
      updateUserProfile(updated);
    }
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-blue-700">Instructor Profile</h2>
        {user?.isApproved ? (
          <span title="Verified Instructor">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </span>
        ) : (
          <span className="text-yellow-600 text-sm font-medium">Pending Verification</span>
        )}
      </div>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expertise</label>
          <input
            type="text"
            value={expertise}
            onChange={e => setExpertise(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Web Development, Data Science"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payout Email</label>
          <input
            type="email"
            value={payoutEmail}
            onChange={e => setPayoutEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your payout email"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">National ID (for verification)</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-200"
            >
              <UploadCloud className="w-5 h-5" /> Upload ID
            </button>
            {nationalIdUrl && (
              <span className="text-green-600 text-sm">ID Uploaded</span>
            )}
          </div>
          {nationalIdUrl && (
            <div className="mt-2">
              <a href={nationalIdUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                View Uploaded ID
              </a>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
} 