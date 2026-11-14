import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const logged = JSON.parse(localStorage.getItem('loggedUser') || 'null');
    if (logged) navigate('/', { replace: true });
  }, [navigate]);

  const [tab, setTab] = useState('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [role, setRole] = useState('client');

  function handleSignup(e) {
    e.preventDefault();
    if (password !== passwordConfirm) {
      alert('Passwords do not match');
      return;
    }

    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    const signupData = {
      username,
      email,
      password,
      password_confirm: passwordConfirm,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      address
    };

    if (role === 'admin') {
      signupData.specialization = specialization;
      signupData.license_number = licenseNumber;
    }

    const endpoint = role === 'client' ? 'http://127.0.0.1:8000/api/auth/patient/signup/' : 'http://127.0.0.1:8000/api/auth/doctor/signup/';

    axios.post(endpoint, signupData)
      .then(response => {
        const token = response.data.tokens?.access;
        localStorage.setItem('token', token);
        localStorage.setItem('loggedUser', JSON.stringify(response.data.user));
        navigate('/');
      })
      .catch(err => {
        console.error('Signup error:', err.response?.data);
        alert('Signup failed: ' + (err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Error'));
      });
  }

  function handleLogin(e) {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/api/auth/login/', {
      username: loginUsername,
      password: loginPassword
    })
    .then(response => {
      const token = response.data.tokens?.access;
      localStorage.setItem('token', token);
      localStorage.setItem('loggedUser', JSON.stringify(response.data.user));
      navigate('/');
    })
    .catch(err => {
      alert('Login failed: ' + (err.response?.data?.detail || 'Invalid credentials'));
    });
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="modern-card p-5 fade-in" style={{ maxWidth: 500, width: '100%', margin: '20px' }}>
        <div className="text-center mb-4">
          <h2 style={{ 
            fontWeight: '800', 
            background: 'var(--gradient-primary)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            fontSize: '32px'
          }}>
            🏥 MediCare
          </h2>
          <p className="text-muted">Your healthcare companion</p>
        </div>

        <div className="d-flex gap-2 mb-4">
          <button 
            className={`btn ${tab === 'login' ? 'btn-gradient-primary' : 'btn-outline-secondary'} flex-fill`}
            onClick={() => setTab('login')}
            style={{ borderRadius: '12px', fontWeight: '600', padding: '12px' }}
          >
            🔐 Login
          </button>
          <button 
            className={`btn ${tab === 'signup' ? 'btn-gradient-primary' : 'btn-outline-secondary'} flex-fill`}
            onClick={() => setTab('signup')}
            style={{ borderRadius: '12px', fontWeight: '600', padding: '12px' }}
          >
            ✨ Sign Up
          </button>
        </div>

        {tab === 'login' && (
          <form onSubmit={handleLogin} className="slide-in">
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>Username</label>
              <input 
                className="form-control" 
                required 
                value={loginUsername} 
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            <div className="mb-4">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>Password</label>
              <input 
                className="form-control" 
                type="password" 
                required 
                value={loginPassword} 
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <button className="btn btn-gradient-primary w-100" type="submit" style={{ padding: '12px', fontSize: '16px' }}>
              ✓ Login to Account
            </button>
          </form>
        )}

        {tab === 'signup' && (
          <form onSubmit={handleSignup} className="slide-in">
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>Full Name</label>
              <input className="form-control" required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>Username</label>
              <input className="form-control" required value={username} onChange={e => setUsername(e.target.value)} placeholder="johndoe" />
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>Email</label>
              <input className="form-control" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>Password</label>
                <input className="form-control" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="col-md-6">
                <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>Confirm Password</label>
                <input className="form-control" type="password" required value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} placeholder="••••••••" />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>Phone Number</label>
              <input className="form-control" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+92 300 1234567" />
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>Address</label>
              <input className="form-control" value={address} onChange={e => setAddress(e.target.value)} placeholder="City, Country" />
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>I want to</label>
              <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                <option value="client">👤 Book an Appointment (Patient)</option>
                <option value="admin">👨‍⚕️ Join as a Doctor</option>
              </select>
            </div>

            {role === 'admin' && (
              <div className="slide-in">
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>Specialization</label>
                  <input
                    className="form-control"
                    required
                    value={specialization}
                    onChange={e => setSpecialization(e.target.value)}
                    placeholder="e.g., Cardiologist, Dermatologist"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: '600', fontSize: '14px' }}>License Number</label>
                  <input
                    className="form-control"
                    required
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    placeholder="Medical License Number"
                  />
                </div>
              </div>
            )}

            <button className="btn btn-gradient-primary w-100 mt-2" type="submit" style={{ padding: '12px', fontSize: '16px' }}>
              ✓ Create Account
            </button>
          </form>
        )}

        <p className="text-center mt-4 mb-0" style={{ fontSize: '13px', color: 'var(--gray)' }}>
          ⏰ All bookings follow Pakistan Standard Time (PKT)
        </p>
      </div>
    </div>
  );
}