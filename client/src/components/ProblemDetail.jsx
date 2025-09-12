import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProblemDetail = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('c++');

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`/api/v1/problems/${id}`);
        setProblem(response.data);
      } catch (error) {
        console.error('Error fetching problem:', error);
      }
    };

    fetchProblem();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/v1/submissions', {
        submission: { problem_id: id, language, code, status: 'pending' },
      });

      if (response.status === 201) {
        alert('Submission sent successfully!');
      } else {
        alert('Failed to send submission.');
      }
    } catch (error) {
      console.error('Error sending submission:', error);
    }
  };

  if (!problem) return <div>Loading...</div>;

  return (
    <div>
      <h2>{problem.title}</h2>
      <p>{problem.description}</p>
      <p>Points: {problem.points}</p>
      <p>Difficulty: {problem.difficulty}</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Language:</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="c++">C++</option>
            <option value="c">C</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>
        <div>
          <label>Code:</label>
          <textarea value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ProblemDetail;
