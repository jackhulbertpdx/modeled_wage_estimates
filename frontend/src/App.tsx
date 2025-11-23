import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import WageComparison from './components/WageComparison'
import GeographicExplorer from './components/GeographicExplorer'
import './App.css'

function Navigation() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="border-b border-[#E3E2E0] bg-white">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-lg font-semibold text-[#37352F]">
              BLS Wage Explorer
            </h1>
            <p className="text-xs text-[#787774]">
              Bureau of Labor Statistics • 2014-2023
            </p>
          </div>

          <div className="flex gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-[#F7F6F3] text-[#37352F]'
                  : 'text-[#787774] hover:text-[#37352F] hover:bg-[#F7F6F3]'
              }`}
            >
              Salary Comparison
            </Link>
            <Link
              to="/explore"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/explore')
                  ? 'bg-[#F7F6F3] text-[#37352F]'
                  : 'text-[#787774] hover:text-[#37352F] hover:bg-[#F7F6F3]'
              }`}
            >
              Geographic Explorer
            </Link>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-[#9B9A97]">High-quality data</p>
          <p className="text-xs text-[#2383E2] font-medium">3+ observations</p>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col">
        <Navigation />
        <Routes>
          <Route path="/" element={<WageComparison />} />
          <Route path="/explore" element={<GeographicExplorer />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
