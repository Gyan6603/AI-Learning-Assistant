
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getDocuments,
  generateFlashcards,
  deleteDocument,
} from "../../services/api";

import type {
  Document,
  Flashcard,
} from "../../services/api";

function Flashcards() {
  const navigate = useNavigate();
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardCount, setFlashcardCount] = useState("5");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleCard = (index: number) => {
  setFlippedCards((previous) =>
    previous.includes(index)
      ? previous.filter((cardIndex) => cardIndex !== index)
      : [...previous, index]
    );
  };
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    async function loadDocuments() {
      try {
        const data = await getDocuments();
        setDocuments(data);
      } catch {
        setError("Failed to load PDFs.");
      }
    }

    loadDocuments();
  }, [navigate]);

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
    setFlashcards([]);

  } catch (error) {
    console.error("Failed to delete PDF:", error);

    setError(
      error instanceof Error
        ? error.message
        : "Failed to delete PDF."
    );
  }
}

  async function handleGenerate() {
    if (!selectedDocumentId) {
      setError("Please select a PDF first.");
      return;
    }

    setError("");
    setIsLoading(true);
    setFlashcards([]);

    try {
      const data = await generateFlashcards(
        `Generate ${flashcardCount} flashcards in English from this PDF.`,
        selectedDocumentId,
        Number(flashcardCount)
      );

      setFlashcards(data.slice(0, Number(flashcardCount)));
    } catch (error) {
      console.error(error);
      setError("Failed to generate flashcards.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          📚 Flashcard Generator
        </h1>

        <p className="text-gray-600 mt-2">
          Generate flashcards from your study PDF.
        </p>
      </div>

      <div className="border rounded-xl p-6 space-y-4">

        <div>
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
              Select a PDF
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
        {selectedDocumentId && (
  <button
    onClick={handleDeleteSelectedDocument}
    className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
  >
    Remove Selected PDF
  </button>
)}
        <div>
          <label className="block font-semibold mb-2">
            Number of Flashcards
          </label>

          <select
            value={flashcardCount}
            onChange={(event) =>
              setFlashcardCount(event.target.value)
            }
            className="w-full border rounded-lg px-4 py-3"
          >
            <option value="3">3 Flashcards</option>
            <option value="5">5 Flashcards</option>
            <option value="10">10 Flashcards</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white rounded-lg px-6 py-3 disabled:opacity-50"
        >
          {isLoading
            ? "Generating..."
            : "Generate Flashcards"}
        </button>

      </div>

      {error && (
        <div className="bg-red-100 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      <div className="space-y-4">

        {flashcards.map((card, index) => {
        const isFlipped = flippedCards.includes(index);

    return (
    <div
      key={index}
      onClick={() => toggleCard(index)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleCard(index);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Flashcard ${index + 1}. ${
        isFlipped ? "Show question" : "Show answer"
      }`}
      className="mt-6 cursor-pointer rounded-2xl border p-6 shadow-md transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <p className="text-sm text-gray-500">
        Flashcard {index + 1}
      </p>

      {!isFlipped ? (
        <div className="mt-4">
          <h2 className="text-xl font-bold">
            ❓ {card.question}
          </h2>

          <p className="mt-6 text-sm text-blue-600">
            Click to reveal answer 🔄
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-green-700">
            ✅ Answer
          </h2>

          <p className="mt-4 text-lg">
            {card.answer}
          </p>

          <p className="mt-6 text-sm text-blue-600">
            Click to show question 🔄
          </p>
        </div>
      )}
    </div>
  );
})}

      </div>

    </div>
  );
}

export default Flashcards;