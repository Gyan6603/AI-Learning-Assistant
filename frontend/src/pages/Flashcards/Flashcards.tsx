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
        ? previous.filter(
            (cardIndex) => cardIndex !== index
          )
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
          (document) =>
            document.id !== selectedDocumentId
        )
      );

      setSelectedDocumentId("");
      setFlashcards([]);
      setFlippedCards([]);
    } catch (error) {
      console.error(
        "Failed to delete PDF:",
        error
      );

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
    setFlippedCards([]);

    try {
      const data = await generateFlashcards(
        `Generate ${flashcardCount} flashcards in English from this PDF.`,
        selectedDocumentId,
        Number(flashcardCount)
      );

      setFlashcards(
        data.slice(0, Number(flashcardCount))
      );
    } catch (error) {
      console.error(error);
      setError("Failed to generate flashcards.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl shadow-sm">
              🧠
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Smart Revision
              </p>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                AI Flashcards
              </h1>
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
            Turn your study material into interactive flashcards
            and revise important concepts quickly.
          </p>
        </div>

        {/* Generator Controls */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_220px_auto] lg:items-end">

            {/* PDF */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Study Material
              </label>

              <select
                value={selectedDocumentId}
                onChange={(event) => {
                  setSelectedDocumentId(
                    event.target.value
                  );
                  setFlashcards([]);
                  setFlippedCards([]);
                  setError("");
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-800"
              >
                <option value="">
                  📄 Select a study PDF
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

            {/* Count */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Number of Cards
              </label>

              <select
                value={flashcardCount}
                onChange={(event) =>
                  setFlashcardCount(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-800"
              >
                <option value="3">3 Cards</option>
                <option value="5">5 Cards</option>
                <option value="10">10 Cards</option>
              </select>
            </div>

            {/* Generate */}
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
            >
              {isLoading
                ? "Generating..."
                : "Generate Cards →"}
            </button>
          </div>

          {/* Selected PDF */}
          {selectedDocumentId && (
            <div className="mt-5 flex flex-col gap-3 rounded-xl bg-indigo-50 px-4 py-3 dark:bg-indigo-950/40 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                PDF selected. Ready to generate flashcards.
              </div>

              <button
                onClick={handleDeleteSelectedDocument}
                className="self-start rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:bg-slate-900 dark:hover:bg-red-950/30 sm:self-auto"
              >
                Remove PDF
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-indigo-50 text-2xl dark:bg-indigo-950/50">
              🧠
            </div>

            <h2 className="mt-4 font-bold text-slate-800 dark:text-white">
              Creating your flashcards...
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              CogniVerse is analyzing your study material.
            </p>
          </div>
        )}

        {/* Flashcards */}
        {!isLoading && flashcards.length > 0 && (
          <section className="mt-8">

            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Your Revision Deck
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {flashcards.length} Flashcards
                </h2>
              </div>

              <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
                Click a card to reveal the answer
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {flashcards.map((card, index) => {
                const isFlipped =
                  flippedCards.includes(index);

                return (
                  <div
                    key={index}
                    onClick={() => toggleCard(index)}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        toggleCard(index);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Flashcard ${
                      index + 1
                    }. ${
                      isFlipped
                        ? "Show question"
                        : "Show answer"
                    }`}
                    className="group min-h-[260px] cursor-pointer break-words rounded-2xl border border-slate-200 bg-white p-5 shadow-sm outline-none transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700 dark:hover:bg-slate-800 dark:focus:ring-indigo-950 sm:p-6"
                  >

                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                        Card {index + 1}
                      </span>

                      <span className="text-lg">
                        {isFlipped ? "💡" : "❓"}
                      </span>
                    </div>

                    {/* Question */}
                    {!isFlipped ? (
                      <div className="flex min-h-[190px] flex-col justify-center">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Question
                        </p>

                        <h3 className="mt-3 break-words text-xl font-bold leading-8 text-slate-800 dark:text-white">
                          {card.question}
                        </h3>

                        <p className="mt-6 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          Click to reveal answer ↗
                        </p>
                      </div>
                    ) : (
                      <div className="flex min-h-[190px] flex-col justify-center">
                        <p className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
                          Answer
                        </p>

                        <p className="mt-3 break-words text-lg font-medium leading-8 text-slate-700 dark:text-slate-200">
                          {card.answer}
                        </p>

                        <p className="mt-6 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          Click to view question ↗
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!isLoading &&
          flashcards.length === 0 &&
          !error && (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900 sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl dark:bg-indigo-950/50">
                🧠
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-800 dark:text-white">
                Ready to revise?
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Select one of your study PDFs above and generate
                AI-powered flashcards for quick revision.
              </p>
            </div>
          )}
      </div>
    </main>
  );
}

export default Flashcards;