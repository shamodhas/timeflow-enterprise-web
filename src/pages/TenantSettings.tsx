import React, { useEffect, useState } from "react"
import {
  Database,
  Server,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building2,
  Activity
} from "lucide-react"
import {
  getCurrentTenantDetails,
  listAllTenants,
  testCustomDatabase,
  updateTenantDatabaseConfig,
  type TestDbResponse
} from "../services/tenant.service"
import { showToast } from "../utils/toast"

export const TenantSettings = () => {
  const [details, setDetails] = useState<any>(null)
  const [allTenants, setAllTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [customDbUrl, setCustomDbUrl] = useState("")
  const [sslRequired, setSslRequired] = useState(true)
  const [testResult, setTestResult] = useState<TestDbResponse | null>(null)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [currentRes, listRes] = await Promise.all([
        getCurrentTenantDetails(),
        listAllTenants().catch(() => ({ tenants: [] }))
      ])
      setDetails(currentRes)
      setAllTenants(listRes.tenants || [])
      if (currentRes?.tenant) {
        setSslRequired(Boolean(currentRes.tenant.dbSslRequired))
      }
    } catch (err: any) {
      showToast.error(
        err.response?.data?.message || "Failed to load tenant infrastructure details."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handleTestConnection = async () => {
    if (!customDbUrl.trim()) {
      showToast.error("Enter a PostgreSQL URI to test.")
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const res = await testCustomDatabase(customDbUrl.trim(), sslRequired)
      setTestResult(res)
      if (res.connected) {
        showToast.success(`PostgreSQL reachable in ${res.latencyMs}ms!`)
      } else {
        showToast.error(res.error || "Connection test failed.")
      }
    } catch (err: any) {
      setTestResult({
        connected: false,
        latencyMs: 0,
        maskedUrl: customDbUrl,
        error:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Connection failed"
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSwitchDatabase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customDbUrl.trim()) {
      showToast.error("Provide a valid PostgreSQL connection string.")
      return
    }
    setSaving(true)
    try {
      const res = await updateTenantDatabaseConfig({
        customDatabaseUrl: customDbUrl.trim(),
        dbStrategy: "BYOD_CUSTOM",
        dbSslRequired: sslRequired
      })
      showToast.success(res.message || "Isolated database updated and warmed!")
      setCustomDbUrl("")
      setTestResult(null)
      await loadData()
    } catch (err: any) {
      showToast.error(
        err.response?.data?.message || "Failed to switch tenant database."
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading && !details) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Loading Multi-Tenant Infrastructure & Telemetry...
      </div>
    )
  }

  const tenant = details?.tenant
  const usage = details?.usage
  const cacheStats = details?.performance?.cache
  const poolStats = details?.performance?.connectionPools

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Multi-Tenant SaaS & BYOD Database Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage isolated tenant databases, warm connection pools, and L1/L2 cache telemetry.
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer self-start"
        >
          <RefreshCw size={14} />
          Refresh Telemetry
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Workspace
            </span>
            <Building2 size={18} className="text-blue-600" />
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white truncate">
            {tenant?.name || "IJSE"}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              {tenant?.slug}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold">
              {tenant?.plan}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold">
              {tenant?.dbStrategy}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
            <span>
              Employees: <strong>{usage?.employees ?? 0}</strong> / {tenant?.maxEmployees ?? 250}
            </span>
            <span>
              Branches: <strong>{usage?.branches ?? 0}</strong> / {tenant?.maxBranches ?? 25}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dynamic Pool Manager
            </span>
            <Activity size={18} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {poolStats?.activeWarmPools ?? 1}{" "}
            <span className="text-xs font-semibold text-slate-400">
              / {poolStats?.maxConcurrentPools ?? 60} Warm Pools
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 truncate font-mono">
            {tenant?.maskedDbUrl}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck size={14} />
            0ms Warm Pool Handshake Active
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              L1/L2 Cache Engine
            </span>
            <Zap size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {cacheStats?.hitRatePercent ?? 0}%{" "}
            <span className="text-xs font-semibold text-slate-400">
              Hit Rate ({cacheStats?.provider || "memory-lru"})
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Hits: <strong>{cacheStats?.hits ?? 0}</strong> &bull; Misses:{" "}
            <strong>{cacheStats?.misses ?? 0}</strong> &bull; Keys:{" "}
            <strong>{cacheStats?.l1Size ?? 0}</strong>
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            Branches, Geofences & Tenant Metadata cached in RAM
          </div>
        </div>
      </div>

      {/* BYOD Custom Database Connection Panel */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <Server size={20} className="text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Connect or Switch to Client-Hosted PostgreSQL Database (BYOD)
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Connect a dedicated PostgreSQL database for <strong>{tenant?.name}</strong>. The platform will automatically verify connectivity, run baseline schema & index migrations, encrypt the URI with AES-256-GCM, and hot-swap the connection pool without downtime.
        </p>

        <form onSubmit={handleSwitchDatabase} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="postgresql://owner:password@custom-host.neon.tech/client_hrm_db?sslmode=require"
              value={customDbUrl}
              onChange={(e) => setCustomDbUrl(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-xs font-mono bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-3 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-700 transition cursor-pointer shrink-0"
            >
              {testing ? "Testing..." : "1. Test DB Latency"}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer shrink-0"
            >
              {saving ? "Provisioning..." : "2. Provision & Switch Pool"}
            </button>
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={sslRequired}
              onChange={(e) => setSslRequired(e.target.checked)}
            />
            Require SSL/TLS (Enabled for Neon, AWS RDS, Supabase, Azure Postgres)
          </label>

          {testResult && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center justify-between ${
                testResult.connected
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.connected ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>
                  {testResult.connected
                    ? `Connected (${testResult.maskedUrl}) — ${testResult.serverVersion}`
                    : `Error: ${testResult.error}`}
                </span>
              </div>
              {testResult.connected && (
                <span className="font-mono font-bold">
                  {testResult.latencyMs}ms
                </span>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Registered Tenants & Active Pools Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4">
          <Database size={18} className="text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Registered Tenant Organizations & Isolated Data Sources ({allTenants.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase">
                <th className="py-3 px-3">Organization</th>
                <th className="py-3 px-3">Slug</th>
                <th className="py-3 px-3">Plan</th>
                <th className="py-3 px-3">DB Strategy</th>
                <th className="py-3 px-3">Isolated Data Source</th>
                <th className="py-3 px-3">Pool Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {allTenants.map((t) => {
                const warmPool = poolStats?.tenants?.find(
                  (p: any) => p.tenantId === t.id
                )
                return (
                  <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">
                      {t.name}
                      <div className="text-[10px] font-normal text-slate-400">
                        {t.ownerEmail}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {t.slug}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                        {t.plan}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold ${
                          t.dbStrategy === "BYOD_CUSTOM"
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                            : "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {t.dbStrategy}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500 max-w-xs truncate">
                      {t.maskedDbUrl}
                    </td>
                    <td className="py-3 px-3">
                      {warmPool ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          WARM ({warmPool.totalQueries} queries)
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">
                          STANDBY (On-Demand)
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
