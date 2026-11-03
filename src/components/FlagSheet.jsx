import { useState } from 'react';
import { FLAG_REASONS } from '../data.js';
import { LEVELS, compareRooms, effectivePriority, higherOf, isHigher } from '../priority.js';
import { PriorityBadge } from './Badges.jsx';
import { PriorityIcon } from './icons.jsx';
import Modal from './Modal.jsx';

function formFrom(room) {
  const f = room?.flag;
  return f
    ? { level: f.level, reason: f.reason, otherText: f.otherText, note: f.note }
    : { level: null, reason: null, otherText: '', note: '' };
}

export default function FlagSheet({ rooms, presetRoom, onSave, onRemove, onClose }) {
  const eligible = rooms
    .filter((r) => r.task !== 'done')
    .sort((a, b) =>
      a.task === 'in_progress' ? -1 : b.task === 'in_progress' ? 1 : compareRooms(a, b),
    );

  const [roomNumber, setRoomNumber] = useState(presetRoom);
  const room = eligible.find((r) => r.number === roomNumber) ?? null;
  const [form, setForm] = useState(() => formFrom(room));
  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function pickRoom(n) {
    setRoomNumber(n);
    setForm(formFrom(eligible.find((r) => r.number === n)));
    setErrors({});
  }

  function submit(e) {
    e.preventDefault();
    const next = {};
    if (!room) next.room = 'Choose a room to flag.';
    if (!form.level) next.level = 'Choose a priority.';
    if (!form.reason) next.reason = 'Choose a reason.';
    if (form.reason === 'Other' && !form.otherText.trim()) next.otherText = 'Add a short explanation.';
    setErrors(next);
    const firstError = ['room', 'level', 'reason', 'otherText'].find((k) => next[k]);
    if (firstError) {
      document.getElementById(`flag-${firstError}`)?.focus();
      return;
    }
    onSave(room.number, {
      level: form.level,
      reason: form.reason,
      otherText: form.reason === 'Other' ? form.otherText.trim() : '',
      note: form.reason === 'Other' ? '' : form.note.trim(),
    });
  }

  const sup = room?.supervisor.level;
  const result = room && form.level ? higherOf(sup, form.level) : null;
  let resultNote = '';
  if (result) {
    if (isHigher(sup, form.level)) {
      resultNote = `This room will remain ${sup} priority, as set by your supervisor. Your flag is still saved in room details.`;
    } else if (form.level === sup) {
      resultNote = `Same as the supervisor priority. Your reason will show on the room card.`;
    } else {
      resultNote = `Raises this room from ${sup} to ${result}.`;
    }
  }

  return (
    <Modal className="sheet" labelledBy="flag-title" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="sheet-body">
          <div className="sheet-grip" aria-hidden="true" />
          <h2 id="flag-title">{room?.flag ? 'Edit your flag' : 'Flag room'}</h2>
          <p className="muted">
            Raise a room's priority when something changes during your shift.
            You can't lower a priority your supervisor set.
          </p>

          {eligible.length === 0 ? (
            <p className="empty"><strong>All your rooms are done.</strong> Completed rooms can't be flagged.</p>
          ) : (
            <>
              {presetRoom != null && room ? (
                <p className="flag-room-fixed">
                  Room <strong>{room.number}</strong> · {room.service}
                </p>
              ) : (
                <fieldset className="fieldset">
                  <legend>Room</legend>
                  <div className="options room-options" id="flag-room" tabIndex={-1}>
                    {eligible.map((r) => (
                      <label key={r.number} className="option">
                        <input
                          type="radio"
                          name="flag-room"
                          checked={roomNumber === r.number}
                          onChange={() => pickRoom(r.number)}
                        />
                        <span className="option-main">Room {r.number}</span>
                        <span className="option-sub">
                          {r.task === 'in_progress' ? 'Cleaning now · ' : ''}
                          {effectivePriority(r).level} priority{r.flag ? ' · Flagged' : ''}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.room && <p className="error">{errors.room}</p>}
                </fieldset>
              )}

              <fieldset className="fieldset">
                <legend>Priority</legend>
                <div className="options level-options" id="flag-level" tabIndex={-1}>
                  {LEVELS.map((level) => (
                    <label key={level} className={`option level level-${level.toLowerCase()}`}>
                      <input
                        type="radio"
                        name="flag-level"
                        checked={form.level === level}
                        onChange={() => set('level', level)}
                      />
                      <PriorityIcon level={level} />
                      <span className="option-main">{level}</span>
                    </label>
                  ))}
                </div>
                {errors.level && <p className="error">{errors.level}</p>}
              </fieldset>

              <fieldset className="fieldset">
                <legend>Reason</legend>
                <div className="options reason-options" id="flag-reason" tabIndex={-1}>
                  {FLAG_REASONS.map((reason) => (
                    <label key={reason} className="option">
                      <input
                        type="radio"
                        name="flag-reason"
                        checked={form.reason === reason}
                        onChange={() => set('reason', reason)}
                      />
                      <span className="option-main">{reason}</span>
                    </label>
                  ))}
                </div>
                {errors.reason && <p className="error">{errors.reason}</p>}
              </fieldset>

              {form.reason === 'Other' ? (
                <div className="field">
                  <label htmlFor="flag-otherText">Explain briefly (required)</label>
                  <input
                    id="flag-otherText"
                    maxLength={60}
                    value={form.otherText}
                    onChange={(e) => set('otherText', e.target.value)}
                    aria-invalid={Boolean(errors.otherText)}
                    aria-describedby={errors.otherText ? 'flag-otherText-error' : undefined}
                  />
                  {errors.otherText && <p id="flag-otherText-error" className="error">{errors.otherText}</p>}
                </div>
              ) : form.reason ? (
                <div className="field">
                  <label htmlFor="flag-note">Note (optional)</label>
                  <textarea
                    id="flag-note"
                    rows={2}
                    maxLength={120}
                    value={form.note}
                    onChange={(e) => set('note', e.target.value)}
                  />
                </div>
              ) : null}

              {result && (
                <div className="result-preview" aria-live="polite">
                  <p className="result-label">Resulting priority</p>
                  <PriorityBadge level={result} />
                  <p className="small">{resultNote}</p>
                </div>
              )}

              <p className="muted small">
                Flagging doesn't change the cleaning status and isn't sent to anyone.
                Tell your supervisor or front desk directly if needed.
              </p>
            </>
          )}
        </div>

        <div className="sheet-footer">
          {room?.flag && (
            <button type="button" className="btn danger-text" onClick={() => onRemove(room.number)}>
              Remove my flag
            </button>
          )}
          <div className="btn-row">
            <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
            {eligible.length > 0 && (
              <button type="submit" className="btn primary">
                {room?.flag ? 'Update flag' : 'Save flag'}
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
