import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ProblemList from './components/ProblemList';
import ProblemDetail from './components/ProblemDetail';
import Profile from './components/Profile';
import Submissions from './components/Submissions';
import './App.css';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const { data } = await axios.post('http://localhost:3000/api/v1/login', { email, password });
      setToken(data.token);
      localStorage.setItem('token', data.token);
    } catch (err) {
      console.error('Erro no login:', err);
      alert('Email ou senha inválidos.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const handleSignUp = async (userData) => {
    try {
      await axios.post('http://localhost:3000/api/v1/users', { user: userData });
      return true;
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 409 || data?.error === 'Email already registered') {
        alert('Este e-mail já está cadastrado. Faça login para continuar.');
      } else if (typeof data === 'object' && data) {
        const messages = Object.entries(data).flatMap(([field, val]) => {
          if (Array.isArray(val)) return val.map((m) => `${field} ${m}`);
          return [`${field}: ${String(val)}`];
        });
        alert(messages.join('\n') || 'Falha no cadastro. Verifique os dados.');
      } else {
        alert(String(data || err.message || 'Falha no cadastro.'));
      }
      return false;
    }
  };

  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const tk = localStorage.getItem('token');
      if (tk) config.headers['Authorization'] = `Bearer ${tk}`;
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={!token ? <LandingPage /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!token ? <LoginForm onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!token ? <SignUpForm onSignUp={handleSignUp} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={token ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/problems" element={token ? <ProblemList onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/problem/:id" element={token ? <ProblemDetail onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/profile" element={token ? <Profile onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/submissions" element={token ? <Submissions onLogout={handleLogout} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
