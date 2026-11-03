import { MessageIcon, MyWorkIcon } from './icons.jsx';

// Messages is intentionally inert (out of scope).
export default function BottomNav({ onMyWork }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      <button type="button" className="nav-item" aria-disabled="true" onClick={(e) => e.preventDefault()}>
        <MessageIcon width={26} height={26} />
        <span>Messages</span>
        <span className="sr-only">, not available in this demo</span>
      </button>
      <button type="button" className="nav-item current" aria-current="page" onClick={onMyWork}>
        <MyWorkIcon width={26} height={26} />
        <span>My work</span>
      </button>
    </nav>
  );
}
