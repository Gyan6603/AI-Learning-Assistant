import { useState,useEffect } from "react";
import { sendChatMessage,getDocuments } from "../../services/api";
import type { Document } from "../../services/api";
import { useNavigate } from "react-router-dom";
// import { getAIResponse } from "../../services/aiService";

type Message = {
  role: "user" | "assistant";
  content: string;
};
function Chat() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);   
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");

  useEffect(() => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    navigate("/login");
  }
}, [navigate]);

useEffect(() => {
  async function loadDocuments() {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error("Failed to load documents:", error);
    }
  }

  loadDocuments();
}, []);

  async function handleSend() {
  if (message.trim() === "") {
    return;
  }
  setError("");
  setIsLoading(true);
  const userMessage: Message = {
    role: "user",
    content: message,
  };

  setMessages((currentMessages) => [
    ...currentMessages,
    userMessage,
  ]);
  setMessage("");
  try{
  // const response = await getAIResponse(message);
  const data = await sendChatMessage(message, selectedDocumentId || undefined);
  const aiMessage: Message = {
    role: "assistant",
    content: data.reply,
  };
  setMessages((currentMessages) => [
    ...currentMessages,
    aiMessage,
  ]);
} catch (error) {
  console.error("AI response failed :", error);
  setError("Sorry, I couldn't get a response. Please try again.")
} finally {
  setIsLoading(false);
 }
}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          🤖 AI Tutor
        </h1>

        <p className="text-gray-600 mt-2">
          Ask anything and learn with your AI tutor.
        </p>
        {/* PDF Selection Dropdown*/}
        <div className="mt-4">
        <label className="block font-semibold mb-2">
          Select Study PDF
        </label>

        <select
        value={selectedDocumentId}
        onChange={(event) =>
        setSelectedDocumentId(event.target.value)
      }
      className="w-full border rounded-lg px-4 py-3"
    >
      <option value="">
        General Chat (No PDF)
      </option>

      {documents.map((document) => (
        <option
          key={document.id}
          value={document.id}
        >
          {document.filename}
        </option>
        ))}
      </select>
    </div>
      </div>

      <div className="border rounded-xl p-6 min-h-64 space-y-3">
        {messages.length === 0 ? (
          <p className="text-gray-500">
            Your conversation will appear here.
          </p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className="bg-blue-100 rounded-lg px-4 py-3"
            >
            <p className="font-semibold">
                {msg.role === "user" ? "👤 You" : "🤖 AI Tutor"}
            </p>

            <p>{msg.content}</p>
            </div>
          ))
        )}
        {isLoading && (
            <div className="bg-gray-100 rounded-lg px-4 py-3">
            🤖 AI Tutor is thinking...
            </div>
        )}
        {error && (
            <div className="bg-red-100 text-red-700 rounded-lg px-4 py-3">
            {error}
            </div>
        )}
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask your question..."
          className="flex-1 border rounded-lg px-4 py-3"
        />

        <button
            onClick={handleSend}
            disabled={isLoading}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white disabled:opacity-50"
        >
            {isLoading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default Chat;