import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

// Import layouts
import MainLayout from './layouts/MainLayout'
import CompactLayout from './layouts/CompactLayout'

// Import only the test page
import TestPage from './pages/TestPage'

function AppWithTest() {
  return (
    <Router>
      <Routes>
        {/* Main layout for the test page */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<TestPage />} />
        </Route>

        {/* Compact layout for the test page */}
        <Route path="/test-compact" element={<CompactLayout condensedHeader condensedFooter />}>
          <Route index element={<TestPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default AppWithTest;
