import { CheckIcon, CircleIcon, ClockIcon, DoorIcon, PersonIcon, PriorityIcon } from './icons.jsx';

export function PriorityBadge({ level }) {
  return (
    <span className={`badge priority-${level.toLowerCase()}`}>
      <PriorityIcon level={level} />
      {level} priority
    </span>
  );
}

export function OccupancyChip({ occupancy }) {
  const Icon = occupancy === 'Occupied' ? PersonIcon : DoorIcon;
  return (
    <span className="chip">
      <Icon width={16} height={16} />
      {occupancy}
    </span>
  );
}

const TASK = {
  not_started: { label: 'Not started', Icon: CircleIcon },
  in_progress: { label: 'In progress', Icon: ClockIcon },
  done: { label: 'Clean — awaiting inspection', Icon: CheckIcon },
};

export function TaskState({ task }) {
  const { label, Icon } = TASK[task];
  return (
    <span className={`task-state task-${task}`}>
      <Icon width={16} height={16} />
      {label}
    </span>
  );
}
