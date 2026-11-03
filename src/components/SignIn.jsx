import { useState } from 'react';
import { DEMO_USER } from '../data.js';
import { InfoIcon } from './icons.jsx';

export default function SignIn({ onSignIn }) {
  const [staffId, setStaffId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!staffId.trim() || !pin.trim()) {
      setError('Enter your staff ID and PIN.');
      return;
    }
    const ok =
      staffId.trim().toUpperCase() === DEMO_USER.staffId && pin.trim() === DEMO_USER.pin;
    if (!ok) {
      setError("That staff ID and PIN don't match. Check the demo credentials below.");
      return;
    }
    onSignIn({ staffId: DEMO_USER.staffId, name: DEMO_USER.name, role: DEMO_USER.role });
  }

  function useDemo() {
    setStaffId(DEMO_USER.staffId);
    setPin(DEMO_USER.pin);
    setError('');
  }

  return (
    <main className="app signin">
      <div className="blob-wrap" aria-hidden="true"><div className="blob" /></div>
      <p className="eyebrow">Housekeeping</p>
      <h1>Sign in to your shift</h1>
      <p className="demo-label">
        <InfoIcon width={18} height={18} />
        Demo sign-in only. This is not real authentication.
      </p>

      <form className="card form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="staff-id">Staff ID</label>
          <input
            id="staff-id"
            autoComplete="username"
            autoCapitalize="characters"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'signin-error' : undefined}
          />
        </div>
        <div className="field">
          <label htmlFor="pin">PIN</label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'signin-error' : undefined}
          />
        </div>
        {error && (
          <p id="signin-error" className="error" role="alert">{error}</p>
        )}
        <button type="submit" className="btn primary block">Sign in</button>
      </form>

      <section className="card demo-creds" aria-labelledby="demo-creds-title">
        <h2 id="demo-creds-title">Demo credentials for reviewers</h2>
        <dl>
          <div><dt>Staff ID</dt><dd>{DEMO_USER.staffId}</dd></div>
          <div><dt>PIN</dt><dd>{DEMO_USER.pin}</dd></div>
        </dl>
        <p className="muted">Signs in as {DEMO_USER.name}, {DEMO_USER.role}.</p>
        <button type="button" className="btn secondary block" onClick={useDemo}>
          Fill in demo credentials
        </button>
      </section>
    </main>
  );
}
