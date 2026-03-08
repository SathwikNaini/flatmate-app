import React, { useState, useEffect, useRef } from "react";
import "./Layout.css";

const Layout = ({ children, activeTab, setActiveTab, onLogout, user }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "search", label: "Search", icon: "🔍" },
    { id: "suggestions", label: "Suggestions", icon: "💡" },
    { id: "requests", label: "Requests", icon: "📩" },
    { id: "connections", label: "Connections", icon: "🤝" },
  ];

  const handleNavClick = (id) => {
    setActiveTab?.(id);
    if (isMobile) setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false); // Close menu on nav
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className={`saas-layout ${isSidebarCollapsed ? "collapsed" : ""} ${isMobile ? "mobile" : ""}`}>
      {/* LEFT SIDEBAR */}
      <aside className={`sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-box">
            <span className="logo-icon">🚀</span>
            {!isSidebarCollapsed && <span className="logo-text">FlatmateFinder</span>}
          </div>
          {isMobile && (
            <button className="close-mobile-btn" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <span className="group-label">{isSidebarCollapsed ? "•" : "Main Menu"}</span>
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`nav-btn ${activeTab === item.id ? "active" : ""}`}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
              >
                <span className="btn-icon">{item.icon}</span>
                {!isSidebarCollapsed && <span className="btn-label">{item.label}</span>}
                {activeTab === item.id && !isSidebarCollapsed && <span className="active-dot"></span>}
              </button>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-btn logout-btn" onClick={onLogout} title="Logout">
            <span className="btn-icon">🚪</span>
            {!isSidebarCollapsed && <span className="btn-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA */}
      <div className="main-wrapper">
        {/* TOP NAVBAR */}
        <header className="top-navbar sticky-top">
          {/* Left Side: Logo & Toggle */}
          <div className="header-left">
            <button className="toggle-btn" onClick={toggleSidebar}>
              {isMobile ? "☰" : isSidebarCollapsed ? "→" : "←"}
            </button>
            <div className="navbar-logo">
              <span className="logo-icon">🚀</span>
              <span className="logo-text">FlatmateFinder</span>
            </div>
          </div>

          {/* Right Side: Utilities */}
          <div className="header-right">
            <button className="utility-icon-btn notification-bell" onClick={() => handleNavClick("notifications")}>
              <span className="icon">🔔</span>
              <span className="badge-dot"></span>
            </button>
            
            <div className="user-profile-widget" ref={profileMenuRef}>
              <button 
                className="avatar-circle-btn" 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                title="Profile & Settings"
              >
                {user?.email?.[0].toUpperCase() || "U"}
              </button>

              {/* Settings Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="profile-dropdown-menu animate-fade-in-up">
                  <div className="dropdown-header">
                    <span className="user-email-header">{user?.email || "User"}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  
                  <button className="dropdown-item" onClick={() => handleNavClick("profile")}>
                    <span className="icon">👤</span> Profile
                  </button>
                  <button className="dropdown-item" onClick={() => handleNavClick("settings")}>
                    <span className="icon">⚙️</span> Settings
                  </button>
                  <button className="dropdown-item" onClick={() => handleNavClick("privacy")}>
                    <span className="icon">🔒</span> Privacy
                  </button>
                  <button className="dropdown-item" onClick={() => handleNavClick("help")}>
                    <span className="icon">❓</span> Help
                  </button>
                  
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item text-danger" onClick={onLogout}>
                    <span className="icon">🚪</span> Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="main-content-scroll">
          <div className="content-container slide-up">
            {children}
          </div>
        </main>
      </div>

      {/* MOBILE OVERLAY */}
      {isMobile && isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
    </div>
  );
};

export default Layout;
