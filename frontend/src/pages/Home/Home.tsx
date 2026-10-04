import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { checkBackendHealth } from "../../services/api";

function Home() {
  const [backendMessage, setBackendMessage] = useState("");
  const [backendError, setBackendError] = useState("");

  const navigate = useNavigate();

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

  const features = [
    {
      title: "AI Tutor",
      description:
        "Ask questions and learn with an AI-powered study assistant.",
      icon: "🤖",
      path: "/chat",
    },
    {
      title: "Smart Quiz",
      description:
        "Test your knowledge with AI-generated quizzes from your PDFs.",
      icon: "📝",
      path: "/quiz",
    },
    {
      title: "AI Flashcards",
      description:
        "Turn your study material into smart revision flashcards.",
      icon: "🧠",
      path: "/flashcards",
    },
    {
      title: "Learning Analytics",
      description:
        "Track your quiz performance and monitor your learning progress.",
      icon: "📊",
      path: "/dashboard",
    },
  ];

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 dark:bg-slate-950">

      {/* Hero Section */}
      <section className="relative overflow-hidden">

        {/* Background decoration */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-900/20" />
        <div className="absolute -left-24 top-48 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl dark:bg-purple-900/20" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">

          {/* Hero Content */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm dark:border-indigo-900/50 dark:bg-slate-900 dark:text-indigo-400">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              AI-powered learning platform
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Learn smarter.
              <br />
              <span className="text-indigo-600 dark:text-indigo-400">
                Study better.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              CogniVerse helps you understand your study material with AI.
              Upload PDFs, ask questions, create flashcards, take quizzes,
              and track your progress — all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/signup")}
                className="rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl dark:shadow-indigo-950/40"
              >
                Start Learning →
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
              >
                Go to Dashboard
              </button>
            </div>

            {/* Backend Status */}
            <div className="mt-6">
              {backendMessage && (
                <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-950/30 dark:text-green-400">
                  <span>●</span>
                  {backendMessage}
                </div>
              )}

              {backendError && (
                <div className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  <span>●</span>
                  {backendError}
                </div>
              )}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">

              {/* Fake dashboard header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    Your Learning Space
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                    Welcome back 👋
                  </h2>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg dark:bg-indigo-950/50">
                  🧠
                </div>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-950/40">
                  <p className="text-xs text-indigo-500 dark:text-indigo-400">
                    PDFs
                  </p>

                  <p className="mt-1 text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                    12
                  </p>
                </div>

                <div className="rounded-2xl bg-purple-50 p-4 dark:bg-purple-950/40">
                  <p className="text-xs text-purple-500 dark:text-purple-400">
                    Quizzes
                  </p>

                  <p className="mt-1 text-2xl font-bold text-purple-700 dark:text-purple-300">
                    24
                  </p>
                </div>

                <div className="rounded-2xl bg-green-50 p-4 dark:bg-green-950/40">
                  <p className="text-xs text-green-500 dark:text-green-400">
                    Score
                  </p>

                  <p className="mt-1 text-2xl font-bold text-green-700 dark:text-green-300">
                    86%
                  </p>
                </div>
              </div>

              {/* AI Tutor preview */}
              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white">
                    AI
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      AI Tutor
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Ask me anything about your study material...
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Weekly Progress
                  </span>

                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    78%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full w-[78%] rounded-full bg-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Everything you need
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              One platform for smarter learning
            </h2>

            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Turn your study material into an interactive learning
              experience powered by AI.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <button
                key={feature.title}
                onClick={() => navigate(feature.path)}
                className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-800"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl transition-transform duration-200 group-hover:scale-110 dark:bg-indigo-950/50">
                  {feature.icon}
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {feature.description}
                </p>

                <div className="mt-5 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  Explore →
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-slate-900 dark:bg-black">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to transform the way you study?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Upload your study material and let CogniVerse help you
            learn, revise, and test your knowledge.
          </p>

          <button
            onClick={() => navigate("/signup")}
            className="mt-8 rounded-xl bg-indigo-600 px-7 py-3.5 font-semibold text-white transition-all duration-200 hover:bg-indigo-500"
          >
            Create Your Account →
          </button>
        </div>
      </section>
    </main>
  );
}

export default Home;