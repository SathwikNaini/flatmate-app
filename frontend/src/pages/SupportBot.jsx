import React, { useState, useEffect, useRef } from 'react';

function SupportBot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm the FlatmateFinder Support Bot 🤖. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot thinking and replying
    setTimeout(() => {
      const lowerInput = userMessage.text.toLowerCase();
      let replyText = "I'm not quite sure how to answer that. Could you please rephrase or email support@flatmatefinder.com?";
      
      if (lowerInput.includes('find a flatmate') || lowerInput.includes('search')) {
        replyText = "To found a flatmate, go to the Search tab and use our filters! Once you match, you can chat with them.";
      } else if (lowerInput.includes('delete') && lowerInput.includes('message')) {
        replyText = "To delete a message in a chat, click the message you sent, and select the 'Delete' option.";
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        replyText = "Hello there! What's on your mind?";
      } else if (lowerInput.includes('request') || lowerInput.includes('accept')) {
        replyText = "When someone accepts your request, they appear in your Connections tab. You can then chat with them!";
      } else if (lowerInput.includes('friend') || lowerInput.includes('connections')) {
        replyText = "To make friends, start by searching for compatible flatmates and sending them connection requests!";
      } else if (lowerInput.includes('location') || lowerInput.includes('city') || lowerInput.includes('area')) {
        replyText = "You can filter flatmates by location! Just head over to the Search tab and type in your preferred city or area.";
      } else if (lowerInput.includes('how') || lowerInput.includes('what') || lowerInput.includes('why') || lowerInput.includes('can i')) {
        replyText = "That's a great question! For detailed assistance, I recommend checking our Frequently Asked Questions section above, or reaching out to support@flatmatefinder.com so a human can help you out.";
      }

      setMessages((prev) => [...prev, { id: Date.now() + 1, text: replyText, isBot: true }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] z-50 fade-in shadow-2xl rounded-2xl overflow-hidden border border-white/10" style={{ backgroundColor: 'var(--card-bg)' }}>
      {/* Bot Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10" style={{ backgroundColor: 'var(--accent-color)' }}>
        <div className="flex items-center gap-3">
          <div className="text-2xl">🤖</div>
          <div>
            <h3 className="text-white font-semibold text-sm m-0 leading-tight">Support Bot</h3>
            <p className="text-white/80 text-xs m-0 leading-tight">Always online</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
          style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', borderRadius: '4px' }}
        >
          ✕
        </button>
      </div>

      {/* Messages Area */}
      <div className="p-4 h-80 overflow-y-auto flex flex-col gap-3 scrollbar-thin scrollbar-thumb-white/10" style={{ backgroundColor: 'var(--bg-color)' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div 
              className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.isBot ? 'rounded-tl-sm' : 'rounded-tr-sm'}`}
              style={{ 
                backgroundColor: msg.isBot ? 'var(--card-bg)' : 'var(--accent-color)',
                color: msg.isBot ? 'var(--text-primary)' : '#fff',
                border: msg.isBot ? '1px solid var(--border-color)' : 'none'
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-2xl rounded-tl-sm text-sm border border-white/10 flex items-center gap-1" style={{ backgroundColor: 'var(--card-bg)' }}>
              <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="px-3 py-3 border-t border-white/10 flex gap-2 items-center" style={{ backgroundColor: 'var(--card-bg)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 bg-transparent border-none text-sm focus:outline-none focus:ring-0 px-2"
          style={{ color: 'var(--text-primary)' }}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isTyping}
          className="w-8 h-8 rounded-full flex items-center justify-center p-0 transition-opacity disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent-color)', color: 'white', border: 'none' }}
        >
          ↑
        </button>
      </form>
    </div>
  );
}

export default SupportBot;
