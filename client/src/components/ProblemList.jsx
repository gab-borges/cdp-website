import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import './problems.css';

const SORT_KEYS = {
  id: 'id',
  title: 'title',
  difficulty: 'difficulty',
  points: 'points',
  solvers: 'solvers_count',
};

const ProblemList = () => {
  const { setHeaderUser } = useOutletContext() ?? {};
  const [me, setMe] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sort, setSort] = useState({ key: SORT_KEYS.id, direction: 'asc' });
  const [showCreate, setShowCreate] = useState(false);
  const blankForm = useMemo(
    () => ({
      title: '',
      description: '',
      difficulty: '',
      points: '',
      judge: '',
      judge_identifier: '',
    }),
    []
  );
  const [createForm, setCreateForm] = useState(blankForm);
  const [createError, setCreateError] = useState('');
  const [createMessage, setCreateMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(blankForm);
  const [editError, setEditError] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const isAdmin = me?.role === 'admin';

  const loadProblems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/v1/problems');
      setProblems(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to load problems.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMe = useCallback(async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/api/v1/me');
      setMe(data);
    } catch (err) {
      console.error('Failed to load current user for problems page:', err);
    }
  }, []);

  useEffect(() => {
    loadProblems();
    loadMe();
  }, [loadMe, loadProblems]);

  useEffect(() => {
    if (!setHeaderUser || !me) return;
    setHeaderUser(me);
  }, [me, setHeaderUser]);

  useEffect(() => {
    if (!createMessage) return undefined;
    const timeoutId = setTimeout(() => setCreateMessage(''), 3000);
    return () => clearTimeout(timeoutId);
  }, [createMessage]);

  useEffect(() => {
    if (!editMessage) return undefined;
    const timeoutId = setTimeout(() => setEditMessage(''), 3000);
    return () => clearTimeout(timeoutId);
  }, [editMessage]);

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const parsePoints = (value) => {
    if (!value || !String(value).trim()) return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  };

  const buildPayload = (form) => {
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      difficulty: form.difficulty.trim() || null,
      judge: form.judge.trim() || null,
      judge_identifier: form.judge_identifier.trim() || null,
    };
    const points = parsePoints(form.points);
    if (points != null) payload.points = points;
    return payload;
  };

  const resetCreateForm = () => {
    setCreateForm(blankForm);
    setCreateError('');
    setCreateMessage('');
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    if (!createForm.title.trim()) {
      setCreateError('Informe um título para o problema.');
      return;
    }

    try {
      setCreating(true);
      setCreateError('');
      const payload = { problem: buildPayload(createForm) };
      const { data } = await axios.post('http://localhost:3000/api/v1/problems', payload);
      setProblems((prev) => [data, ...prev]);
      setCreateMessage('Problema criado com sucesso.');
      resetCreateForm();
      setShowCreate(false);
    } catch (err) {
      console.error('Falha ao criar problema:', err);
      const message = err?.response?.data?.errors?.join(' ') || err.message || 'Não foi possível criar o problema.';
      setCreateError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingId) return;
    if (!editForm.title.trim()) {
      setEditError('Informe um título para o problema.');
      return;
    }

    try {
      setSavingEdit(true);
      setEditError('');
      const payload = { problem: buildPayload(editForm) };
      const { data } = await axios.patch(`http://localhost:3000/api/v1/problems/${editingId}`, payload);
      setProblems((prev) => prev.map((problem) => (problem.id === data.id ? data : problem)));
      setEditMessage('Problema atualizado.');
      setEditingId(null);
      setEditForm(blankForm);
    } catch (err) {
      console.error('Falha ao atualizar problema:', err);
      const message = err?.response?.data?.errors?.join(' ') || err.message || 'Não foi possível atualizar o problema.';
      setEditError(message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (problem) => {
    if (!window.confirm(`Remover o problema "${problem.title}"? Esta ação não pode ser desfeita.`)) return;
    try {
      setDeletingId(problem.id);
      await axios.delete(`http://localhost:3000/api/v1/problems/${problem.id}`);
      setProblems((prev) => prev.filter((item) => item.id !== problem.id));
    } catch (err) {
      console.error('Falha ao remover problema:', err);
      alert('Não foi possível remover o problema. Tente novamente.');
    } finally {
      setDeletingId(null);
    }
  };

  const beginEdit = (problem) => {
    setEditError('');
    setEditMessage('');
    setEditingId(problem.id);
    setEditForm({
      title: problem.title || '',
      description: problem.description || '',
      difficulty: problem.difficulty || '',
      points: problem.points != null ? String(problem.points) : '',
      judge: problem.judge || '',
      judge_identifier: problem.judge_identifier || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(blankForm);
    setEditError('');
  };

  const difficulties = useMemo(() => {
    const set = new Set();
    problems.forEach((p) => {
      if (p?.difficulty) set.add(p.difficulty);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [problems]);

  const filteredProblems = useMemo(() => {
    const term = search.trim().toLowerCase();
    const byQuery = (problem) => {
      if (!term) return true;
      const haystacks = [problem.title, problem.source, problem.difficulty, problem.tags?.join(' ')];
      return haystacks.filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
    };

    const byDifficulty = (problem) => {
      if (difficultyFilter === 'all') return true;
      return problem?.difficulty === difficultyFilter;
    };

    const sorted = [...problems].filter(byQuery).filter(byDifficulty);

    const compare = (a, b) => {
      const { key, direction } = sort;
      const dir = direction === 'desc' ? -1 : 1;
      const av = a?.[key];
      const bv = b?.[key];

      if (key === SORT_KEYS.title || key === SORT_KEYS.difficulty) {
        return String(av || '').localeCompare(String(bv || '')) * dir;
      }

      const numA = Number(av ?? 0);
      const numB = Number(bv ?? 0);
      if (Number.isNaN(numA) || Number.isNaN(numB)) {
        return String(av || '').localeCompare(String(bv || '')) * dir;
      }
      return (numA - numB) * dir;
    };

    return sorted.sort(compare);
  }, [difficultyFilter, problems, search, sort]);

  const handleSort = (key) => {
    setSort((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSortKeyDown = (event, key) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSort(key);
    }
  };

  const renderSortIndicator = (key) => {
    if (sort.key !== key) return <span className="table-sort">⇅</span>;
    return <span className="table-sort active">{sort.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="problems-root">
      <main className="problems-main problems-container">
        <div className="problem-head">
          <div>
            <h1 className="problem-detail-title">Problemas</h1>
            <p className="problem-sub">Explore a lista de problemas</p>
          </div>
          {isAdmin && (
            <button type="button" className="lp-btn" onClick={() => setShowCreate((prev) => !prev)}>
              {showCreate ? 'Ocultar formulário' : 'Novo problema'}
            </button>
          )}
          <div className="problem-filters">
            <div className="filter-group">
              <label htmlFor="problem-search">Buscar</label>
              <input
                id="problem-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Título, dificuldade ou tag"
              />
            </div>
            <div className="filter-group">
              <label htmlFor="problem-difficulty">Dificuldade</label>
              <select
                id="problem-difficulty"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="all">Todas</option>
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {isAdmin && showCreate && (
          <section className="problem-card problem-admin-form">
            <h2 className="problem-admin-title">Cadastrar problema</h2>
            <form className="problem-admin-grid" onSubmit={handleCreateSubmit}>
              <label className="problem-admin-field" htmlFor="new-problem-title">
                <span>Título</span>
                <input
                  id="new-problem-title"
                  name="title"
                  type="text"
                  value={createForm.title}
                  onChange={handleCreateChange}
                  placeholder="Título do problema"
                  disabled={creating}
                  required
                />
              </label>
              <label className="problem-admin-field" htmlFor="new-problem-difficulty">
                <span>Dificuldade</span>
                <input
                  id="new-problem-difficulty"
                  name="difficulty"
                  type="text"
                  value={createForm.difficulty}
                  onChange={handleCreateChange}
                  placeholder="Ex: fácil, médio, difícil"
                  disabled={creating}
                />
              </label>
              <label className="problem-admin-field" htmlFor="new-problem-points">
                <span>Pontos</span>
                <input
                  id="new-problem-points"
                  name="points"
                  type="number"
                  value={createForm.points}
                  onChange={handleCreateChange}
                  placeholder="Valor em pontos"
                  disabled={creating}
                  min="0"
                />
              </label>
              <label className="problem-admin-field" htmlFor="new-problem-judge">
                <span>Plataforma</span>
                <input
                  id="new-problem-judge"
                  name="judge"
                  type="text"
                  value={createForm.judge}
                  onChange={handleCreateChange}
                  placeholder="Codeforces, Kattis..."
                  disabled={creating}
                />
              </label>
              <label className="problem-admin-field" htmlFor="new-problem-identifier">
                <span>Identificador</span>
                <input
                  id="new-problem-identifier"
                  name="judge_identifier"
                  type="text"
                  value={createForm.judge_identifier}
                  onChange={handleCreateChange}
                  placeholder="ID na plataforma"
                  disabled={creating}
                />
              </label>
              <label className="problem-admin-field problem-admin-span" htmlFor="new-problem-description">
                <span>Descrição</span>
                <textarea
                  id="new-problem-description"
                  name="description"
                  value={createForm.description}
                  onChange={handleCreateChange}
                  placeholder="Resumo do problema"
                  disabled={creating}
                  rows={4}
                />
              </label>

              {createError && <div className="problem-admin-alert problem-admin-alert-error">{createError}</div>}
              {createMessage && <div className="problem-admin-alert problem-admin-alert-success">{createMessage}</div>}

              <div className="problem-admin-actions">
                <button type="button" className="lp-btn lp-btn-ghost" onClick={resetCreateForm} disabled={creating}>
                  Limpar
                </button>
                <button type="submit" className="lp-btn" disabled={creating}>
                  {creating ? 'Salvando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </section>
        )}

        {editingId && (
          <section className="problem-card problem-admin-form">
            <h2 className="problem-admin-title">Editar problema</h2>
            <form className="problem-admin-grid" onSubmit={handleEditSubmit}>
              <label className="problem-admin-field" htmlFor="edit-problem-title">
                <span>Título</span>
                <input
                  id="edit-problem-title"
                  name="title"
                  type="text"
                  value={editForm.title}
                  onChange={handleEditChange}
                  placeholder="Título do problema"
                  disabled={savingEdit}
                  required
                />
              </label>
              <label className="problem-admin-field" htmlFor="edit-problem-difficulty">
                <span>Dificuldade</span>
                <input
                  id="edit-problem-difficulty"
                  name="difficulty"
                  type="text"
                  value={editForm.difficulty}
                  onChange={handleEditChange}
                  placeholder="Ex: fácil, médio, difícil"
                  disabled={savingEdit}
                />
              </label>
              <label className="problem-admin-field" htmlFor="edit-problem-points">
                <span>Pontos</span>
                <input
                  id="edit-problem-points"
                  name="points"
                  type="number"
                  value={editForm.points}
                  onChange={handleEditChange}
                  placeholder="Valor em pontos"
                  disabled={savingEdit}
                  min="0"
                />
              </label>
              <label className="problem-admin-field" htmlFor="edit-problem-judge">
                <span>Plataforma</span>
                <input
                  id="edit-problem-judge"
                  name="judge"
                  type="text"
                  value={editForm.judge}
                  onChange={handleEditChange}
                  placeholder="Codeforces, Kattis..."
                  disabled={savingEdit}
                />
              </label>
              <label className="problem-admin-field" htmlFor="edit-problem-identifier">
                <span>Identificador</span>
                <input
                  id="edit-problem-identifier"
                  name="judge_identifier"
                  type="text"
                  value={editForm.judge_identifier}
                  onChange={handleEditChange}
                  placeholder="ID na plataforma"
                  disabled={savingEdit}
                />
              </label>
              <label className="problem-admin-field problem-admin-span" htmlFor="edit-problem-description">
                <span>Descrição</span>
                <textarea
                  id="edit-problem-description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  placeholder="Resumo do problema"
                  disabled={savingEdit}
                  rows={4}
                />
              </label>

              {editError && <div className="problem-admin-alert problem-admin-alert-error">{editError}</div>}
              {editMessage && <div className="problem-admin-alert problem-admin-alert-success">{editMessage}</div>}

              <div className="problem-admin-actions">
                <button type="button" className="lp-btn lp-btn-ghost" onClick={cancelEdit} disabled={savingEdit}>
                  Cancelar
                </button>
                <button type="submit" className="lp-btn" disabled={savingEdit}>
                  {savingEdit ? 'Salvando...' : 'Atualizar'}
                </button>
              </div>
            </form>
          </section>
        )}

        {loading && <div className="problem-card">Carregando...</div>}
        {error && <div className="problem-card">{error}</div>}

        {!loading && !error && (
          <div className="problem-table-wrap">
            {filteredProblems.length === 0 ? (
              <div className="problem-card">Nenhum problema encontrado com os filtros atuais.</div>
            ) : (
              <table className="problem-table">
                <thead>
                  <tr>
                    <th
                      className="sortable col-id"
                      onClick={() => handleSort(SORT_KEYS.id)}
                      onKeyDown={(event) => handleSortKeyDown(event, SORT_KEYS.id)}
                      role="button"
                      tabIndex={0}
                    >
                      ID {renderSortIndicator(SORT_KEYS.id)}
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSort(SORT_KEYS.title)}
                      onKeyDown={(event) => handleSortKeyDown(event, SORT_KEYS.title)}
                      role="button"
                      tabIndex={0}
                    >
                      Problema {renderSortIndicator(SORT_KEYS.title)}
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSort(SORT_KEYS.difficulty)}
                      onKeyDown={(event) => handleSortKeyDown(event, SORT_KEYS.difficulty)}
                      role="button"
                      tabIndex={0}
                    >
                      Dificuldade {renderSortIndicator(SORT_KEYS.difficulty)}
                    </th>
                    <th
                      className="sortable col-points"
                      onClick={() => handleSort(SORT_KEYS.points)}
                      onKeyDown={(event) => handleSortKeyDown(event, SORT_KEYS.points)}
                      role="button"
                      tabIndex={0}
                    >
                      Pontos {renderSortIndicator(SORT_KEYS.points)}
                    </th>
                    <th
                      className="sortable col-solvers"
                      onClick={() => handleSort(SORT_KEYS.solvers)}
                      onKeyDown={(event) => handleSortKeyDown(event, SORT_KEYS.solvers)}
                      role="button"
                      tabIndex={0}
                    >
                      Soluções {renderSortIndicator(SORT_KEYS.solvers)}
                    </th>
                    {isAdmin && <th>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map((problem) => {
                    const difficulty = problem?.difficulty || '—';
                    const diffToken = problem?.difficulty
                      ? (problem.difficulty
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .replace(/[^a-z0-9]+/g, '-') || 'unknown')
                      : 'unknown';
                    const difficultyClass = `diff-pill diff-${diffToken}`;
                    const solversCount = Number(problem?.solvers_count ?? 0);
                    return (
                      <tr key={problem.id ?? problem.title}>
                        <td className="col-id">{problem.id ?? '—'}</td>
                        <td className="col-title">
                          <Link to={`/problem/${problem.id}`} className="problem-link">{problem.title}</Link>
                          {problem?.source && <span className="col-meta">{problem.source}</span>}
                        </td>
                        <td className="col-diff">
                          <span className={difficultyClass}>{difficulty}</span>
                        </td>
                        <td className="col-points">{problem.points ?? '—'}</td>
                        <td className="col-solvers">{solversCount.toLocaleString('pt-BR')}</td>
                        {isAdmin && (
                          <td className="col-actions">
                            <button
                              type="button"
                              className="lp-btn lp-btn-ghost problem-action"
                              onClick={() => beginEdit(problem)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="lp-btn lp-btn-ghost problem-action problem-action-danger"
                              onClick={() => handleDelete(problem)}
                              disabled={deletingId === problem.id}
                            >
                              {deletingId === problem.id ? 'Removendo...' : 'Remover'}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProblemList;
