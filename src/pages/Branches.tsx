import { useEffect, useState } from "react"
import { MapPin, Pencil, Plus, Power } from "lucide-react"
import { isAxiosError } from "axios"
import { showToast } from "../utils/toast"
import { BranchMapPicker } from "../components/BranchMapPicker"
import { PageLoader } from "../components/Loaders"
import {
  createBranch,
  getBranches,
  updateBranch,
  type Branch,
  type BranchPayload
} from "../services/branch.service"

interface BranchForm {
  name: string
  latitude: number | null
  longitude: number | null
  radiusMeters: number
}

const emptyBranch: BranchForm = {
  name: "",
  latitude: null,
  longitude: null,
  radiusMeters: 500
}

export const Branches = () => {
  const [branches, setBranches] = useState<Branch[]>([])
  const [form, setForm] = useState<BranchForm>(emptyBranch)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const refresh = async () => {
    try {
      setBranches(await getBranches())
    } catch {
      showToast.error("Failed to load branches.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void getBranches()
      .then(setBranches)
      .catch(() => showToast.error("Failed to load branches."))
      .finally(() => setLoading(false))
  }, [])

  const reset = () => {
    setForm(emptyBranch)
    setEditingId(null)
  }

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (form.latitude === null || form.longitude === null) {
      showToast.error("Choose the branch location on the map first.")
      return
    }

    const payload: BranchPayload = {
      name: form.name,
      latitude: form.latitude,
      longitude: form.longitude,
      radiusMeters: form.radiusMeters
    }
    setSaving(true)
    try {
      if (editingId) {
        const current = branches.find((branch) => branch.id === editingId)
        await updateBranch(editingId, {
          ...payload,
          isActive: current?.isActive ?? true
        })
        showToast.success("Branch updated.")
      } else {
        await createBranch(payload)
        showToast.success("Branch created.")
      }
      reset()
      await refresh()
    } catch (error) {
      showToast.error(
        isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message ?? "Failed to save branch."
          : "Failed to save branch."
      )
    } finally {
      setSaving(false)
    }
  }

  const edit = (branch: Branch) => {
    setEditingId(branch.id)
    setForm({
      name: branch.name,
      latitude: branch.latitude,
      longitude: branch.longitude,
      radiusMeters: branch.radiusMeters
    })
  }

  const toggleActive = async (branch: Branch) => {
    try {
      await updateBranch(branch.id, {
        name: branch.name,
        latitude: branch.latitude,
        longitude: branch.longitude,
        radiusMeters: branch.radiusMeters,
        isActive: !branch.isActive
      })
      showToast.success(branch.isActive ? "Branch deactivated." : "Branch activated.")
      await refresh()
    } catch {
      showToast.error("Failed to change branch status.")
    }
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Branch locations
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Active branches are used to verify clock-in and clock-out locations.
        </p>
      </header>

      <form
        onSubmit={save}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 sm:p-5 [&>*]:min-w-0"
      >
        <h2 className="sm:col-span-2 font-semibold">
          {editingId ? "Edit branch" : "Add branch"}
        </h2>
        <label className="text-sm">
          Branch name
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent p-2 dark:border-slate-700"
          />
        </label>
        <label className="text-sm">
          Geofence radius (meters)
          <input
            required
            type="number"
            min="1"
            step="1"
            value={form.radiusMeters}
            onChange={(event) =>
              setForm({ ...form, radiusMeters: Number(event.target.value) })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent p-2 dark:border-slate-700"
          />
        </label>
        <BranchMapPicker
          value={
            form.latitude !== null && form.longitude !== null
              ? {
                  latitude: form.latitude,
                  longitude: form.longitude
                }
              : null
          }
          onChange={(coordinates) =>
            setForm({
              ...form,
              latitude: coordinates.latitude,
              longitude: coordinates.longitude
            })
          }
        />
        <div className="flex gap-2 sm:col-span-2">
          <button
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            <Plus size={16} />
            {editingId ? "Save changes" : "Add branch"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        {loading ? (
          <PageLoader label="Loading branches" />
        ) : branches.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No branches added yet.</p>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {branches.map((branch) => (
              <article
                key={branch.id}
                className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 dark:bg-slate-900"
              >
                <div className="min-w-0 break-words">
                  <h3 className="font-semibold">{branch.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin size={14} />
                    {Number(branch.latitude).toFixed(6)}, {Number(branch.longitude).toFixed(6)} · {branch.radiusMeters}m
                  </p>
                  <span className={branch.isActive ? "text-xs text-green-600" : "text-xs text-slate-500"}>
                    {branch.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => edit(branch)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleActive(branch)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
                  >
                    <Power size={14} />
                    {branch.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
