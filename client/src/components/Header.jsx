import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo-cdp.jpg';
import './header.css';

function Header({ onLogout, currentUser }) {
  const location = useLocation();
  const [user, setUser] = useState(currentUser ?? null);
  const [loadingUser, setLoadingUser] = useState(!currentUser);

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
      { to: '/problems', label: 'Problemas', match: ['/problem'] },
      { to: '/submissions', label: 'Submissões' },
    ];

    if (user?.id) {
      items.push({ to: `/profile/${user.id}`, label: 'Perfil', match: ['/profile'] });
    }

    return items.map((link) => {
      const prefixes = [link.to, ...(link.match ?? [])];
      const isActive = prefixes.some((prefix) => location.pathname.startsWith(prefix));
      const base = 'lp-btn lp-btn-ghost app-nav-item';
      return {
        ...link,
        className: isActive ? `${base} app-nav-active` : base,
      };
    });
  }, [location.pathname, user?.id]);

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
          {loadingUser && <span className="app-greeting app-muted">Carregando...</span>}
          {!loadingUser && user && (
            <span className="app-greeting">Olá, <strong>{user.name}</strong></span>
          )}
          {!loadingUser && !user && <span className="app-greeting">&nbsp;</span>}
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
