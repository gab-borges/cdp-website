import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import codeforcesLogo from '../assets/codeforces-logo.png';
import './dashboard.css';

function Dashboard() {
  const { setHeaderUser } = useOutletContext() ?? {};
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [feedMeta, setFeedMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedError, setFeedError] = useState(null);
  const [posting, setPosting] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [feedDraft, setFeedDraft] = useState({ title: '', body: '' });
  const [refreshingCf, setRefreshingCf] = useState(false);
  const [cfFeedback, setCfFeedback] = useState(null);

  const avatarUrl = me?.codeforces_title_photo;
  const avatarFallback = me?.username?.slice(0, 1).toUpperCase() || '?';

  const isAdmin = me?.role === 'admin';

  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    []
  );

  const refreshFeedPreview = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/api/v1/feed', { params: { per_page: 5 } });
      setFeedPosts(data.posts || []);
      setFeedMeta(data.meta || null);
      setFeedError(null);
    } catch (err) {
      console.error('Erro ao carregar o feed:', err);
      setFeedError('Não foi possível carregar o feed agora.');
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [meRes, usersRes] = await Promise.all([
          axios.get('http://localhost:3000/api/v1/me'),
          axios.get('http://localhost:3000/api/v1/users'),
        ]);

        if (!mounted) return;
        setMe(meRes.data);
        setUsers(usersRes.data);
        console.log('--- DASHBOARD DATA ---');
        console.log('ME:', meRes.data);
        console.log('USERS:', usersRes.data);
        console.log('--------------------');
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        if (mounted) setError('Falha ao carregar seus dados.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    refreshFeedPreview();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!setHeaderUser || !me) return;
    setHeaderUser(me);
  }, [me, setHeaderUser]);

  useEffect(() => {
    if (!cfFeedback) return;
    const timeout = setTimeout(() => setCfFeedback(null), 4000);
    return () => clearTimeout(timeout);
  }, [cfFeedback]);

  const topUsers = useMemo(() => {
    const arr = Array.isArray(users) ? [...users] : [];
    return arr.sort((a, b) => (b?.total_score || 0) - (a?.total_score || 0)).slice(0, 5);
  }, [users]);

  const handleFeedSubmit = async (event) => {
    event.preventDefault();
    if (!feedDraft.title.trim() || !feedDraft.body.trim()) {
      alert('Preencha título e mensagem.');
      return;
    }

    try {
      setPosting(true);
      await axios.post('http://localhost:3000/api/v1/feed', {
        feed_post: {
          title: feedDraft.title.trim(),
          body: feedDraft.body.trim(),
        },
      });
      setFeedDraft({ title: '', body: '' });
      setShowComposer(false);
      await refreshFeedPreview();
    } catch (err) {
      console.error('Erro ao publicar no feed:', err);
      const message =
        err?.response?.data?.errors?.join(' ') || err?.response?.data?.error || err.message || 'Falha ao publicar.';
      alert(message);
    } finally {
      setPosting(false);
    }
  };

  const handleCodeforcesRefresh = async () => {
    if (!me?.codeforces_handle) {
      alert('Conecte seu handle do Codeforces na página de perfil para sincronizar.');
      return;
    }

    try {
      setRefreshingCf(true);
      const { data } = await axios.patch('http://localhost:3000/api/v1/profile', {
        profile: { codeforces_handle: me.codeforces_handle },
      });
      setMe(data);
      setCfFeedback({ type: 'success', message: 'Dados do Codeforces atualizados.' });
    } catch (err) {
      console.error('Erro ao sincronizar Codeforces:', err);
      const message = err?.response?.data?.errors?.join(' ') || err?.response?.data?.error || err.message || 'Falha ao sincronizar.';
      setCfFeedback({ type: 'error', message });
    } finally {
      setRefreshingCf(false);
    }
  };

  const renderFeedPreview = () => {
    if (feedError) {
      return <div className="db-feed-error">{feedError}</div>;
    }

    if (!feedPosts.length) {
      return <div className="db-feed-empty">Nenhuma atualização publicada ainda.</div>;
    }

    return (
      <div className="db-feed-list">
        {feedPosts.map((post) => (
          <article key={post.id} className="db-feed-item">
            <header className="db-feed-head">
              <h3>{post.title}</h3>
              <div className="db-feed-meta">
                {post.author?.username ? (
                  <Link className="db-feed-author" to={`/profile/${post.author.username}`}>
                    {post.author.username}
                  </Link>
                ) : (
                  <span>Equipe</span>
                )}
                <span>{dateTimeFormatter.format(new Date(post.published_at))}</span>
              </div>
            </header>
            <p className="db-feed-body">{post.body}</p>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="db-root">
      <main className="db-main db-container">
        {loading && <div className="db-card">Carregando...</div>}
        {error && <div className="db-card db-error">{error}</div>}

        {!loading && !error && (
          <div className="db-grid">
            <section className="db-card db-card-summary">
              <div className="db-summary-header">
                <div className="db-summary-avatar" aria-hidden={!avatarUrl}>
                  {avatarUrl ? <img src={avatarUrl} alt="" className="db-summary-avatar-img" /> : <span>{avatarFallback}</span>}
                </div>
                <div>
                  <h2 className="db-summary-name">{me?.name || me?.username}</h2>
                  <span className="db-summary-score">{(me?.total_score ?? 0).toLocaleString('pt-BR')} pts</span>
                  <span className="db-summary-monthly-score">{(me?.monthly_score ?? 0).toLocaleString('pt-BR')} pts (mês)</span>
                </div>
              </div>

              <div className="db-summary-divider" />

              <div className="db-summary-codeforces">
                <div className="db-summary-cf-meta">
                  <img src={codeforcesLogo} alt="Codeforces" className="db-summary-cf-logo" />
                  <div className="db-summary-cf-text">
                    <span className="db-summary-cf-handle">{me?.codeforces_handle || 'Codeforces não conectado'}</span>
                    {me?.codeforces_last_synced_at && (
                      <span className="db-summary-cf-sync">
                        Última sincronização {dateTimeFormatter.format(new Date(me.codeforces_last_synced_at))}
                      </span>
                    )}
                  </div>
                </div>
                <div className="db-summary-cf-actions">
                  {me?.codeforces_handle ? (
                    <button
                      type="button"
                      className="lp-btn lp-btn-ghost db-summary-cf-button"
                      onClick={handleCodeforcesRefresh}
                      disabled={refreshingCf}
                    >
                      {refreshingCf ? 'Sincronizando...' : 'Atualizar'}
                    </button>
                  ) : (
                    <Link
                      className="lp-btn lp-btn-ghost db-summary-cf-button"
                      to={me?.username ? `/profile/${me.username}/edit` : '/profile'}
                    >
                      Conectar
                    </Link>
                  )}
                </div>
              </div>

              {cfFeedback && (
                <div
                  className={`db-summary-alert ${cfFeedback.type === 'error' ? 'db-summary-alert-error' : 'db-summary-alert-success'}`}
                >
                  {cfFeedback.message}
                </div>
              )}
            </section>

            <section className="db-card db-card-ranking">
              <div className="db-card-header">
                <div>
                  <div className="db-card-title">Ranking</div>
                  <p className="db-muted">Top 5 membros</p>
                </div>
                <Link className="db-link" to="/ranking">
                  Ver todos
                </Link>
              </div>
              <div className="db-table-head">
                <div>#</div>
                <div>Membro</div>
                <div className="db-right">Pontos</div>
              </div>
              <div className="db-divider" />
              {topUsers.map((user, index) => (
                <div className="db-row" key={user.id ?? index}>
                  <div className="db-strong">{index + 1}</div>
                  <div className="db-truncate">
                    {user?.username ? (
                      <Link className="db-link" to={`/profile/${user.username}`}>
                        {user.username}
                      </Link>
                    ) : (
                      <span>{user.username}</span>
                    )}
                  </div>
                  <div className="db-right db-mono">{(user.total_score ?? 0).toLocaleString('pt-BR')}</div>
                </div>
              ))}
            </section>

            <section className="db-card db-card-feed">
              <div className="db-card-header">
                <div>
                  <div className="db-card-title">Feed do Clube</div>
                  <p className="db-muted">Últimas atualizações da coordenação.</p>
                </div>
                <div className="db-card-actions">
                  <Link className="lp-btn lp-btn-ghost" to="/feed">
                    Ver feed completo
                  </Link>
                  {isAdmin && (
                    <button
                      type="button"
                      className="lp-btn lp-btn-ghost"
                      onClick={() => setShowComposer((prev) => !prev)}
                    >
                      {showComposer ? 'Cancelar' : 'Novo post'}
                    </button>
                  )}
                </div>
              </div>

              {isAdmin && showComposer && (
                <form className="db-feed-form" onSubmit={handleFeedSubmit}>
                  <div className="db-form-group">
                    <label htmlFor="dashboard-feed-title">Título</label>
                    <input
                      id="dashboard-feed-title"
                      type="text"
                      value={feedDraft.title}
                      onChange={(event) => setFeedDraft((prev) => ({ ...prev, title: event.target.value }))}
                      maxLength={160}
                      required
                    />
                  </div>
                  <div className="db-form-group">
                    <label htmlFor="dashboard-feed-body">Mensagem</label>
                    <textarea
                      id="dashboard-feed-body"
                      value={feedDraft.body}
                      onChange={(event) => setFeedDraft((prev) => ({ ...prev, body: event.target.value }))}
                      maxLength={5000}
                      required
                    />
                  </div>
                  <div className="db-actions">
                    <button type="submit" className="lp-btn" disabled={posting}>
                      {posting ? 'Publicando...' : 'Publicar'}
                    </button>
                  </div>
                </form>
              )}

              {feedMeta?.total_count ? (
                <div className="db-muted db-feed-count">
                  {feedMeta.total_count} publicações ao todo
                </div>
              ) : null}

              {renderFeedPreview()}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
