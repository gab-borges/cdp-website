import { useState, useEffect } from 'react';
import axios from 'axios';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    try {
      // Envia a requisição DELETE para a API
      await axios.delete(`http://localhost:3000/api/v1/users/${userId}`);
      // Após a exclusão, busca a lista de usuários atualizada
      fetchUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Falha ao excluir usuário.');
    }
  };

  const handleUpdateUser = async (userId, updatedData) => {
    try {
      // A API espera os dados dentro da chave "user"
      const payload = { user: updatedData };
      await axios.patch(`http://localhost:3000/api/v1/users/${userId}`, payload);
      fetchUsers(); // Recarrega a lista para mostrar os dados atualizados
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Falha ao atualizar usuário.');
    }
  };

  return (
    <div className="App">
      <UserForm onUserAdded={fetchUsers} />
      <hr />
      <UserList users={users} onDeleteUser={handleDeleteUser} onUpdateUser={handleUpdateUser} />
    </div>
  );
}

export default App;