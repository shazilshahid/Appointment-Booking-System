import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('loggedUser') || 'null');

  function handleLogout() {
    localStorage.removeItem('loggedUser');
    navigate('/login');
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">Appointment System</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink end className="nav-link" to="/">Home</NavLink>
            </li>
            {user?.user_type === 'doctor' &&
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">My Schedule</NavLink>
              </li>
            } 
            {user ? (
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-link btn btn-link text-warning">Logout</button>
              </li>
            ) : (
              <li className="nav-item">
                <NavLink className="nav-link text-warning" to="/login">Login</NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}