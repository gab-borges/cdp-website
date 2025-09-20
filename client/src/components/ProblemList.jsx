import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import './problems.css';

const SORT_KEYS = {
  id: 'id',
  title: 'title',
  difficulty: 'difficulty',
  points: 'points',
};

const ProblemList = ({ onLogout }) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sort, setSort] = useState({ key: SORT_KEYS.id, direction: 'asc' });

  useEffect(() => {
    const fetchProblems = async () => {
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
    };

    fetchProblems();
  }, []);

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
      <Header onLogout={onLogout} />

      <main className="problems-main problems-container">
        <div className="problem-head">
          <div>
            <h1 className="problem-detail-title">Problemas</h1>
            <p className="problem-sub">Explore a lista de problemas</p>
          </div>
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
                      className="sortable"
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
                      className="sortable"
                      onClick={() => handleSort(SORT_KEYS.points)}
                      onKeyDown={(event) => handleSortKeyDown(event, SORT_KEYS.points)}
                      role="button"
                      tabIndex={0}
                    >
                      Pontos {renderSortIndicator(SORT_KEYS.points)}
                    </th>
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
