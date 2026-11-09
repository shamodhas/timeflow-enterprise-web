import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'

const MainLayout = () => {
  return (
    <div className='min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200'>
      <div className='fixed top-4 right-4 z-50'>
        <ThemeToggle />
      </div>
      <main className='w-full'>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
