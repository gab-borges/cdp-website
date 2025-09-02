import { useState } from 'react';
import '../App.css';
import './landing.css';
import './auth.css';
import logo from '../assets/logo-cdp.jpg';

function LoginForm({ onLogin, onShowSignUp, onBack }) {
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
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <img src={logo} alt="Clube de Programação UTFPR" className="auth-logo" />
          <span>Clube de Programação • UTFPR</span>
        </div>
        <h2 className="auth-title">Entrar</h2>
        <p className="auth-sub">Acesse sua conta para acompanhar estudos, treinos e ranking.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              className="lp-input"
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
              className="lp-input"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
            />
          </div>
          <div className="auth-actions">
            <button className="lp-btn auth-submit" type="submit">Entrar</button>
          </div>
          <p className="toggle-view">
            Não tem uma conta?{' '}
            <button type="button" onClick={onShowSignUp} className="link-button">
              Cadastre-se
            </button>
          </p>
          <p className="auth-meta">
            <button type="button" className="link-button" onClick={onBack}>
              Voltar para a página inicial
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
