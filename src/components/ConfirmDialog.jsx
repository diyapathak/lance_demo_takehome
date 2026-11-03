import Modal from './Modal.jsx';

export default function ConfirmDialog({ title, body, confirmLabel, onConfirm, onCancel }) {
  return (
    <Modal className="confirm" labelledBy="confirm-title" onClose={onCancel}>
      <h2 id="confirm-title">{title}</h2>
      <p>{body}</p>
      <div className="btn-row">
        <button type="button" className="btn secondary" onClick={onCancel} autoFocus>
          Cancel
        </button>
        <button type="button" className="btn danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
