
import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';

function App() {

  return (
    <>
      <Routes>
        <Route path="/vqm-trading-tool/" element={<HomePage />} />
      </Routes>
    </>
  )
}

export default App
