import { activeRoom } from '../store.js';
import { sortTodo } from '../priority.js';
import RoomCard from './RoomCard.jsx';
import CleaningActions from './CleaningActions.jsx';
import { FlagIcon, InfoIcon, SearchIcon, SignOutIcon } from './icons.jsx';

const BUSY_HINT_ID = 'busy-hint';

// Checkout = departed guest (full service); Refresh = stayover.
const TYPE_FILTERS = {
  checkout: { label: 'Checkout', test: (r) => r.service === 'Full service' },
  refresh: { label: 'Refresh', test: (r) => r.service === 'Refresh' },
};

export default function MyRooms({
  rooms, session, tab, onTab, query, onQuery, typeFilter, onTypeFilter,
  onOpen, onStart, onPause, onComplete, onFlag, onSignOut, onReset,
}) {
  const active = activeRoom(rooms);
  const todo = sortTodo(rooms);
  const done = rooms
    .filter((r) => r.task === 'done')
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
  const remaining = rooms.length - done.length;

  const searching = query.trim() !== '';
  const filtering = searching || typeFilter !== 'all';
  const digits = query.replace(/\D/g, '');
  const matchesType = (r) => typeFilter === 'all' || TYPE_FILTERS[typeFilter].test(r);
  const matches = (r) =>
    matchesType(r) && (!searching || (digits !== '' && String(r.number).includes(digits)));
  const todoShown = todo.filter(matches);
  const doneShown = done.filter(matches);

  const tabs = [
    { id: 'todo', label: 'To do', count: todo.length },
    { id: 'progress', label: 'In progress', count: active ? 1 : 0 },
    { id: 'done', label: 'Done', count: done.length },
  ];

  const tabRooms = tab === 'todo' ? todo : tab === 'done' ? done : active ? [active] : [];
  const typePills = [
    { id: 'all', label: 'All', count: tabRooms.length },
    ...Object.entries(TYPE_FILTERS).map(([id, f]) => ({
      id, label: f.label, count: tabRooms.filter(f.test).length,
    })),
  ];

  const actionsFor = (room) => (
    <CleaningActions
      room={room}
      active={active}
      onStart={onStart}
      onPause={onPause}
      onComplete={onComplete}
      busyHintId={BUSY_HINT_ID}
    />
  );

  const activeCard = active && (
    <section className="active-section" aria-labelledby="active-title">
      <h2 id="active-title" className="section-title">Cleaning now</h2>
      <RoomCard room={active} onOpen={onOpen} actions={actionsFor(active)} />
    </section>
  );

  const noResults = (where) => (
    <div className="empty">
      <p>
        <strong>
          No {typeFilter === 'all' ? '' : `${TYPE_FILTERS[typeFilter].label.toLowerCase()} `}rooms
          in {where}{searching ? ` match “${query.trim()}”` : ''}.
        </strong>
      </p>
      {searching && <p className="muted">Search by room number, for example 106.</p>}
      <button
        type="button"
        className="btn secondary"
        onClick={() => { onQuery(''); onTypeFilter('all'); }}
      >
        Clear filters
      </button>
    </div>
  );

  return (
    <main className="app home">
      <div className="blob-wrap" aria-hidden="true"><div className="blob" /></div>

      <header className="home-header">
        <div className="header-top">
          <p className="eyebrow">Housekeeping</p>
          <button type="button" className="btn-text" onClick={onSignOut}>
            <SignOutIcon width={18} height={18} /> Sign out
          </button>
        </div>
        <h1>Your rooms for today</h1>
        <p className="staff-line">{session.name} · {session.role}</p>
        <div className="header-row">
          <p className="summary">
            <strong>{remaining}</strong> remaining · <strong>{done.length}</strong> completed
          </p>
          <button type="button" className="btn primary flag-btn" onClick={() => onFlag(null)}>
            <FlagIcon /> Flag room
          </button>
        </div>
      </header>

      <div className="filters" role="group" aria-label="Show rooms">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className="pill"
            aria-pressed={tab === t.id}
            onClick={() => onTab(t.id)}
          >
            {t.label} <span className="pill-count">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="type-filters" role="group" aria-label="Filter by service">
        {typePills.map((t) => (
          <button
            key={t.id}
            type="button"
            className="pill pill-outline"
            aria-pressed={typeFilter === t.id}
            onClick={() => onTypeFilter(t.id)}
          >
            {t.label} <span className="pill-count">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="search">
        <label htmlFor="room-search" className="sr-only">Search by room number</label>
        <SearchIcon className="search-icon" />
        <input
          id="room-search"
          type="search"
          inputMode="numeric"
          placeholder="Search room number"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
      </div>

      {tab === 'todo' && (
        <>
          {activeCard}
          <section aria-labelledby="todo-title">
            <div className="section-head">
              <h2 id="todo-title" className="section-title">To do</h2>
              <p className="sort-note">Priority first · Then room number</p>
            </div>
            {active && todo.length > 0 && (
              <p id={BUSY_HINT_ID} className="hint">
                <InfoIcon width={18} height={18} /> Finish or pause room {active.number} first.
              </p>
            )}
            {todoShown.length > 0 ? (
              <ul className="room-list">
                {todoShown.map((room, i) => (
                  <li key={room.number}>
                    <RoomCard
                      room={room}
                      onOpen={onOpen}
                      actions={actionsFor(room)}
                      upNext={!filtering && i === 0}
                    />
                  </li>
                ))}
              </ul>
            ) : filtering && todo.length > 0 ? (
              noResults('To do')
            ) : active ? (
              <div className="empty">
                <p><strong>Nothing else waiting.</strong></p>
                <p className="muted">Finish room {active.number} above.</p>
              </div>
            ) : (
              <div className="empty">
                <p><strong>All your rooms are done for today.</strong></p>
                <p className="muted">Completed rooms are awaiting inspection.</p>
                <button type="button" className="btn secondary" onClick={() => onTab('done')}>View Done</button>
              </div>
            )}
          </section>
        </>
      )}

      {tab === 'progress' && (
        active ? activeCard : (
          <div className="empty">
            <p><strong>No room in progress.</strong></p>
            <p className="muted">Start a room from To do.</p>
            <button type="button" className="btn secondary" onClick={() => onTab('todo')}>Go to To do</button>
          </div>
        )
      )}

      {tab === 'done' && (
        <section aria-labelledby="done-title">
          <div className="section-head">
            <h2 id="done-title" className="section-title">Done</h2>
            <p className="sort-note">Most recent first</p>
          </div>
          {doneShown.length > 0 ? (
            <ul className="room-list">
              {doneShown.map((room) => (
                <li key={room.number}>
                  <RoomCard room={room} onOpen={onOpen} />
                </li>
              ))}
            </ul>
          ) : filtering && done.length > 0 ? (
            noResults('Done')
          ) : (
            <div className="empty">
              <p><strong>No rooms completed yet.</strong></p>
              <p className="muted">Rooms you mark clean appear here, awaiting inspection.</p>
            </div>
          )}
        </section>
      )}

      <footer className="demo-footer">
        <p className="muted">Demo data is saved in this browser only. It doesn't sync to other devices.</p>
        <button type="button" className="btn secondary" onClick={onReset}>Reset demo</button>
      </footer>
    </main>
  );
}
