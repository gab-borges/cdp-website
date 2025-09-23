import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import axios from 'axios';
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

  const solvedCount = Number(user?.solved_problems_count ?? 0);
  const cfSyncedAt = user?.codeforces_last_synced_at ? formatDateTime(user.codeforces_last_synced_at) : null;
  const isOwnProfile = currentUser && currentUser.username === user?.username;
  const avatarUrl = user?.codeforces_title_photo;
  const avatarFallback = user?.username?.slice(0, 1).toUpperCase() || '?';

  const handleEditClick = () => {
    navigate(`/profile/${username}/edit`);
  };

  return (
    <div className="profile-root">
      <main className="profile-main profile-container">
        {loading && <div className="profile-card">Carregando...</div>}
        {error && <div className="profile-card profile-error">{error}</div>}

        {!loading && !error && user && (
          <>
            <div className="profile-card">
              <div className="profile-card-header profile-card-header--avatar">
                <div className="profile-avatar-block">
                  <div className="profile-avatar" aria-hidden={!avatarUrl}>
                    {avatarUrl ? <img src={avatarUrl} alt="" className="profile-avatar-img" /> : <span>{avatarFallback}</span>}
                  </div>
                  <div>
                    <div className="profile-card-title">Perfil</div>
                    <div className="profile-card-username">@{user.username}</div>
                  </div>
                </div>
                {isOwnProfile && (
                  <button type="button" className="lp-btn" onClick={handleEditClick}>
                    Editar perfil
                  </button>
                )}
              </div>

              <div className="profile-row">
                <div className="profile-label">Usuário</div>
                <div className="profile-value profile-mono">{user.username}</div>
              </div>
              <div className="profile-row">
                <div className="profile-label">Email</div>
                <div className="profile-value">{user.email || '—'}</div>
              </div>
              <div className="profile-row">
                <div className="profile-label">Pontuação</div>
                <div className="profile-value profile-mono">{(user.score ?? 0).toLocaleString('pt-BR')} pts</div>
              </div>
              <div className="profile-row">
                <div className="profile-label">Problemas resolvidos</div>
                <div className="profile-value profile-mono">{solvedCount.toLocaleString('pt-BR')}</div>
              </div>
              <div className="profile-row">
                <div className="profile-label">Entrou em</div>
                <div className="profile-value">{formatDateTime(user.created_at)}</div>
              </div>
            </div>

            <div className="profile-card">
              <div className="profile-card-title">Bio</div>
              <div className="profile-bio">
                {user.bio ? user.bio : <span className="profile-muted">Nenhuma bio cadastrada.</span>}
              </div>
            </div>

            <div className="profile-card">
              <div className="profile-card-title">Codeforces</div>
              {user.codeforces_handle ? (
                <>
                  <div className="profile-cf-grid">
                    <div className="profile-cf-stat">
                      <div className="profile-cf-label">Handle</div>
                      <div className="profile-cf-value">{user.codeforces_handle}</div>
                    </div>
                    <div className="profile-cf-stat">
                      <div className="profile-cf-label">Rating</div>
                      <div className="profile-cf-value">{user.codeforces_rating ?? '—'}</div>
                    </div>
                    <div className="profile-cf-stat">
                      <div className="profile-cf-label">Rank</div>
                      <div className="profile-cf-value">{formatRank(user.codeforces_rank)}</div>
                    </div>
                  </div>
                  <div className="profile-meta-row profile-meta-row--wrap">
                    <span>{cfSyncedAt ? `Atualizado em ${cfSyncedAt}` : 'Ainda não sincronizado.'}</span>
                  </div>
                </>
              ) : (
                <p className="profile-muted">Este membro ainda não conectou o Codeforces.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;
