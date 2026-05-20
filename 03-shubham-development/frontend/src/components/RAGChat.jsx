'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import axiosInstance from 'lib/axios';
import { Bot, MessageCircleMore, Sparkles, X, ChevronRight } from 'lucide-react';

const HIDDEN_PATHS = ['/organizer-hub', '/admin'];

export default function RAGChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your Shubham Venue assistant. I can help answer questions about bookings, payments, and our facilities. What's on your mind?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [systemStatus, setSystemStatus] = useState(null);
  const messagesEndRef = useRef(null);

  // Suggested questions for quick user interaction
  const suggestions = [
    "How do I book a hall?",
    "What are the payment methods?",
    "What is the cancellation policy?",
    "Do you offer catering?",
  ];

  const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/api/v1`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    checkSystemStatus();
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const checkSystemStatus = async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/rag/status`);
      setSystemStatus(response.data);
    } catch (err) {
      console.error('Failed to check system status:', err);
    }
  };

  /**
   * Professional Message Formatter
   * Converts "Q: ... A: ..." strings into structured UI blocks
   */
  const renderMessageContent = (text) => {
    if (!text.includes('Q:') && !text.includes('A:')) {
      return <p className="leading-relaxed">{text}</p>;
    }

    const parts = text.split(/(Q:|A:)/g);

    return (
      <div className="space-y-3">
        {parts.map((part, i) => {
          if (part === 'Q:' || part === 'A:') return null;
          const marker = parts[i - 1];

          if (marker === 'Q:') {
            return (
              <div key={i} className="font-bold text-amber-900 flex gap-2 items-start">
                <span className="mt-1 bg-amber-100 text-amber-700 px-1 rounded text-[10px] font-black">Q</span>
                <span>{part.trim()}</span>
              </div>
            );
          }
          if (marker === 'A:') {
            return (
              <div key={i} className="text-gray-700 pl-4 border-l-2 border-amber-300 py-1 italic leading-relaxed">
                {part.trim()}
              </div>
            );
          }
          return <p key={i} className="text-gray-800">{part.trim()}</p>;
        })}
      </div>
    );
  };

  const handleSendMessage = async (e, overrideText = null) => {
    if (e) e.preventDefault();
    const queryText = overrideText || input;
    if (!queryText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: queryText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/rag/query`, {
        question: queryText,
        topK: 3,
      });

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.answer,
        sender: 'bot',
        timestamp: new Date(),
        sources: response.data.sources || [],
        method: response.data.method || 'unknown',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        text: err.response?.data?.message || 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(`${API_BASE_URL}/rag/initialize`);
      await checkSystemStatus();
      setMessages((prev) => [...prev, {
        id: Date.now(),
        text: 'Database successfully indexed! I am ready to help.',
        sender: 'bot'
      }]);
    } catch (err) {
      setError('Initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  if (HIDDEN_PATHS.some((p) => pathname?.startsWith(p))) return null;

  return (
    <>
      {/* Tooltip */}
      {!isOpen && showTooltip && (
        <div className="fixed bottom-28 right-8 z-40 animate-in fade-in slide-in-from-bottom-2">
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 px-4 py-3 max-w-xs">
            <button onClick={() => setShowTooltip(false)} className="absolute right-2 top-2 text-gray-400"><X size={14} /></button>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-amber-50 p-2 text-amber-600"><Sparkles size={16} /></div>
              <div>
                <p className="text-gray-800 font-semibold text-sm">Need help?</p>
                <p className="text-gray-600 text-xs mt-1">Ask me about venues and pricing.</p>
              </div>
            </div>
            {/* Arrow pointing down to the button */}
            <div className="absolute -bottom-2 right-7 w-4 h-4 bg-white border-r border-b border-gray-200 rotate-45" />
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full shadow-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white transition hover:scale-105"
        >
          <MessageCircleMore size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 z-50 w-96 h-[640px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">

          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full"><Bot size={20} /></div>
              <div>
                <h2 className="text-lg font-bold">Support Assistant</h2>
                <p className="text-xs text-amber-100">{systemStatus?.initialized ? 'Online' : 'Initializing...'}</p>
              </div>
            </div>
            <X className="cursor-pointer hover:text-amber-200" onClick={() => setIsOpen(false)} />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-xl text-sm shadow-sm ${m.sender === 'user' ? 'bg-amber-500 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none'
                  }`}>
                  {renderMessageContent(m.text)}

                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-xl border animate-pulse flex gap-1">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {systemStatus?.initialized && !loading && (
            <div className="px-4 py-3 bg-gray-50 flex gap-2 overflow-x-auto border-t border-gray-100 
    /* Custom Scrollbar Styling */
    scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent
    [&::-webkit-scrollbar]:h-1.5
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-amber-200
    [&::-webkit-scrollbar-thumb]:rounded-full
    hover:[&::-webkit-scrollbar-thumb]:bg-amber-300">

              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(null, s)}
                  className="whitespace-nowrap px-4 py-2 bg-white border border-amber-100 text-amber-700 text-xs font-medium rounded-full hover:bg-amber-50 hover:border-amber-300 transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  {s} <ChevronRight size={12} className="opacity-50" />
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            {error && <div className="mb-2 text-[10px] text-red-500 font-bold">{error}</div>}

            {!systemStatus?.initialized ? (
              <button onClick={handleInitialize} className="w-full py-2 bg-amber-500 text-white rounded-lg font-bold">
                Initialize Assistant
              </button>
            ) : (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask something..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                />
                <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition">
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}