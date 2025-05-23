import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Login from './Login.jsx'
import Placeholder from './Placeholder.jsx'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path = "/login" element ={<Login/>}/>
        <Route path = "*" element ={<Placeholder/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
