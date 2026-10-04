import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

      const response = await fetch(
        `${API_BASE_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          const errors = data.detail
            .map((error: any) => error.msg)
            .join(", ");

          throw new Error(errors);
        }

        throw new Error(data.detail || "Signup failed");
      }

      if (!data.success) {
        throw new Error(data.message);
      }

      setMessage("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-2">

          {/* Left Side */}
          <div className="hidden bg-indigo-600 p-12 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl">
                  🧠
                </div>

                <span className="text-xl font-bold text-white">
                  CogniVerse
                </span>
              </div>

              <div className="mt-20">
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-200">
                  Start learning smarter
                </p>

                <h1 className="mt-4 text-4xl font-bold leading-tight text-white">
                  Your study material.
                  <br />
                  Your AI tutor.
                  <br />
                  One platform.
                </h1>

                <p className="mt-6 max-w-md leading-7 text-indigo-100">
                  Create your CogniVerse account and turn your
                  study material into an interactive learning
                  experience.
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4">
                <span className="text-xl">📄</span>
                <span className="text-sm font-medium text-white">
                  Learn from your PDFs
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4">
                <span className="text-xl">🧠</span>
                <span className="text-sm font-medium text-white">
                  Generate smart flashcards
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4">
                <span className="text-xl">📊</span>
                <span className="text-sm font-medium text-white">
                  Track your progress
                </span>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <div className="p-8 sm:p-12">
            <div className="mx-auto max-w-md">

              {/* Mobile Brand */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
                  🧠
                </div>

                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  Cogni
                  <span className="text-indigo-600 dark:text-indigo-400">
                    Verse
                  </span>
                </span>
              </div>

              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Create your account
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Start your personalized learning journey.
                </p>
              </div>

              <form onSubmit={handleSignup} className="mt-8">

                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Full name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-950"
                  />
                </div>

                {/* Email */}
                <div className="mt-5">
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Email address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-950"
                  />
                </div>

                {/* Password */}
                <div className="mt-5">
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-950"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Message */}
                {message && (
                  <div
                    className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium ${
                      message === "Account created successfully!"
                        ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                    }`}
                  >
                    {message}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-indigo-100 transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-indigo-950/40"
                >
                  {loading
                    ? "Creating account..."
                    : "Create Account →"}
                </button>
              </form>

              {/* Login */}
              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Signup;