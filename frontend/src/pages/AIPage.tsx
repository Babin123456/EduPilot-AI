import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Bot, Send, Sparkles, User, UserCheck } from 'lucide-react';

export const AIPage: React.FC = () => {
  const { activeClass } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: query,
        conversation_id: conversationId,
        class_id: activeClass?.id,
      });

      setConversationId(res.data.conversation_id);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.message.content },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an issue processing your request.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Which students in my active class have attendance below 75%?',
    'What classes do I have scheduled for today?',
    'Summarize my section analytics and risk status',
    'Generate a quiz topic outline for Operating Systems',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-adamas-green text-slate-950 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 dark:text-white text-base">EduPilot AI Assistant</h2>
            <p className="text-xs text-slate-500">
              Context-Aware Copilot • Groq & Gemini Powered
            </p>
          </div>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-adamas-blue/10 text-adamas-blue dark:text-adamas-green flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">How can I assist your teaching today?</h3>
            <p className="text-xs text-slate-500">
              Ask questions about attendance thresholds, timetable schedules, student analytics, or generate academic lesson plans.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full pt-2">
              {samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-adamas-blue hover:text-adamas-blue text-left transition-colors"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-adamas-green text-slate-950 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  AI
                </div>
              )}
              <div
                className={`max-w-xl p-4 rounded-2xl text-xs font-medium whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-adamas-blue text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-3 items-center text-xs text-slate-400 font-semibold animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-adamas-green/20 text-adamas-green flex items-center justify-center">
              AI
            </div>
            EduPilot is thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about attendance, timetable, or student performance..."
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-adamas-blue"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-adamas-blue hover:bg-adamas-blue-dark text-white rounded-xl shadow disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
