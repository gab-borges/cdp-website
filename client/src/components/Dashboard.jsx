import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import './dashboard.css';

function Dashboard({ onLogout }) {
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [{ data: meData }, { data: usersData }] = await Promise.all([
          axios.get('http://localhost:3000/api/v1/me'),
          axios.get('http://localhost:3000/api/v1/users'),
        ]);
        if (mounted) {
          setMe(meData);
          setUsers(usersData);
        }
      } catch (e) {
        console.error('Erro ao carregar dados do dashboard:', e);
        if (mounted) setError('Falha ao carregar seus dados.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const topUsers = useMemo(() => {
    const arr = Array.isArray(users) ? [...users] : [];
    return arr.sort((a, b) => (b?.score || 0) - (a?.score || 0)).slice(0, 5);
  }, [users]);

  return (
    <div className="db-root">
      <Header onLogout={onLogout} currentUser={me} />

      <main className="db-main db-container">
        {loading && (
          <div className="db-card">Carregando...</div>
        )}
        {error && (
          <div className="db-card db-error">{error}</div>
        )}

        {!loading && !error && (
          <div className="db-grid">
            <section className="db-card">
              <div className="db-card-title">Resumo</div>
              <div className="db-row db-row--info">
                <div className="db-label">Nome</div>
                <div className="db-value">{me?.name}</div>
              </div>
              <div className="db-row db-row--info">
                <div className="db-label">Email</div>
                <div className="db-value">{me?.email}</div>
              </div>
              <div className="db-row db-row--info">
                <div className="db-label">Pontuação</div>
                <div className="db-value db-mono">{me?.score ?? 0} pts</div>
              </div>
            </section>

            <section className="db-card">
              <div className="db-card-title">Próximos eventos</div>
              <div className="db-muted">Em breve: integraremos com /api/v1/events</div>
              <ul className="db-list">
                <li>Treino Semanal • Terças 18:40 • CB-106</li>
                <li>Simulado Maratona • Sábado 09:00 • Lab 2</li>
              </ul>
            </section>

            <section className="db-card">
              <div className="db-card-title">Ranking (Top 5)</div>
              <div className="db-table-head">
                <div>#</div>
                <div>Membro</div>
                <div className="db-right">Pontos</div>
              </div>
              <div className="db-divider" />
              {topUsers.map((u, i) => (
                <div className="db-row" key={u.id ?? i}>
                  <div className="db-strong">{i + 1}</div>
                  <div className="db-truncate">
                    {u?.id ? (
                      <Link className="db-link" to={`/profile/${u.id}`}>{u.name}</Link>
                    ) : (
                      <span>{u.name}</span>
                    )}
                  </div>
                  <div className="db-right db-mono">{u.score ?? 0}</div>
                </div>
              ))}
            </section>

            <section className="db-card">
              <div className="db-card-title">Meu progresso</div>
              <div className="db-muted">Após validação das integrações, exibiremos estatísticas (Codeforces/AtCoder).</div>
              <div className="db-placeholder" />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
