import { useState } from 'react';

function UserList({ users, onDeleteUser, onUpdateUser }) {
  const [editingUserId, setEditingUserId] = useState(null);
  const [updatedData, setUpdatedData] = useState({});

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setUpdatedData({ name: user.name, score: user.score });
  };

  const handleSave = (userId) => {
    onUpdateUser(userId, updatedData);
    setEditingUserId(null);
  };

  return (
    <div>
      <h1>Lista de Usuários do Clube</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {editingUserId === user.id ? (
              <>
                <input
                  type="text"
                  value={updatedData.name}
                  onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })}
                />
                <input
                  type="number"
                  value={updatedData.score}
                  onChange={(e) => setUpdatedData({ ...updatedData, score: e.target.value })}
                />
                <button onClick={() => handleSave(user.id)}>Salvar</button>
                <button onClick={() => setEditingUserId(null)}>Cancelar</button>
              </>
            ) : (
              <>
                <strong>{user.name}</strong> - Pontuação: {user.score}
                <button onClick={() => handleEdit(user)} style={{ marginLeft: '10px' }}>
                  Editar
                </button>
                <button onClick={() => onDeleteUser(user.id)} style={{ marginLeft: '10px' }}>
                  Excluir
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;