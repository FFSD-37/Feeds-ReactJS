import { useState } from 'react'
import './App.css'
import Sidebar from './components/sidebar.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Sidebar />
    </div>
  )
}

export default App
