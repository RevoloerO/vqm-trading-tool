import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './HomePage';

function App() {
  return (
    <ThemeProvider>
      <HomePage />
    </ThemeProvider>
  )
}

export default App
