import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import axios from 'axios';
import codeforcesLogo from '../assets/codeforces-logo.png';
import './profile.css';

const useAutoDismiss = (message, clearMessage, delay = 4000) => {
  useEffect(() => {
    if (!message) return undefined;
    const timeoutId = setTimeout(() => clearMessage(''), delay);
    return () => clearTimeout(timeoutId);
  }, [message, clearMessage, delay]);
};

const ProfileEdit = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { setHeaderUser } = useOutletContext() ?? {};
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usernameDraft, setUsernameDraft] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [bioMessage, setBioMessage] = useState('');
  const [bioError, setBioError] = useState('');
  const [editingBio, setEditingBio] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', password: '', confirm: '' });
  const [pwdMessage, setPwdMessage] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);
  const [cfDraft, setCfDraft] = useState('');
  const [cfMessage, setCfMessage] = useState('');
  const [cfError, setCfError] = useState('');
  const [editingCf, setEditingCf] = useState(false);
  const [savingCf, setSavingCf] = useState(false);
  const [deleteForm, setDeleteForm] = useState({ confirm: '', password: '' });
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const solvedCount = Number(user?.solved_problems_count ?? 0);
  const totalScore = Number(user?.total_score ?? 0);
  const monthlyScore = Number(user?.monthly_score ?? 0);
  const avatarUrl = user?.codeforces_title_photo;
  const avatarFallback = user?.username?.slice(0, 1).toUpperCase() || '?';

  useAutoDismiss(usernameMessage, setUsernameMessage);
  useAutoDismiss(bioMessage, setBioMessage);
  useAutoDismiss(cfMessage, setCfMessage);
  useAutoDismiss(pwdMessage, setPwdMessage);

  const editStats = [
    {
      label: 'Pontuação',
      value: (
        <>
          <span className="profile-stat-main">{totalScore.toLocaleString('pt-BR')} pts</span>
          <span className="profile-stat-sub">({monthlyScore.toLocaleString('pt-BR')} pts)</span>
        </>
      ),
    },
    { label: 'Problemas resolvidos', value: solvedCount.toLocaleString('pt-BR') },
  ];

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get('/api/v1/profile');
        if (!mounted) return;
        if (data.username !== username) {
          navigate(`/profile/${data.username}/edit`, { replace: true });
          return;
        }
        setUser(data);
        setUsernameDraft(data.username || '');
        setEditingUsername(false);
        setUsernameMessage('');
        setUsernameError('');
        setBioDraft(data.bio || '');
        setEditingBio(false);
        setCfDraft(data.codeforces_handle || '');
        setEditingCf(!data.codeforces_handle);
        setCfMessage('');
        setCfError('');
        setDeleteForm({ confirm: '', password: '' });
        setDeleteError('');
      } catch (e) {
        console.error('Erro ao carregar dados do perfil:', e);
        setError('Falha ao carregar seus dados.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUser();
    return () => { mounted = false; };
  }, [username, navigate]);

  useEffect(() => {
    if (!setHeaderUser || !user) return;
    setHeaderUser(user);
  }, [setHeaderUser, user]);

  const formatDateTime = (value) => {
    if (!value) return 'Sincronize para obter dados atualizados.';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  };

  const formatRank = (rank) => {
    if (!rank) return '—';
    return rank.replace(/_/g, ' ');
  };

  const updateCodeforces = async (rawHandle) => {
    const handle = rawHandle.trim();
    const isDisconnect = handle.length === 0;
    setCfMessage('');
    setCfError('');
    setSavingCf(true);
    try {
      const { data } = await axios.patch('/api/v1/profile', {
        profile: { codeforces_handle: handle },
      });
      setUser(data);
      setCfDraft(data.codeforces_handle || '');
      setCfMessage(
        isDisconnect ? 'Conexão com Codeforces removida.' : 'Sincronização iniciada! A atualização da sua pontuação pode levar alguns minutos.'
      );
      setEditingCf(isDisconnect);
    } catch (e) {
      const errData = e?.response?.data;
      const message = Array.isArray(errData?.errors)
        ? errData.errors.join(' ')
        : errData?.error || 'Não foi possível conectar ao Codeforces.';
      setCfError(message);
    } finally {
      setSavingCf(false);
    }
  };

  const handleCodeforcesSubmit = async (event) => {
    event.preventDefault();
    await updateCodeforces(cfDraft);
  };

  const handleCodeforcesDisconnect = async () => {
    await updateCodeforces('');
  };

  const handleCodeforcesRefresh = async () => {
    await updateCodeforces(user.codeforces_handle || '');
  };

  const handleUsernameSubmit = async (event) => {
    event.preventDefault();
    setUsernameMessage('');
    setUsernameError('');
    setSavingUsername(true);
    try {
      const nextUsername = usernameDraft.trim().toLowerCase();
      const { data } = await axios.patch('/api/v1/profile', {
        profile: { username: nextUsername },
      });
      setUser(data);
      setUsernameDraft(data.username || '');
      setUsernameMessage('Nome de usuário atualizado com sucesso.');
      setEditingUsername(false);
      if (data.username && data.username !== username) {
        navigate(`/profile/${data.username}/edit`, { replace: true });
      }
    } catch (e) {
      const errData = e?.response?.data;
      const message = Array.isArray(errData?.errors)
        ? errData.errors.join(' ')
        : errData?.error || 'Não foi possível atualizar seu nome de usuário.';
      setUsernameError(message);
    } finally {
      setSavingUsername(false);
    }
  };

  const handleBioSubmit = async (event) => {
    event.preventDefault();
    setBioMessage('');
    setBioError('');
    setSavingBio(true);
    try {
      const { data } = await axios.patch('/api/v1/profile', {
        profile: { bio: bioDraft.trim() },
      });
      setUser(data);
      setBioMessage('Bio atualizada com sucesso.');
      setEditingBio(false);
    } catch (e) {
      const message = e?.response?.data?.errors?.join(' ') || 'Não foi possível atualizar sua bio.';
      setBioError(message);
    } finally {
      setSavingBio(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPwdMessage('');
    setPwdError('');
    setSavingPwd(true);
    try {
      await axios.patch('/api/v1/profile/password', {
        profile: {
          current_password: pwdForm.current,
          password: pwdForm.password,
          password_confirmation: pwdForm.confirm,
        },
      });
      setPwdMessage('Senha atualizada com sucesso.');
      setPwdForm({ current: '', password: '', confirm: '' });
    } catch (e) {
      const errData = e?.response?.data;
      const message = Array.isArray(errData?.errors)
        ? errData.errors.join(' ')
        : errData?.error || 'Não foi possível atualizar a senha.';
      setPwdError(message);
    } finally {
      setSavingPwd(false);
    }
  };

  const handleAccountDelete = async (event) => {
    event.preventDefault();
    setDeleteError('');

    const expectedUsername = (user?.username || '').toLowerCase();
    const typedUsername = deleteForm.confirm.trim().toLowerCase();
    if (!typedUsername || typedUsername !== expectedUsername) {
      setDeleteError('Digite seu nome de usuário exatamente para confirmar.');
      return;
    }

    if (!deleteForm.password) {
      setDeleteError('Informe sua senha para confirmar a exclusão.');
      return;
    }

    try {
      setDeleteLoading(true);
      await axios.delete('/api/v1/profile', {
        data: { profile: { current_password: deleteForm.password } },
      });
      alert('Conta excluída permanentemente.');
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (e) {
      const message = e?.response?.data?.error || 'Não foi possível excluir sua conta.';
      setDeleteError(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="profile-root">
      <main className="profile-main profile-container">
        {loading && <div className="profile-card">Carregando...</div>}
        {error && <div className="profile-card profile-error">{error}</div>}
        {!loading && !error && user && (
          <section className="profile-panel profile-panel--edit">
            <header className="profile-hero">
              <div className="profile-identity">
                <div className="profile-avatar" aria-hidden={!avatarUrl}>
                  {avatarUrl ? <img src={avatarUrl} alt="" className="profile-avatar-img" /> : <span>{avatarFallback}</span>}
                </div>
                <div>
                  <h1 className="profile-name">Editar perfil</h1>
                  <div className="profile-username">@{user.username}</div>
                </div>
              </div>
              <Link to={`/profile/${user.username}`} className="lp-btn lp-btn-ghost">
                Ver perfil
              </Link>
            </header>

            <div className="profile-stats">
              {editStats.map((stat) => (
                <div key={stat.label} className="profile-stat">
                  <div className="profile-stat-label">{stat.label}</div>
                  <div className="profile-stat-value">{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="profile-edit-grid">
              <section className="profile-edit-section">
                <div className="profile-edit-section-header">
                  <h2 className="profile-section-title">Nome de usuário</h2>
                  <button
                    type="button"
                    className="lp-btn lp-btn-ghost"
                    onClick={() => {
                      setEditingUsername((prev) => !prev);
                      setUsernameMessage('');
                      setUsernameError('');
                      setUsernameDraft(user.username || '');
                    }}
                  >
                    {editingUsername ? 'Cancelar' : 'Editar'}
                  </button>
                </div>
                <p className="profile-muted">Escolha o identificador único usado em rankings e no seu perfil público.</p>
                {!editingUsername && (
                  <div className="profile-summary">
                    <span className="profile-summary-label">Atual</span>
                    <span className="profile-summary-value">@{user.username}</span>
                  </div>
                )}
                {editingUsername && (
                  <form onSubmit={handleUsernameSubmit} className="profile-edit-form">
                    <div className="profile-form-group">
                      <label htmlFor="username-field">Nome de usuário</label>
                      <input
                        id="username-field"
                        type="text"
                        value={usernameDraft}
                        onChange={(event) => setUsernameDraft(event.target.value)}
                        placeholder="nome_de_usuario"
                        required
                      />
                      <p className="profile-muted">Use apenas letras minúsculas, números e "_". Seu identificador deve ser único.</p>
                    </div>
                    <div className="profile-actions">
                      <button type="submit" className="lp-btn" disabled={savingUsername}>
                        {savingUsername ? 'Salvando...' : 'Salvar alterações'}
                      </button>
                    </div>
                  </form>
                )}
                {(usernameMessage || usernameError) && (
                  <div className={`profile-alert ${usernameError ? 'profile-alert-error' : 'profile-alert-success'}`}>
                    {usernameError || usernameMessage}
                  </div>
                )}
              </section>

              <section className="profile-edit-section">
                <div className="profile-edit-section-header">
                  <h2 className="profile-section-title">Bio</h2>
                  <button
                    type="button"
                    className="lp-btn lp-btn-ghost"
                    onClick={() => {
                      setEditingBio((prev) => !prev);
                      setBioMessage('');
                      setBioError('');
                      setBioDraft(user.bio || '');
                    }}
                  >
                    {editingBio ? 'Cancelar' : 'Editar'}
                  </button>
                </div>
                <p className="profile-muted">Um pouco sobre você, hobbies, áreas de estudo ou metas.</p>
                {!editingBio && (
                  <div className="profile-bio">
                    {user.bio ? user.bio : <span className="profile-muted">Nenhuma bio cadastrada.</span>}
                  </div>
                )}
                {editingBio && (
                  <form onSubmit={handleBioSubmit} className="profile-edit-form">
                    <textarea
                      className="profile-textarea"
                      value={bioDraft}
                      maxLength={1200}
                      onChange={(event) => setBioDraft(event.target.value)}
                      placeholder="Conte-nos sobre sua experiência, interesses ou metas."
                    />
                    <div className="profile-meta-row">
                      <span>{bioDraft.length}/1200</span>
                      <button type="submit" className="lp-btn" disabled={savingBio}>
                        {savingBio ? 'Salvando...' : 'Salvar bio'}
                      </button>
                    </div>
                  </form>
                )}
                {(bioMessage || bioError) && (
                  <div className={`profile-alert ${bioError ? 'profile-alert-error' : 'profile-alert-success'}`}>
                    {bioError || bioMessage}
                  </div>
                )}
              </section>

              <section className="profile-edit-section">
                <div className="profile-edit-section-header">
                  <div className="profile-section-title profile-codeforces-header">
                    <img src={codeforcesLogo} alt="Codeforces" className="profile-codeforces-logo" />
                    <span>Codeforces</span>
                  </div>
                  {user.codeforces_handle && !editingCf && (
                    <button
                      type="button"
                      className="lp-btn lp-btn-ghost"
                      onClick={() => {
                        setEditingCf(true);
                        setCfMessage('');
                        setCfError('');
                        setCfDraft(user.codeforces_handle || '');
                      }}
                    >
                      Editar
                    </button>
                  )}
                </div>
                <p className="profile-muted">Conecte seu handle para sincronizar automaticamente seus resultados.</p>
                <div className="profile-codeforces profile-codeforces--form">
                  {user.codeforces_handle && !editingCf ? (
                    <>
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
                      </div>
                      <div className="profile-codeforces-meta">{formatDateTime(user.codeforces_last_synced_at)}</div>
                      <div className="profile-cf-actions">
                        <button type="button" className="lp-btn" onClick={handleCodeforcesRefresh} disabled={savingCf}>
                          {savingCf ? 'Sincronizando...' : 'Atualizar dados'}
                        </button>
                        <button type="button" className="lp-btn lp-btn-ghost" onClick={handleCodeforcesDisconnect} disabled={savingCf}>
                          Desconectar
                        </button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleCodeforcesSubmit} className="profile-form-inline">
                      <div className="profile-form-group">
                        <label htmlFor="cf-handle">Handle</label>
                        <input
                          id="cf-handle"
                          type="text"
                          value={cfDraft}
                          onChange={(event) => setCfDraft(event.target.value)}
                          placeholder="codeforces_handle"
                        />
                      </div>
                      <div className="profile-actions">
                        <button type="submit" className="lp-btn" disabled={savingCf || (!cfDraft.trim() && !user.codeforces_handle)}>
                          {savingCf ? 'Conectando...' : user.codeforces_handle ? 'Salvar' : 'Conectar'}
                        </button>
                        {user.codeforces_handle && (
                          <button
                            type="button"
                            className="lp-btn lp-btn-ghost"
                            disabled={savingCf}
                            onClick={() => {
                              setEditingCf(false);
                              setCfDraft(user.codeforces_handle || '');
                            }}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
                {(cfMessage || cfError) && (
                  <div className={`profile-alert ${cfError ? 'profile-alert-error' : 'profile-alert-success'}`}>
                    {cfError || cfMessage}
                  </div>
                )}
              </section>

              <form className="profile-edit-section profile-edit-form" onSubmit={handlePasswordChange}>
                <div className="profile-edit-section-header">
                  <h2 className="profile-section-title">Alterar senha</h2>
                </div>
                <div className="profile-form-group">
                  <label htmlFor="current-password">Senha atual</label>
                  <input
                    id="current-password"
                    type="password"
                    value={pwdForm.current}
                    onChange={(event) => setPwdForm((prev) => ({ ...prev, current: event.target.value }))}
                    required
                  />
                </div>
                <div className="profile-form-group profile-grid">
                  <div>
                    <label htmlFor="new-password">Nova senha</label>
                    <input
                      id="new-password"
                      type="password"
                      value={pwdForm.password}
                      onChange={(event) => setPwdForm((prev) => ({ ...prev, password: event.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password">Confirmar</label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={pwdForm.confirm}
                      onChange={(event) => setPwdForm((prev) => ({ ...prev, confirm: event.target.value }))}
                      required
                    />
                  </div>
                </div>
              <div className="profile-actions">
                <button type="submit" className="lp-btn" disabled={savingPwd}>
                  {savingPwd ? 'Atualizando...' : 'Atualizar senha'}
                </button>
              </div>
              {(pwdMessage || pwdError) && (
                <div className={`profile-alert ${pwdError ? 'profile-alert-error' : 'profile-alert-success'}`}>
                  {pwdError || pwdMessage}
                </div>
              )}
            </form>

            <section className="profile-edit-section profile-edit-section--danger">
              <div className="profile-edit-section-header">
                <h2 className="profile-section-title">Excluir conta</h2>
              </div>
              <p className="profile-danger-text">
                Esta ação é permanente e removerá todos os seus dados. Para confirmar, digite seu nome de usuário completo e sua senha atual.
              </p>
              <form onSubmit={handleAccountDelete} className="profile-edit-form">
                <div className="profile-form-group">
                  <label htmlFor="delete-confirm">Nome de usuário</label>
                  <input
                    id="delete-confirm"
                    type="text"
                    value={deleteForm.confirm}
                    onChange={(event) => setDeleteForm((prev) => ({ ...prev, confirm: event.target.value }))}
                    placeholder={user.username}
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="profile-form-group">
                  <label htmlFor="delete-password">Senha atual</label>
                  <input
                    id="delete-password"
                    type="password"
                    value={deleteForm.password}
                    onChange={(event) => setDeleteForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="Sua senha"
                    required
                  />
                </div>
                {deleteError && <div className="profile-alert profile-alert-error">{deleteError}</div>}
                <div className="profile-actions">
                  <button type="submit" className="lp-btn lp-btn-danger" disabled={deleteLoading}>
                    {deleteLoading ? 'Excluindo...' : 'Excluir conta'}
                  </button>
                </div>
              </form>
            </section>
          </div>

          <footer className="profile-footer">
            <div className="profile-footer-item">
              <span className="profile-footer-label">Email</span>
                <span className="profile-footer-value">{user.email || '—'}</span>
              </div>
              <div className="profile-footer-item">
                <span className="profile-footer-label">Entrou em</span>
                <span className="profile-footer-value">{formatDateTime(user.created_at)}</span>
              </div>
            </footer>
          </section>
        )}
      </main>
    </div>
  );
};

export default ProfileEdit;
