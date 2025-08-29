import { useState } from 'react';
import '../App.css';

function SignUpForm({ onSignUp, onShowLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      alert('As senhas não coincidem!');
      return;
    }
    // O App.jsx espera os dados sem o campo de confirmação
    onSignUp({ name, email, password, password_confirmation: passwordConfirmation });
  };

  return (
    <div className="login-container"> {/* Podemos reutilizar o mesmo container */} 
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Cadastro</h2>
        <div className="form-group">
          <label htmlFor="name">Nome</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Crie uma senha"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password_confirmation">Confirme a Senha</label>
          <input
            type="password"
            id="password_confirmation"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="Repita a senha"
            required
          />
        </div>
        <button type="submit">Cadastrar</button>
        <p className="toggle-view">
          Já tem uma conta?{' '}
          <button type="button" onClick={onShowLogin} className="link-button">
            Faça login
          </button>
        </p>
      </form>
    </div>
  );
}

export default SignUpForm;
