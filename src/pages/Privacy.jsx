import React, { useState } from 'react';

function Privacy() {
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public', // public, private, connections
    readReceipts: true,
    showOnlineStatus: true,
    searchableByEmail: false
  });

  const toggleSwitch = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="section-container fade-in">
      <div className="card saas-card">
        <div className="card-header border-none">
          <h3><span className="mr-2">🔒</span> Privacy Settings</h3>
          <p>Control who can see your profile and activity.</p>
        </div>
        
        <div className="card-body">
          {/* Profile Visibility */}
          <div className="settings-section mb-8">
            <h4 className="text-lg font-semibold mb-4 text-primary border-b border-white/10 pb-2">Profile Visibility</h4>
            <p className="text-sm text-secondary mb-4 opacity-80">Choose who can view your full profile details and flatmate preferences.</p>
            
            <div className="flex flex-col gap-3">
              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${privacy.profileVisibility === 'public' ? 'border-accent bg-accent/10' : 'border-white/10 hover:bg-white/5'}`}>
                <input 
                  type="radio" 
                  name="visibility" 
                  value="public" 
                  checked={privacy.profileVisibility === 'public'} 
                  onChange={() => setPrivacy(prev => ({...prev, profileVisibility: 'public'}))}
                  className="accent-[#6c63ff] w-4 h-4"
                />
                <div>
                  <div className="font-medium text-sm">Everyone (Public)</div>
                  <div className="text-xs text-secondary opacity-60">Anyone on FlatmateFinder can find and view your profile.</div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${privacy.profileVisibility === 'connections' ? 'border-accent bg-accent/10' : 'border-white/10 hover:bg-white/5'}`}>
                <input 
                  type="radio" 
                  name="visibility" 
                  value="connections" 
                  checked={privacy.profileVisibility === 'connections'} 
                  onChange={() => setPrivacy(prev => ({...prev, profileVisibility: 'connections'}))}
                  className="accent-[#6c63ff] w-4 h-4"
                />
                <div>
                  <div className="font-medium text-sm">Connections Only</div>
                  <div className="text-xs text-secondary opacity-60">Only accepted matches can view your full details.</div>
                </div>
              </label>
            </div>
          </div>

          {/* Activity Status */}
          <div className="settings-section mb-8">
            <h4 className="text-lg font-semibold mb-4 text-primary border-b border-white/10 pb-2">Activity Status</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div>
                  <h5 className="font-medium text-[15px]">Show Online Status</h5>
                  <p className="text-xs text-secondary opacity-70">Let others see when you are active on the app.</p>
                </div>
                <label className="saas-toggle">
                  <input type="checkbox" checked={privacy.showOnlineStatus} onChange={() => toggleSwitch('showOnlineStatus')} />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div>
                  <h5 className="font-medium text-[15px]">Read Receipts</h5>
                  <p className="text-xs text-secondary opacity-70">If turned off, you won't see read receipts from others either.</p>
                </div>
                <label className="saas-toggle">
                  <input type="checkbox" checked={privacy.readReceipts} onChange={() => toggleSwitch('readReceipts')} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions mt-8 pt-4 border-t border-white/10">
            <button className="primary-btn saas-btn w-full sm:w-auto" onClick={() => alert("Privacy settings saved successfully!")}>
              <span className="btn-text">Save Privacy Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
