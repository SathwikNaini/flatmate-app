import React from 'react';

const Avatar = ({ src, name, className = "", indicator }) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";
  const fullSrc = src && !src.startsWith('http') ? `${API_URL}${src}` : src;

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {fullSrc ? (
        <img 
          src={fullSrc} 
          alt={name || "User"} 
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center rounded-full bg-accent text-white font-bold tracking-wider shadow-inner shadow-white/10 uppercase">
          {name?.[0] || 'U'}
        </div>
      )}
      {indicator && (
        <span className={`status-indicator ${indicator}`}></span>
      )}
    </div>
  );
};

export default Avatar;
