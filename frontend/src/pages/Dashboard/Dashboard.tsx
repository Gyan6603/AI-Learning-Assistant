import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, getDashboardStats } from "../../services/api";

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
      {/* {error && <p>{error}</p>} */}

      {user && (
        <div>
          <h2>Welcome!</h2>
          <p>You are authenticated.</p>
          <p>User ID: {user.user_id}</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;