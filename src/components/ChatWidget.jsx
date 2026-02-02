// src/components/ChatWidget.jsx
import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react'; // or use heroicons if you prefer

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hi! How can I help you with Stockly today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Sample bot reply
    setTimeout(() => {
      let botReply = "I'm still learning... Ask me about stock, expiry, sales or predictions!";
      
      if (input.toLowerCase().includes('stock') || input.toLowerCase().includes('quantity')) {
        botReply = "You can check current stock levels in the Inventory section.";
      } else if (input.toLowerCase().includes('expiry') || input.toLowerCase().includes('expire')) {
        botReply = "Near expiry items are shown in the Expiry Alerts page.";
      } else if (input.toLowerCase().includes('predict') || input.toLowerCase().includes('forecast')) {
        botReply = "Go to the Predict page to forecast reorder quantities.";
      }

      setMessages(prev => [...prev, { role: 'bot', content: botReply }]);
    }, 800);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full 
                   bg-gradient-to-br from-stockly-green to-teal-500 
                   text-slate-900 flex items-center justify-center 
                   shadow-2xl hover:scale-110 transition-transform duration-200"
        title="Chat with Stockly Assistant"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 z-50 
                     w-80 sm:w-96 h-[480px] 
                     bg-white dark:bg-gray-800 
                     rounded-2xl shadow-2xl 
                     flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-stockly-green to-emerald-400 text-slate-900 p-4 flex justify-between items-center font-semibold">
            <div>
              <h3 className="font-bold">Stockly Assistant</h3>
              <p className="text-xs opacity-70 font-normal">Ask about stock, expiry, sales...</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-900 hover:opacity-70 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm
                    ${msg.role === 'user' 
                      ? 'bg-stockly-green text-slate-900 font-semibold rounded-br-none' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2.5 rounded-l-lg border 
                         border-gray-300 dark:border-gray-600 
                         dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-stockly-green"
              />
              <button
                onClick={handleSend}
                className="bg-stockly-green text-slate-900 px-5 rounded-r-lg hover:bg-emerald-400 font-semibold transition shadow-md"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}