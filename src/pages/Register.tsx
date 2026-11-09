import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../services/api"

export const Register = () => {
  const [formData, setFormData] = useState({
    employeeCode: "",
    fullName: "",
    email: "",
    password: "",
    role: "EMPLOYEE"
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    try {
      await api.post("/auth/register", formData)
      setSuccess("Registration submitted. Awaiting admin approval.")
      setTimeout(() => navigate("/auth/login"), 3000)
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed."
      )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 w-full transition-colors">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
        <h2 className="mb-6 text-center text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Request Access
        </h2>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-center text-xs font-semibold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Employee Code
            </label>
            <input
              type="text"
              placeholder="EMP-001"
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
              value={formData.employeeCode}
              onChange={(e) =>
                setFormData({ ...formData, employeeCode: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Corporate Email
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Requested Role
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 outline-none focus:border-blue-500 text-sm bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="EMPLOYEE">Standard Employee</option>
              <option value="HR">HR</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 text-sm mt-2 cursor-pointer"
          >
            Submit Request
          </button>

          <div className="mt-4 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
