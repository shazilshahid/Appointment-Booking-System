import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

function Protected({ children }) {
  const user = JSON.parse(localStorage.getItem('loggedUser') || 'null');
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const user = JSON.parse(localStorage.getItem('loggedUser') || 'null');

  return (
    <>
      <Navbar />
      <div className="container my-4">
        <Routes>
          {/* Login is only available if NOT logged in */}
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

          {/* Protected routes */}
          <Route path="/" element={<Protected><Home /></Protected>} />
          <Route path="/about" element={<Protected><About /></Protected>} />
          <Route path="/contact" element={<Protected><Contact /></Protected>} />
          <Route path="/admin" element={<Protected><Admin /></Protected>} />

          {/* Fallback: send user to home if logged in, otherwise to login */}
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
        </Routes>
      </div>
    </>
  );
}