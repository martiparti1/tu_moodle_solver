import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Login from './Login.jsx'
import Placeholder from './Placeholder.jsx'
import './index.css'
import TestSolver from './TestSolver.jsx';

function App() {
  return (
  
    <BrowserRouter>
      <Routes>
        <Route path = "/login" element ={<Login/>}/>
        <Route path = "/test" element ={<TestSolver/>}/>
        <Route path = "*" element ={<Placeholder/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
