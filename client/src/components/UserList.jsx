import { useState, useEffect } from 'react';
import axios from 'axios';

function UserList() {
  const [users, setUsers] = useState([]); // Estado para armazenar a lista de usuários

  useEffect(() => {
    // Função para buscar os dados da API
    const fetchUsers = async () => {
      try {
        // A URL completa da sua API Rails
        const response = await axios.get('http://localhost:3000/api/v1/users');
        setUsers(response.data); // Atualiza o estado com os dados recebidos
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };

    fetchUsers();
  }, []); // O array vazio [] garante que isso rode apenas uma vez, quando o componente montar

  return (
    <div>
      <h1>Lista de Usuários do Clube</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <strong>{user.name}</strong> - Pontuação: {user.score}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;