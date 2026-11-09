import type { ReactNode } from 'react'
import { ThemeToggle } from '../components/ThemeToggle'

interface BlankLayoutProps {
  children: ReactNode
}

const BlankLayout = ({ children }: BlankLayoutProps) => {
  return (
    <div className='min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center relative transition-colors duration-200'>
      <div className='fixed top-4 right-4 z-50'>
        <ThemeToggle />
      </div>
      {children}
    </div>
  )
}

export default BlankLayout
