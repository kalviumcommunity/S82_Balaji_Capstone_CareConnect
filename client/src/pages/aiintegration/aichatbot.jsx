import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const AiChatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hi! I'm your AI Health Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 const handleSend = async () => {
  if (!input.trim()) return;

  const newMessages = [...messages, { sender: "user", text: input }];
  setMessages(newMessages);
  setInput("");
  setLoading(true);

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/ai`,
      {
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful health assistant. Provide general health advice with a disclaimer." },
          { role: "user", content: input }
        ]
      },
      { withCredentials: true }
    );

    const botReply = response.data.choices[0].message.content;
    setMessages([...newMessages, { sender: "bot", text: botReply }]);
  } catch (error) {
    console.error(error);
    setMessages([...newMessages, { sender: "bot", text: "⚠ Oops! Something went wrong." }]);
  }

  setLoading(false);
};

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 text-xl font-bold text-center shadow">
        AI Health Assistant
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-lg p-3 rounded-xl ${
              msg.sender === "user"
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-gray-200 text-black self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && <p className="text-gray-500">Bot is typing...</p>}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input Box */}
      <div className="p-4 flex items-center gap-2 border-t bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-3 border rounded-xl focus:outline-none"
          placeholder="Ask me anything about health..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AiChatbot;
