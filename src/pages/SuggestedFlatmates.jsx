import { useEffect, useState } from "react";
import { profiles, connections } from "../lib/api";
import Avatar from "../components/Avatar";

function SuggestedFlatmates() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const data = await profiles.getSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await connections.send(userId);
      alert("Connection request sent!");
      setSuggestions(suggestions.filter(p => p.user_id !== userId));
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <p>Loading suggestions...</p>;

  return (
    <div className="suggestions-container-saas fade-in">
      <div className="section-header saas-section-header">
        <div className="header-content">
          <h3>💡 People for You</h3>
          <p className="text-secondary">Based on your shared location and flatmate preferences</p>
        </div>
      </div>

      {suggestions.length === 0 && (
        <div className="empty-state-card card saas-card">
          <div className="card-body py-12 text-center">
            <p className="text-secondary">No suggestions available right now. Try updating your profile!</p>
          </div>
        </div>
      )}

      <div className="results-grid-saas">
        {suggestions.map(profile => (
          <div
            key={profile.id}
            className="card saas-card glass-card hover-lift result-card"
          >
            <div className="card-body">
              <div className="compatibility-badge">
                <span>{profile.compatibility_score || 50}% Match</span>
                {(profile.compatibility_score || 50) >= 80 && (
                  <span className="ml-2 text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                    Top Choice
                  </span>
                )}
              </div>
              <div className="profile-header-sm">
                <Avatar 
                  src={profile.profile_pic} 
                  name={profile.name} 
                  className="avatar-lg bg-indigo-500 text-white" 
                  indicator={profile.is_online ? "online" : undefined}
                />
                <div className="profile-info-sm">
                  <h5>{profile.name || "Anonymous User"}</h5>
                  <p className="location-meta">
                    <span>🎂 {profile.age || "??"} yrs</span>
                    <span className="dot">•</span>
                    <span>📍 {profile.location}</span>
                  </p>
                </div>
              </div>
              <div className="profile-tags-row mt-4">
                <span className="tag-pill">✨ Handpicked</span>
                <span className="tag-pill">🟢 {profile.is_online ? "Active Now" : "Recently Active"}</span>
              </div>
              <p className="profile-bio-summary mt-4">{profile.bio || "Searching for a compatible flatmate who values cleanliness and quiet hours."}</p>
            </div>
            <div className="card-footer border-none bg-transparent pt-0">
              <button 
                className="saas-btn primary-btn full-width" 
                onClick={() => handleConnect(profile.user_id)}
              >
                Connect Now
                <span className="btn-glow"></span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SuggestedFlatmates;
