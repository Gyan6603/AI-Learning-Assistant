
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDocuments,
  generateQuiz,
  submitQuizResult,
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
        setError("Failed to load documents");
      }
    }

    loadDocuments();
  }, [navigate]);

  async function handleGenerateQuiz() {
    if (!selectedDocumentId) {
      setError("Please select a PDF");
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
    } catch {
      setError("Failed to generate quiz");
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
      return; // Prevent changing answers after results are shown
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

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold">
        📝 AI Quiz Generator
      </h1>

      <p className="mt-2 text-gray-600">
        Test your knowledge using your study PDF.
      </p>

      <div className="mt-6 rounded-xl border p-5 shadow">
        <label className="block font-semibold">
          Select Study PDF
        </label>

        <select
          value={selectedDocumentId}
          onChange={(event) =>
            setSelectedDocumentId(event.target.value)
          }
          className="mt-2 w-full rounded-lg border px-4 py-3"
        >
          <option value="">Select a PDF</option>

          {documents.map((document) => (
            <option key={document.id} value={document.id}>
              {document.filename}
            </option>
          ))}
        </select>

        <button
          onClick={handleGenerateQuiz}
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Quiz"}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </p>
      )}

      {questions.map((question, index) => (
        <div
          key={index}
          className="mt-6 rounded-xl border p-6 shadow"
        >
          <p className="text-sm text-gray-500">
            Question {index + 1}
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {question.question}
          </h2>

          <div className="mt-4 space-y-3">
            
    {question.options.map((option, optionIndex) => {
        const isMultiple = question.question_type === "multiple";
        const isSelected = (answers[index] || []).includes(option);
        const isCorrectOption = question.correct_answers
            .map((answer) => answer.trim().toLowerCase())
            .includes(option.trim().toLowerCase());

        const isWrongSelected = isSelected && !isCorrectOption;

        const optionColor = showResults
            ? isCorrectOption
            ? "border-green-500 bg-green-100"
            : isWrongSelected
            ? "border-red-500 bg-red-100"
            : "border-gray-300"
        : "border-gray-300";
         return (
        <label
            key={optionIndex}
            className={`flex items-center gap-3 rounded-lg border p-3 ${
                showResults
                    ? "cursor-not-allowed opacity-80"
                    : "cursor-pointer hover:bg-gray-100"
            } ${optionColor}`}
            >
        <input
            type={isMultiple ? "checkbox" : "radio"}
            name={`question-${index}`}
            value={option}
            checked={isSelected}
            disabled={showResults}
            onChange={() =>
                handleOptionChange(
                    index,
                    option,
                    question.question_type
                )
            }
        />
        <span>{option}</span>
        </label>
        );
    })}
          </div>
        
{showResults && (
  <div className="mt-4 rounded-lg bg-gray-50 p-4">
    {(answers[index] || []).length === 0 ? (
      <>
        <p className="font-semibold text-yellow-600">
          ⚪ Not Answered
        </p>
      </>
    ) : (
      <p className="font-semibold">
        {(() => {
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

          return isCorrect
            ? "✅ Correct Answer!"
            : "❌ Incorrect Answer";
        })()}
      </p>
    )}

    <p className="mt-2 text-green-700">
      <strong>Correct Answer:</strong>{" "}
      {question.correct_answers.join(", ")}
    </p>
  </div>
)}
        </div>
      ))}

      {questions.length > 0 && (
        <button
          onClick={handleSubmitQuiz}
          className="mt-6 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
        >
          Submit Quiz
        </button>
      )}

      {score !== null && (
        <div className="mt-6 rounded-xl bg-green-100 p-6 text-center">
          <h2 className="text-2xl font-bold text-green-800">
            Your Score
          </h2>

          <p className="mt-2 text-xl">
            {score} / {questions.length}
          </p>

          <button
            onClick={resetQuiz}
        className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
        Retake Quiz
        </button>
        </div>
      )}
    </div>
  );
}

export default Quiz;