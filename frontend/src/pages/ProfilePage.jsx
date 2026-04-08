import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { User, Mail, Shield, Camera, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const ProfilePage = () => {
  const { user, initAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    avatar: null,
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        bio: user.profile.bio || '',
        avatar: null,
      });
      setPreview(user.profile.avatar);
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('bio', formData.bio);
    if (formData.avatar) {
      data.append('avatar', formData.avatar);
    }

    try {
      await api.patch('/api/users/profile/update/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Profile updated successfully!');
      initAuth(); // Refresh user state
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-dark-card border border-slate-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm"
      >
        <div className="h-40 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 relative">
            <div className="absolute -bottom-16 left-12 flex items-end gap-6">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-dark-bg bg-slate-50 dark:bg-dark-card shadow-2xl">
                        {preview ? (
                            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                                <User size={48} className="text-gray-600" />
                            </div>
                        )}
                    </div>
                    <label className="absolute bottom-2 right-2 p-2 bg-purple-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-purple-700 transition-colors">
                        <Camera size={18} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                </div>
                <div className="pb-4">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user?.username}</h1>
                    <p className="text-primary font-medium">{user?.role}</p>
                </div>
            </div>
        </div>

        <div className="p-12 pt-24">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Mail size={16} /> Email Address
                    </label>
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-gray-400 cursor-not-allowed">
                        {user?.email}
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Shield size={16} /> Account Security
                    </label>
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-gray-400 cursor-not-allowed">
                        Password protected
                    </div>
                </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Professional Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors h-40 resize-none"
              />
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {loading ? 'Saving Changes...' : 'Save Profile'}
                </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
