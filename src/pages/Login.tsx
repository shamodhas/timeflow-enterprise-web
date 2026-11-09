import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useGoogleLogin } from "@react-oauth/google"
import { useAuthStore } from "../store/authStore"
import { googleLogin, login } from "../services/auth.service"

export const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const authStore = useAuthStore()
  const navigate = useNavigate()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const res = await login({ email, password })
      authStore.login(res.user, res.token, res.refreshToken)
      navigate("/app/dashboard")
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Check credentials."
      )
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("")
      try {
        const res = await googleLogin(tokenResponse.access_token)
        authStore.login(res.user, res.token, res.refreshToken)
        navigate("/app/dashboard")
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Unauthorized. Account not provisioned."
        )
      }
    },
    onError: () => setError("Google sign-in was canceled or failed.")
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 w-full transition-colors">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="/ijse-badge.png"
            alt="IJSE"
            className="h-16 w-16 rounded-2xl shadow-md object-contain mb-3"
          />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            IJSE
          </h2>
          <p className="text-xs font-bold text-red-600 dark:text-red-500 uppercase tracking-wider mt-0.5">
            Institute of Software Engineering
          </p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Enterprise HRM & Attendance System
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-center text-xs font-semibold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Corporate Email
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 text-sm cursor-pointer"
          >
            Sign In
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="mx-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            OR
          </span>
          <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        <button
          onClick={() => handleGoogleLogin()}
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition hover:bg-slate-50 dark:hover:bg-slate-700/60 text-sm cursor-pointer"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>

        <div className="mt-6 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/auth/register"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            Request Access
          </Link>
        </div>
      </div>
      <div className="mt-6 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
        Developed by{" "}
        <a
          href="https://shamodha.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-600 dark:text-slate-300 font-semibold hover:underline"
        >
          shamodha.com
        </a>
      </div>
    </div>
  )
}
