import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getDocuments,
  generateQuiz,
  submitQuizResult,
  deleteDocument,
} from "../../services/api";

import type {
  Document,
  QuizQuestion,
} from "../../services/api";

function Quiz() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [score, setScore] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/login");
      return;
    }

    async function loadDocuments() {
      try {
        const data = await getDocuments();
        setDocuments(data);
      } catch {
        setError("Failed to load documents.");
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
      setQuestions([]);
      setAnswers({});
      setScore(null);
      setShowResults(false);
    } catch (error) {
      console.error("Failed to delete PDF:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete PDF."
      );
    }
  }

  async function handleGenerateQuiz() {
    if (!selectedDocumentId) {
      setError("Please select a PDF first.");
      return;
    }

    setLoading(true);
    setError("");
    setQuestions([]);
    setAnswers({});
    setScore(null);
    setShowResults(false);

    try {
      const data = await generateQuiz(selectedDocumentId);
      setQuestions(data);
    } catch (error) {
      console.error(error);
      setError("Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  }

  function handleOptionChange(
    questionIndex: number,
    option: string,
    questionType: "single" | "multiple"
  ) {
    if (showResults) {
      return;
    }

    setAnswers((previous) => {
      const currentAnswers = previous[questionIndex] || [];

      if (questionType === "single") {
        return {
          ...previous,
          [questionIndex]: [option],
        };
      }

      const updatedAnswers = currentAnswers.includes(option)
        ? currentAnswers.filter((answer) => answer !== option)
        : [...currentAnswers, option];

      return {
        ...previous,
        [questionIndex]: updatedAnswers,
      };
    });
  }

  function resetQuiz() {
    setAnswers({});
    setScore(null);
    setShowResults(false);
  }

  async function handleSubmitQuiz() {
    let totalScore = 0;

    questions.forEach((question, index) => {
      const selectedAnswers = (answers[index] || [])
        .map((answer) => answer.trim().toLowerCase())
        .sort();

      const correctAnswers = question.correct_answers
        .map((answer) => answer.trim().toLowerCase())
        .sort();

      const isCorrect =
        selectedAnswers.length === correctAnswers.length &&
        selectedAnswers.every(
          (answer, answerIndex) =>
            answer === correctAnswers[answerIndex]
        );

      if (isCorrect) {
        totalScore++;
      }
    });

    try {
      await submitQuizResult(
        selectedDocumentId,
        totalScore,
        questions.length
      );
    } catch (error) {
      console.error("Failed to save quiz result:", error);
    }

    setScore(totalScore);
    setShowResults(true);
  }

  const answeredCount = Object.values(answers).filter(
    (answer) => answer.length > 0
  ).length;

  const percentage =
    score !== null && questions.length > 0
      ? Math.round((score / questions.length) * 100)
      : 0;

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl shadow-sm">
              🎯
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Knowledge Check
              </p>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                AI Quiz
              </h1>
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
            Test your understanding with AI-generated questions
            based on your study material.
          </p>
        </div>

        {/* Quiz Setup */}
        {!showResults && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Study Material
                </label>

                <select
                  value={selectedDocumentId}
                  onChange={(event) => {
                    setSelectedDocumentId(event.target.value);
                    setQuestions([]);
                    setAnswers({});
                    setScore(null);
                    setShowResults(false);
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

              <button
                onClick={handleGenerateQuiz}
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
              >
                {loading ? "Generating..." : "Generate Quiz →"}
              </button>
            </div>

            {selectedDocumentId && (
              <div className="mt-5 flex flex-col gap-3 rounded-xl bg-indigo-50 px-4 py-3 dark:bg-indigo-950/40 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
                  <span className="h-2 w-2 rounded-full bg-green-500" />

                  PDF selected. Ready to generate your quiz.
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
        )}

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-indigo-50 text-2xl dark:bg-indigo-950/50">
              🎯
            </div>

            <h2 className="mt-4 font-bold text-slate-800 dark:text-white">
              Creating your quiz...
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              CogniVerse is preparing questions from your
              study material.
            </p>
          </div>
        )}

        {/* Quiz */}
        {!loading && questions.length > 0 && !showResults && (
          <section className="mt-8">

            {/* Progress Header */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Quiz Progress
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {answeredCount} / {questions.length} answered
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Keep going
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Choose the correct answer for each question.
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{
                    width: `${
                      questions.length > 0
                        ? (answeredCount / questions.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                        {index + 1}
                      </span>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Question {index + 1}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {question.question_type === "multiple"
                            ? "Select all correct answers"
                            : "Select one answer"}
                        </p>
                      </div>
                    </div>

                    {answers[index]?.length > 0 && (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600 dark:bg-green-950/40 dark:text-green-400">
                        Answered
                      </span>
                    )}
                  </div>

                  <h2 className="mt-5 break-words text-lg font-bold leading-8 text-slate-800 dark:text-white sm:text-xl">
                    {question.question}
                  </h2>

                  <div className="mt-6 space-y-3">
                    {question.options.map(
                      (option, optionIndex) => {
                        const isMultiple =
                          question.question_type === "multiple";

                        const isSelected = (
                          answers[index] || []
                        ).includes(option);

                        return (
                          <label
                            key={optionIndex}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all duration-200 ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-50 shadow-sm dark:bg-indigo-950/40"
                                : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750"
                            }`}
                          >
                            <input
                              type={
                                isMultiple
                                  ? "checkbox"
                                  : "radio"
                              }
                              name={`question-${index}`}
                              value={option}
                              checked={isSelected}
                              onChange={() =>
                                handleOptionChange(
                                  index,
                                  option,
                                  question.question_type
                                )
                              }
                              className="h-4 w-4 accent-indigo-600"
                            />

                            <span className="flex-1 break-words text-sm font-medium leading-6 text-slate-700 dark:text-slate-200">
                              {option}
                            </span>

                            {isSelected && (
                              <span className="shrink-0 text-indigo-600 dark:text-indigo-400">
                                ✓
                              </span>
                            )}
                          </label>
                        );
                      }
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">
                    Ready to submit?
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    You have answered {answeredCount} of{" "}
                    {questions.length} questions.
                  </p>
                </div>

                <button
                  onClick={handleSubmitQuiz}
                  className="w-full rounded-xl bg-green-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700 hover:shadow-md sm:w-auto"
                >
                  Submit Quiz ✓
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Results */}
        {showResults && score !== null && (
          <section className="mt-8">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              {/* Score Header */}
              <div className="bg-indigo-600 px-6 py-10 text-center text-white sm:px-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-4xl">
                  🏆
                </div>

                <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-indigo-100">
                  Quiz Completed
                </p>

                <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                  Your Score
                </h2>

                <p className="mt-4 text-5xl font-bold">
                  {score}
                  <span className="text-2xl font-medium text-indigo-100">
                    {" "}
                    / {questions.length}
                  </span>
                </p>
              </div>

              {/* Score Stats */}
              <div className="grid gap-4 p-5 dark:bg-slate-900 sm:grid-cols-3 sm:p-8">
                <div className="rounded-2xl bg-slate-50 p-5 text-center dark:bg-slate-800">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Score
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {percentage}%
                  </p>
                </div>

                <div className="rounded-2xl bg-green-50 p-5 text-center dark:bg-green-950/30">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Correct
                  </p>

                  <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-400">
                    {score}
                  </p>
                </div>

                <div className="rounded-2xl bg-red-50 p-5 text-center dark:bg-red-950/30">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    Incorrect
                  </p>

                  <p className="mt-2 text-2xl font-bold text-red-700 dark:text-red-400">
                    {questions.length - score}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 border-t border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:justify-center sm:p-6">
                <button
                  onClick={resetQuiz}
                  className="w-full rounded-xl bg-indigo-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
                >
                  🔄 Retake Quiz
                </button>

                <button
                  onClick={() => {
                    setQuestions([]);
                    setAnswers({});
                    setScore(null);
                    setShowResults(false);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-7 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:w-auto"
                >
                  Create New Quiz
                </button>
              </div>
            </div>

            {/* Answer Review */}
            <div className="mt-8">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Review
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  Answer Review
                </h2>
              </div>

              <div className="space-y-5">
                {questions.map((question, index) => {
                  const selectedAnswers =
                    answers[index] || [];

                  const normalizedSelected =
                    selectedAnswers
                      .map((answer) =>
                        answer.trim().toLowerCase()
                      )
                      .sort();

                  const normalizedCorrect =
                    question.correct_answers
                      .map((answer) =>
                        answer.trim().toLowerCase()
                      )
                      .sort();

                  const isCorrect =
                    normalizedSelected.length ===
                      normalizedCorrect.length &&
                    normalizedSelected.every(
                      (answer, answerIndex) =>
                        answer ===
                        normalizedCorrect[answerIndex]
                    );

                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                            isCorrect
                              ? "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400"
                              : selectedAnswers.length === 0
                              ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400"
                              : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                          }`}
                        >
                          {isCorrect
                            ? "✓"
                            : selectedAnswers.length === 0
                            ? "—"
                            : "×"}
                        </span>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Question {index + 1}
                          </p>

                          <h3 className="mt-2 break-words font-bold leading-7 text-slate-800 dark:text-white">
                            {question.question}
                          </h3>
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                        {selectedAnswers.length === 0 ? (
                          <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                            ⚪ Not Answered
                          </p>
                        ) : (
                          <p
                            className={`text-sm font-semibold ${
                              isCorrect
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {isCorrect
                              ? "✅ Correct Answer"
                              : "❌ Incorrect Answer"}
                          </p>
                        )}

                        <p className="mt-3 break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                          <strong className="text-slate-800 dark:text-white">
                            Correct answer:
                          </strong>{" "}
                          {question.correct_answers.join(", ")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading &&
          questions.length === 0 &&
          !showResults &&
          !error && (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900 sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl dark:bg-indigo-950/50">
                🎯
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-800 dark:text-white">
                Ready for a challenge?
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Select one of your study PDFs above and let
                CogniVerse create an AI-powered quiz to test
                your knowledge.
              </p>
            </div>
          )}
      </div>
    </main>
  );
}

export default Quiz;