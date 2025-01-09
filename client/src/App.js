
import Home from './pages/Home';
import Login from './pages/Login';
import Project from './pages/Project';
import { AuthProvider } from './context/AuthContext';
import { Routes, Route, BrowserRouter } from 'react-router-dom';



export default function App() {

  return (
    <AuthProvider>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Project/:id" element={<Project />} />
        </Routes>
    </div>
    </AuthProvider>
    
    
  );
}
 