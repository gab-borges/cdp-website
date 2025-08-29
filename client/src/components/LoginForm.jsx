import { useState } from 'react';
import '../App.css';

function LoginForm({ onLogin, onShowSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    if (!email || !password) {
      alert('Por favor, preencha o email e a senha.');
      return;
    }
    onLogin(email, password); // Chama a função do componente pai
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
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
            placeholder="Sua senha"
            required
          />
        </div>
        <button type="submit">Entrar</button>
        <p className="toggle-view">
          Não tem uma conta?{' '}
          <button type="button" onClick={onShowSignUp} className="link-button">
            Cadastre-se
          </button>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;
