
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './HomePage';

function App() {

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/vqm-trading-tool/" element={<HomePage />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
