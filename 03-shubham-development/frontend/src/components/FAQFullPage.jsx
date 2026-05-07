// Alternative: Full-Screen FAQ Page Component
// Use this if you want a dedicated FAQ page instead of the floating widget

'use client';

import { useState, useRef, useEffect } from 'react';
import axiosInstance from 'lib/axios';

export default function FAQFullPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hi! I\'m your AI FAQ assistant. Ask me anything about our hall booking service!',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [systemStatus, setSystemStatus] = useState(null);
  const messagesEndRef = useRef(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/rag/status`);
      setSystemStatus(response.data);
    } catch (err) {
      console.error('Failed to check system status:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/rag/query`, {
        question: input,
        topK: 3,
      });

      const botMessage = {
        id: messages.length + 2,
        text: response.data.answer,
        sender: 'bot',
        timestamp: new Date(),
        sources: response.data.sources,
        confidence: response.data.confidence,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = {
        id: messages.length + 2,
        text: err.response?.data?.message || 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
      setError(err.response?.data?.message || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(`${API_BASE_URL}/rag/initialize`);
      await checkSystemStatus();

      const botMessage = {
        id: messages.length + 1,
        text: 'System initialized! I\'ve loaded the FAQ database. Feel free to ask me anything.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError('Failed to initialize system');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 shadow-md">
        <h1 className="text-3xl font-bold">FAQ Assistant</h1>
        <p className="text-sm text-blue-100 mt-1">
          Status: {systemStatus?.initialized ? '✓ Ready' : '⚠ Not Ready'} • Documents: {systemStatus?.documentsLoaded || 0}
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-md lg:max-w-lg px-4 py-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : message.isError
                  ? 'bg-red-100 text-red-800 rounded-bl-none border border-red-300'
                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-200 shadow-sm'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 text-xs opacity-80">
                  <p className="font-semibold mb-1">Sources:</p>
                  <div className="space-y-1">
                    {message.sources.slice(0, 2).map((source, idx) => (
                      <div key={idx} className="p-2 bg-opacity-50 bg-gray-100 rounded">
                        {source.content.substring(0, 150)}...
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 px-4 py-3 rounded-lg rounded-bl-none border border-gray-200 shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-6 shadow-lg">
        {error && (
          <div className="mb-3 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {!systemStatus?.initialized && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded text-sm flex justify-between items-center">
            <span>System not initialized. Click button to load FAQ data.</span>
            <button
              onClick={handleInitialize}
              disabled={loading}
              className="ml-3 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 text-xs font-semibold"
            >
              Initialize
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading || !systemStatus?.initialized}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !systemStatus?.initialized}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
