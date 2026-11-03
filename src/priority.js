export const LEVELS = ['Low', 'Medium', 'High'];

export function isHigher(a, b) {
  return LEVELS.indexOf(a) > LEVELS.indexOf(b);
}

export function higherOf(a, b) {
  return isHigher(b, a) ? b : a;
}

export function flagReasonText(flag) {
  return flag.reason === 'Other' ? flag.otherText : flag.reason;
}

// Ties resolve to the flag so the housekeeper's reason is shown.
export function effectivePriority(room) {
  const { supervisor, flag } = room;
  if (flag && !isHigher(supervisor.level, flag.level)) {
    return { level: flag.level, source: 'flag', reason: flagReasonText(flag) };
  }
  return { level: supervisor.level, source: 'supervisor', reason: supervisor.reason };
}

export function sourceLine(eff) {
  const source = eff.source === 'flag' ? 'Flagged by you' : 'Set by supervisor';
  return eff.reason ? `${eff.reason} · ${source}` : source;
}

export function compareRooms(a, b) {
  const pa = effectivePriority(a).level;
  const pb = effectivePriority(b).level;
  if (pa !== pb) return isHigher(pa, pb) ? -1 : 1;
  return a.number - b.number;
}

export function sortTodo(rooms) {
  return rooms.filter((r) => r.task === 'not_started').sort(compareRooms);
}

export function ordinal(n) {
  const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10];
  return n + (suffix && Math.floor(n / 10) % 10 !== 1 ? suffix : 'th');
}

export function flagOutcomeMessage(beforeRooms, afterRooms, number) {
  const before = beforeRooms.find((r) => r.number === number);
  const after = afterRooms.find((r) => r.number === number);
  const levelBefore = effectivePriority(before).level;
  const levelAfter = effectivePriority(after).level;

  let headline;
  if (!after.flag) {
    headline = `Flag removed. Room ${number} is ${levelAfter} priority, as set by your supervisor.`;
  } else if (isHigher(after.supervisor.level, after.flag.level)) {
    headline = `Flag saved. Room ${number} remains ${levelAfter} priority, as set by your supervisor.`;
  } else if (levelAfter === levelBefore) {
    headline = `Flag saved. Room ${number} stays ${levelAfter} priority.`;
  } else {
    headline = `Flag saved. Room ${number} is now ${levelAfter} priority.`;
  }

  let position;
  if (after.task === 'in_progress') {
    position = 'It stays your active room.';
  } else {
    const from = sortTodo(beforeRooms).findIndex((r) => r.number === number) + 1;
    const to = sortTodo(afterRooms).findIndex((r) => r.number === number) + 1;
    if (to < from) position = `Moved up from ${ordinal(from)} to ${ordinal(to)} in To do.`;
    else if (to > from) position = `Moved down from ${ordinal(from)} to ${ordinal(to)} in To do.`;
    else position = `Its place in To do hasn't changed (${ordinal(to)}).`;
  }

  return `${headline} ${position}`;
}
