import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send } from "lucide-react"; // Modern send icon
import aiIcon from "../../assets/chatbot.png"; // AI icon
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://s82-balaji-capstone-careconnect-4.onrender.com";

const AiChatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hi! I'm Nora, your AI Health Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

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

      const response = await axios.post(`${API_BASE_URL}/ai`, {
        messages: openAiMessages
      },{
        withCredentials: false 
      });

      const aiMessage = response.data.choices?.[0]?.message?.content || "No response from AI.";
      setMessages([...newMessages, { sender: "bot", text: aiMessage }]);
    } catch (error) {
      console.error("AI API Error:", error.response?.data || error.message);
      setMessages([...newMessages, { sender: "bot", text: "⚠️ Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <Link
        to="/"
        className="absolute top-6 left-6 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition"
      >
        Back
      </Link>
  <div className="flex flex-col w-[90%] max-w-5xl h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden">
    
    {/* Header */}
    <div className="flex items-center gap-4 bg-blue-600 text-white p-5 shadow-md">
      <img src={aiIcon} alt="AI" className="w-12 h-12 rounded-full object-cover" />
      <h1 className="text-2xl font-semibold">Nora</h1>
    </div>

    {/* Chat Messages */}
    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50 flex flex-col text-lg">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`inline-block px-6 py-4 rounded-2xl shadow-sm break-words ${
            msg.sender === "user"
              ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white self-end ml-auto"
              : "bg-white border text-gray-800 self-start"
          }`}
          style={{ maxWidth: "70%" }}
        >
          {msg.text}
        </div>
      ))}
      {loading && <p className="text-gray-500 italic">Nora is responding...</p>}
      <div ref={chatEndRef}></div>
    </div>

    {/* Input Area */}
    <div className="p-5 bg-gray-100 border-t flex items-center gap-4">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 p-4 rounded-xl border text-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
        placeholder="Ask me anything about health..."
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        disabled={loading}
      />
      <button
        onClick={handleSend}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl flex items-center justify-center shadow-md disabled:opacity-50"
        disabled={loading}
      >
        <Send size={24} />
      </button>
    </div>
  </div>
</div>

  );
};

export default AiChatbot;
