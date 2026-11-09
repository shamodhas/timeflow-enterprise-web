import { useLoaderStore } from '../store/loader.store'

export const GlobalLoader = () => {
  const isLoading = useLoaderStore(state => state.isLoading)

  if (!isLoading) return null

  return (
    <div
      role='progressbar'
      aria-label='Loading'
      className='fixed inset-0 z-[9999] cursor-progress bg-white/30 backdrop-blur-sm dark:bg-slate-900/30'
    >
      <div className='absolute inset-x-0 top-0 h-[3px] overflow-hidden bg-blue-100 dark:bg-slate-800'>
        <div className='h-full w-2/5 animate-[topbar_1.1s_ease-in-out_infinite] rounded-full bg-blue-600 dark:bg-blue-400' />
      </div>
    </div>
  )
}
