import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import markedKatex from 'marked-katex-extension';
import 'katex/dist/katex.min.css';
import logo from '../assets/logo-cdp.jpg';
import './problems.css';

marked.setOptions({ gfm: true, breaks: true });
marked.use(markedKatex({ throwOnError: false }));

const SANITIZE_CONFIG = {
  ADD_TAGS: ['math', 'annotation', 'semantics', 'mrow', 'mi', 'mn', 'mo', 'msup', 'mfrac', 'mtable', 'mtr', 'mtd', 'mstyle', 'mspace', 'mtext', 'button'],
  ADD_ATTR: ['class', 'style', 'href', 'target', 'rel', 'aria-hidden', 'aria-label', 'role', 'type'],
  ALLOW_DATA_ATTR: true,
};

const ProblemDetail = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('C++');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const markdownRef = useRef(null);

  const sanitizedDescription = useMemo(() => {
    if (!problem?.description) return '';

    const rawHtml = marked.parse(problem.description);
    if (typeof window === 'undefined') return rawHtml;

    return DOMPurify.sanitize(rawHtml, SANITIZE_CONFIG);
  }, [problem?.description]);

  useEffect(() => {
    const container = markdownRef.current;
    if (!container) return undefined;

    const preBlocks = Array.from(container.querySelectorAll('pre'));
    const cleanupCallbacks = [];

    preBlocks.forEach((pre) => {
      if (pre.parentElement?.classList?.contains('code-block-wrapper')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-button';
      button.textContent = 'Copy';

      const resetAfterCopy = () => {
        button.disabled = false;
        button.textContent = 'Copy';
      };

      const handleClick = async () => {
        try {
          await navigator.clipboard.writeText(pre.innerText);
          button.textContent = 'Copied!';
        } catch (err) {
          console.error('Failed to copy snippet:', err);
          button.textContent = 'Error';
        } finally {
          button.disabled = true;
          setTimeout(resetAfterCopy, 1500);
        }
      };

      button.addEventListener('click', handleClick);
      wrapper.appendChild(button);

      cleanupCallbacks.push(() => {
        button.removeEventListener('click', handleClick);
        button.remove();
        if (wrapper.contains(pre)) {
          wrapper.parentNode?.insertBefore(pre, wrapper);
        }
        wrapper.remove();
      });
    });

    return () => {
      cleanupCallbacks.forEach((fn) => fn());
    };
  }, [sanitizedDescription]);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/v1/problems/${id}`);
        setProblem(response.data);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setError('Failed to load problem.');
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post('/api/v1/submissions', {
        submission: { problem_id: id, language, code },
      });

      if (response.status === 201) {
        alert('Submission sent successfully!');
        setCode('');
      } else {
        alert('Failed to send submission.');
      }
    } catch (error) {
      console.error('Error sending submission:', error);
      alert('An error occurred while sending the submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="problems-root">
      <header className="problems-header">
        <div className="problems-container problems-headwrap">
          <Link to="/dashboard" className="problems-brand">
            <img src={logo} alt="Clube de Programação UTFPR" className="problems-logo" />
            <span>Clube de Programação • UTFPR-CT</span>
          </Link>
          <div className="problems-spacer" />
          <Link to="/problems" className="btn btn-ghost">Todos os Problemas</Link>
        </div>
      </header>

      <main className="problems-main problems-container">
        {loading && <div className="problem-card">Loading...</div>}
        {error && <div className="problem-card">{error}</div>}
        {!loading && !error && problem && (
          <div className="problem-detail-card">
            <h1 className="problem-detail-title">{problem.title}</h1>
            <div className="problem-card-info">
              <span>Dificuldade: {problem.difficulty}</span>
              <span>Pontos: {problem.points}</span>
            </div>
            <div className="problem-detail-body">
              {sanitizedDescription ? (
                <div
                  ref={markdownRef}
                  className="markdown-body"
                  dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                />
              ) : (
                <p>Este problema ainda não possui descrição.</p>
              )}
            </div>

            <div className="submission-form">
              <h3>Envie Sua Solução</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="language">Linguagem</label>
                  <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="C++">C++</option>
                    <option value="C">C</option>
                    <option value="Python 3">Python</option>
                    <option value="Java">Java</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="code">Código</label>
                  <textarea id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Escreva seu código..." />
                </div>
                <button type="submit" className="btn" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProblemDetail;
