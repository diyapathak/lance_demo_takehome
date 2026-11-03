import { activeRoom } from '../store.js';
import { effectivePriority, flagReasonText, isHigher, sourceLine } from '../priority.js';
import { PriorityBadge, TaskState } from './Badges.jsx';
import CleaningActions from './CleaningActions.jsx';
import RoomPhotos from './RoomPhotos.jsx';
import { ChevronLeft, FlagIcon, InfoIcon } from './icons.jsx';

export default function RoomDetails({
  room, rooms, onBack, onStart, onPause, onComplete, onFlag, onAddPhoto, onRemovePhoto,
}) {
  const active = activeRoom(rooms);
  const eff = effectivePriority(room);
  const { supervisor, flag } = room;
  const blocked = room.task === 'not_started' && active;

  let flagNote = null;
  if (flag && isHigher(supervisor.level, flag.level)) {
    flagNote = `Your supervisor's ${supervisor.level} priority is higher, so it applies.`;
  } else if (flag && flag.level === supervisor.level) {
    flagNote = 'Same as the supervisor priority. Your reason shows on the room card.';
  }

  return (
    <main className="app details">
      <button type="button" className="back-btn" onClick={onBack}>
        <ChevronLeft /> My rooms
      </button>

      <header className="details-hero">
        <span className="room-tile big" aria-hidden="true">{room.number}</span>
        <div>
          <h1 className="details-service">
            <span className="sr-only">Room {room.number}, </span>{room.service}
          </h1>
          <TaskState task={room.task} />
        </div>
      </header>

      <section className="details-actions" aria-label="Cleaning">
        {blocked && (
          <p id="details-busy" className="hint">
            <InfoIcon width={18} height={18} /> Finish or pause room {active.number} first.
          </p>
        )}
        <CleaningActions
          room={room}
          active={active}
          onStart={onStart}
          onPause={onPause}
          onComplete={onComplete}
          busyHintId="details-busy"
        />
        {room.task === 'done' && (
          <p className="muted">Marked clean. Inspection happens outside this app.</p>
        )}
      </section>

      <section className="card" aria-labelledby="priority-title">
        <h2 id="priority-title" className="card-title">Priority</h2>
        <div className="priority-current">
          <PriorityBadge level={eff.level} />
          <span className="priority-reason">{sourceLine(eff)}</span>
        </div>

        <dl className="priority-sources">
          <div>
            <dt>Set by supervisor</dt>
            <dd>
              <strong>{supervisor.level}</strong>
              {supervisor.reason ? ` · ${supervisor.reason}` : ' · No reason given'}
            </dd>
          </div>
          <div>
            <dt>Your flag</dt>
            <dd>
              {flag ? (
                <>
                  <strong>{flag.level}</strong> · {flagReasonText(flag)}
                  {flag.note && <span className="flag-note">“{flag.note}”</span>}
                </>
              ) : (
                'None'
              )}
            </dd>
          </div>
        </dl>
        {flagNote && <p className="muted small">{flagNote}</p>}

        {room.task === 'done' ? (
          <p className="muted small">Completed rooms can't be flagged.</p>
        ) : (
          <button type="button" className="btn secondary block" onClick={() => onFlag(room.number)}>
            <FlagIcon /> {flag ? 'Edit or remove my flag' : 'Flag room'}
          </button>
        )}
      </section>

      <section className="card" aria-labelledby="room-title">
        <h2 id="room-title" className="card-title">Room</h2>
        <dl className="facts">
          <div><dt>Service</dt><dd>{room.service}</dd></div>
          <div><dt>Occupancy</dt><dd>{room.occupancy}</dd></div>
          <div><dt>Room type</dt><dd>{room.roomType}</dd></div>
        </dl>
        <h3 className="notes-title">Notes</h3>
        <p className="notes">{room.notes}</p>
        <RoomPhotos room={room} onAdd={onAddPhoto} onRemove={onRemovePhoto} />
      </section>
    </main>
  );
}
