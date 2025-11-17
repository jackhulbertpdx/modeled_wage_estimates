import WageComparison from './components/WageComparison'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                BLS Wage Comparison Tool
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                High-quality wage data from the Bureau of Labor Statistics (2014-2023)
              </p>
              <p className="mt-1 text-xs text-blue-600 font-medium">
                ✓ Filtered for statistical reliability (10+ wage observations)
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Data Source</p>
              <p className="text-sm font-medium text-gray-900">BLS Modeled Wage Estimates</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WageComparison />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Built with Bureau of Labor Statistics data • Updated through 2023
          </p>
          <p className="text-center text-xs text-gray-400 mt-1">
            Showing only high-quality data with 10+ wage observations for statistical reliability
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
