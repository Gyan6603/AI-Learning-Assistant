import { useEffect, useState } from "react";
import { checkBackendHealth } from "../../services/api";
import FeatureCard from "../../components/common/FeatureCard";
import { useNavigate } from "react-router-dom";

function Home() {
  const [backendMessage, setBackendMessage] = useState("");
  const [backendError, setBackendError] = useState("");
  useEffect(() => {
  checkBackendHealth()
    .then((data) => {
      setBackendMessage(data.message);
    })
    .catch((error) => {
      console.error(error);
      setBackendError("Could not connect to backend.");
    });
}, []);

  const navigate = useNavigate();
  const features = [
  {
    title: "AI Tutor",
    description: "Learn with your personal AI learning assistant.",
    icon: "🤖",
    path: "/chat",
  },
  {
    title: "Smart Quiz",
    description: "Test your knowledge with AI-generated quizzes.",
    icon: "📝",
    path: "/quiz",
  },
  {
    title: "AI Flashcards",
    description: "Revise concepts using intelligent flashcards.",
    icon: "🧠",
    path: "/flashcards",
  },
  {
    title: "Learning Analytics",
    description: "Track your learning progress and performance.",
    icon: "📊",
    path: "/dashboard",
  },
];
  return (
    <>
      <h1>Home</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {backendMessage && (
          <p className="text-green-600 mb-4">
          🟢 {backendMessage}
          </p>
        )}

        {backendError && (
          <p className="text-red-600 mb-4">
          🔴 {backendError}
          </p>
        )}
        {features.map((feature) => (
        <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            onClick={() => navigate(feature.path)}
          />
        ))} 
      </div>
    </>
  );
}
export default Home;