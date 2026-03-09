import { useEffect, useState, useRef } from "react";
import { auth, profiles } from "../lib/api";
import IncomingRequests from "./IncomingRequests";
import AcceptedMatches from "./AcceptedMatches";
import Notifications from "./Notifications";
import SearchFlatmates from "./SearchFlatmates";
import SuggestedFlatmates from "./SuggestedFlatmates";
import Matches from "./Matches";
import Settings from "./Settings";
import Privacy from "./Privacy";
import Help from "./Help";

function Dashboard({ activeTab, setActiveTab, socket }) {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userData = await auth.getUser();
      setUser(userData.user);

      const profileData = await profiles.getById(userData.user.id);
      
      if (profileData) {
        setProfile(profileData);
      } else {
        setProfile({ name: "", age: "", bio: "", location: "", preferences: "" });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      console.log('Updating profile with data:', profile);
      
      // Use PUT method for update
      const updatedProfile = await profiles.updateProfile({
        name: profile.name,
        age: profile.age,
        bio: profile.bio,
        location: profile.location,
        preferences: profile.preferences,
        avatar_base64: profile.avatar_base64
      });
      
      console.log('Profile updated successfully:', updatedProfile);
      
      // Update local state with the returned profile
      setProfile(updatedProfile);
      
      // Re-fetch profile to ensure UI is perfectly in sync with server state
      await fetchProfile();
      
      alert("Profile updated successfully!");
    } catch (error) {
      console.error('Profile update error:', error);
      alert("Error updating profile: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, avatar_base64: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  if (loading) return (
    <div className="skeleton-container">
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-card"></div>
    </div>
  );

  return (
    <div className="dashboard-content">
      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="section-container fade-in">
          <div className="card saas-card">
            <div className="card-header border-none">
              <h3>Profile Settings</h3>
              <p>Manage your public information and flatmate preferences.</p>
            </div>
            <div className="card-body">
              <div className="profile-dp-section pb-6 mb-6 border-b border-[var(--border-color)] flex justify-center">
                <div 
                  className="profile-dp-container relative cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profile?.avatar_base64 ? (
                    <img src={profile.avatar_base64} alt="Profile DP" className="dp-image" />
                  ) : (
                    <div className="dp-fallback bg-gradient-to-br from-indigo-500 to-purple-600">
                      {profile?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="dp-overlay absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-2xl mb-1">📷</span>
                    <span className="text-[10px] text-white font-medium uppercase tracking-wider">Change DP</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                  style={{ display: 'none' }}
                />
              </div>

              <div className="form-grid">
                <div className="form-group flex-1">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={profile?.name || ""}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Age</label>
                  <input
                    type="number"
                    placeholder="e.g. 24"
                    value={profile?.age || ""}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Location (Hyderabad)</label>
                <input
                  type="text"
                  placeholder="e.g. Madhapur, Gachibowli"
                  value={profile?.location || ""}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Professional Bio</label>
                <textarea
                  placeholder="Tell potential flatmates a bit about yourself, your hobbies, and living style..."
                  rows="4"
                  value={profile?.bio || ""}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
              </div>

              <div className="form-actions mt-4">
                <button 
                  className="primary-btn saas-btn" 
                  onClick={handleUpdate}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="spinner-xs"></div>
                      <span className="btn-text">Saving...</span>
                    </>
                  ) : (
                    <span className="btn-text">Save Changes</span>
                  )}
                  <span className="btn-glow"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && <Notifications />}

      {/* Search Tab */}
      {activeTab === "search" && <SearchFlatmates />}

      {/* Suggestions Tab */}
      {activeTab === "suggestions" && <SuggestedFlatmates />}

      {/* Requests Tab */}
      {activeTab === "requests" && <IncomingRequests />}

      {/* Connections Tab */}
      {activeTab === "connections" && <AcceptedMatches socket={socket} />}

      {/* Old Matches/Discover Tab (if needed) */}
      {activeTab === "matches" && <Matches socket={socket} />}
      
      {/* Profile Dropdown Features */}
      {activeTab === "settings" && <Settings />}
      {activeTab === "privacy" && <Privacy />}
      {activeTab === "help" && <Help />}
    </div>
  );
}

export default Dashboard;
