import { CheckIcon, CloseIcon } from './icons.jsx';

// Always mounted so the live region announces updates.
export default function Toasts({ undoRoom, nextRoom, onUndo, onDismissUndo, notice, onDismissNotice }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {notice && (
        <div className="toast">
          <p>{notice}</p>
          <button type="button" className="toast-icon-btn" onClick={onDismissNotice} aria-label="Dismiss message">
            <CloseIcon />
          </button>
        </div>
      )}
      {undoRoom != null && (
        <div className="toast">
          <CheckIcon className="toast-check" />
          <p>
            <strong>Room {undoRoom}: Clean — awaiting inspection.</strong>
            {nextRoom && <span className="toast-sub">Next up: room {nextRoom.number}</span>}
          </p>
          <button type="button" className="toast-action" onClick={onUndo}>
            Undo
          </button>
          <button type="button" className="toast-icon-btn" onClick={onDismissUndo} aria-label="Dismiss">
            <CloseIcon />
          </button>
        </div>
      )}
    </div>
  );
}
