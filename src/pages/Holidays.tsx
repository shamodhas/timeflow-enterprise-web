import React, { useEffect, useState } from "react"
import api from "../services/api"
import { showToast } from "../utils/toast"

interface HolidayItem {
  id: string
  name: string
  date: string
}

export const Holidays = () => {
  const [holidays, setHolidays] = useState<HolidayItem[]>([])
  const [name, setName] = useState("")
  const [date, setDate] = useState("")

  const fetchHolidays = async () => {
    try {
      const res = await api.get("/holidays")
      setHolidays(res.data)
    } catch {
      showToast.error("Failed to load holidays")
    }
  }

  useEffect(() => {
    fetchHolidays()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post("/holidays", { name: name.trim(), date })
      showToast.success("Holiday added!")
      setName("")
      setDate("")
      fetchHolidays()
    } catch (error: any) {
      showToast.error(error.response?.data?.message || "Failed to add holiday")
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this holiday?")) return
    try {
      await api.delete(`/holidays/${id}`)
      fetchHolidays()
    } catch (error: any) {
      showToast.error(
        error.response?.data?.message || "Failed to delete holiday"
      )
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 outline-none focus:border-blue-500 text-sm font-medium text-slate-700 dark:text-slate-200"

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <form
        onSubmit={handleAdd}
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
      >
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Holiday name"
          className={inputClass}
        />
        <input
          required
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
        >
          + Add Holiday
        </button>
      </form>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
        {holidays.length === 0 && (
          <p className="p-6 text-sm text-slate-500">No holidays added.</p>
        )}
        {holidays.map((h) => (
          <div key={h.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {h.name}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                {new Date(`${h.date}T00:00:00`).toLocaleDateString("en-LK", {
                  weekday: "long",
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}
              </p>
            </div>
            <button
              onClick={() => handleDelete(h.id)}
              className="text-red-600 hover:underline font-semibold text-xs cursor-pointer"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
