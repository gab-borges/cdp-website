import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import './landing.css';
import './auth.css';
import logo from '../assets/logo-cdp.jpg';

function SignUpForm({ onSignUp }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      alert('As senhas não coincidem!');
      return;
    }
    const success = await onSignUp({ name, email, password, password_confirmation: passwordConfirmation });
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <img src={logo} alt="Clube de Programação UTFPR" className="auth-logo" />
          <span>Clube de Programação • UTFPR</span>
        </div>
        <h2 className="auth-title">Criar conta</h2>
        <p className="auth-sub">Participe dos treinos e acompanhe seu progresso no ranking.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nome</label>
            <input
              className="lp-input"
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
              placeholder="Crie uma senha"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password_confirmation">Confirme a Senha</label>
            <input
              className="lp-input"
              type="password"
              id="password_confirmation"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Repita a senha"
              required
            />
          </div>
          <div className="auth-actions">
            <button className="lp-btn auth-submit" type="submit">Cadastrar</button>
          </div>
          <p className="toggle-view">
            Já tem uma conta?{' '}
            <Link to="/login" className="link-button">
              Faça login
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

export default SignUpForm;
