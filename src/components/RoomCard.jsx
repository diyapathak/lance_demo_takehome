import { effectivePriority, sourceLine } from '../priority.js';
import { OccupancyChip, PriorityBadge, TaskState } from './Badges.jsx';
import { CameraIcon, ChevronRight } from './icons.jsx';

export default function RoomCard({ room, onOpen, actions, upNext = false }) {
  const eff = effectivePriority(room);
  const variant = room.task === 'in_progress' ? 'active' : room.task === 'done' ? 'done' : '';

  return (
    <article className={`room-card ${variant}`}>
      {upNext && <p className="up-next">Up next</p>}
      <button type="button" className="room-card-main" onClick={() => onOpen(room.number)}>
        <span className="room-tile" aria-hidden="true">{room.number}</span>
        <span className="room-info">
          <span className="sr-only">Room {room.number}, </span>
          <span className="room-title">{room.service}</span>
          <span className="chips">
            <PriorityBadge level={eff.level} />
            <OccupancyChip occupancy={room.occupancy} />
            {room.photos.length > 0 && (
              <span className="chip">
                <CameraIcon width={16} height={16} />
                {room.photos.length} {room.photos.length === 1 ? 'photo' : 'photos'}
              </span>
            )}
          </span>
          <TaskState task={room.task} />
          <span className="priority-reason">{sourceLine(eff)}</span>
          <span className="sr-only">. View details</span>
        </span>
        <ChevronRight className="chevron" />
      </button>
      {actions && <div className="room-card-actions">{actions}</div>}
    </article>
  );
}
