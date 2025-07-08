import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Login from './pages/Login.jsx'
import Placeholder from './components/Placeholder.jsx'
import TestSolver from './pages/TestSolver.jsx';
import AuthGuard from './components/AuthGuard.jsx';
import './index.css'

function App() {
  return (
  
    <BrowserRouter>
      <Routes>
        <Route path = "/login" element ={<Login/>}/>

        <Route path = "/test" element ={
          <AuthGuard>
            <TestSolver/>
          </AuthGuard>
          }/>
        <Route path = "*" element ={<Placeholder/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
