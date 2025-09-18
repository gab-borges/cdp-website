import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo-cdp.jpg';
import './profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get('http://localhost:3000/api/v1/me');
        setUser(data);
      } catch (e) {
        console.error('Erro ao carregar dados do perfil:', e);
        setError('Falha ao carregar seus dados.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="profile-root">
      <header className="profile-header">
        <div className="profile-container profile-headwrap">
          <Link to="/dashboard" className="profile-brand">
            <img src={logo} alt="Clube de Programação UTFPR" className="profile-logo" />
            <span>Clube de Programação • UTFPR-CT</span>
          </Link>
          <div className="profile-spacer" />
          <Link to="/dashboard" className="btn btn-ghost">Dashboard</Link>
        </div>
      </header>

      <main className="profile-main profile-container">
        {loading && <div className="profile-card">Carregando...</div>}
        {error && <div className="profile-card profile-error">{error}</div>}
        {!loading && !error && user && (
          <div className="profile-card">
            <div className="profile-card-title">Seu Perfil</div>
            <div className="profile-row">
              <div className="profile-label">Nome</div>
              <div className="profile-value">{user.name}</div>
            </div>
            <div className="profile-row">
              <div className="profile-label">Email</div>
              <div className="profile-value">{user.email}</div>
            </div>
            <div className="profile-row">
              <div className="profile-label">Pontuação</div>
              <div className="profile-value profile-mono">{user.score ?? 0} pts</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
