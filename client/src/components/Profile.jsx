import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import axios from 'axios';
import codeforcesLogo from '../assets/codeforces-logo.png';
import './profile.css';

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const formatRank = (rank) => {
  if (!rank) return '—';
  return rank.replace(/_/g, ' ');
};

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { setHeaderUser } = useOutletContext() ?? {};
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const [profileRes, meRes] = await Promise.all([
          axios.get(`/api/v1/users/${username}`),
          axios.get('/api/v1/me').catch(() => null),
        ]);

        if (!mounted) return;
        setUser(profileRes.data);
        if (meRes?.data) setCurrentUser(meRes.data);
      } catch (err) {
        console.error('Falha ao carregar perfil:', err);
        if (!mounted) return;
        const notFound = err?.response?.status === 404;
        setError(notFound ? 'Usuário não encontrado.' : 'Falha ao carregar este perfil.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => { mounted = false; };
  }, [username]);

  useEffect(() => {
    if (!setHeaderUser || !currentUser) return;
    setHeaderUser(currentUser);
  }, [currentUser, setHeaderUser]);

  const totalSolvedCount = Number(user?.total_solved_problems_count ?? 0);
  const platformSolvedCount = Number(user?.solved_problems_count ?? 0);
  const cfSolvedCount = Number(user?.codeforces_solved_problems_count ?? 0);
  const totalScore = Number(user?.total_score ?? 0);
  const platformScore = Number(user?.score ?? 0);
  const monthlyScore = Number(user?.monthly_score ?? 0);
  const cfSyncedAt = user?.codeforces_last_synced_at ? formatDateTime(user.codeforces_last_synced_at) : null;
  const isOwnProfile = currentUser && currentUser.username === user?.username;
  const avatarUrl = user?.codeforces_title_photo;
  const avatarFallback = user?.username?.slice(0, 1).toUpperCase() || '?';
  const displayName = user?.name?.trim() || user?.username || 'Perfil';

  const stats = [
    {
      label: 'Pontuação',
      value: (
        <>
          <span className="profile-stat-main">{totalScore.toLocaleString('pt-BR')} pts</span>
          <span className="profile-stat-sub">({platformScore.toLocaleString('pt-BR')} pts na plataforma)</span>
          <span className="profile-stat-sub">{monthlyScore.toLocaleString('pt-BR')} pts neste mês</span>
        </>
      ),
    },
    {
      label: 'Problemas resolvidos',
      value: (
        <>
          <span className="profile-stat-main">{totalSolvedCount.toLocaleString('pt-BR')}</span>
          <span className="profile-stat-sub">({platformSolvedCount.toLocaleString('pt-BR')} na plataforma)</span>
        </>
      ),
    },
  ];

  const handleEditClick = () => {
    navigate(`/profile/${username}/edit`);
  };

  return (
    <div className="profile-root">
      <main className="profile-main profile-container">
        {loading && <div className="profile-card">Carregando...</div>}
        {error && <div className="profile-card profile-error">{error}</div>}

        {!loading && !error && user && (
          <section className="profile-panel">
            <header className="profile-hero">
              <div className="profile-identity">
                <div className="profile-avatar" aria-hidden={!avatarUrl}>
                  {avatarUrl ? <img src={avatarUrl} alt="" className="profile-avatar-img" /> : <span>{avatarFallback}</span>}
                </div>
                <div>
                  <h1 className="profile-name">{displayName}</h1>
                </div>
              </div>
              {isOwnProfile && (
                <button type="button" className="lp-btn" onClick={handleEditClick}>
                  Editar perfil
                </button>
              )}
            </header>

            <div className="profile-stats">
              {stats.map((stat) => (
                <div key={stat.label} className="profile-stat">
                  <div className="profile-stat-label">{stat.label}</div>
                  <div className="profile-stat-value">{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="profile-details">
              <div className="profile-bio-block">
                <h2 className="profile-section-title">Bio</h2>
                <div className="profile-bio">
                  {user.bio ? user.bio : <span className="profile-muted">Nenhuma bio cadastrada.</span>}
                </div>
              </div>

              <div className="profile-codeforces">
                <div className="profile-section-title profile-codeforces-header">
                  <img src={codeforcesLogo} alt="Codeforces" className="profile-codeforces-logo" />
                  <span>Codeforces</span>
                </div>

                {user.codeforces_handle ? (
                  <div className="profile-codeforces-body">
                    <div className="profile-codeforces-grid">
                      <div className="profile-codeforces-stat">
                        <div className="profile-codeforces-label">Handle</div>
                        <div className="profile-codeforces-value">{user.codeforces_handle}</div>
                      </div>
                      <div className="profile-codeforces-stat">
                        <div className="profile-codeforces-label">Rating</div>
                        <div className="profile-codeforces-value">{user.codeforces_rating ?? '—'}</div>
                      </div>
                      <div className="profile-codeforces-stat">
                        <div className="profile-codeforces-label">Rank</div>
                        <div className="profile-codeforces-value">{formatRank(user.codeforces_rank)}</div>
                      </div>
                      <div className="profile-codeforces-stat">
                        <div className="profile-codeforces-label">Problemas resolvidos</div>
                        <div className="profile-codeforces-value">{cfSolvedCount.toLocaleString('pt-BR')}</div>
                      </div>
                      <div className="profile-codeforces-stat">
                        <div className="profile-codeforces-label">Pontuação</div>
                        <div className="profile-codeforces-value">
                          {Number(user.codeforces_score ?? 0).toLocaleString('pt-BR')} pts
                        </div>
                      </div>
                    </div>
                    <div className="profile-codeforces-meta">
                      {cfSyncedAt ? `Atualizado em ${cfSyncedAt}` : 'Ainda não sincronizado.'}
                    </div>
                  </div>
                ) : (
                  <p className="profile-muted">Este membro ainda não conectou o Codeforces.</p>
                )}
              </div>
            </div>
            <footer className="profile-footer">
              {isOwnProfile && (
                <div className="profile-footer-item">
                  <span className="profile-footer-label">Email</span>
                  <span className="profile-footer-value">{user.email || '—'}</span>
                </div>
              )}
              <div className="profile-footer-item">
                <span className="profile-footer-label">Entrou em</span>
                <span className="profile-footer-value">{formatDateTime(user?.created_at).slice(0, 12)}</span>
              </div>
            </footer>
          </section>
        )}
      </main>
    </div>
  );
};

export default Profile;
