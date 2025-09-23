import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo-cdp.jpg';
import './header.css';

function Header({ onLogout, currentUser }) {
  const location = useLocation();
  const [user, setUser] = useState(currentUser ?? null);
  const [loadingUser, setLoadingUser] = useState(!currentUser);
  const avatarUrl = user?.codeforces_title_photo;

  useEffect(() => {
    if (currentUser) return undefined;

    let mounted = true;
    const fetchUser = async () => {
      try {
        setLoadingUser(true);
        const { data } = await axios.get('/api/v1/me');
        if (mounted) setUser(data);
      } catch (err) {
        console.error('Erro ao carregar dados do usuário no cabeçalho:', err);
      } finally {
        if (mounted) setLoadingUser(false);
      }
    };

    fetchUser();
    return () => { mounted = false; };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    setUser(currentUser);
    setLoadingUser(false);
  }, [currentUser]);

  const navItems = useMemo(() => {
    const items = [
      { to: '/feed', label: 'Feed', match: ['/feed'] },
      { to: '/problems', label: 'Problemas', match: ['/problem'] },
      { to: '/materials', label: 'Materiais', match: ['/materials'] },
      { to: '/submissions', label: 'Submissões' },
    ];

    return items.map((link) => {
      const prefixes = [link.to, ...(link.match ?? [])];
      const isActive = prefixes.some((prefix) => location.pathname.startsWith(prefix));
      const base = 'lp-btn lp-btn-ghost app-nav-item';
      return {
        ...link,
        className: isActive ? `${base} app-nav-active` : base,
      };
    });
  }, [location.pathname, user?.username]);

  const profileHref = user?.username ? `/profile/${user.username}` : null;

  return (
    <header className="app-header">
      <div className="app-shell">
        <Link to="/dashboard" className="app-brand">
          <img src={logo} alt="Clube de Programação UTFPR" className="app-logo" />
          <span>Clube de Programação • UTFPR-CT</span>
        </Link>

        <div className="app-spacer" />

        {navItems.map(({ to, label, className }) => (
          <Link key={to} to={to} className={className}>
            {label}
          </Link>
        ))}

        <div className="app-userbox">
          {profileHref ? (
            <Link to={profileHref} className="app-userlink">
              <div className="app-avatar" aria-hidden={!avatarUrl}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="app-avatar-img" />
                ) : (
                  <span>{user?.username?.slice(0, 1).toUpperCase() || '?'}</span>
                )}
              </div>
              {loadingUser && <span className="app-greeting app-muted">Carregando...</span>}
              {!loadingUser && user && (
                <span className="app-greeting">
                  Olá,
                  {' '}
                  <strong>{user.username}</strong>
                </span>
              )}
            </Link>
          ) : (
            <div className="app-userlink app-userlink-disabled">
              <div className="app-avatar" aria-hidden={!avatarUrl}>
                <span>{user?.username?.slice(0, 1).toUpperCase() || '?'}</span>
              </div>
              {loadingUser && <span className="app-greeting app-muted">Carregando...</span>}
              {!loadingUser && !user && <span className="app-greeting">&nbsp;</span>}
            </div>
          )}
          {typeof onLogout === 'function' && (
            <button type="button" className="lp-btn" onClick={onLogout}>
              Sair
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
