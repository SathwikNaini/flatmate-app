import { useEffect, useState } from "react";
import { auth, connections } from "../lib/api";
import Avatar from "../components/Avatar";

function IncomingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await connections.getIncoming();
        setRequests(data || []);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
      setLoading(false);
    };

    fetchRequests();
  }, []);

  const handleAccept = async (connectionId) => {
    try {
      await connections.updateStatus(connectionId, "accepted");
      alert("Connection accepted!");
      setRequests((prev) => prev.filter((req) => req.id !== connectionId));
    } catch (error) {
      alert("Error accepting connection: " + error.message);
    }
  };

  const handleReject = async (connectionId) => {
    try {
      await connections.updateStatus(connectionId, "rejected");
      alert("Connection rejected!");
      setRequests((prev) => prev.filter((req) => req.id !== connectionId));
    } catch (error) {
      alert("Error rejecting connection: " + error.message);
    }
  };

  if (loading) return (
    <div className="skeleton-container">
      <div className="skeleton skeleton-card"></div>
    </div>
  );

  return (
    <div className="requests-container fade-in">
      <div className="section-header mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Pending Requests</h2>
        <p className="text-secondary">Manage your incoming connection requests.</p>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state-card saas-card glass-card">
          <div className="empty-state-content">
            <div className="empty-icon-pulse">📩</div>
            <h3 className="mt-4 text-lg font-medium">Clear for now!</h3>
            <p className="text-secondary">New connection requests will appear here as people find your profile.</p>
          </div>
        </div>
      ) : (
        <div className="results-grid-saas">
          {requests.map((req) => (
            <div key={req.id} className="card saas-card glass-card hover-lift">
              <div className="card-body">
                <div className="profile-header-sm">
                  <Avatar 
                    src={req.profile_pic} 
                    name={req.name} 
                    className="avatar-saas-lg" 
                    indicator={req.is_online ? "online" : undefined}
                  />
                  <div className="profile-meta-sm">
                    <h5 className="font-bold text-lg">{req.name || "Anonymous User"}</h5>
                    <span className="location-tag-saas">📍 {req.location || "Location not set"}</span>
                    {req.age && <span className="age-tag-saas"> • {req.age} years</span>}
                  </div>
                </div>
                
                <div className="request-bio-preview mt-4">
                   <p className="text-sm text-secondary truncate-2">{req.bio || "No bio provided"}</p>
                </div>
              </div>
              <div className="card-footer-saas button-group px-6 pb-6">
                <button 
                  className="saas-btn primary-btn flex-1" 
                  onClick={() => handleAccept(req.id)}
                >
                  <span className="btn-text">Accept ✅</span>
                  <span className="btn-glow"></span>
                </button>
                <button 
                  className="saas-btn secondary-btn flex-1" 
                  onClick={() => handleReject(req.id)}
                >
                  <span className="btn-text">Decline</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default IncomingRequests;
