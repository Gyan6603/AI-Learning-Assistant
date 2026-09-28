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
  LabelList,
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

    // Refresh dashboard statistics
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

    // Remove deleted PDF from the current list
    setDocuments((currentDocuments) =>
      currentDocuments.filter(
        (document) => document.id !== documentId
      )
    );

    // Refresh dashboard statistics
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
    <div>
      <h1>Dashboard Page</h1>
      <button onClick={() => {
        localStorage.removeItem("access_token");
        navigate("/login");
      }}>
        Logout
      </button>
      {stats && (
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-5 shadow">
        <h3 className="text-gray-500">Total PDFs</h3>
        <p className="mt-2 text-3xl font-bold">
          {stats.total_documents}
        </p>
      </div>

      <div className="rounded-xl border p-5 shadow">
        <h3 className="text-gray-500">Quizzes Attempted</h3>
        <p className="mt-2 text-3xl font-bold">
          {stats.total_quizzes}
        </p>
      </div>

      <div className="rounded-xl border p-5 shadow">
        <h3 className="text-gray-500">Average Score</h3>
        <p className="mt-2 text-3xl font-bold">
          {stats.average_score}%
        </p>
      </div>
    </div>
  )}
  <div className="mt-8 rounded-xl border p-5 shadow">
  <h2 className="mb-4 text-xl font-bold">
    Quiz Progress
  </h2>

  <div className="mb-4">
  <label className="mr-3 font-medium">
    Show:
  </label>

  <select
    value={chartLimit}
    onChange={(event) =>
      setChartLimit(event.target.value)
    }
    className="rounded-lg border px-3 py-2"
  >
    <option value="5">Last 5 quizzes</option>
    <option value="10">Last 10 quizzes</option>
    <option value="20">Last 20 quizzes</option>
    <option value="all">All quizzes</option>
  </select>
  </div>

  {historyLoading && (
    <p>Loading quiz progress...</p>
  )}

  {historyError && (
    <p className="text-red-500">
      {historyError}
    </p>
  )}

  {!historyLoading && !historyError && history.length === 0 && (
    <p className="text-gray-500">
      No quiz attempts yet.
    </p>
  )}

  {!historyLoading && !historyError && history.length > 0 && (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="quiz" />

        <YAxis domain={[0, 100]} />

        <Tooltip
        formatter={(value) => [`${value}%`, "Score"]}
        />
        <Bar dataKey="score" name="Score (%)">
          <LabelList dataKey="score" position="top" />
        </Bar>      
      </BarChart>
    </ResponsiveContainer>
  )}
</div>
<div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
  <h2 className="text-xl font-bold">
    Upload PDF
  </h2>

  <p className="mt-1 text-sm text-gray-500">
    Upload your study material and start learning with AI.
  </p>

  <div className="mt-5 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
    
    <div className="text-4xl">
      📄
    </div>

    <p className="mt-2 font-medium">
      Upload your PDF
    </p>

    <p className="mt-1 text-sm text-gray-500">
      PDF files only
    </p>

    <label
      htmlFor="pdf-upload"
      className="mt-4 inline-block cursor-pointer rounded-lg bg-black px-5 py-2.5 font-medium text-white transition hover:bg-gray-800"
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
      <div className="mt-4 rounded-lg bg-gray-50 p-3 text-left">
        <p className="font-medium">
          📄 {selectedFile.name}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
    )}

    <button
      onClick={handlePdfUpload}
      disabled={uploading || !selectedFile}
      className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {uploading ? "Uploading..." : "Upload PDF"}
    </button>

    {uploadMessage && (
      <p className="mt-3 text-sm">
        {uploadMessage}
      </p>
    )}
  </div>
</div>
<div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
  <h2 className="text-xl font-bold">
    Your Uploaded PDFs
  </h2>

  {documents.length === 0 ? (
    <p className="mt-3 text-sm text-gray-500">
      No PDFs uploaded yet.
    </p>
  ) : (
    <div className="mt-4 space-y-3">
      {documents.map((document) => (
        <div
          key={document.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div>
            <p className="font-medium">
              📄 {document.filename}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {document.text_length} characters
            </p>
          </div>

          <button
            onClick={() => handleDeleteDocument(document.id)}
            disabled={deletingDocument === document.id}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
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

  {user && (
    <div className="mt-6">
      <h2 className="text-2xl font-bold">
          Welcome back! 👋
      </h2>

      <p className="mt-2 text-gray-600">
        Continue your learning journey with AI Learning Assistant.
      </p>
  </div>
  )}
    </div>
  );
}

export default Dashboard;