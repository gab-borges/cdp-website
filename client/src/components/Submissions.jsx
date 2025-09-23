import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './submissions.css';

const STATUS_CLASSES = {
  accepted: 'status-accepted',
  'wrong answer': 'status-wrong',
  'time limit': 'status-time',
  'time limit exceeded': 'status-time',
  'runtime error': 'status-runtime',
  'compilation error': 'status-compilation',
  'judge error': 'status-judge',
  pending: 'status-pending',
  submitted: 'status-submitted',
  processing: 'status-pending',
  'submission failed': 'status-failed',
  'execution error': 'status-failed',
};

const STATUS_LABELS = {
  accepted: 'Aceito',
  processing: 'Processando...',
  pending: 'Pendente',
  submitted: 'Enviado',
  'wrong answer': 'Wrong Answer',
  'time limit': 'Time Limit',
  'time limit exceeded': 'Time Limit',
  'runtime error': 'Runtime Error',
  'compilation error': 'Compilation Error',
  'judge error': 'Judge Error',
  'submission failed': 'Falha no envio',
  'execution error': 'Erro de execução',
};

const formatStatus = (status) => {
  if (!status) return '—';
  const key = String(status).toLowerCase();
  return STATUS_LABELS[key] || status;
};

const formatStatusClass = (status) => {
  const key = String(status || '').toLowerCase();
  return STATUS_CLASSES[key] || 'status-unknown';
};

const formatTime = (value) => {
  if (value === null || value === undefined) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  if (num === 0) return '0 s';
  if (num < 1) return `${num.toFixed(3)} s`;
  if (num < 10) return `${num.toFixed(2)} s`;
  return `${num.toFixed(1)} s`;
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const Submissions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [problemsMap, setProblemsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [bannerMessage, setBannerMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [submissionRes, problemRes] = await Promise.all([
          axios.get('/api/v1/submissions'),
          axios.get('/api/v1/problems'),
        ]);
        if (!mounted) return;
        const problemList = Array.isArray(problemRes.data) ? problemRes.data : [];
        const map = problemList.reduce((acc, problem) => {
          if (problem?.id != null) acc[problem.id] = problem;
          return acc;
        }, {});
        setProblemsMap(map);
        setSubmissions(Array.isArray(submissionRes.data) ? submissionRes.data : []);
      } catch (err) {
        console.error('Erro ao carregar submissões:', err);
        if (mounted) setError('Falha ao carregar suas submissões.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  const newSubmissionId = location.state?.newSubmissionId;

  useEffect(() => {
    if (!newSubmissionId) return;
    setHighlightId(newSubmissionId);
    setBannerMessage('Seu envio foi registrado e está sendo processado. Recarregue em instantes para ver o resultado final.');
    navigate(location.pathname, { replace: true });
  }, [newSubmissionId, location.pathname, navigate]);

  useEffect(() => {
    if (!bannerMessage) return undefined;
    const timeoutId = setTimeout(() => setBannerMessage(''), 6000);
    return () => clearTimeout(timeoutId);
  }, [bannerMessage]);

  useEffect(() => {
    if (!highlightId) return undefined;
    const timeoutId = setTimeout(() => setHighlightId(null), 10000);
    return () => clearTimeout(timeoutId);
  }, [highlightId]);

  const statuses = useMemo(() => {
    const uniq = new Set();
    submissions.forEach((submission) => {
      if (submission?.status) uniq.add(submission.status);
    });
    return Array.from(uniq).sort((a, b) => a.localeCompare(b));
  }, [submissions]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return submissions.filter((submission) => {
      const problem = problemsMap[submission.problem_id];
      if (statusFilter !== 'all' && submission.status !== statusFilter) return false;
      if (!term) return true;
      const haystacks = [
        submission.status,
        submission.language,
        problem?.title,
        problem?.difficulty,
        problem?.judge,
      ];
      return haystacks.filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [problemsMap, search, statusFilter, submissions]);

  return (
    <div className="submissions-root">
      <main className="submissions-main submissions-container">
        <div className="submissions-head">
          <div>
            <h1 className="submissions-title">Minhas Submissões</h1>
            <p className="submissions-sub">Acompanhe o histórico recente de envios e seus resultados.</p>
          </div>
          <div className="submissions-filters">
            <div className="filter-group">
              <label htmlFor="submission-search">Buscar</label>
              <input
                id="submission-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Problema, status ou linguagem"
              />
            </div>
            <div className="filter-group">
              <label htmlFor="submission-status">Status</label>
              <select
                id="submission-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">Todos</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {bannerMessage && <div className="submissions-card submissions-banner">{bannerMessage}</div>}
        {loading && <div className="submissions-card">Carregando...</div>}
        {error && <div className="submissions-card submissions-error">{error}</div>}

        {!loading && !error && (
          <div className="submissions-table-wrap">
            {filtered.length === 0 ? (
              <div className="submissions-card">Nenhuma submissão encontrada.</div>
            ) : (
              <table className="submissions-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Problema</th>
                    <th>Status</th>
                    <th>Linguagem</th>
                    <th>Tempo</th>
                    <th>Enviado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((submission) => {
                    const problem = problemsMap[submission.problem_id];
                    const statusClass = formatStatusClass(submission.status);
                    const isHighlighted = highlightId === submission.id;
                    return (
                      <tr
                        key={submission.id ?? `${submission.problem_id}-${submission.created_at}`}
                        className={isHighlighted ? 'submissions-highlight' : undefined}
                      >
                        <td className="col-numeric">{submission.id ?? '—'}</td>
                        <td className="col-problem">
                          <Link className="problem-link" to={`/problem/${submission.problem_id}`}>
                            {problem?.title || `Problema #${submission.problem_id}`}
                          </Link>
                          {problem?.difficulty && (
                            <span className="col-meta">{problem.difficulty}</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-pill ${statusClass}`}>
                            {formatStatus(submission.status)}
                          </span>
                        </td>
                        <td className="col-language">{submission.language || '—'}</td>
                        <td className="col-time">{formatTime(submission.execution_time)}</td>
                        <td className="col-datetime">{formatDateTime(submission.created_at)}</td>
                        <td className="col-actions">
                          <button
                            type="button"
                            className="lp-btn lp-btn-ghost"
                            onClick={() => setSelectedSubmission({ submission, problem })}
                          >
                            Ver código
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {selectedSubmission && (
        <div className="submission-modal" role="dialog" aria-modal="true">
          <div className="submission-modal-backdrop" onClick={() => setSelectedSubmission(null)} aria-hidden="true" />
          <div className="submission-modal-content">
            <div className="submission-modal-header">
              <div>
                <div className="submission-modal-title">{selectedSubmission.problem?.title || `Problema #${selectedSubmission.submission.problem_id}`}</div>
                <div className="submission-modal-meta">
                  {formatStatus(selectedSubmission.submission.status)} • {selectedSubmission.submission.language || '—'} • {formatDateTime(selectedSubmission.submission.created_at)}
                </div>
              </div>
              <button type="button" className="lp-btn lp-btn-ghost" onClick={() => setSelectedSubmission(null)}>
                Fechar
              </button>
            </div>
            <div className="submission-modal-body">
              <pre><code>{selectedSubmission.submission.code || '// sem conteúdo'}</code></pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;
