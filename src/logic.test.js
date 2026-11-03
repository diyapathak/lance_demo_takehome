import { describe, it, expect } from 'vitest';
import { effectivePriority, sortTodo, sourceLine, flagOutcomeMessage } from './priority.js';
import { reducer, initialState, activeRoom } from './store.js';

const order = (state) => sortTodo(state.rooms).map((r) => r.number);
const room = (state, n) => state.rooms.find((r) => r.number === n);
const flag = (level, reason = 'Guest waiting', extra = {}) => ({
  level, reason, otherText: '', note: '', ...extra,
});

describe('priority ordering', () => {
  it('starts in the required order', () => {
    expect(order(initialState())).toEqual([106, 104, 103, 105, 107]);
  });

  it('flagging 103 High moves it above 106 (tie, lower room number)', () => {
    const s = reducer(initialState(), { type: 'saveFlag', number: 103, flag: flag('High') });
    expect(order(s)).toEqual([103, 106, 104, 105, 107]);
    expect(sourceLine(effectivePriority(room(s, 103)))).toBe('Guest waiting · Flagged by you');
  });

  it('cannot lower a supervisor priority', () => {
    const s = reducer(initialState(), { type: 'saveFlag', number: 106, flag: flag('Low') });
    const eff = effectivePriority(room(s, 106));
    expect(eff).toMatchObject({ level: 'High', source: 'supervisor', reason: 'Arrival at 2 PM' });
    expect(order(s)).toEqual([106, 104, 103, 105, 107]);
    expect(room(s, 106).flag.level).toBe('Low');
  });

  it('on a tie, the housekeeper reason drives the card', () => {
    const s = reducer(initialState(), {
      type: 'saveFlag', number: 104, flag: flag('Medium', 'Other', { otherText: 'Guest at desk' }),
    });
    expect(sourceLine(effectivePriority(room(s, 104)))).toBe('Guest at desk · Flagged by you');
  });

  it('removing a flag restores supervisor priority', () => {
    let s = reducer(initialState(), { type: 'saveFlag', number: 103, flag: flag('High') });
    s = reducer(s, { type: 'removeFlag', number: 103 });
    expect(effectivePriority(room(s, 103)).level).toBe('Low');
    expect(order(s)).toEqual([106, 104, 103, 105, 107]);
  });

  it('describes moves accurately', () => {
    const a = initialState();
    const b = reducer(a, { type: 'saveFlag', number: 103, flag: flag('High') });
    expect(flagOutcomeMessage(a.rooms, b.rooms, 103)).toBe(
      'Flag saved. Room 103 is now High priority. Moved up from 3rd to 1st in To do.',
    );
    const c = reducer(a, { type: 'saveFlag', number: 106, flag: flag('Medium') });
    expect(flagOutcomeMessage(a.rooms, c.rooms, 106)).toBe(
      "Flag saved. Room 106 remains High priority, as set by your supervisor. Its place in To do hasn't changed (1st).",
    );
  });
});

describe('cleaning workflow', () => {
  it('allows only one active clean', () => {
    let s = reducer(initialState(), { type: 'start', number: 103 });
    s = reducer(s, { type: 'start', number: 106 });
    expect(activeRoom(s.rooms).number).toBe(103);
    expect(room(s, 106).task).toBe('not_started');
  });

  it('pause returns to To do without changing priority', () => {
    let s = reducer(initialState(), { type: 'saveFlag', number: 103, flag: flag('High') });
    s = reducer(s, { type: 'start', number: 103 });
    expect(order(s)).toEqual([106, 104, 105, 107]);
    s = reducer(s, { type: 'pause', number: 103 });
    expect(order(s)).toEqual([103, 106, 104, 105, 107]);
  });

  it('flagging does not change cleaning state', () => {
    let s = reducer(initialState(), { type: 'start', number: 105 });
    s = reducer(s, { type: 'saveFlag', number: 105, flag: flag('High') });
    expect(room(s, 105).task).toBe('in_progress');
  });

  it('complete → undo restores in progress; duplicates are ignored', () => {
    let s = reducer(initialState(), { type: 'start', number: 103 });
    s = reducer(s, { type: 'complete', number: 103, at: 1 });
    const again = reducer(s, { type: 'complete', number: 103, at: 2 });
    expect(again).toBe(s);
    expect(room(s, 103).task).toBe('done');
    s = reducer(s, { type: 'undo' });
    expect(room(s, 103).task).toBe('in_progress');
    expect(s.undo).toBeNull();
  });

  it('starting another room dismisses undo so two rooms cannot be active', () => {
    let s = reducer(initialState(), { type: 'start', number: 103 });
    s = reducer(s, { type: 'complete', number: 103, at: 1 });
    s = reducer(s, { type: 'start', number: 106 });
    expect(s.undo).toBeNull();
    s = reducer(s, { type: 'undo' });
    expect(s.rooms.filter((r) => r.task === 'in_progress')).toHaveLength(1);
  });

  it('completed rooms cannot be flagged and never return to To do', () => {
    let s = reducer(initialState(), { type: 'start', number: 107 });
    s = reducer(s, { type: 'complete', number: 107, at: 1 });
    s = reducer(s, { type: 'saveFlag', number: 107, flag: flag('High') });
    expect(room(s, 107).flag).toBeNull();
    expect(order(s)).not.toContain(107);
  });

  it('reset restores rooms but keeps the session', () => {
    let s = reducer(initialState(), { type: 'signIn', session: { name: 'Maya Chen' } });
    s = reducer(s, { type: 'saveFlag', number: 103, flag: flag('High') });
    s = reducer(s, { type: 'start', number: 103 });
    s = reducer(s, { type: 'reset' });
    expect(s.rooms).toEqual(initialState().rooms);
    expect(s.session).toEqual({ name: 'Maya Chen' });
  });
});

describe('photos', () => {
  const photo = (id) => ({ id, dataUrl: 'data:image/jpeg;base64,x', caption: '', addedAt: 1 });

  it('can only be added while in progress, up to 4 per room', () => {
    let s = reducer(initialState(), { type: 'addPhoto', number: 103, photo: photo('a') });
    expect(room(s, 103).photos).toHaveLength(0);
    s = reducer(s, { type: 'start', number: 103 });
    for (const id of ['a', 'b', 'c', 'd', 'e']) {
      s = reducer(s, { type: 'addPhoto', number: 103, photo: photo(id) });
    }
    expect(room(s, 103).photos.map((p) => p.id)).toEqual(['a', 'b', 'c', 'd']);
    s = reducer(s, { type: 'removePhoto', number: 103, id: 'b' });
    expect(room(s, 103).photos.map((p) => p.id)).toEqual(['a', 'c', 'd']);
  });

  it('are kept on completion, locked after, and cleared by reset', () => {
    let s = reducer(initialState(), { type: 'start', number: 103 });
    s = reducer(s, { type: 'addPhoto', number: 103, photo: photo('a') });
    s = reducer(s, { type: 'complete', number: 103, at: 1 });
    s = reducer(s, { type: 'removePhoto', number: 103, id: 'a' });
    expect(room(s, 103).photos).toHaveLength(1);
    s = reducer(s, { type: 'reset' });
    expect(room(s, 103).photos).toEqual([]);
  });
});
