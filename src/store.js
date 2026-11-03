import { INITIAL_ROOMS } from './data.js';
import { MAX_PHOTOS_PER_ROOM } from './photos.js';

const STORAGE_KEY = 'housekeeping-demo-v1';

export function initialState() {
  return { session: null, rooms: structuredClone(INITIAL_ROOMS), undo: null };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved.rooms) || saved.rooms.length !== INITIAL_ROOMS.length) {
      return initialState();
    }
    // undo is session-only by design
    const rooms = saved.rooms.map((r) => ({ ...r, photos: r.photos ?? [] }));
    return { session: saved.session ?? null, rooms, undo: null };
  } catch {
    return initialState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ session: state.session, rooms: state.rooms }),
    );
    return true;
  } catch {
    return false;
  }
}

export function activeRoom(rooms) {
  return rooms.find((r) => r.task === 'in_progress') ?? null;
}

function findRoom(state, number) {
  return state.rooms.find((r) => r.number === number);
}

function updateRoom(state, number, changes) {
  return {
    ...state,
    rooms: state.rooms.map((r) => (r.number === number ? { ...r, ...changes } : r)),
  };
}

// Guards keep actions idempotent (double taps, stale buttons).
export function reducer(state, action) {
  const room = action.number != null ? findRoom(state, action.number) : null;

  switch (action.type) {
    case 'signIn':
      return { ...state, session: action.session };

    case 'signOut':
      return { ...state, session: null, undo: null };

    case 'start':
      if (!room || room.task !== 'not_started' || activeRoom(state.rooms)) return state;
      return { ...updateRoom(state, room.number, { task: 'in_progress' }), undo: null };

    case 'pause':
      if (!room || room.task !== 'in_progress') return state;
      return { ...updateRoom(state, room.number, { task: 'not_started' }), undo: null };

    case 'complete':
      if (!room || room.task !== 'in_progress') return state;
      return {
        ...updateRoom(state, room.number, { task: 'done', completedAt: action.at }),
        undo: room.number,
      };

    case 'undo': {
      const target = findRoom(state, state.undo);
      if (!target || target.task !== 'done' || activeRoom(state.rooms)) {
        return { ...state, undo: null };
      }
      return {
        ...updateRoom(state, target.number, { task: 'in_progress', completedAt: null }),
        undo: null,
      };
    }

    case 'dismissUndo':
      return { ...state, undo: null };

    case 'saveFlag':
      if (!room || room.task === 'done') return state;
      return updateRoom(state, room.number, { flag: action.flag });

    case 'removeFlag':
      if (!room || room.task === 'done') return state;
      return updateRoom(state, room.number, { flag: null });

    case 'addPhoto':
      if (!room || room.task !== 'in_progress' || room.photos.length >= MAX_PHOTOS_PER_ROOM) {
        return state;
      }
      return updateRoom(state, room.number, { photos: [...room.photos, action.photo] });

    case 'removePhoto':
      if (!room || room.task !== 'in_progress') return state;
      return updateRoom(state, room.number, {
        photos: room.photos.filter((p) => p.id !== action.id),
      });

    case 'reset':
      return { ...initialState(), session: state.session };

    default:
      return state;
  }
}
