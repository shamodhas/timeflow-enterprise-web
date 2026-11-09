import React from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { useThemeStore } from "../store/themeStore"

interface ThemeToggleProps {
  className?: string
  variant?: "button" | "dropdown"
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  variant = "button"
}) => {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useThemeStore()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  // Close menu on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (variant === "dropdown") {
    return (
      <div className={`relative inline-block ${className}`} ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center justify-center p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs"
          title={`Theme: ${theme}`}
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? (
            <Moon size={18} className="text-blue-400 transition-transform duration-200" />
          ) : (
            <Sun size={18} className="text-amber-500 transition-transform duration-200" />
          )}
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={() => {
                setTheme("light")
                setMenuOpen(false)
              }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold transition-colors ${
                theme === "light"
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Sun size={14} className="text-amber-500" />
              <span>Light</span>
            </button>
            <button
              onClick={() => {
                setTheme("dark")
                setMenuOpen(false)
              }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold transition-colors ${
                theme === "dark"
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Moon size={14} className="text-blue-400" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => {
                setTheme("system")
                setMenuOpen(false)
              }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold transition-colors ${
                theme === "system"
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Monitor size={14} className="text-slate-400" />
              <span>System</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 shadow-xs cursor-pointer ${className}`}
      title={
        resolvedTheme === "dark"
          ? "Switch to Light Mode"
          : "Switch to Dark Mode"
      }
      aria-label="Toggle dark/light mode"
    >
      {resolvedTheme === "dark" ? (
        <Sun
          size={18}
          className="text-amber-400 rotate-0 scale-100 transition-all duration-300 hover:rotate-45"
        />
      ) : (
        <Moon
          size={18}
          className="text-slate-700 rotate-0 scale-100 transition-all duration-300 hover:-rotate-12"
        />
      )}
    </button>
  )
}
export default ThemeToggle

