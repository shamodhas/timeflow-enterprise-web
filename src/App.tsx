import { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AppRouter } from './routes/AppRoutes'
import { GlobalLoader } from './components/GlobalLoader'
import { useThemeStore } from './store/themeStore'

export function App () {
  const initTheme = useThemeStore((state) => state.initTheme)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <>
      <GlobalLoader />
      <Router>
        <AppRouter />
      </Router>
    </>
  )
}

export default App
