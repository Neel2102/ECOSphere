import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [health, setHealth] = useState(null);

  useEffect(() => {
    // Fetch data from backend
    fetch('http://localhost:5000/')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error('Error:', err));

    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => console.error('Error:', err));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React + Express Application</h1>
        <p>{message}</p>
        {health && (
          <div className="health-check">
            <h2>API Health Check</h2>
            <p>Status: {health.status}</p>
            <p>Message: {health.message}</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
