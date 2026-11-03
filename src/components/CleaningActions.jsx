import { CheckIcon, PauseIcon, PlayIcon } from './icons.jsx';

export default function CleaningActions({ room, active, onStart, onPause, onComplete, busyHintId }) {
  if (room.task === 'not_started') {
    const blocked = Boolean(active);
    return (
      <button
        type="button"
        className="btn primary block"
        disabled={blocked}
        aria-describedby={blocked ? busyHintId : undefined}
        onClick={() => onStart(room.number)}
      >
        <PlayIcon /> Start clean
      </button>
    );
  }

  if (room.task === 'in_progress') {
    return (
      <div className="btn-row">
        <button type="button" className="btn secondary" onClick={() => onPause(room.number)}>
          <PauseIcon /> Pause cleaning
        </button>
        <button type="button" className="btn primary" onClick={() => onComplete(room.number)}>
          <CheckIcon /> Mark clean
        </button>
      </div>
    );
  }

  return null;
}
