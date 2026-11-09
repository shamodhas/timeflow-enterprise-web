import { type ReactNode, useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { navigationConfig } from "../navigation/vertical"
import { horizontalNavigationConfig } from "../navigation/horizontal"
import { LogOut, ChevronDown, User, Menu, X } from "lucide-react"
import { ThemeToggle } from "../components/ThemeToggle"

interface DashboardLayoutProps {
  children: ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout, fetchUser } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      fetchUser()
    }
  }, [user, fetchUser])

  const handleLogout = () => {
    logout()
    navigate("/auth/login")
  }

  return (
    <div className="relative flex h-screen w-full max-w-full overflow-hidden bg-slate-100/60 dark:bg-slate-950 font-sans transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 shrink-0 h-full z-20 shadow-[2px_0_8px_-3px_rgba(0,0,0,0.05)] transition-colors duration-200">
        <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-linear-to-r from-blue-600/5 to-transparent dark:from-blue-600/10">
          <div className="flex items-center space-x-3">
            <img
              src="/ijse-badge.png"
              alt="IJSE"
              className="h-10 w-10 rounded-xl shadow-md object-contain"
            />
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase">
                {user?.tenantSlug || "IJSE"}
                <span className="text-red-600 dark:text-red-500">.</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-tight truncate max-w-[165px]">
                {user?.tenantName || "Institute of Software Engineering"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Main Menu
          </p>
          {navigationConfig.map((item) => {
            if (item.roles && user && !item.roles.includes(user.role))
              return null

            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}
                />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 m-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between shrink-0 transition-colors duration-200">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="h-10 w-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0 text-sm">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.fullName || "Loading..."}
              </p>
              <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide truncate">
                {user?.role || "Employee"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-xl transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Developed by{" "}
            <a
              href="https://shamodha.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 dark:text-slate-300 font-semibold hover:underline"
            >
              shamodha.com
            </a>
          </p>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <header className="h-16 md:h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 shrink-0 z-30 shadow-xs transition-colors duration-200">
          {/* Mobile Header Left */}
          <div className="flex items-center space-x-3 md:hidden">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {mobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center space-x-2.5">
              <img
                src="/ijse-badge.png"
                alt="IJSE"
                className="h-8 w-8 rounded-lg shadow-sm object-contain"
              />
              <div>
                <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  IJSE
                </h1>
                <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide leading-tight mt-0.5">
                  Institute of Software Engineering
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Header Left */}
          <div className="hidden md:flex flex-col">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {navigationConfig.find((n) => n.path === location.pathname)
                ?.name || "Dashboard"}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Manage your workforce operations seamlessly.
            </p>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 relative">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 p-1.5 sm:px-3 sm:py-2 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60 cursor-pointer"
              >
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {user?.fullName || "User"}
                  </p>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 mt-0.5 uppercase tracking-wide">
                    {user?.role || "Staff"}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className="text-slate-400 dark:text-slate-500 hidden sm:block"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 sm:hidden">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase mt-0.5">
                      {user?.role}
                    </p>
                  </div>
                  <div className="px-4 py-2 text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                    Account Settings
                  </div>
                  <div className="px-2">
                    <div className="flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <User size={14} className="text-slate-400 dark:text-slate-500" />
                      <span className="truncate">
                        {user?.email || "No email provided"}
                      </span>
                    </div>
                  </div>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                  <div className="px-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 bg-slate-100/60 dark:bg-slate-950 pb-24 md:pb-8 transition-colors duration-200">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-around px-0.5 shrink-0 fixed bottom-0 left-0 right-0 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-colors duration-200"
        >
          {horizontalNavigationConfig.map((item) => {
            if (item.roles && user && !item.roles.includes(user.role))
              return null

            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-blue-600 dark:bg-blue-500 rounded-full shadow-sm" />
                )}
                <Icon
                  size={20}
                  className={`transition-transform duration-200 ${isActive ? "scale-110 text-blue-600 dark:text-blue-400" : ""}`}
                />
                <span className="text-[9px] sm:text-[10px] mt-1 tracking-tight truncate max-w-[44px] sm:max-w-16">
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl z-50 md:hidden flex flex-col transition-transform animate-in slide-in-from-left duration-200 border-r border-slate-200 dark:border-slate-800">
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <img
                src="/ijse-badge.png"
                alt="IJSE"
                className="h-9 w-9 rounded-xl shadow-sm object-contain"
              />
              <div>
                <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  IJSE<span className="text-red-600 dark:text-red-500">.</span>
                </h1>
                <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Institute of Software Engineering
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {navigationConfig.map((item) => {
              if (item.roles && user && !item.roles.includes(user.role))
                return null

              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center space-x-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setMobileDrawerOpen(false)
                handleLogout()
              }}
              className="flex w-full items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardLayout
