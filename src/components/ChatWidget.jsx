import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, Mic, PenLine } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import chatAssistantImg from '../assets/ChatAssistant.jpg';

// ================================================================
// ReportForm: MOVED OUTSIDE so it doesn't remount on parent re-render
// ================================================================
const ReportForm = React.memo(({ payload, API_BASE, pushBotMessage, addMessage }) => {
  const [reportType, setReportType] = useState(payload.options?.[0] || 'sales');
  const [month, setMonth] = useState(payload.months?.[0] || 'All');
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    addMessage({ role: 'bot', content: '⏳ Generating your report...', isLoading: true });

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please log in to generate reports.');

      const resp = await fetch(`${API_BASE}/generate_report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ report_type: reportType, month })
      });

      if (!resp.ok) {
        const txt = await resp.text();
        let parsed;
        try { parsed = JSON.parse(txt); } catch { parsed = null; }
        const msg = parsed?.error || parsed?.message || txt || 'Failed to generate report';
        throw new Error(msg);
      }

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = resp.headers.get('Content-Disposition')?.match(/filename=(.*)$/)?.[1] || `${reportType}_report_${month}.pdf`;
      a.href = url;
      a.download = filename.replace(/['"]/g, '');
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Push a success message
      pushBotMessage(`✅ ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report for ${month} generated and downloaded.`);
    } catch (err) {
      pushBotMessage({ error: true, text: `❌ ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 p-1">
      <div className="text-sm font-semibold text-gray-900 dark:text-stockly-50 mb-2">{payload.title}</div>

      {/* Report Type Buttons */}
      <div className="flex gap-2 justify-center">
        {payload.options.map(opt => (
          <button
            key={opt}
            onClick={() => setReportType(opt)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              reportType === opt 
                ? 'bg-stockly-green text-slate-900 shadow-md' 
                : 'bg-gray-300 dark:bg-stockly-800 text-gray-800 dark:text-stockly-200 hover:bg-gray-400 dark:hover:bg-stockly-700'
            }`}
          >
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
      </div>

      {/* Month Selector */}
      <div className="mt-3">
        <label className="text-xs font-semibold text-gray-900 dark:text-stockly-50 block mb-2">Select month</label>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-stockly-800 bg-white dark:bg-stockly-800 text-gray-900 dark:text-stockly-50 font-medium focus:outline-none focus:ring-2 focus:ring-stockly-green"
        >
          {payload.months.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Centered Generate Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={generateReport}
          disabled={loading}
          className="bg-stockly-green text-slate-900 px-6 py-2 rounded-lg hover:bg-stockly-500 font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Generating...' : '📥 Generate & Download'}
        </button>
      </div>
    </div>
  );
});

ReportForm.displayName = 'ReportForm';

// ================================================================
// Main ChatWidget Component
// ================================================================
export default function ChatWidget() {
  const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [messages, setMessages] = useState([
    { id: genId(), role: 'bot', content: 'Hi! How can I help you with Stockly today?' }
  ]);
  const [input, setInput] = useState('');
  const recognitionRef = useRef(null);
  const baseInputRef = useRef('');
  const finalTranscriptRef = useRef('');

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const addMessage = useCallback((msg) => {
    setMessages(prev => [...prev, { ...msg, id: genId() }]);
  }, []);

  const pushBotMessage = useCallback((payload) => {
    addMessage({ role: 'bot', content: payload });
  }, [addMessage]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      finalTranscriptRef.current = '';
      setIsListening(true);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      let finalTranscript = finalTranscriptRef.current;
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = (result[0]?.transcript || '').trim();
        if (!text) continue;
        if (result.isFinal) {
          finalTranscript = `${finalTranscript} ${text}`.trim();
        } else {
          interimTranscript = `${interimTranscript} ${text}`.trim();
        }
      }

      finalTranscriptRef.current = finalTranscript;
      const combined = [baseInputRef.current, finalTranscriptRef.current, interimTranscript]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      setInput(combined);
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);

    return () => {
      recognitionRef.current = null;
    };
  }, []);

  const handleMicClick = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Speech-to-text is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    baseInputRef.current = input;
    recognitionRef.current.start();
  };

  const handleNewChat = () => {
    setMessages([{ id: genId(), role: 'bot', content: 'Hi! How can I help you with Stockly today?' }]);
    setInput('');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    addMessage({ role: 'user', content: input });
    const userQuery = input;
    setInput('');

    addMessage({ role: 'bot', content: '⏳ Processing your query...', isLoading: true });

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setMessages(prev => {
          const withoutLoading = prev.filter(msg => !msg.isLoading);
          return [...withoutLoading, { id: genId(), role: 'bot', content: '❌ Please log in to use the chat assistant.', isLoading: false, error: true }];
        });
        return;
      }

      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userQuery })
      });

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

      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading);
        const botPayload = data.response || "Sorry, I couldn't process that request.";
        return [...withoutLoading, { id: genId(), role: 'bot', content: botPayload }];
      });
    } catch (error) {
      console.error('Chat error:', error);

      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading);
        return [...withoutLoading, { id: genId(), role: 'bot', content: `❌ ${error.message || 'Connection error. Please try again.'}`, isLoading: false, error: true }];
      });
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full 
                   bg-gradient-to-br from-stockly-green to-stockly-500 
                   text-slate-900 flex items-center justify-center 
                   shadow-2xl hover:shadow-[0_12px_28px_rgba(16,185,129,0.45)] transition-shadow duration-200"
        title="Chat with Stockly Assistant"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1 rounded-full border-2 border-stockly-green/80 animate-ping"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1 rounded-full border-2 border-stockly-blue/60"
        />
        <img
          src={chatAssistantImg}
          alt="Chat Assistant"
          className={`w-12 h-12 rounded-full object-cover border border-white/70 transition-opacity ${
            isOpen ? 'opacity-80' : 'opacity-100'
          }`}
        />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 left-auto z-50 
                     w-80 sm:w-96 h-[520px] 
                     bg-white dark:bg-stockly-900 
                     rounded-2xl shadow-2xl 
                     flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-stockly-green to-stockly-400 text-slate-900 p-4 flex justify-between items-center font-semibold">
            <div>
              <h3 className="font-bold">Stockly Assistant</h3>
              <p className="text-xs opacity-70 font-normal">Ask about stock, expiry, sales, or generate reports...</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewChat}
                className="text-slate-900 hover:opacity-80 transition"
                title="New chat"
                aria-label="New chat"
              >
                <PenLine size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-900 hover:opacity-70 transition"
                title="Close chat"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 dark:bg-stockly-950">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words
                    ${msg.role === 'user'
                      ? 'bg-stockly-green text-slate-900 font-semibold rounded-br-none'
                      : msg.error || (msg.content && msg.content.error)
                        ? 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 rounded-bl-none'
                        : 'bg-gray-200 dark:bg-stockly-800 text-gray-900 dark:text-stockly-50 rounded-bl-none'}`}
                >
                  {msg.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                    </div>
                  ) : msg.role === 'user' ? (
                    msg.content
                  ) : (typeof msg.content === 'object' && msg.content !== null && msg.content.type === 'report_prompt') ? (
                    <ReportForm
                      payload={msg.content}
                      API_BASE={API_BASE}
                      pushBotMessage={pushBotMessage}
                      addMessage={addMessage}
                    />
                  ) : typeof msg.content === 'object' && msg.content !== null && msg.content.text ? (
                    msg.content.text
                  ) : typeof msg.content === 'string' ? (
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => <p {...props} className="mb-1 last:mb-0" />,
                        strong: ({ node, ...props }) => <strong {...props} className="font-bold" />,
                        em: ({ node, ...props }) => <em {...props} className="italic" />,
                        ul: ({ node, ...props }) => <ul {...props} className="list-disc list-inside mb-1" />,
                        ol: ({ node, ...props }) => <ol {...props} className="list-decimal list-inside mb-1" />,
                        li: ({ node, ...props }) => <li {...props} className="ml-2" />,
                        code: ({ node, ...props }) => <code {...props} className="bg-opacity-20 px-1 rounded" />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    String(msg.content)
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="p-4 border-t dark:border-stockly-800 bg-white dark:bg-stockly-900">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleMicClick}
                className={`px-3 py-2.5 rounded-lg border border-stockly-200 bg-white text-stockly-900 shadow-sm transition 
                  hover:bg-stockly-50 focus:outline-none focus:ring-2 focus:ring-stockly-300 
                  dark:bg-stockly-900 dark:text-stockly-50 dark:border-stockly-800 dark:hover:bg-stockly-800 ${
                    isListening ? 'ring-2 ring-stockly-400 bg-stockly-50 dark:bg-stockly-800' : ''
                  }`}
                title={speechSupported ? (isListening ? 'Stop listening' : 'Start voice input') : 'Speech-to-text not supported'}
                aria-label="Voice input"
              >
                <span className="relative flex items-center justify-center">
                  {isListening && (
                    <span className="absolute -inset-1 rounded-full bg-stockly-300/40 animate-ping" />
                  )}
                  <Mic size={18} className={isListening ? 'text-stockly-700 dark:text-stockly-200' : ''} />
                </span>
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2.5 rounded-lg border 
                         border-gray-300 dark:border-stockly-800 
                         dark:bg-stockly-800 focus:outline-none focus:ring-2 focus:ring-stockly-green"
              />
              <button
                onClick={handleSend}
                className="bg-stockly-green text-slate-900 px-4 py-2.5 rounded-lg hover:bg-stockly-500 font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



