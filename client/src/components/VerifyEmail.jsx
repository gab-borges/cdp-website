import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import './auth.css';
import logo from '../assets/logo-cdp.jpg';

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const initialIdentifier = location.state?.email || location.state?.username || searchParams.get('identifier') || '';
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialIdentifier) {
      setIdentifier(initialIdentifier);
    }
  }, [initialIdentifier]);

  const sanitizeIdentifier = (value) => value.trim().toLowerCase();

  const handleVerify = async (event) => {
    event.preventDefault();
    const trimmedIdentifier = sanitizeIdentifier(identifier);
    const trimmedCode = code.trim();

    if (!trimmedIdentifier || !trimmedCode) {
      alert('Informe seu email ou nome de usuário e o código recebido.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post('http://localhost:3000/api/v1/users/confirm', {
        email: trimmedIdentifier.includes('@') ? trimmedIdentifier : undefined,
        username: trimmedIdentifier.includes('@') ? undefined : trimmedIdentifier,
        code: trimmedCode,
      });

      alert(data?.message || 'Email confirmado com sucesso! Você já pode fazer login.');
      navigate('/login');
    } catch (err) {
      const message = err?.response?.data?.error || err?.response?.data?.message || err.message;
      alert(String(message || 'Não foi possível confirmar seu email. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const trimmedIdentifier = sanitizeIdentifier(identifier);
    if (!trimmedIdentifier) {
      alert('Informe seu email ou nome de usuário para reenviar o código.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post('http://localhost:3000/api/v1/users/resend_confirmation', {
        email: trimmedIdentifier.includes('@') ? trimmedIdentifier : undefined,
        username: trimmedIdentifier.includes('@') ? undefined : trimmedIdentifier,
      });
      alert(data?.message || 'Enviamos um novo código para o seu email.');
    } catch (err) {
      const message = err?.response?.data?.error || err?.response?.data?.message || err.message;
      alert(String(message || 'Não foi possível reenviar o código. Aguarde e tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <img src={logo} alt="Clube de Programação UTFPR" className="auth-logo" />
          <span>Clube de Programação • UTFPR</span>
        </div>
        <h2 className="auth-title">Confirmar email</h2>
        <p className="auth-sub">
          Informe o código de 6 dígitos enviado para o seu email. O código expira em 5 minutos.
        </p>
        <form className="auth-form" onSubmit={handleVerify}>
          <div className="form-group-floating">
            <input
              className="lp-input"
              type="text"
              id="identifier"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder=" "
              autoComplete="username"
              required
            />
            <label htmlFor="identifier">Email ou nome de usuário</label>
          </div>

          <div className="form-group-floating">
            <input
              className="lp-input"
              type="text"
              id="code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder=" "
              inputMode="numeric"
              maxLength={6}
              required
            />
            <label htmlFor="code">Código</label>
          </div>

          <div className="auth-actions">
            <button className="lp-btn auth-submit" type="submit" disabled={loading}>
              {loading ? 'Validando...' : 'Confirmar email'}
            </button>
            <button
              type="button"
              className="lp-btn lp-btn-ghost"
              onClick={handleResend}
              disabled={loading}
            >
              Reenviar código
            </button>
          </div>

          <p className="auth-meta">
            Já confirmou?{' '}
            <Link to="/login" className="link-button">
              Fazer login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default VerifyEmail;
