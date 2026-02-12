import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hi! How can I help you with Stockly today?' }
  ]);
  const [input, setInput] = useState('');

  // Use an env var for API base, fallback to localhost:5000
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const userQuery = input;
    setInput('');

    // Add loading state
    setMessages(prev => [...prev, { role: 'bot', content: '⏳ Processing your query...', isLoading: true }]);

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        setMessages(prev => {
          const withoutLoading = prev.filter(msg => !msg.isLoading);
          return [...withoutLoading, {
            role: 'bot',
            content: '❌ Please log in to use the chat assistant.',
            isLoading: false,
            error: true
          }];
        });
        return;
      }

      // Call backend chat endpoint (use absolute URL to avoid hitting frontend dev server HTML)
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userQuery })
      });

      // Read as text first so we can show helpful diagnostics if server returns HTML
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error('Invalid JSON response from server: ' + (text || '').slice(0, 1000));
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Chat request failed');
      }

      // Remove loading message and add actual response
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading);
        return [...withoutLoading, {
          role: 'bot',
          content: data.response || "Sorry, I couldn't process that request.",
          isLoading: false
        }];
      });
    } catch (error) {
      console.error('Chat error:', error);

      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading);
        return [...withoutLoading, {
          role: 'bot',
          content: `❌ ${error.message || 'Connection error. Please try again.'}`,
          isLoading: false,
          error: true
        }];
      });
    }
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
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words
                    ${msg.role === 'user' 
                      ? 'bg-stockly-green text-slate-900 font-semibold rounded-br-none' 
                      : msg.error
                        ? 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 rounded-bl-none'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'}`}
                >
                  {msg.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce" style={{animationDelay: '0.2s'}}>●</span>
                      <span className="animate-bounce" style={{animationDelay: '0.4s'}}>●</span>
                    </div>
                  ) : msg.role === 'user' ? (
                    msg.content
                  ) : (
                    // Parse markdown for bot messages
                    <ReactMarkdown
                      components={{
                        p: ({node, ...props}) => <p {...props} className="mb-1 last:mb-0" />,
                        strong: ({node, ...props}) => <strong {...props} className="font-bold" />,
                        em: ({node, ...props}) => <em {...props} className="italic" />,
                        ul: ({node, ...props}) => <ul {...props} className="list-disc list-inside mb-1" />,
                        ol: ({node, ...props}) => <ol {...props} className="list-decimal list-inside mb-1" />,
                        li: ({node, ...props}) => <li {...props} className="ml-2" />,
                        code: ({node, ...props}) => <code {...props} className="bg-opacity-20 px-1 rounded" />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
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