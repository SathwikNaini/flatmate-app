import React, { useState, useEffect, useRef } from 'react';
import { profiles, users } from '../lib/api';

function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    matches: true,
    messages: true
  });
  
  // Initialize theme from localStorage or default to dark
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Apply theme to document documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    // Fetch user profile on mount to get current avatar and preferences
    const fetchData = async () => {
      try {
        // We handle preferences first since it doesn't require localStorage user object parsing explicitly
        try {
          const prefs = await users.getPreferences();
          setNotifications(prev => ({...prev, ...prefs}));
        } catch(e) { console.error("Could not fetch prefs", e); }
        
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          const currentProfile = await profiles.getById(userObj.id);
          if (currentProfile && currentProfile.profile_pic) {
            setAvatarUrl(currentProfile.profile_pic);
          }
        }
      } catch (err) {
        console.error("Could not fetch settings data", err);
      }
    };
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await users.updatePreferences(notifications);
      alert("Settings saved successfully!");
    } catch (err) {
      alert("Failed to save settings: " + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await profiles.uploadAvatar(file);
      
      // Update the local state to show the new picture immediately.
      // Append the API_URL since the db saves it as /uploads/xxxx
      setAvatarUrl(import.meta.env.VITE_API_URL + res.profile_pic);
      alert("Profile picture updated!");
    } catch (err) {
      alert("Failed to upload avatar: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="section-container fade-in">
      <div className="card saas-card">
        <div className="card-header border-none">
          <h3><span className="mr-2">⚙️</span> Account Settings</h3>
          <p>Manage your app preferences and notifications.</p>
        </div>
        
        <div className="card-body">
          {/* Profile Picture Section */}
          <div className="settings-section mb-8 border-b border-white/10 pb-6 flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-accent text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-accent/40 overflow-hidden relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                'U'
              )}
              <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-sm font-medium transition-all">
                {uploading ? '...' : 'Edit'}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-1 text-primary">Profile Picture</h4>
              <p className="text-sm text-secondary opacity-70 mb-3">Upload a new avatar. Max 5MB.</p>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              <button 
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/10 disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Choose Image'}
              </button>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="settings-section mb-8">
            <h4 className="text-lg font-semibold mb-4 text-primary border-b border-white/10 pb-2">Appearance</h4>
            <div className="flex gap-4">
              <button 
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <span className="text-xl">☀️</span> Light Mode
              </button>
              <button 
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <span className="text-xl">🌙</span> Dark Mode
              </button>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="settings-section mb-8">
            <h4 className="text-lg font-semibold mb-4 text-primary border-b border-white/10 pb-2">Notifications</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div>
                  <h5 className="font-medium text-[15px]">Push Notifications</h5>
                  <p className="text-xs text-secondary opacity-70">Receive alerts on your device</p>
                </div>
                <label className="saas-toggle">
                  <input type="checkbox" checked={notifications.push} onChange={() => toggleNotification('push')} />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div>
                  <h5 className="font-medium text-[15px]">Email Notifications</h5>
                  <p className="text-xs text-secondary opacity-70">Receive daily summaries and important alerts</p>
                </div>
                <label className="saas-toggle">
                  <input type="checkbox" checked={notifications.email} onChange={() => toggleNotification('email')} />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div>
                  <h5 className="font-medium text-[15px]">New Messages</h5>
                  <p className="text-xs text-secondary opacity-70">Alerts for new chat messages</p>
                </div>
                <label className="saas-toggle">
                  <input type="checkbox" checked={notifications.messages} onChange={() => toggleNotification('messages')} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="settings-section">
            <h4 className="text-lg font-semibold mb-4 text-red-500 border-b border-red-500/20 pb-2">Danger Zone</h4>
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <h5 className="font-medium text-[15px] text-red-400 mb-1">Delete Account</h5>
              <p className="text-xs text-secondary opacity-70 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <button 
                className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition-colors border border-red-500/20"
                onClick={() => alert("Account deletion requires email confirmation in this demo.")}
              >
                Delete my account
              </button>
            </div>
          </div>

          <div className="form-actions mt-8 pt-4 border-t border-white/10">
            <button 
              className="primary-btn saas-btn w-full sm:w-auto" 
              onClick={handleSaveSettings}
              disabled={savingSettings}
            >
              {savingSettings ? <div className="spinner-xs"></div> : null}
              <span className="btn-text">{savingSettings ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
