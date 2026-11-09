import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Building2,
  Database,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Server,
  Zap
} from "lucide-react"
import { useAuthStore } from "../store/authStore"
import {
  onboardNewTenant,
  testCustomDatabase,
  type TestDbResponse
} from "../services/tenant.service"
import { showToast } from "../utils/toast"

export const TenantOnboarding = () => {
  const navigate = useNavigate()
  const authStore = useAuthStore()

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [domain, setDomain] = useState("")
  const [plan, setPlan] = useState<"FREE_TRIAL" | "STARTER" | "PRO" | "ENTERPRISE">("PRO")
  const [dbMode, setDbMode] = useState<"MANAGED" | "BYOD">("MANAGED")
  const [customDatabaseUrl, setCustomDatabaseUrl] = useState("")
  const [dbSslRequired, setDbSslRequired] = useState(true)
  const [dbTestResult, setDbTestResult] = useState<TestDbResponse | null>(null)
  const [testingDb, setTestingDb] = useState(false)

  const [adminFullName, setAdminFullName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9-]/g, "-")) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]/g, "-")
          .replace(/-+/g, "-")
      )
    }
  }

  const handleTestDb = async () => {
    if (!customDatabaseUrl.trim()) {
      setError("Please enter a PostgreSQL connection URL to test.")
      return
    }
    setError("")
    setTestingDb(true)
    setDbTestResult(null)
    try {
      const res = await testCustomDatabase(customDatabaseUrl.trim(), dbSslRequired)
      setDbTestResult(res)
      if (res.connected) {
        showToast.success(`Connected to PostgreSQL in ${res.latencyMs}ms!`)
      } else {
        showToast.error(res.error || "Database connection failed.")
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Database connection test failed."
      setDbTestResult({
        connected: false,
        latencyMs: 0,
        maskedUrl: customDatabaseUrl,
        error: msg
      })
    } finally {
      setTestingDb(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const res = await onboardNewTenant({
        name,
        slug,
        domain: domain || undefined,
        plan,
        dbStrategy: dbMode === "BYOD" ? "BYOD_CUSTOM" : "DEDICATED_MANAGED",
        customDatabaseUrl: dbMode === "BYOD" ? customDatabaseUrl.trim() : undefined,
        dbSslRequired,
        adminFullName,
        adminEmail,
        adminPassword
      })

      authStore.setTenantSlug(res.tenant.slug)
      authStore.login(res.user, res.token, res.refreshToken)
      showToast.success(`Workspace '${res.tenant.name}' provisioned!`)
      navigate("/app/dashboard")
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to provision workspace."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 flex flex-col items-center justify-center transition-colors">
      <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <img
              src="/timeflow-logo.png"
              alt="TimeFlow Enterprise"
              className="h-14 w-14 rounded-2xl shadow-md object-contain shrink-0 mt-1"
            />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Zap size={14} />
                Multi-Tenant SaaS Onboarding
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Create Isolated Organization Workspace
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Deploy a dedicated HRM & Attendance environment on our managed cloud or connect your own PostgreSQL database (BYOD).
              </p>
            </div>
          </div>
          <Link
            to="/auth/login"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
          >
            &larr; Back to Sign In
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 dark:bg-red-950/40 p-3.5 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Step 1: Organization Details */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" />
              1. Organization Profile & Plan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dialog Axiata PLC"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Workspace Slug (Tenant ID) *
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden focus-within:border-blue-500">
                  <input
                    type="text"
                    required
                    placeholder="dialog"
                    value={slug}
                    onChange={(e) =>
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-")
                      )
                    }
                    className="w-full p-3 text-sm bg-transparent text-slate-800 dark:text-slate-100 outline-none font-mono"
                  />
                  <span className="pr-3 text-xs text-slate-400 font-mono">
                    .timeflow.app
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Corporate Domain (Optional)
                </label>
                <input
                  type="text"
                  placeholder="dialog.lk"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Subscription Tier
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                >
                  <option value="FREE_TRIAL">Free Trial (Up to 25 Employees)</option>
                  <option value="STARTER">Starter Tier (Up to 75 Employees)</option>
                  <option value="PRO">Pro Tier (Up to 300 Employees)</option>
                  <option value="ENTERPRISE">Enterprise VIP (5,000+ Employees & BYOD)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Database Isolation Mode */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Database size={16} className="text-blue-600" />
              2. Isolated Database Strategy (Zero Shared Schema)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDbMode("MANAGED")}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  dbMode === "MANAGED"
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-blue-600" />
                    Managed Cloud Database
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                    Instant Setup
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Auto-provisions an isolated schema & warm connection pool on our high-speed PostgreSQL cluster.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDbMode("BYOD")}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                  dbMode === "BYOD"
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Server size={16} className="text-indigo-600" />
                    Bring Your Own DB (BYOD)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                    100% Client-Hosted
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Connect your own PostgreSQL instance (Neon, AWS RDS, Supabase, or On-Premise).
                </p>
              </button>
            </div>

            {dbMode === "BYOD" && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Client PostgreSQL Connection URI (Encrypted with AES-256-GCM) *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      required={dbMode === "BYOD"}
                      placeholder="postgresql://user:password@ep-custom.aws.neon.tech/company_hrm?sslmode=require"
                      value={customDatabaseUrl}
                      onChange={(e) => setCustomDatabaseUrl(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-xs font-mono bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleTestDb}
                      disabled={testingDb}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-800 transition shrink-0 cursor-pointer"
                    >
                      {testingDb ? "Testing..." : "Test Connection"}
                    </button>
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dbSslRequired}
                    onChange={(e) => setDbSslRequired(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Require SSL/TLS connection (Recommended for Neon, Supabase, RDS)
                </label>

                {dbTestResult && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center justify-between ${
                      dbTestResult.connected
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {dbTestResult.connected ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )}
                      <span>
                        {dbTestResult.connected
                          ? `Connection Verified (${dbTestResult.maskedUrl})`
                          : `Failed: ${dbTestResult.error}`}
                      </span>
                    </div>
                    {dbTestResult.connected && (
                      <span className="font-mono font-bold">
                        {dbTestResult.latencyMs}ms
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 3: Super Admin Account */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              3. Primary Administrator Account
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Admin Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Kasun Perera"
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Admin Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@company.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Admin Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 p-4 font-bold text-white shadow-lg shadow-blue-600/25 transition text-sm cursor-pointer"
          >
            {submitting
              ? "Provisioning Isolated Database & Seeding Workspace..."
              : "Provision Isolated Tenant Workspace & Launch Dashboard"}
          </button>
        </form>
      </div>
    </div>
  )
}
