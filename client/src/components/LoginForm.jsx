import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import './landing.css';
import './auth.css';
import logo from '../assets/logo-cdp.jpg';

function LoginForm({ onLogin }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier || !password) {
      alert('Por favor, preencha o email ou nome de usuário e a senha.');
      return;
    }

    const isEmail = trimmedIdentifier.includes('@');
    onLogin({
      email: isEmail ? trimmedIdentifier : undefined,
      username: !isEmail ? trimmedIdentifier : undefined,
      password,
    });
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <img src={logo} alt="Clube de Programação UTFPR" className="auth-logo" />
          <span>Clube de Programação • UTFPR</span>
        </div>
        <h2 className="auth-title">Entrar</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="identifier">Email ou nome de usuário</label>
            <input
              className="lp-input"
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              className="lp-input"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="auth-actions">
            <button className="lp-btn auth-submit" type="submit">Entrar</button>
          </div>
          <p className="toggle-view">
            Não tem uma conta?{' '}
            <Link to="/signup" className="link-button">
              Cadastre-se
            </Link>
          </p>
          <p className="auth-meta">
            <Link to="/" className="link-button">
              Voltar para a página inicial
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
