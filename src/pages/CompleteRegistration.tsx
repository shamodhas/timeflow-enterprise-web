// src/pages/CompleteRegistration.tsx
import React, { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { showToast } from "../utils/toast"
import { completeRegistration } from "../services/auth.service"

export const CompleteRegistration = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token") // URL eken token eka gannawa

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      showToast.error("Invalid or missing invitation token.")
      return
    }

    if (password !== confirmPassword) {
      showToast.error("Passwords do not match!")
      return
    }

    if (password.length < 6) {
      showToast.error("Password must be at least 6 characters.")
      return
    }

    setLoading(true)
    try {
      await completeRegistration({ token, password })
      showToast.success("Registration complete! You can now log in.")
      navigate("/auth/login") // Success unama login page ekata yawanawa
    } catch (error: any) {
      showToast.error(error.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  // Token ekak nattam error message ekak pennanawa
  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 transition-colors">
        <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-red-100 dark:border-red-900/50 max-w-sm">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Invalid Link</h2>
          <p className="text-gray-600 dark:text-slate-400">
            The invitation link is broken or missing the security token.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 w-full transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="text-center mb-8">
          <img
            src="/ijse-badge.png"
            alt="IJSE"
            className="h-14 w-14 rounded-2xl shadow-md object-contain mx-auto mb-3"
          />
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Activate Account</h1>
          <p className="text-xs font-bold text-red-600 dark:text-red-500 uppercase tracking-wider mt-0.5">
            Institute of Software Engineering
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
            Welcome to IJSE! Set your password to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="block w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors mt-4 cursor-pointer"
          >
            {loading ? "Activating..." : "Activate & Continue"}
          </button>
        </form>
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
