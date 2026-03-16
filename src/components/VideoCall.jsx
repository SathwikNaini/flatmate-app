import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';

// This component handles the WebRTC Video/Audio stream and the UI modal
const VideoCall = ({ 
  socket, 
  receiverId, 
  receiverName, 
  currentUser, 
  isInitiator, 
  callType, // 'video' or 'audio'
  incomingSignal,
  onClose 
}) => {
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(!!incomingSignal);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  // 1. Initialize media stream
  useEffect(() => {
    const getMedia = async () => {
      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({
          video: callType === 'video',
          audio: true
        });
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        // Auto-call if we are the initiator
        if (isInitiator) {
          callUser(currentStream);
        }
      } catch (err) {
        console.error("Failed to get local stream", err);
        alert("Microphone/Camera permission denied. Cannot place call.");
        onClose();
      }
    };

    getMedia();

    // Clean up media streams and listeners on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // 2. socket listens for accept / end
  useEffect(() => {
    if (!socket) return;

    socket.on("call_accepted", (signal) => {
      setCallAccepted(true);
      if (connectionRef.current) {
        connectionRef.current.signal(signal);
      }
    });

    socket.on("call_ended", () => {
      leaveCall();
    });

    return () => {
      socket.off("call_accepted");
      socket.off("call_ended");
    };
  }, [socket]);

  // Caller -> init peer
  const callUser = (myStream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: myStream
    });

    peer.on("signal", (data) => {
      socket.emit("call_user", {
        userToCall: receiverId,
        signalData: data,
        from: currentUser.id,
        name: currentUser.name,
        type: callType
      });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    connectionRef.current = peer;
  };

  // Receiver -> accept peer
  const answerCall = () => {
    setCallAccepted(true);
    setReceivingCall(false);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    });

    peer.on("signal", (data) => {
      socket.emit("answer_call", { signal: data, to: receiverId });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.signal(incomingSignal);
    connectionRef.current = peer;
  };

  // End call
  const leaveCall = () => {
    setCallEnded(true);
    socket.emit("end_call", { to: receiverId });
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center animate-fade-in text-white">
      <div className="flex flex-col items-center w-full max-w-4xl px-4">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">
            {callType === 'video' ? '📹 Video Call' : '📞 Voice Call'}
          </h2>
          {!callAccepted && isInitiator && !callEnded && (
            <p className="text-secondary animate-pulse">Calling {receiverName}...</p>
          )}
          {receivingCall && !callAccepted && (
            <p className="text-accent animate-pulse">{receiverName} is calling you...</p>
          )}
        </div>

        {/* Video Grid */}
        <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center mb-8">
          
          {/* Local Video */}
          {(stream && (!receivingCall || callAccepted)) && (
            <div className={`relative rounded-2xl overflow-hidden bg-black border-2 border-white/10 ${callType === 'audio' ? 'w-48 h-48 rounded-full' : 'w-full md:w-1/2 max-w-lg aspect-video'}`}>
              <video 
                playsInline 
                muted 
                ref={myVideo} 
                autoPlay 
                className={`w-full h-full object-cover ${callType === 'video' ? 'scale-x-[-1]' : ''}`} // mirror video
              />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-sm font-medium drop-shadow-md">
                <span>You</span>
                {callType === 'audio' && <span className="animate-pulse text-green-400">Audio Active</span>}
              </div>
            </div>
          )}

          {/* Remote Video */}
          {callAccepted && !callEnded && (
            <div className={`relative rounded-2xl overflow-hidden bg-black border-2 border-accent/50 ${callType === 'audio' ? 'w-48 h-48 rounded-full' : 'w-full md:w-1/2 max-w-lg aspect-video'}`}>
              <video 
                playsInline 
                ref={userVideo} 
                autoPlay 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-sm font-medium backdrop-blur-sm">
                {receiverName}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-6 mt-4">
          {receivingCall && !callAccepted ? (
            <>
              <button onClick={answerCall} className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-3xl shadow-lg shadow-green-500/30 transition-transform hover:scale-110">
                📞
              </button>
              <button onClick={leaveCall} className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-3xl shadow-lg shadow-red-500/30 transition-transform hover:scale-110">
                ✕
              </button>
            </>
          ) : (
            <button onClick={leaveCall} className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-3xl shadow-lg shadow-red-500/30 transition-transform hover:scale-110">
              📞
              <span className="absolute -rotate-[135deg]">/</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
