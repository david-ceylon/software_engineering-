import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ResetPassword from './components/ResetPassword';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

function MainApp() {
  // Persist user in localStorage so reloads keep the session
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  });

  const handleLogin = (u) => {
    try { localStorage.setItem('user', JSON.stringify(u)); } catch (e) {}
    setUser(u);
  };

  const handleLogout = () => {
    try { localStorage.removeItem('user'); } catch (e) {}
    setUser(null);
  };

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return <Auth onLogin={handleLogin} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;