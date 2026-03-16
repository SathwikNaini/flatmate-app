import { useEffect, useState } from "react";
import { auth, profiles, connections } from "../lib/api";
import Avatar from "../components/Avatar";

function Matches() {
  const [allProfiles, setAllProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, [page]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const userData = await auth.getUser();
      setCurrentUser(userData.user);

      const data = await profiles.getAll();
      
      // Handle both paginated and non-paginated responses
      if (data.profiles) {
        setAllProfiles(data.profiles);
        setTotalPages(data.pagination.totalPages);
      } else {
        setAllProfiles(data);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (receiverId) => {
    try {
      await connections.send(receiverId);
      alert("Connection request sent!");
      // Remove from list
      setAllProfiles(allProfiles.filter(p => p.user_id !== receiverId));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="matches-section fade-in">
      <div className="section-header">
        <h3>Discover Flatmates</h3>
        <p>Browse potential flatmates and send connection requests.</p>
      </div>

      {loading && allProfiles.length === 0 ? (
        <div className="skeleton-container">
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
        </div>
      ) : (
        <>
          {allProfiles.length === 0 && !loading ? (
            <div className="empty-state card">
              <div className="card-body">
                <div className="empty-icon">👥</div>
                <h3>No profiles found</h3>
                <p>Check back later for new potential flatmates.</p>
              </div>
            </div>
          ) : (
            <div className="results-grid">
              {allProfiles.map((profile) => (
                <div key={profile.id} className="card result-card">
                  <div className="card-body">
                    <div className="result-header">
                      <Avatar 
                        src={profile.profile_pic} 
                        name={profile.name} 
                        className="result-avatar" 
                      />
                      <div className="result-meta">
                        <h5>{profile.name || "Anonymous User"}</h5>
                        <span className="meta-info">
                          {profile.age ? `${profile.age} years` : "Age not set"} • {profile.location || "Location not set"}
                        </span>
                      </div>
                    </div>
                    <p className="result-bio">{profile.bio || "No bio provided."}</p>
                  </div>
                  <div className="card-footer">
                    <button 
                      className="primary-btn full-width" 
                      onClick={() => handleConnect(profile.user_id)}
                    >
                      Connect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination-container">
              <button 
                className="secondary-btn btn-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
              >
                ← Previous
              </button>
              <div className="pagination-info">
                Page {page} of {totalPages}
              </div>
              <button 
                className="secondary-btn btn-sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Matches;
