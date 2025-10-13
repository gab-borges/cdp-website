import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import codeforcesLogo from '../assets/codeforces-logo.png';
import './dashboard.css';
import './feed.css';

function Dashboard() {
  const { setHeaderUser } = useOutletContext() ?? {};
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshingCf, setRefreshingCf] = useState(false);
  const [cfFeedback, setCfFeedback] = useState(null);
  const [posts, setPosts] = useState([]);
  const [feedMeta, setFeedMeta] = useState({ page: 1, total_pages: 1, total_count: 0, per_page: 10 });
  const [loadingFeedInitial, setLoadingFeedInitial] = useState(true);
  const [loadingFeedMore, setLoadingFeedMore] = useState(false);
  const [feedError, setFeedError] = useState(null);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [feedDraft, setFeedDraft] = useState({ title: '', body: '' });
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingDraft, setEditingDraft] = useState({ title: '', body: '' });

  const feedLoaderRef = useRef(null);
  const feedPageRef = useRef(1);
  const feedNextPageRef = useRef(2);
  const feedMountedRef = useRef(true);

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

  const loadFeed = useCallback(async (pageToLoad = 1) => {
    if (!feedMountedRef.current) return;

    if (pageToLoad === 1) {
      setLoadingFeedInitial(true);
      setFeedError(null);
      feedNextPageRef.current = 2;
    } else {
      setLoadingFeedMore(true);
    }

    try {
      const { data } = await axios.get('http://localhost:3000/api/v1/feed', { params: { page: pageToLoad } });
      if (!feedMountedRef.current) return;

      const incoming = data.posts || [];
      let updatedPosts = incoming;

      setPosts((prev) => {
        if (pageToLoad === 1) {
          updatedPosts = incoming;
          return incoming;
        }

        const existingIds = new Set(prev.map((item) => item.id));
        const merged = [...prev];
        incoming.forEach((item) => {
          if (!existingIds.has(item.id)) merged.push(item);
        });
        updatedPosts = merged;
        return merged;
      });

      const metaInfo = data.meta || {};
      const currentPage = metaInfo.page || pageToLoad;
      const perPage = Number(metaInfo.per_page) || updatedPosts.length || 10;
      const totalPages = Number(metaInfo.total_pages ?? metaInfo.totalPages) || currentPage;
      let nextPage = metaInfo.next_page ?? metaInfo.nextPage;
      if (typeof nextPage === 'string') {
        const parsed = Number.parseInt(nextPage, 10);
        nextPage = Number.isNaN(parsed) ? null : parsed;
      }
      if (nextPage == null) {
        if (totalPages && currentPage < totalPages) {
          nextPage = currentPage + 1;
        } else if (incoming.length >= perPage) {
          nextPage = pageToLoad + 1;
        } else {
          nextPage = null;
        }
      }

      feedPageRef.current = currentPage;
      feedNextPageRef.current = nextPage;
      setFeedMeta({
        page: currentPage,
        per_page: metaInfo.per_page || 10,
        total_pages: totalPages,
        total_count: metaInfo.total_count ?? updatedPosts.length,
      });
      setHasMoreFeed(Boolean(nextPage));
    } catch (err) {
      console.error('Erro ao carregar o feed:', err);
      if (feedMountedRef.current) setFeedError('Não foi possível carregar o feed agora.');
    } finally {
      if (!feedMountedRef.current) return;
      if (pageToLoad === 1) {
        setLoadingFeedInitial(false);
      } else {
        setLoadingFeedMore(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    feedMountedRef.current = true;
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
    loadFeed(1);

    return () => {
      mounted = false;
      feedMountedRef.current = false;
    };
  }, [loadFeed]);

  useEffect(() => {
    if (!setHeaderUser || !me) return;
    setHeaderUser(me);
  }, [me, setHeaderUser]);

  useEffect(() => {
    if (!cfFeedback) return;
    const timeout = setTimeout(() => setCfFeedback(null), 4000);
    return () => clearTimeout(timeout);
  }, [cfFeedback]);

  useEffect(() => {
    const node = feedLoaderRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasMoreFeed && !loadingFeedMore && feedNextPageRef.current) {
          loadFeed(feedNextPageRef.current);
        }
      },
      { rootMargin: '0px 0px 200px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMoreFeed, loadingFeedMore, loadFeed, posts.length]);

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
      await loadFeed(1);
    } catch (err) {
      console.error('Erro ao publicar no feed:', err);
      const message =
        err?.response?.data?.errors?.join(' ') || err?.response?.data?.error || err.message || 'Falha ao publicar.';
      alert(message);
    } finally {
      setPosting(false);
    }
  };

  const handleFeedEditStart = (post) => {
    if (editingId === post.id) {
      handleFeedEditCancel();
      return;
    }

    setEditingId(post.id);
    setEditingDraft({ title: post.title, body: post.body });
    setShowComposer(false);
  };

  const handleFeedEditCancel = () => {
    setEditingId(null);
    setEditingDraft({ title: '', body: '' });
  };

  const handleFeedEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingId) return;

    if (!editingDraft.title.trim() || !editingDraft.body.trim()) {
      alert('Preencha título e mensagem.');
      return;
    }

    try {
      setPosting(true);
      const { data } = await axios.patch(`http://localhost:3000/api/v1/feed/${editingId}`, {
        feed_post: {
          title: editingDraft.title.trim(),
          body: editingDraft.body.trim(),
        },
      });
      setPosts((prev) => prev.map((item) => (item.id === data.id ? data : item)));
      handleFeedEditCancel();
    } catch (err) {
      console.error('Erro ao atualizar publicação:', err);
      const message =
        err?.response?.data?.errors?.join(' ') || err?.response?.data?.error || err.message || 'Falha ao atualizar publicação.';
      alert(message);
    } finally {
      setPosting(false);
    }
  };

  const handleFeedDelete = async (postId) => {
    const confirmed = window.confirm('Tem certeza que deseja remover esta publicação?');
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:3000/api/v1/feed/${postId}`);
      handleFeedEditCancel();
      await loadFeed(1);
    } catch (err) {
      console.error('Erro ao remover publicação:', err);
      const message = err?.response?.data?.error || err.message || 'Falha ao remover publicação.';
      alert(message);
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

  const renderFeed = () => {
    if (loadingFeedInitial) {
      return <div className="feed-placeholder">Carregando publicações...</div>;
    }

    if (feedError) {
      return <div className="feed-error">{feedError}</div>;
    }

    if (!posts.length) {
      return <div className="feed-empty">Nenhuma publicação disponível ainda.</div>;
    }

    return (
      <>
        <div className="feed-list">
          {posts.map((post) => {
            const isEditing = editingId === post.id;
            const authorUsername = post.author?.username;
            const authorAvatar = post.author?.codeforces_title_photo;
            const authorFallback = authorUsername?.slice(0, 1).toUpperCase() || '?';
            return (
              <article key={post.id} className="feed-item">
                <header className="feed-item-head">
                  <div className="feed-item-main">
                    <div className="feed-item-avatar" aria-hidden={!authorAvatar}>
                      {authorAvatar ? (
                        <img
                          src={authorAvatar}
                          alt={`Avatar de ${authorUsername || 'autor'}`}
                          className="feed-item-avatar-img"
                        />
                      ) : (
                        <span>{authorFallback}</span>
                      )}
                    </div>
                    <div className="feed-item-text">
                      <h2>{post.title}</h2>
                      <div className="feed-item-meta">
                        {post.author?.username ? (
                          <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link>
                        ) : (
                          <span>Equipe</span>
                        )}
                        <span>{dateTimeFormatter.format(new Date(post.published_at))}</span>
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="feed-item-actions">
                      <button type="button" className="lp-btn lp-btn-ghost" onClick={() => handleFeedEditStart(post)}>
                        {isEditing ? 'Fechar' : 'Editar'}
                      </button>
                      <button
                        type="button"
                        className="lp-btn lp-btn-ghost feed-delete"
                        onClick={() => handleFeedDelete(post.id)}
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </header>

                {isEditing ? (
                  <form className="feed-edit-form" onSubmit={handleFeedEditSubmit}>
                    <div className="feed-form-group">
                      <label htmlFor={`feed-edit-title-${post.id}`}>Título</label>
                      <input
                        id={`feed-edit-title-${post.id}`}
                        type="text"
                        value={editingDraft.title}
                        onChange={(event) => setEditingDraft((prev) => ({ ...prev, title: event.target.value }))}
                        maxLength={160}
                        required
                      />
                    </div>
                    <div className="feed-form-group">
                      <label htmlFor={`feed-edit-body-${post.id}`}>Mensagem</label>
                      <textarea
                        id={`feed-edit-body-${post.id}`}
                        value={editingDraft.body}
                        onChange={(event) => setEditingDraft((prev) => ({ ...prev, body: event.target.value }))}
                        maxLength={5000}
                        required
                      />
                    </div>
                    <div className="feed-actions">
                      <button type="button" className="lp-btn lp-btn-ghost" onClick={handleFeedEditCancel}>
                        Cancelar
                      </button>
                      <button type="submit" className="lp-btn" disabled={posting}>
                        {posting ? 'Salvando...' : 'Salvar'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="feed-item-body">{post.body}</p>
                )}
              </article>
            );
          })}
        </div>
        <div ref={feedLoaderRef} className="feed-loader" aria-hidden="true">
          {loadingFeedMore ? 'Carregando...' : <span className="feed-loader-placeholder" />}
        </div>
      </>
    );
  };

  return (
    <div className="db-root">
      <main className="db-main db-container">
        {loading && <div className="db-card">Carregando...</div>}
        {error && <div className="db-card db-error">{error}</div>}

        {!loading && !error && (
          <div className="db-grid">
            <div className="db-left">
              <section className="db-card db-card-summary">
                <div className="db-summary-header">
                  <div className="db-summary-avatar" aria-hidden={!avatarUrl}>
                    {avatarUrl ? <img src={avatarUrl} alt="" className="db-summary-avatar-img" /> : <span>{avatarFallback}</span>}
                  </div>
                  <div>
                    <h2 className="db-summary-name">{me?.name || me?.username}</h2>
                    <span className="db-summary-score">{(me?.total_score ?? 0).toLocaleString('pt-BR')} pts</span>
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
                {topUsers.map((user, index) => (
                  <div className="db-row" key={user.id ?? index}>
                    <div className="db-strong">{index + 1}</div>
                    <div className="db-rank-avatar" aria-hidden={!user?.codeforces_title_photo}>
                      {user?.codeforces_title_photo ? (
                        <img
                          src={user.codeforces_title_photo}
                          alt={`Avatar de ${user.username || 'membro'}`}
                          className="db-rank-avatar-img"
                        />
                      ) : (
                        <span>{user?.username?.slice(0, 1).toUpperCase() || '?'}</span>
                      )}
                    </div>
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
            </div>

            <div className="db-feed-column">
              {isAdmin && showComposer && (
                <form className="feed-form" onSubmit={handleFeedSubmit}>
                  <div className="feed-form-group">
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
                  <div className="feed-form-group">
                    <label htmlFor="dashboard-feed-body">Mensagem</label>
                    <textarea
                      id="dashboard-feed-body"
                      value={feedDraft.body}
                      onChange={(event) => setFeedDraft((prev) => ({ ...prev, body: event.target.value }))}
                      maxLength={5000}
                      required
                    />
                  </div>
                  <div className="feed-actions">
                    <button type="button" className="lp-btn lp-btn-ghost" onClick={() => setShowComposer(false)} disabled={posting}>
                      Cancelar
                    </button>
                    <button type="submit" className="lp-btn" disabled={posting}>
                      {posting ? 'Publicando...' : 'Publicar'}
                    </button>
                  </div>
                </form>
              )}

              {isAdmin && !showComposer && (
                <div className="db-feed-actions">
                  <button type="button" className="lp-btn" onClick={() => setShowComposer(true)}>
                    Novo post
                  </button>
                </div>
              )}

              {renderFeed()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
