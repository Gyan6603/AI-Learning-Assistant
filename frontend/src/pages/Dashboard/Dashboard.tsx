import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getProfile,
  getDashboardStats,
  getQuizHistory,
  getDocuments,
  uploadPdf,
  deleteDocument,
} from "../../services/api";

import type { QuizHistoryItem } from "../../services/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type UserProfile = {
  user_id: string;
  success: boolean;
  message: string;
};

type DashboardStats = {
  total_documents: number;
  total_quizzes: number;
  average_score: number;
};

function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [chartLimit, setChartLimit] = useState("10");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [deletingDocument, setDeletingDocument] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setUser(data);
      } catch {
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    }

    loadProfile();
  }, [navigate]);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      }
    }

    loadStats();
  }, []);

  useEffect(() => {
    async function loadQuizHistory() {
      try {
        setHistoryLoading(true);
        setHistoryError("");

        const data = await getQuizHistory();
        setHistory(data);
      } catch (error) {
        console.error("Failed to load quiz history:", error);
        setHistoryError("Failed to load quiz history");
      } finally {
        setHistoryLoading(false);
      }
    }

    loadQuizHistory();
  }, []);

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

  async function handlePdfUpload() {
    if (!selectedFile) {
      setUploadMessage("Please select a PDF first.");
      return;
    }

    try {
      setUploading(true);
      setUploadMessage("");

      const data = await uploadPdf(selectedFile);

      setUploadMessage(data.message);
      setSelectedFile(null);

      const updatedStats = await getDashboardStats();
      setStats(updatedStats);

      const updatedDocuments = await getDocuments();
      setDocuments(updatedDocuments);
    } catch (error) {
      setUploadMessage(
        error instanceof Error
          ? error.message
          : "PDF upload failed"
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteDocument(documentId: string) {
    try {
      setDeletingDocument(documentId);

      await deleteDocument(documentId);

      setDocuments((currentDocuments) =>
        currentDocuments.filter(
          (document) => document.id !== documentId
        )
      );

      const updatedStats = await getDashboardStats();
      setStats(updatedStats);
    } catch (error) {
      console.error("Failed to delete PDF:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete PDF"
      );
    } finally {
      setDeletingDocument("");
    }
  }

  const limit =
    chartLimit === "all"
      ? history.length
      : Number(chartLimit);

  const recentHistory =
    history.length > limit
      ? history.slice(0, limit).reverse()
      : [...history].reverse();

  const chartData = recentHistory.map((item, index) => ({
    quiz: `Quiz ${
      history.length - recentHistory.length + index + 1
    }`,
    score: Math.round(
      (item.score / item.total_questions) * 100
    ),
  }));

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Learning Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Welcome back! 👋
            </h1>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Continue your learning journey with CogniVerse.
            </p>

            {user && (
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                {user.message}
              </p>
            )}
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("access_token");
              navigate("/login");
            }}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-red-200 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-red-900 dark:hover:text-red-400"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {/* PDFs */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Total PDFs
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.total_documents}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl dark:bg-indigo-950/40">
                  📄
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                Study materials uploaded
              </p>
            </div>

            {/* Quizzes */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Quizzes Attempted
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.total_quizzes}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl dark:bg-purple-950/40">
                  📝
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                Knowledge checks completed
              </p>
            </div>

            {/* Score */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Average Score
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.average_score}%
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl dark:bg-green-950/40">
                  🎯
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                Overall quiz performance
              </p>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* Quiz Progress */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Quiz Progress
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Track your recent quiz performance.
                </p>
              </div>

              <select
                value={chartLimit}
                onChange={(event) =>
                  setChartLimit(event.target.value)
                }
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-indigo-950"
              >
                <option value="5">Last 5 quizzes</option>
                <option value="10">Last 10 quizzes</option>
                <option value="20">Last 20 quizzes</option>
                <option value="all">All quizzes</option>
              </select>
            </div>

            <div className="mt-6">
              {historyLoading && (
                <div className="flex h-[300px] items-center justify-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loading quiz progress...
                  </p>
                </div>
              )}

              {historyError && (
                <div className="flex h-[300px] items-center justify-center">
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {historyError}
                  </p>
                </div>
              )}

              {!historyLoading &&
                !historyError &&
                history.length === 0 && (
                  <div className="flex h-[300px] flex-col items-center justify-center">
                    <div className="text-4xl">📊</div>

                    <p className="mt-3 font-semibold text-slate-700 dark:text-slate-200">
                      No quiz attempts yet
                    </p>

                    <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                      Complete a quiz to see your progress here.
                    </p>
                  </div>
                )}

              {!historyLoading &&
                !historyError &&
                history.length > 0 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 8,
                        left: -10,
                        bottom: 5,
                      }}
                      barCategoryGap="25%"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        className="text-slate-200 dark:text-slate-700"
                      />

                      <XAxis
                        dataKey="quiz"
                        tick={{ fontSize: 11 }}
                        interval="preserveStartEnd"
                        tickMargin={8}
                        stroke="currentColor"
                        className="text-slate-500 dark:text-slate-400"
                      />

                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 11 }}
                        width={35}
                        stroke="currentColor"
                        className="text-slate-500 dark:text-slate-400"
                      />

                      <Tooltip
                        formatter={(value) => [
                          `${value}%`,
                          "Score",
                        ]}
                        contentStyle={{
                          backgroundColor: "var(--tooltip-bg)",
                          border:
                            "1px solid var(--tooltip-border)",
                          borderRadius: "12px",
                          color: "var(--tooltip-text)",
                        }}
                        cursor={{
                          fill: "rgba(99, 102, 241, 0.06)",
                        }}
                      />

                      <Bar
                        dataKey="score"
                        name="Score (%)"
                        fill="#4f46e5"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm dark:bg-slate-800">
            <p className="text-sm font-semibold text-indigo-300">
              Quick Actions
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Keep learning
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Choose a learning mode and continue improving your
              knowledge.
            </p>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate("/chat")}
                className="w-full rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-semibold transition hover:bg-white/15"
              >
                🤖 Ask AI Tutor
              </button>

              <button
                onClick={() => navigate("/flashcards")}
                className="w-full rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-semibold transition hover:bg-white/15"
              >
                🧠 Study Flashcards
              </button>

              <button
                onClick={() => navigate("/quiz")}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-left text-sm font-semibold transition hover:bg-indigo-500"
              >
                📝 Take a Quiz →
              </button>
            </div>
          </div>
        </div>

        {/* Upload PDF */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Study Material
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Upload a PDF
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Upload your study material and start learning with AI.
            </p>
          </div>

          <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-3xl dark:bg-indigo-950/50">
              📄
            </div>

            <p className="mt-4 font-semibold text-slate-800 dark:text-slate-200">
              Upload your study PDF
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              PDF files only
            </p>

            <label
              htmlFor="pdf-upload"
              className="mt-5 inline-block cursor-pointer rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Choose PDF File
            </label>

            <input
              id="pdf-upload"
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setSelectedFile(file);
                setUploadMessage("");
              }}
            />

            {selectedFile && (
              <div className="mx-auto mt-5 max-w-md rounded-xl border border-slate-200 bg-white p-4 text-left dark:border-slate-700 dark:bg-slate-900">
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  📄 {selectedFile.name}
                </p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            <button
              onClick={handlePdfUpload}
              disabled={uploading || !selectedFile}
              className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-indigo-600 dark:hover:bg-indigo-700"
            >
              {uploading ? "Uploading..." : "Upload PDF →"}
            </button>

            {uploadMessage && (
              <p
                className={`mt-4 text-sm font-medium ${
                  uploadMessage.toLowerCase().includes("success")
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-500 dark:text-red-400"
                }`}
              >
                {uploadMessage}
              </p>
            )}
          </div>
        </div>

        {/* Uploaded PDFs */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Your Uploaded PDFs
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage your study materials.
              </p>
            </div>

            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              {documents.length} files
            </span>
          </div>

          {documents.length === 0 ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center dark:bg-slate-800">
              <div className="text-3xl">📚</div>

              <p className="mt-3 font-semibold text-slate-700 dark:text-slate-200">
                No PDFs uploaded yet
              </p>

              <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                Upload your first study material above.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-indigo-800 dark:hover:bg-slate-800 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xl dark:bg-red-950/30">
                      📄
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800 dark:text-slate-200">
                        {document.filename}
                      </p>

                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {document.text_length} characters
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleDeleteDocument(document.id)
                    }
                    disabled={
                      deletingDocument === document.id
                    }
                    className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                  >
                    {deletingDocument === document.id
                      ? "Removing..."
                      : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Dashboard;