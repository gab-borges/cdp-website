import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo-cdp.jpg';
import './problems.css';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/v1/problems');
        setProblems(response.data);
      } catch (error) {
        console.error('Error fetching problems:', error);
        setError('Failed to load problems.');
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  return (
    <div className="problems-root">
      <header className="problems-header">
        <div className="problems-container problems-headwrap">
          <Link to="/dashboard" className="problems-brand">
            <img src={logo} alt="Clube de Programação UTFPR" className="problems-logo" />
            <span>Clube de Programação • UTFPR-CT</span>
          </Link>
          <div className="problems-spacer" />
          <Link to="/dashboard" className="btn btn-ghost">Dashboard</Link>
        </div>
      </header>

      <main className="problems-main problems-container">
        <h1 className="problem-detail-title">Problemas</h1>
        {loading && <div className="problem-card">Carregando...</div>}
        {error && <div className="problem-card">{error}</div>}
        {!loading && !error && (
          <div>
            {problems.map(problem => (
              <div key={problem.id} className="problem-card">
                <h2 className="problem-card-title">
                  <Link to={`/problems/${problem.id}`}>{problem.title}</Link>
                </h2>
                <div className="problem-card-info">
                  <span>Dificuldade: {problem.difficulty}</span>
                  <span>Pontos: {problem.points}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProblemList;
