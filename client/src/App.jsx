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
      const status = err?.response?.status;
      const data = err?.response?.data;
      const contentType = err?.response?.headers?.['content-type'] || '';
      const looksHtml = typeof data === 'string' && /<\s*(!DOCTYPE|html|head|body)/i.test(data);

      console.error('Erro no cadastro:', { status, data });

      if (status === 409 || data?.error === 'Email already registered') {
        alert('Este e-mail já está cadastrado. Faça login para continuar.');
        setCurrentView('login');
        return;
      }

      if (typeof data === 'object' && data) {
        // Rails validation errors come as { field: ["msg1", "msg2"] }
        const messages = Object.entries(data).flatMap(([field, val]) => {
          if (Array.isArray(val)) return val.map((m) => `${field} ${m}`);
          return [`${field}: ${String(val)}`];
        });
        alert(messages.join('\n') || 'Falha no cadastro. Verifique os dados.');
        return;
      }

      if (looksHtml || contentType.includes('text/html')) {
        alert('Falha no cadastro. Tente novamente mais tarde.');
        return;
      }

      alert(String(data || err.message || 'Falha no cadastro.'));
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
