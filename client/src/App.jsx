import { useState, useEffect } from 'react';
import axios from 'axios';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm'; // 1. Importamos o novo componente
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState(null);
  const [currentView, setCurrentView] = useState('login'); // 2. Novo estado de visualização

  // Ao carregar o app, verifica se já existe um token no localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Busca os usuários sempre que o token mudar (ex: após o login)
  useEffect(() => {
    if (token) {
      fetchUsers();
    } else {
      setUsers([]); // Limpa os usuários ao fazer logout
    }
  }, [token]);

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3000/api/v1/login', { email, password });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Email ou senha inválidos.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  // 3. Nova função para lidar com o cadastro
  const handleSignUp = async (userData) => {
    try {
      const payload = { user: userData };
      await axios.post('http://localhost:3000/api/v1/users', payload);
      alert('Cadastro realizado com sucesso! Por favor, faça o login.');
      setCurrentView('login'); // Volta para a tela de login
    } catch (error) {
      console.error('Erro no cadastro:', error.response.data);
      alert(`Erro no cadastro: ${JSON.stringify(error.response.data)}`);
    }
  };

  // Configura o interceptor do Axios para injetar o token em todas as requisições
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:3000/api/v1/users/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Falha ao excluir usuário.');
    }
  };

  const handleUpdateUser = async (userId, updatedData) => {
    try {
      const payload = { user: updatedData };
      await axios.patch(`http://localhost:3000/api/v1/users/${userId}`, payload);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Falha ao atualizar usuário.');
    }
  };

  // 4. Lógica de renderização atualizada
  if (!token) {
    return currentView === 'login' ? (
      <LoginForm onLogin={handleLogin} onShowSignUp={() => setCurrentView('signup')} />
    ) : (
      <SignUpForm onSignUp={handleSignUp} onShowLogin={() => setCurrentView('login')} />
    );
  }

  // Se houver token, mostra a aplicação principal
  return (
    <div className="App">
      <header>
        <h1>Clube de Programação</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <main>
        <UserForm onUserAdded={fetchUsers} />
        <hr />
        <UserList users={users} onDeleteUser={handleDeleteUser} onUpdateUser={handleUpdateUser} />
      </main>
    </div>
  );
}

export default App;
