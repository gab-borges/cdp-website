import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import './dashboard.css';
import './feed.css';

function Feed({ onLogout }) {
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total_pages: 1, total_count: 0, per_page: 10 });
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [posting, setPosting] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [draft, setDraft] = useState({ title: '', body: '' });
  const [editingId, setEditingId] = useState(null);
  const [editingDraft, setEditingDraft] = useState({ title: '', body: '' });
  const [hasMore, setHasMore] = useState(true);

  const loaderRef = useRef(null);
  const isMounted = useRef(true);
  const pageRef = useRef(1);

  const isAdmin = me?.role === 'admin';

  const loadPosts = useCallback(async (pageToLoad = 1) => {
    if (!isMounted.current) return;

    if (pageToLoad === 1) {
      setLoadingInitial(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const { data } = await axios.get('http://localhost:3000/api/v1/feed', { params: { page: pageToLoad } });
      if (!isMounted.current) return;

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
      const totalPages = metaInfo.total_pages || currentPage;

      pageRef.current = currentPage;
      setMeta({
        page: currentPage,
        per_page: metaInfo.per_page || 10,
        total_pages: totalPages,
        total_count: metaInfo.total_count ?? updatedPosts.length,
      });
      setHasMore(currentPage < totalPages);
    } catch (err) {
      console.error('Falha ao carregar feed:', err);
      if (isMounted.current) setError('Não foi possível carregar as publicações no momento.');
    } finally {
      if (!isMounted.current) return;
      if (pageToLoad === 1) {
        setLoadingInitial(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    const fetchUser = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/api/v1/me');
        if (isMounted.current) setMe(data);
      } catch (err) {
        console.error('Falha ao carregar usuário atual:', err);
      }
    };

    fetchUser();
    loadPosts(1);

    return () => {
      isMounted.current = false;
    };
  }, [loadPosts]);

  useEffect(() => {
    const node = loaderRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasMore && !loadingMore) {
          loadPosts(pageRef.current + 1);
        }
      },
      { rootMargin: '0px 0px 200px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadPosts]);

  const formatDateTime = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    []
  );

  const handlePublish = async (event) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.body.trim()) {
      alert('Preencha título e mensagem.');
      return;
    }

    try {
      setPosting(true);
      await axios.post('http://localhost:3000/api/v1/feed', {
        feed_post: {
          title: draft.title.trim(),
          body: draft.body.trim(),
        },
      });
      setDraft({ title: '', body: '' });
      setShowComposer(false);
      await loadPosts(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Erro ao publicar no feed:', err);
      const message =
        err?.response?.data?.errors?.join(' ') || err?.response?.data?.error || err.message || 'Falha ao publicar.';
      alert(message);
    } finally {
      setPosting(false);
    }
  };

  const handleEditStart = (post) => {
    if (editingId === post.id) {
      handleEditCancel();
      return;
    }

    setEditingId(post.id);
    setEditingDraft({ title: post.title, body: post.body });
    setShowComposer(false);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingDraft({ title: '', body: '' });
  };

  const handleEditSubmit = async (event) => {
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
      handleEditCancel();
    } catch (err) {
      console.error('Erro ao atualizar publicação:', err);
      const message =
        err?.response?.data?.errors?.join(' ') || err?.response?.data?.error || err.message || 'Falha ao atualizar publicação.';
      alert(message);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (postId) => {
    const confirmed = window.confirm('Tem certeza que deseja remover esta publicação?');
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:3000/api/v1/feed/${postId}`);
      handleEditCancel();
      await loadPosts(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Erro ao remover publicação:', err);
      const message = err?.response?.data?.error || err.message || 'Falha ao remover publicação.';
      alert(message);
    }
  };

  const renderPosts = () => {
    if (loadingInitial) {
      return <div className="feed-placeholder">Carregando publicações...</div>;
    }

    if (error) {
      return <div className="feed-error">{error}</div>;
    }

    if (!posts.length) {
      return <div className="feed-empty">Nenhuma publicação disponível ainda.</div>;
    }

    return (
      <>
        <div className="feed-list">
          {posts.map((post) => {
            const isEditing = editingId === post.id;
            return (
              <article key={post.id} className="feed-item">
                <header className="feed-item-head">
                  <div>
                    <h2>{post.title}</h2>
                    <div className="feed-item-meta">
                      {post.author?.username ? (
                        <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link>
                      ) : (
                        <span>Equipe</span>
                      )}
                      <span>{formatDateTime.format(new Date(post.published_at))}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="feed-item-actions">
                      <button type="button" className="lp-btn lp-btn-ghost" onClick={() => handleEditStart(post)}>
                        {isEditing ? 'Fechar' : 'Editar'}
                      </button>
                      <button
                        type="button"
                        className="lp-btn lp-btn-ghost feed-delete"
                        onClick={() => handleDelete(post.id)}
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </header>

                {isEditing ? (
                  <form className="feed-edit-form" onSubmit={handleEditSubmit}>
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
                      <button type="button" className="lp-btn lp-btn-ghost" onClick={handleEditCancel}>
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
        <div ref={loaderRef} className="feed-loader">
          {loadingMore ? 'Carregando mais...' : hasMore ? 'Continue rolando para carregar mais.' : 'Você viu todas as publicações.'}
        </div>
      </>
    );
  };

  return (
    <div className="feed-root">
      <Header onLogout={onLogout} currentUser={me} />
      <main className="feed-main">
        <section className="feed-card">
          <header className="feed-header">
            <div>
              <h1>Feed do Clube</h1>
              <p className="feed-sub">Acompanhe comunicados, novidades e avisos importantes.</p>
            </div>
            {isAdmin && (
              <button type="button" className="lp-btn" onClick={() => setShowComposer((prev) => !prev)}>
                {showComposer ? 'Cancelar' : 'Novo post'}
              </button>
            )}
          </header>

          {isAdmin && showComposer && (
            <form className="feed-form" onSubmit={handlePublish}>
              <div className="feed-form-group">
                <label htmlFor="feed-title">Título</label>
                <input
                  id="feed-title"
                  type="text"
                  value={draft.title}
                  onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                  maxLength={160}
                  required
                />
              </div>
              <div className="feed-form-group">
                <label htmlFor="feed-body">Mensagem</label>
                <textarea
                  id="feed-body"
                  value={draft.body}
                  onChange={(event) => setDraft((prev) => ({ ...prev, body: event.target.value }))}
                  maxLength={5000}
                  required
                />
              </div>
              <div className="feed-actions">
                <button type="submit" className="lp-btn" disabled={posting}>
                  {posting ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </form>
          )}

          {renderPosts()}

          {!loadingInitial && (
            <footer className="feed-footer">
              <span>
                {meta.total_count} publicações • Página {meta.page} de {meta.total_pages}
              </span>
              <span>
                {posts.length} exibidas nesta sessão
              </span>
            </footer>
          )}
        </section>
      </main>
    </div>
  );
}

export default Feed;
