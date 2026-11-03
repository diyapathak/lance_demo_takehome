import { useState } from 'react';
import { MAX_PHOTOS_PER_ROOM, compressPhoto } from '../photos.js';
import { CameraIcon } from './icons.jsx';

export default function RoomPhotos({ room, onAdd, onRemove }) {
  const [pending, setPending] = useState(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmingRemove, setConfirmingRemove] = useState(null);

  const editable = room.task === 'in_progress';
  const { photos } = room;
  const full = photos.length >= MAX_PHOTOS_PER_ROOM;

  async function choose(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      setPending(await compressPhoto(file));
      setCaption('');
    } catch {
      setError("Couldn't read that image. Try a JPG or PNG photo.");
    } finally {
      setBusy(false);
    }
  }

  function save() {
    const photo = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      dataUrl: pending,
      caption: caption.trim(),
      addedAt: Date.now(),
    };
    if (onAdd(room.number, photo)) {
      setPending(null);
      setCaption('');
    } else {
      setError('Not enough storage on this device for another photo. Remove a photo or reset the demo.');
    }
  }

  return (
    <div className="photos">
      <div className="photos-head">
        <h3 className="notes-title">Photos</h3>
        <span className="muted small">Optional · {photos.length} of {MAX_PHOTOS_PER_ROOM}</span>
      </div>

      {photos.length > 0 && (
        <ul className="photo-grid">
          {photos.map((p, i) => (
            <li key={p.id} className="photo">
              <img src={p.dataUrl} alt={p.caption || `Photo ${i + 1} of room ${room.number}`} />
              {p.caption && <p className="photo-caption">{p.caption}</p>}
              {editable && (confirmingRemove === p.id ? (
                <div className="photo-confirm">
                  <button type="button" className="btn-small danger" onClick={() => { onRemove(room.number, p.id); setConfirmingRemove(null); }}>
                    Remove
                  </button>
                  <button type="button" className="btn-small" onClick={() => setConfirmingRemove(null)}>
                    Keep
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-small"
                  onClick={() => setConfirmingRemove(p.id)}
                  aria-label={`Remove photo ${i + 1}`}
                >
                  Remove
                </button>
              ))}
            </li>
          ))}
        </ul>
      )}

      {!editable && photos.length === 0 && (
        <p className="muted small">
          {room.task === 'done' ? 'No photos added.' : 'Start cleaning to add photos.'}
        </p>
      )}

      {editable && pending && (
        <div className="photo-pending">
          <img src={pending} alt="New photo preview" />
          <div className="field">
            <label htmlFor="photo-caption">Caption (optional)</label>
            <input
              id="photo-caption"
              maxLength={80}
              value={caption}
              placeholder="e.g. Stain on carpet by window"
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <div className="btn-row">
            <button type="button" className="btn secondary" onClick={() => setPending(null)}>Discard</button>
            <button type="button" className="btn primary" onClick={save}>Save photo</button>
          </div>
        </div>
      )}

      {editable && !pending && !full && (
        <label className={`btn secondary block file-btn${busy ? ' is-busy' : ''}`}>
          <input type="file" accept="image/*" className="sr-only" onChange={choose} disabled={busy} />
          <CameraIcon /> {busy ? 'Preparing photo…' : 'Add photo'}
        </label>
      )}
      {editable && full && !pending && (
        <p className="muted small">Photo limit reached for this room.</p>
      )}

      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
