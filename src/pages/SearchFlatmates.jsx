import { useState } from "react";
import { profiles, connections } from "../lib/api";
import Avatar from "../components/Avatar";

function SearchFlatmates() {
  const [location, setLocation] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const hyderabadAreas = [
    "Madhapur", "Gachibowli", "Kukatpally", "Ameerpet", 
    "Miyapur", "Kondapur", "Hitech City", "Begumpet", 
    "Banjara Hills", "Jubilee Hills"
  ];

  const [filters, setFilters] = useState({
    budget: "",
    gender: "",
    occupation: "",
    roomType: ""
  });

  const handleSearch = async (overrideLocation) => {
    const searchLoc = typeof overrideLocation === 'string' ? overrideLocation : location;
    if (!searchLoc) {
      alert("Please enter a location");
      return;
    }

    setLoading(true);
    try {
      // Passing filters to the search (mocking extra logic if backend doesn't support yet, but keeping structure)
      const data = await profiles.search(searchLoc, filters);
      setResults(data);
    } catch (error) {
      alert("Search failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await connections.send(userId);
      alert("Connection request sent!");
      setResults(results.filter(p => p.user_id !== userId));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="search-container-saas fade-in">
      <div className="card saas-card search-hero-card">
        <div className="card-header border-none">
          <h3>Find Your Next Flatmate</h3>
          <p>Search for people looking for flatmates in Hyderabad with specific preferences.</p>
        </div>
        <div className="card-body">
          <div className="search-input-group">
            <div className="search-bar-wrapper">
              <span className="search-icon-bg">🔍</span>
              <input
                type="text"
                className="saas-input"
                placeholder="Search areas (e.g., Madhapur)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <div className="filters-grid-saas mt-6">
            <div className="filter-group">
              <label>Budget Range</label>
              <select 
                className="saas-input" 
                value={filters.budget}
                onChange={(e) => setFilters({...filters, budget: e.target.value})}
              >
                <option value="">Any Budget</option>
                <option value="low">₹5k - ₹10k</option>
                <option value="mid">₹10k - ₹20k</option>
                <option value="high">₹20k+</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Gender</label>
              <select 
                className="saas-input"
                value={filters.gender}
                onChange={(e) => setFilters({...filters, gender: e.target.value})}
              >
                <option value="">Any Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Occupation</label>
              <select 
                className="saas-input"
                value={filters.occupation}
                onChange={(e) => setFilters({...filters, occupation: e.target.value})}
              >
                <option value="">Any Occupation</option>
                <option value="student">Student</option>
                <option value="professional">Professional</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Room Type</label>
              <select 
                className="saas-input"
                value={filters.roomType}
                onChange={(e) => setFilters({...filters, roomType: e.target.value})}
              >
                <option value="">Any Type</option>
                <option value="shared">Shared Room</option>
                <option value="private">Private Room</option>
              </select>
            </div>
          </div>

          <div className="action-row mt-6">
            <button 
              className="primary-btn saas-btn search-submit-btn w-full" 
              onClick={() => handleSearch()} 
              disabled={loading}
            >
              {loading ? <div className="spinner-xs"></div> : "Search Matches"}
              <span className="btn-glow"></span>
            </button>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="search-results-wrapper fade-in mt-12">
          <div className="results-grid-saas mt-6">
            {results.map(profile => (
              <div key={profile.id} className="card saas-card result-card glass-card hover-lift">
                <div className="card-body">
                  <div className="compatibility-badge">
                    <span>95% Match</span>
                  </div>
                  <div className="profile-header-sm">
                    <Avatar 
                      src={profile.profile_pic} 
                      name={profile.name} 
                      className="avatar-lg" 
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
                    <span className="tag-pill">💼 {profile.occupation || "Professional"}</span>
                    <span className="tag-pill">📅 Jan 2024</span>
                  </div>
                  <p className="profile-bio-summary mt-4">{profile.bio || "No bio provided."}</p>
                </div>
                <div className="card-footer border-none bg-transparent pt-0">
                  <button 
                    className="saas-btn primary-btn full-width" 
                    onClick={() => handleConnect(profile.user_id)}
                  >
                    Connect now
                    <span className="btn-glow"></span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !loading && location && (
        <div className="empty-results-saas card saas-card">
          <div className="card-body text-center py-12">
            <div className="empty-illustration">🏠</div>
            <h3 className="text-xl font-bold mt-4">No results found</h3>
            <p className="text-slate-400 mt-2">We couldn't find anyone in <strong>{location}</strong>. Try searching for a nearby area.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchFlatmates;
