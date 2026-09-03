import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Sparkles, Bot, User, ArrowLeft, Loader2 } from "lucide-react"; 
import aiIcon from "../../assets/chatbot.png"; 
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://s82-balaji-capstone-careconnect-4.onrender.com";
const AiChatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hi! I'm Nora, your AI Health Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { sender: "user", text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const openAiMessages = newMessages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }));

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/ai`, {
        messages: openAiMessages
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });

      const aiMessage = response.data.choices?.[0]?.message?.content || "No response from AI.";
      setMessages([...newMessages, { sender: "bot", text: aiMessage }]);
    } catch {
      setMessages([...newMessages, { sender: "bot", text: "⚠️ Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/60 p-4 sm:p-6">
      {/* Back Button */}
      <Link
        to="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-md hover:bg-white text-slate-700 hover:text-blue-600 rounded-xl shadow-sm border border-slate-200/80 transition-all font-medium text-sm z-10 group"
      >
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
        <span>Back</span>
      </Link>

      {/* Main Chat Container */}
      <div className="flex flex-col w-full max-w-4xl h-[92vh] sm:h-[88vh] bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/10 border border-white/40 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="relative">
              <img 
                src={aiIcon} 
                alt="AI" 
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-white/30 shadow-md bg-white/10" 
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-blue-600 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-bold tracking-tight">Nora</h1>
                <Sparkles size={14} className="text-blue-200 fill-blue-200" />
              </div>
              <p className="text-xs text-blue-100/80 font-medium">Your AI Health Assistant</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-medium text-blue-50">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Online
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gradient-to-b from-slate-50/50 to-white flex flex-col">
          {messages.map((msg, index) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={index}
                className={`flex items-end gap-2.5 max-w-[85%] sm:max-w-[75%] ${
                  isUser ? "self-end ml-auto flex-row-reverse" : "self-start mr-auto"
                }`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  isUser 
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white" 
                    : "bg-white border border-slate-200 text-blue-600"
                }`}>
                  {isUser ? <User size={15} /> : <Bot size={16} />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm sm:text-base leading-relaxed break-words transition-all ${
                    isUser
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-blue-500/10"
                      : "bg-white text-slate-800 border border-slate-100 rounded-bl-none shadow-slate-200/50"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-2.5 self-start text-slate-500 bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm animate-pulse">
              <Loader2 size={16} className="animate-spin text-blue-600" />
              <span className="text-sm font-medium">Nora is responding...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-5 bg-white/80 backdrop-blur-md border-t border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full pl-4 pr-4 py-3.5 rounded-2xl border border-slate-200/80 text-sm sm:text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50/50 focus:bg-white shadow-inner transition-all placeholder:text-slate-400"
              placeholder="Ask me anything about health..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
          </div>
          
          <button
            onClick={handleSend}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 group"
            disabled={loading || !input.trim()}
          >
            <Send size={18} className="transition-transform group-hover:translate-x-0.5" />
            <span className="hidden sm:inline ml-2 font-medium text-sm">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChatbot;