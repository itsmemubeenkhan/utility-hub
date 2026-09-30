'use client';
import { useState } from 'react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.ok) window.location.reload();
    else setError(data.error || 'Login failed');
  }

  return (
    <div className="container">
      <div className="admin-wrap" style={{ marginTop: 48 }}>
        <div className="card">
          <h1 style={{ marginTop: 0 }}>Admin login</h1>
          <p>Enter the admin password (ADMIN_PASSWORD env var) to manage blog posts.</p>
          <form onSubmit={submit}>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8 }}
              />
            </div>
            {error && <div className="msg-err">{error}</div>}
            <button className="btn btn-primary" type="submit">Log in</button>
          </form>
        </div>
      </div>
    </div>
  );
}
