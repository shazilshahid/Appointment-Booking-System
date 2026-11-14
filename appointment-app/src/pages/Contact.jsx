import React, { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  function submit(e) {
    e.preventDefault();
    alert('Message sent (frontend-only demo).');
    setForm({ name: '', email: '', message: '' });
  }

  return (
    <main className="container">
      <h2>Contact Us</h2>
      <form className="mb-4" onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Your Name</label>
          <input className="form-control" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div className="mb-3">
          <label className="form-label">Your Email</label>
          <input className="form-control" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div className="mb-3">
          <label className="form-label">Message</label>
          <textarea className="form-control" rows="4" value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
        </div>
        <button className="btn btn-primary" type="submit">Send</button>
      </form>
    </main>
  );
}