import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Login from './Login.jsx'
import Placeholder from './Placeholder.jsx'
import TestSolver from './TestSolver.jsx';
import AuthGuard from './AuthGuard.jsx';
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
