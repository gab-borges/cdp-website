// src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState(null);
  const [currentView, setCurrentView] = useState('landing'); // <— começa na landing

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    if (token) fetchUsers(); else setUsers([]);
  }, [token]);

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
    setCurrentView('landing'); // volta para a landing
  };

  const handleSignUp = async (userData) => {
    try {
      await axios.post('http://localhost:3000/api/v1/users', { user: userData });
      setCurrentView('login');
    } catch (err) {
      console.error('Erro no cadastro:', err?.response?.data);
      alert(`Erro no cadastro: ${JSON.stringify(err?.response?.data)}`);
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

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/api/v1/users');
      setUsers(data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:3000/api/v1/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      alert('Falha ao excluir usuário.');
    }
  };

  const handleUpdateUser = async (userId, updatedData) => {
    try {
      await axios.patch(`http://localhost:3000/api/v1/users/${userId}`, { user: updatedData });
      fetchUsers();
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      alert('Falha ao atualizar usuário.');
    }
  };

  // ---------- views sem token ----------
  if (!token) {
    if (currentView === 'login') {
      return (
        <LoginForm
          onLogin={handleLogin}
          onShowSignUp={() => setCurrentView('signup')}
          onBack={() => setCurrentView('landing')}
        />
      );
    }
    if (currentView === 'signup') {
      return (
        <SignUpForm
          onSignUp={handleSignUp}
          onShowLogin={() => setCurrentView('login')}
          onBack={() => setCurrentView('landing')}
        />
      );
    }
    // landing (padrão)
    return (
      <LandingPage
        onShowLogin={() => setCurrentView('login')}
        onShowSignUp={() => setCurrentView('signup')}
      />
    );
  }

  // ---------- app autenticada ----------
  return (
    <Dashboard
      onLogout={handleLogout}
      users={users}
      refreshUsers={fetchUsers}
      onDeleteUser={handleDeleteUser}
      onUpdateUser={handleUpdateUser}
    />
  );
}

export default App;
