import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, UploadCloud, Camera, X } from 'lucide-react';
import { uploadToCloudinary } from '../../lib/cloudinary';

export function InstructorProfile() {
  const { user, updateUserProfile } = useAuth();
  const [bio, setBio] = useState(user?.bio || '');
  const [expertise, setExpertise] = useState(user?.expertise || '');
  const [payoutEmail, setPayoutEmail] = useState(user?.payoutEmail || '');
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null);
  const [nationalIdUrl, setNationalIdUrl] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select a valid image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size must be less than 5MB');
        return;
      }
      setIsLoading(true);
      setErrorMessage('');
      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(file, 'lms-avatars');
        setAvatar(result.secure_url);
        setSuccessMessage('Profile photo uploaded successfully!');
      } catch (err) {
        setErrorMessage('Failed to upload image. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Save to localStorage (or call updateUserProfile if available)
      const updated = {
        bio,
        expertise,
        payoutEmail,
        nationalIdUrl,
        avatar,
      };
      localStorage.setItem('instructorProfile', JSON.stringify(updated));
      if (updateUserProfile) {
        await updateUserProfile(updated);
      }
      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      setErrorMessage('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
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

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 mb-6">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 mb-6">
          <X className="w-5 h-5 text-red-600" />
          <p className="text-red-800 font-medium">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-colors"
                  title="Upload Photo"
                  disabled={isLoading}
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                {avatar && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg transition-colors"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-sm text-gray-600">
                Upload a profile photo to personalize your instructor profile.
              </p>
              {isLoading && (
                <p className="text-sm text-blue-600 mt-1">Uploading...</p>
              )}
            </div>
          </div>
        </div>

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