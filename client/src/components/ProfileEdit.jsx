import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import axios from 'axios';
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

  const solvedCount = Number(user?.solved_problems_count ?? 0);
  const avatarUrl = user?.codeforces_title_photo;
  const avatarFallback = user?.username?.slice(0, 1).toUpperCase() || '?';

  useAutoDismiss(usernameMessage, setUsernameMessage);
  useAutoDismiss(bioMessage, setBioMessage);
  useAutoDismiss(cfMessage, setCfMessage);
  useAutoDismiss(pwdMessage, setPwdMessage);

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
      setCfMessage(isDisconnect ? 'Conexão com Codeforces removida.' : 'Dados do Codeforces sincronizados!');
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
                    <div className="profile-card-title">Editar perfil</div>
                    <div className="profile-card-username">@{user.username}</div>
                  </div>
                </div>
              </div>
              <div className="profile-row">
                <div className="profile-label">Usuário</div>
                <div className="profile-value profile-mono">{user.username}</div>
              </div>
              <div className="profile-row">
                <div className="profile-label">Email</div>
                <div className="profile-value">{user.email}</div>
              </div>
              <div className="profile-row">
                <div className="profile-label">Pontuação</div>
                <div className="profile-value profile-mono">{user.score ?? 0} pts</div>
              </div>
              <div className="profile-row">
                <div className="profile-label">Problemas resolvidos</div>
                <div className="profile-value profile-mono">{solvedCount.toLocaleString('pt-BR')}</div>
              </div>
              <div className="profile-meta-row">
                <Link to={`/profile/${user.username}`} className="lp-btn lp-btn-ghost">
                  Ver perfil
                </Link>
              </div>
            </div>

            <div className="profile-card">
              <div className="profile-card-header">
                <div>
                  <div className="profile-card-title">Nome de usuário</div>
                  <p className="profile-muted">Escolha o identificador único usado em rankings e no seu perfil público.</p>
                </div>
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

              {!editingUsername && (
                <div className="profile-identity">
                  <div className="profile-row">
                    <div className="profile-label">Atual</div>
                    <div className="profile-value profile-mono">{user.username}</div>
                  </div>
                </div>
              )}

              {editingUsername && (
                <form onSubmit={handleUsernameSubmit} className="profile-form">
                  <div className="profile-form-group">
                    <label htmlFor="username-field">Nome de usuário</label>
                    <input
                      id="username-field"
                      type="text"
                      value={usernameDraft}
                      onChange={(event) => setUsernameDraft(event.target.value)}
                      placeholder="ex: joao_silva"
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
            </div>

            <div className="profile-card">
              <div className="profile-card-header">
                <div>
                  <div className="profile-card-title">Bio</div>
                  <p className="profile-muted">Um pouco sobre você, hobbies, áreas de estudo ou metas.</p>
                </div>
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

              {!editingBio && (
                <div className="profile-bio">
                  {user.bio ? user.bio : <span className="profile-muted">Nenhuma bio cadastrada.</span>}
                </div>
              )}

              {editingBio && (
                <form onSubmit={handleBioSubmit}>
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
            </div>

            <div className="profile-card">
              <div className="profile-card-header">
                <div>
                  <div className="profile-card-title">Codeforces</div>
                  <p className="profile-muted">Conecte seu handle para exibir rating e rank automaticamente.</p>
                </div>
                {!editingCf && (
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
                    {user.codeforces_handle ? 'Alterar handle' : 'Conectar'}
                  </button>
                )}
              </div>

              {user.codeforces_handle && !editingCf && (
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
                    <span>{formatDateTime(user.codeforces_last_synced_at)}</span>
                    <div className="profile-cf-actions">
                      <button type="button" className="lp-btn" onClick={handleCodeforcesRefresh} disabled={savingCf}>
                        {savingCf ? 'Sincronizando...' : 'Atualizar dados'}
                      </button>
                      <button type="button" className="lp-btn lp-btn-ghost" onClick={handleCodeforcesDisconnect} disabled={savingCf}>
                        Desconectar
                      </button>
                    </div>
                  </div>
                </>
              )}

              {(!user.codeforces_handle || editingCf) && (
                <form onSubmit={handleCodeforcesSubmit} className="profile-form-inline">
                  <div className="profile-form-group">
                    <label htmlFor="cf-handle">Handle</label>
                    <input
                      id="cf-handle"
                      type="text"
                      value={cfDraft}
                      onChange={(event) => setCfDraft(event.target.value)}
                      placeholder="ex: tourist"
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

              {(cfMessage || cfError) && (
                <div className={`profile-alert ${cfError ? 'profile-alert-error' : 'profile-alert-success'}`}>
                  {cfError || cfMessage}
                </div>
              )}
            </div>

            <form className="profile-card" onSubmit={handlePasswordChange}>
              <div className="profile-card-title">Alterar senha</div>
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
          </>
        )}
      </main>
    </div>
  );
};

export default ProfileEdit;
