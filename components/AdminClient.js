'use client';
import { useEffect, useState } from 'react';

const EMPTY = { slug: '', title: '', description: '', date: '', keywords: '', content: '' };

export default function AdminClient() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null); // slug being edited, or null for new
  const [msg, setMsg] = useState(null);

  async function load() {
    const res = await fetch('/api/admin/posts');
    const data = await res.json();
    if (data.ok) setPosts(data.posts);
  }
  useEffect(() => { load(); }, []);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function edit(slug) {
    const res = await fetch('/api/admin/posts/' + slug);
    const data = await res.json();
    if (data.ok) {
      const p = data.post;
      setForm({ slug: p.slug, title: p.title, description: p.description, date: p.date, keywords: p.keywords, content: p.raw || '' });
      setEditing(slug);
      setMsg(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setMsg({ type: 'err', text: data.error || 'Could not load post' });
    }
  }

  async function save(e) {
    e.preventDefault();
    setMsg(null);
    const url = editing ? '/api/admin/posts/' + editing : '/api/admin/posts';
    const res = await fetch(url, {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.ok) {
      setMsg({ type: 'ok', text: (editing ? 'Updated' : 'Created') + ' — /blog/' + data.slug });
      setForm(EMPTY);
      setEditing(null);
      load();
    } else {
      setMsg({ type: 'err', text: data.error || 'Save failed' });
    }
  }

  async function remove(slug) {
    if (!confirm('Delete "' + slug + '"? This cannot be undone.')) return;
    const res = await fetch('/api/admin/posts/' + slug, { method: 'DELETE' });
    const data = await res.json();
    if (data.ok) { setMsg({ type: 'ok', text: 'Deleted ' + slug }); load(); }
    else setMsg({ type: 'err', text: data.error || 'Delete failed' });
  }

  function cancel() { setForm(EMPTY); setEditing(null); setMsg(null); }

  return (
    <div className="container">
      <div className="admin-wrap" style={{ marginTop: 32, marginBottom: 48 }}>
        <h1>Blog admin</h1>
        <p>Posts are Markdown files in <code>content/blog/</code>. New posts appear on /blog instantly.</p>

        {msg && <div className={msg.type === 'ok' ? 'msg-ok' : 'msg-err'}>{msg.text}</div>}

        <div className="card" style={{ marginBottom: 28 }}>
          <h2 style={{ marginTop: 0 }}>{editing ? 'Edit post' : 'New post'}</h2>
          <form onSubmit={save}>
            <div className="field">
              <label>Title *</label>
              <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} required
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8 }} />
            </div>
            {!editing && (
              <div className="field">
                <label>Slug (optional — auto-generated from title)</label>
                <input type="text" value={form.slug} onChange={(e) => set('slug', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8 }} />
              </div>
            )}
            <div className="field">
              <label>Meta description</label>
              <input type="text" value={form.description} onChange={(e) => set('description', e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8 }} />
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Date (YYYY-MM-DD)</label>
                <input type="text" value={form.date} onChange={(e) => set('date', e.target.value)} placeholder="2026-09-30"
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8 }} />
              </div>
              <div className="field" style={{ flex: 2 }}>
                <label>Keywords (comma separated)</label>
                <input type="text" value={form.keywords} onChange={(e) => set('keywords', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8 }} />
              </div>
            </div>
            <div className="field">
              <label>Content (Markdown) *</label>
              <textarea className="code" rows={14} value={form.content} onChange={(e) => set('content', e.target.value)} required
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8 }} />
            </div>
            <div className="admin-bar">
              <button className="btn btn-primary" type="submit">{editing ? 'Update post' : 'Publish post'}</button>
              {editing && <button className="btn btn-secondary" type="button" onClick={cancel}>Cancel</button>}
            </div>
          </form>
        </div>

        <h2>All posts ({posts.length})</h2>
        <table className="admin-table">
          <thead>
            <tr><th>Title</th><th>Date</th><th>URL</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.slug}>
                <td>{p.title}</td>
                <td>{p.date}</td>
                <td><a href={'/blog/' + p.slug} target="_blank" rel="noreferrer">/blog/{p.slug}</a></td>
                <td>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', marginRight: 8 }} onClick={() => edit(p.slug)}>Edit</button>
                  <button className="btn btn-danger" style={{ padding: '6px 12px' }} onClick={() => remove(p.slug)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
