import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { loginUser } from "../../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin() {
    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = await loginUser(email, password);

      if (data.success) {
        localStorage.setItem("access_token", data.access_token);
        setMessage("Login successful!");

        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-2">

          {/* Left Side */}
          <div className="hidden bg-slate-900 p-12 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl">
                  🧠
                </div>

                <span className="text-xl font-bold text-white">
                  Cogni<span className="text-indigo-400">Verse</span>
                </span>
              </div>

              <div className="mt-20">
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
                  Welcome back
                </p>

                <h1 className="mt-4 text-4xl font-bold leading-tight text-white">
                  Continue your
                  <br />
                  learning journey.
                </h1>

                <p className="mt-6 max-w-md leading-7 text-slate-400">
                  Access your study materials, AI tutor, flashcards,
                  quizzes, and learning analytics from one place.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/5 p-4">
                <div className="text-xl">🤖</div>
                <p className="mt-2 text-xs text-slate-400">
                  AI Tutor
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-4">
                <div className="text-xl">📝</div>
                <p className="mt-2 text-xs text-slate-400">
                  Smart Quiz
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-4">
                <div className="text-xl">📊</div>
                <p className="mt-2 text-xs text-slate-400">
                  Analytics
                </p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="p-8 sm:p-12">
            <div className="mx-auto max-w-md">

              {/* Mobile Brand */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
                  🧠
                </div>

                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  Cogni<span className="text-indigo-600 dark:text-indigo-400">
                    Verse
                  </span>
                </span>
              </div>

              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Sign in to continue learning with CogniVerse.
                </p>
              </div>

              {/* Email */}
              <div className="mt-8">
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email address
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800 dark:focus:ring-indigo-950"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
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
                    message === "Login successful!"
                      ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                      : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-indigo-100 transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-indigo-950/40"
              >
                {loading ? "Signing in..." : "Sign in →"}
              </button>

              {/* Signup */}
              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;