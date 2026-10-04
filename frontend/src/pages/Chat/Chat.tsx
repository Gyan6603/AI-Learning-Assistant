import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  sendChatMessage,
  getDocuments,
  deleteDocument,
} from "../../services/api";

import type { Document } from "../../services/api";

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

  async function handleDeleteSelectedDocument() {
    if (!selectedDocumentId) {
      setError("Please select a PDF first.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove this PDF?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteDocument(selectedDocumentId);

      setDocuments((currentDocuments) =>
        currentDocuments.filter(
          (document) => document.id !== selectedDocumentId
        )
      );

      setSelectedDocumentId("");
    } catch (error) {
      console.error("Failed to delete PDF:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete PDF."
      );
    }
  }

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

    try {
      const data = await sendChatMessage(
        message,
        selectedDocumentId || undefined
      );

      const aiMessage: Message = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        aiMessage,
      ]);
    } catch (error) {
      console.error("AI response failed:", error);

      setError(
        "Sorry, I couldn't get a response. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-8">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl shadow-sm">
              🤖
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                AI Learning
              </p>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                AI Tutor
              </h1>
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Ask questions and learn with your personal AI study
            assistant.
          </p>
        </div>

        {/* Study Material Selector */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Study Material
              </label>

              <select
                value={selectedDocumentId}
                onChange={(event) => {
                  setSelectedDocumentId(event.target.value);
                  setError("");
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-800"
              >
                <option value="">
                  🌐 General Chat — No PDF
                </option>

                {documents.map((document) => (
                  <option
                    key={document.id}
                    value={document.id}
                  >
                    📄 {document.filename}
                  </option>
                ))}
              </select>
            </div>

            {selectedDocumentId && (
              <button
                onClick={handleDeleteSelectedDocument}
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
              >
                Remove PDF
              </button>
            )}
          </div>

          {selectedDocumentId && (
            <div className="mt-3 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              AI Tutor is using your selected study material.
            </div>
          )}
        </div>

        {/* Chat Container */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          {/* Chat Header */}
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white">
                AI
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  CogniVerse AI Tutor
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedDocumentId
                    ? "Answering from your study material"
                    : "Ready to help you learn"}
                </p>
              </div>

              <span className="ml-auto flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Online
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="min-h-[420px] space-y-5 overflow-y-auto bg-white p-5 dark:bg-slate-900 sm:p-7">

            {messages.length === 0 && (
              <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl dark:bg-indigo-950/50">
                  🤖
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-800 dark:text-white">
                  How can I help you?
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Ask a question about your study material or
                  start a general conversation with your AI tutor.
                </p>

                <div className="mt-6 grid gap-2 text-left sm:grid-cols-2">
                  <button
                    onClick={() =>
                      setMessage(
                        "Explain this topic in simple words."
                      )
                    }
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
                  >
                    💡 Explain a topic
                  </button>

                  <button
                    onClick={() =>
                      setMessage(
                        "Give me the important points from this topic."
                      )
                    }
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
                  >
                    📌 Key points
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[85%] items-start gap-3 sm:max-w-[75%] ${
                    msg.role === "user"
                      ? "flex-row-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm ${
                      msg.role === "user"
                        ? "bg-slate-900 text-white dark:bg-slate-700"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    {msg.role === "user" ? "👤" : "AI"}
                  </div>

                  <div
                    className={`break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
                      msg.role === "user"
                        ? "rounded-tr-sm bg-indigo-600 text-white"
                        : "rounded-tl-sm bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm text-white">
                    AI
                  </div>

                  <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <span className="animate-pulse">
                      AI Tutor is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800 sm:p-5">
            <div className="flex items-end gap-3">

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();

                    if (!isLoading) {
                      handleSend();
                    }
                  }
                }}
                placeholder="Ask your question..."
                rows={1}
                className="max-h-32 min-h-[48px] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
              />

              <button
                onClick={handleSend}
                disabled={
                  isLoading || message.trim() === ""
                }
                className="flex h-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-4 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
              >
                {isLoading ? "..." : "Send ↑"}
              </button>
            </div>

            <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
              Press Enter to send · Shift + Enter for a new line
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Chat;