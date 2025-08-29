import { useState } from 'react';
import axios from 'axios';

function UserForm({ onUserAdded }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [score, setScore] = useState(0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newUser = { user: { name, email, score: parseInt(score, 10) } };

    try {
      const response = await axios.post('http://localhost:3000/api/v1/users', newUser);
      console.log('Usuário criado:', response.data);
      setName('');
      setEmail('');
      setScore(0);

      onUserAdded();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Falha ao criar usuário.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Adicionar Novo Usuário</h2>
      <div>
        <label>Nome:</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Pontuação:</label>
        <input type="number" value={score} onChange={e => setScore(e.target.value)} required />
      </div>
      <button type="submit">Criar Usuário</button>
    </form>
  );
}

export default UserForm;