import React, { useState } from 'react';
import SupportBot from './SupportBot';

function Help() {
  const [isBotOpen, setIsBotOpen] = useState(false);
  return (
    <div className="section-container fade-in">
      <div className="card saas-card">
        <div className="card-header border-none text-center py-8">
          <div className="text-4xl mb-4">❓</div>
          <h3 className="text-2xl">Help & Support</h3>
          <p className="max-w-md mx-auto mt-2">Find answers to common questions or reach out to our support team.</p>
        </div>
        
        <div className="card-body max-w-2xl mx-auto w-full">
          {/* FAQ Section */}
          <div className="settings-section mb-10">
            <h4 className="text-xl font-semibold mb-6 text-primary border-b border-white/10 pb-3">Frequently Asked Questions</h4>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <h5 className="font-semibold text-[15px] mb-2 text-accent">How do I find a flatmate?</h5>
                <p className="text-sm text-secondary leading-relaxed">Go to the "Search" tab to browse profiles. You can use filters to narrow down by location, age, or preferences. When you find someone you like, send them a connection request!</p>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <h5 className="font-semibold text-[15px] mb-2 text-accent">What happens when someone accepts my request?</h5>
                <p className="text-sm text-secondary leading-relaxed">Once accepted, they will appear in your "Connections" tab. You will then be able to open a chat with them and discuss potential living arrangements.</p>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <h5 className="font-semibold text-[15px] mb-2 text-accent">Can I delete messages?</h5>
                <p className="text-sm text-secondary leading-relaxed">Yes. In any active chat, simply click on a message you sent to open the options menu, and select "Delete". The message will be permanently removed.</p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="settings-section">
            <h4 className="text-xl font-semibold mb-6 text-primary border-b border-white/10 pb-3">Contact Us</h4>
            
            <div className="p-6 rounded-xl border border-accent/20 bg-accent/5 text-center">
              <div className="text-3xl mb-3">💬</div>
              <h5 className="font-semibold text-[16px] mb-2">Still need help?</h5>
              <p className="text-sm text-secondary mb-6">Our support team is available 24/7 to assist you with any issues.</p>
              
              <button 
                className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-accent/20"
                onClick={() => setIsBotOpen(true)}
              >
                Start a Conversation
              </button>
              
              <p className="text-xs text-secondary mt-4 opacity-60">or email us at support@flatmatefinder.com</p>
            </div>
          </div>
        </div>
      </div>
      {/* Support Bot Modal */}
      <SupportBot isOpen={isBotOpen} onClose={() => setIsBotOpen(false)} />
    </div>
  );
}

export default Help;
