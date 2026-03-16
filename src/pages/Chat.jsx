import { useEffect, useState, useRef } from "react";
import { auth, messages, users } from "../lib/api";
import VideoCall from "../components/VideoCall";
import Avatar from "../components/Avatar";

function Chat(props) {
  const { receiverId, socket } = props;
  const [messageList, setMessageList] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [sending, setSending] = useState(false);
  const [activeMessageOptions, setActiveMessageOptions] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(null);

  // WebRTC Call State
  const [callData, setCallData] = useState(null); // { isInitiator: boolean, callType: 'video'|'audio', incomingSignal?: any }

  const emojis = ['😊', '😂', '🥺', '😍', '👍', '🙏', '❤️', '🔥', '🎉', '🙌', '😎', '🤔', '👋', '✨', '💯', '💩', '🤯', '🥳'];

  const [typingStatus, setTypingStatus] = useState({ isTyping: false, conversationId: null, user: "" });

  // Typing Indicator Logic
  useEffect(() => {
    if (!socket || !receiverId) return;

    const handleUserTyping = (data) => {
      if (data.senderId === receiverId) {
        setTypingStatus({
          isTyping: true,
          conversationId: receiverId,
          user: props.receiverName || "User"
        });

        // Auto clear after 3 seconds
        setTimeout(() => {
          setTypingStatus(prev => ({ ...prev, isTyping: false }));
        }, 3000);
      }
    };

    socket.on('user_typing', handleUserTyping);
    return () => socket.off('user_typing', handleUserTyping);
  }, [socket, receiverId, props.receiverName]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await auth.getUser();
        setCurrentUser(userData.user);
        fetchMessages();
      } catch (error) {
        console.error("Error getting user:", error);
      }
    };

    getUser();
  }, [receiverId]);

  // Real-time Message Listener
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      // Only append if it's from the person we are currently chatting with
      if (newMessage.sender_id === receiverId || newMessage.receiver_id === receiverId) {
        setMessageList(prev => [...prev].filter(msg => msg.id !== newMessage.id).concat(newMessage));
        scrollToBottom();
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    
    // WebRTC Listeners
    socket.on('incoming_call', (data) => {
      // Only show ring if we aren't already in a call
      setCallData(prev => {
        if (prev) return prev;
        return {
          isInitiator: false,
          callType: data.type,
          incomingSignal: data.signal,
          callerName: data.name
        };
      });
    });

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('incoming_call');
    };
  }, [socket, receiverId]);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messageList]);

  const fetchMessages = async () => {
    try {
      const data = await messages.get(receiverId);
      setMessageList(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm("Delete this message?")) return;
    try {
      await messages.delete(messageId);
      // Update local state to remove the message
      setMessageList(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message");
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !attachment) || sending) return;
    setSending(true);

    try {
      // If there's an attachment, in a real app we'd upload it first and get a URL.
      // For this demo, we'll just append a pseudo indicator to the text.
      let messageContent = newMessage;
      if (attachment) {
        messageContent += `\n[Attached File: ${attachment.name}]`;
      }

      await messages.send(receiverId, messageContent.trim());
      
      setNewMessage('');
      setAttachment(null);
      setShowEmojiPicker(false);
      await fetchMessages(); // Re-fetch messages to include the new one
    } catch (error) {
      alert("Error sending message: " + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      // Broadcast typing event
      if (socket) {
        socket.emit("typing", receiverId);
      }
    }
  };

  const handleShowInfo = async () => {
    try {
      const data = await users.getInfo(receiverId);
      setShowUserInfo(data);
    } catch (error) {
      alert("Could not load user info: " + error.message);
    }
  };

  return (
    <div className="chat-interface-modern overflow-hidden flex flex-col h-full bg-transparent border-none">
      {/* Chat Header */}
      <div className="chat-header-saas">
        <div className="flex items-center">
          <button className="chat-back-btn" onClick={props.onBack}>
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <Avatar 
              src={props.receiverAvatar} 
              name={props.receiverName} 
              className="avatar-saas-md" 
              indicator="online" 
            />
            <div className="chat-user-info-sm">
              <h4 className="font-bold text-lg leading-tight">{props.receiverName || "Anonymous User"}</h4>
              <span className="text-xs text-secondary flex items-center gap-1.5 opacity-60">
                Online
              </span>
            </div>
          </div>
        </div>
        <div className="chat-header-actions flex gap-4 opacity-70 px-2">
          <button className="icon-btn-saas hov-scale text-xl" onClick={() => setCallData({ isInitiator: true, callType: 'audio' })}>📞</button>
          <button className="icon-btn-saas hov-scale text-xl" onClick={() => setCallData({ isInitiator: true, callType: 'video' })}>📹</button>
          <button className="icon-btn-saas hov-scale text-xl" onClick={handleShowInfo}>ℹ️</button>
        </div>
      </div>

      <div className="chat-messages-scroll-area flex-1 overflow-y-auto p-4 custom-scrollbar">
        {messageList.length === 0 ? (
          <div className="chat-welcome-state">
            <div className="empty-chat-icon">💬</div>
            <p className="text-base text-center max-w-[200px]">Send a message to start chatting with {props.receiverName}</p>
          </div>
        ) : (
          <div className="messages-stack flex flex-col gap-2">
            {messageList.map((msg) => {
              const isMe = msg.sender_id === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-[15px] relative cursor-pointer select-none ${
                      isMe
                        ? 'saas-bubble outgoing'
                        : 'saas-bubble incoming'
                    }`}
                    onClick={() => setActiveMessageOptions(msg.id === activeMessageOptions ? null : msg.id)}
                  >
                    {msg.content}
                    
                    {/* Floating Context Menu */}
                    {activeMessageOptions === msg.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMessageOptions(null);
                          }}
                        ></div>
                        <div className={`absolute top-[90%] ${isMe ? 'right-0' : 'left-0'} mt-1 w-44 bg-[#1a2235] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-white/10 overflow-hidden z-50 py-1.5 backdrop-blur-xl animate-fade-in-up`}>
                          <button 
                            className="w-full text-left px-4 py-2 text-[14px] font-medium text-slate-200 hover:bg-white/10 flex items-center gap-3 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(msg.content);
                              setActiveMessageOptions(null);
                            }}
                          >
                            <span className="opacity-70 text-[16px]">📄</span> Copy Text
                          </button>
                          
                          {isMe && (
                            <button 
                              className="w-full text-left px-4 py-2 text-[14px] font-medium text-red-500 hover:bg-white/10 flex items-center gap-3 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMessage(msg.id);
                                setActiveMessageOptions(null);
                              }}
                            >
                              <span className="opacity-70 text-[16px]">🗑️</span> Delete
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] opacity-40 px-2">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <span className="bubble-status text-[10px] text-accent">✓✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      <div className="typing-area-saas px-6 py-1 h-6 flex items-center justify-between">
        {typingStatus.isTyping && typingStatus.conversationId === receiverId ? (
          <div className="typing-indicator flex items-center gap-2">
            <span className="text-[11px] text-secondary font-medium">{typingStatus.user} is typing</span>
            <div className="typing-dots flex gap-1">
              <span className="dot-bounce"></span>
              <span className="dot-bounce"></span>
              <span className="dot-bounce"></span>
            </div>
          </div>
        ) : <div />}
        
        {attachment && (
          <div className="text-[11px] text-accent flex items-center gap-2 bg-accent/10 px-2 py-1 rounded">
            📎 {attachment.name}
            <button onClick={() => setAttachment(null)} className="hover:text-red-500 ml-1">✕</button>
          </div>
        )}
      </div>

      <div className="chat-input-container relative">
        {showEmojiPicker && (
          <div 
            ref={emojiPickerRef}
            className="emoji-picker-popup"
          >
            <div className="emoji-grid">
              {emojis.map((emoji, i) => (
                <button 
                  key={i} 
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-xl hover:bg-white/10 w-9 h-9 flex items-center justify-center rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="icon-button" title="Emoji">😊</button>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileUpload} 
          accept="image/*,.pdf,.doc,.docx"
        />
        <button onClick={() => fileInputRef.current?.click()} className="icon-button" title="Attach">📎</button>
        
        <textarea
          className="message-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          rows="1"
          disabled={sending}
        />
        
        <button 
          onClick={sendMessage}
          className="send-button"
          disabled={(!newMessage.trim() && !attachment) || sending}
        >
          {sending ? <div className="spinner-xs"></div> : (
             <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
             </svg>
          )}
        </button>
      </div>

      {showUserInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowUserInfo(null)}>
          <div className="card saas-card max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="card-header pb-2 flex justify-between items-start">
              <h3 className="text-xl font-bold">User Information</h3>
              <button className="text-secondary hover:text-white" onClick={() => setShowUserInfo(null)}>✕</button>
            </div>
            <div className="card-body">
              <div className="flex flex-col items-center mb-6">
                <Avatar 
                  src={showUserInfo.profile_pic} 
                  name={showUserInfo.name} 
                  className="w-20 h-20 text-3xl mb-3 shadow-lg shadow-accent/40" 
                />
                <h4 className="text-xl font-bold m-0">{showUserInfo.name || 'Anonymous User'}</h4>
                <div className="text-sm text-secondary mt-1 tracking-wide" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                  {showUserInfo.email}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                  <div className="text-xl bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center">📍</div>
                  <div>
                    <div className="text-xs text-secondary mb-0.5">Location</div>
                    <div className="font-semibold text-sm">{showUserInfo.location || 'Not specified'}</div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 flex-1">
                    <div className="text-xl bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center">👤</div>
                    <div>
                      <div className="text-xs text-secondary mb-0.5">Age</div>
                      <div className="font-semibold text-sm">{showUserInfo.age || '--'}</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 flex-1">
                    <div className="text-xl bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center">🤝</div>
                    <div>
                      <div className="text-xs text-secondary mb-0.5">Preferences</div>
                      <div className="font-semibold text-sm truncate max-w-[100px]" title={showUserInfo.preferences}>{showUserInfo.preferences || 'Any'}</div>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-xs text-secondary opacity-60">Member since {new Date(showUserInfo.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WebRTC Video Call Overlay */}
      {callData && (
        <VideoCall 
          socket={socket}
          receiverId={receiverId}
          receiverName={callData.callerName || props.receiverName || "User"}
          currentUser={currentUser}
          isInitiator={callData.isInitiator}
          callType={callData.callType}
          incomingSignal={callData.incomingSignal}
          onClose={() => setCallData(null)}
        />
      )}
    </div>
  );
}

export default Chat;