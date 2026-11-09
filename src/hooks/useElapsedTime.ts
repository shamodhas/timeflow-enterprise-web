import { useState, useEffect } from "react"

export const useElapsedTime = (
  clockIn?: string | null,
  clockOut?: string | null
) => {
  const [elapsedTime, setElapsedTime] = useState("00:00:00")

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (clockIn && !clockOut) {
      interval = setInterval(() => {
        const diff = Math.floor(
          (new Date().getTime() - new Date(clockIn).getTime()) / 1000
        )
        const h = String(Math.floor(diff / 3600)).padStart(2, "0")
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0")
        const s = String(diff % 60).padStart(2, "0")
        setElapsedTime(`${h}:${m}:${s}`)
      }, 1000)
    } else if (clockIn && clockOut) {
      const diff = Math.floor(
        (new Date(clockOut).getTime() - new Date(clockIn).getTime()) / 1000
      )
      const h = String(Math.floor(diff / 3600)).padStart(2, "0")
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0")
      setElapsedTime(`${h}h ${m}m`)
    } else {
      setElapsedTime("00:00:00")
    }

    return () => clearInterval(interval)
  }, [clockIn, clockOut])

  return elapsedTime
}