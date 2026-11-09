import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Theme = "light" | "dark" | "system"

interface ThemeState {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  initTheme: () => void
}

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

const applyThemeToDocument = (resolved: "light" | "dark") => {
  if (typeof document === "undefined") return
  const root = document.documentElement
  if (resolved === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
  root.style.colorScheme = resolved
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      resolvedTheme: "light",
      setTheme: (theme: Theme) => {
        const resolved = theme === "system" ? getSystemTheme() : theme
        applyThemeToDocument(resolved)
        set({ theme, resolvedTheme: resolved })
      },
      toggleTheme: () => {
        const currentResolved = get().resolvedTheme
        const nextTheme = currentResolved === "dark" ? "light" : "dark"
        applyThemeToDocument(nextTheme)
        set({ theme: nextTheme, resolvedTheme: nextTheme })
      },
      initTheme: () => {
        const currentTheme = get().theme
        const resolved =
          currentTheme === "system" ? getSystemTheme() : currentTheme
        applyThemeToDocument(resolved)
        set({ resolvedTheme: resolved })

        // Listen for system changes if system theme is active
        if (typeof window !== "undefined") {
          const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
          const handleChange = (e: MediaQueryListEvent) => {
            if (get().theme === "system") {
              const newResolved = e.matches ? "dark" : "light"
              applyThemeToDocument(newResolved)
              set({ resolvedTheme: newResolved })
            }
          }
          mediaQuery.removeEventListener("change", handleChange)
          mediaQuery.addEventListener("change", handleChange)
        }
      }
    }),
    {
      name: "timeflow-theme",
      partialize: (state) => ({ theme: state.theme })
    }
  )
)

