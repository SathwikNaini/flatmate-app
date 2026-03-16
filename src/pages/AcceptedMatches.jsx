import { useEffect, useState } from "react";
import { auth, connections } from "../lib/api";
import Chat from "./Chat";
import Avatar from "../components/Avatar";

function AcceptedMatches({ socket }) {
  const [matches, setMatches] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const userData = await auth.getUser();
        setCurrentUser(userData.user);

        const data = await connections.getAccepted();
        setMatches(data || []);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    fetchMatches();
  }, []);

  const filteredMatches = matches.filter(match => 
    match.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="matches-page-wrapper fade-in">
      {matches.length === 0 ? (
        <div className="empty-state-card saas-card glass-card">
          <div className="empty-state-content">
            <div className="empty-icon-pulse">🤝</div>
            <h3 className="mt-4 text-lg font-medium">No matches yet</h3>
            <p className="text-secondary">Keep searching to find the perfect flatmate! Matches will appear here once accepted.</p>
          </div>
        </div>
      ) : (
        <div className={`saas-chat-container ${activeChat ? 'active-chat-open' : ''}`}>
          {/* Conversation Sidebar */}
          <div className="chat-sidebar-pane">
            <div className="sidebar-header-saas">
              <h3 className="font-bold text-xl tracking-tight mb-4">Messages</h3>
              <div className="sidebar-search-chat">
                <input 
                  type="text" 
                  placeholder="Search chats..." 
                  className="chat-search-input" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="conversation-list-saas">
              {filteredMatches.map((match, index) => (
                <div 
                  key={match.id} 
                  className={`conversation-item-saas ${activeChat === match.match_user_id ? 'active' : ''}`}
                  onClick={() => setActiveChat(match.match_user_id)}
                >
                  <Avatar 
                    src={match.profile_pic} 
                    name={match.name} 
                    className="avatar-saas-md" 
                    indicator={match.is_online ? "online" : "offline"} 
                  />
                  <div className="conv-meta-saas flex-1 min-width-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="conv-name text-[15px] font-semibold truncate leading-tight">
                        {match.name || "Anonymous"}
                      </h4>
                      <span className="conv-time text-[11px] opacity-50 font-medium whitespace-nowrap ml-2">
                        {index === 0 ? "21:19" : "Yesterday"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="conv-preview text-[13px] opacity-60 truncate pr-2">
                        {index === 0 ? "Sure, let's talk about the room..." : "Click to open conversation"}
                      </p>
                      {(index === 0 || index === 2) && activeChat !== match.match_user_id && (
                        <div className="unread-badge-saas">
                          {index === 0 ? "2" : "1"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredMatches.length === 0 && (
                <div className="p-8 text-center opacity-40">
                  <p className="text-sm">No matches found</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Main Pane */}
          <div className="chat-main-pane">
            {activeChat ? (
              <Chat 
                receiverId={activeChat} 
                receiverName={matches.find(m => m.match_user_id === activeChat)?.name}
                receiverAvatar={matches.find(m => m.match_user_id === activeChat)?.profile_pic}
                onBack={() => setActiveChat(null)} 
                socket={socket}
              />
            ) : (
              <div className="chat-empty-view">
                <div className="empty-chat-icon">💬</div>
                <h3 className="text-xl font-bold">Select a conversation</h3>
                <p className="text-secondary opacity-60 max-w-[280px] mx-auto mt-2">
                  Choose a connection from the left to start chatting.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AcceptedMatches;
