import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ranking.css';

const Ranking = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rankingType, setRankingType] = useState('general'); // 'general' or 'monthly'

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get('/api/v1/users');
        setUsers(data);
      } catch (err) {
        console.error('Error fetching ranking:', err);
        setError('Failed to load ranking.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const sortedUsers = useMemo(() => {
    const sorted = [...users].sort((a, b) => {
      if (rankingType === 'monthly') {
        return (b.monthly_score || 0) - (a.monthly_score || 0);
      }
      return (b.total_score || 0) - (a.total_score || 0);
    });
    return sorted;
  }, [users, rankingType]);

  return (
    <div className="ranking-root">
      <main className="ranking-main ranking-container">
        <div className="ranking-header">
          <h1 className="ranking-title">Ranking</h1>
          <div className="ranking-tabs">
            <button
              type="button"
              className={`ranking-tab ${rankingType === 'general' ? 'active' : ''}`}
              onClick={() => setRankingType('general')}
            >
              Geral
            </button>
            <button
              type="button"
              className={`ranking-tab ${rankingType === 'monthly' ? 'active' : ''}`}
              onClick={() => setRankingType('monthly')}
            >
              Mensal
            </button>
          </div>
        </div>
        {loading && <div className="ranking-card">Loading...</div>}
        {error && <div className="ranking-card ranking-error">{error}</div>}
        {!loading && !error && (
          <div className="ranking-card">
            <div className="ranking-table-head">
              <div>#</div>
              <div>Membro</div>
              <div className="ranking-right">Pontos</div>
            </div>
            <div className="ranking-divider" />
            {sortedUsers.map((user, index) => {
              const avatarUrl = user.codeforces_title_photo;
              const avatarFallback = user.username?.slice(0, 1).toUpperCase() || '?';
              const score = rankingType === 'monthly' ? user.monthly_score : user.total_score;

              return (
                <div className="ranking-row" key={user.id ?? index}>
                  <div className="ranking-strong">{index + 1}</div>
                  <div className="ranking-user-cell">
                    <div className="ranking-avatar" aria-hidden={!avatarUrl}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="ranking-avatar-img" />
                      ) : (
                        <span>{avatarFallback}</span>
                      )}
                    </div>
                    <div className="ranking-truncate">
                      {user?.username ? (
                        <Link className="ranking-link" to={`/profile/${user.username}`}>
                          {user.username}
                        </Link>
                      ) : (
                        <span>{user.username}</span>
                      )}
                    </div>
                  </div>
                  <div className="ranking-right ranking-mono">{(score ?? 0).toLocaleString('pt-BR')}</div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Ranking;
