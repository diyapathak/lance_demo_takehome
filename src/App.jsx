import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { loadState, reducer, saveState } from './store.js';
import { flagOutcomeMessage, sortTodo } from './priority.js';
import SignIn from './components/SignIn.jsx';
import MyRooms from './components/MyRooms.jsx';
import RoomDetails from './components/RoomDetails.jsx';
import FlagSheet from './components/FlagSheet.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import Toasts from './components/Toasts.jsx';
import BottomNav from './components/BottomNav.jsx';

function parseHash() {
  const m = window.location.hash.match(/^#\/room\/(\d+)$/);
  return m ? Number(m[1]) : null;
}

function scrollToTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [routeRoom, setRouteRoom] = useState(parseHash);
  const [tab, setTab] = useState('todo');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [flagTarget, setFlagTarget] = useState(undefined); // undefined: closed, null: room picker
  const [notice, setNotice] = useState(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const listScroll = useRef(0);
  const pushedDetails = useRef(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const onHash = () => {
      const n = parseHash();
      if (n == null) pushedDetails.current = false;
      setRouteRoom(n);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 7000);
    return () => clearTimeout(t);
  }, [notice]);

  const detailsRoom = state.rooms.find((r) => r.number === routeRoom) ?? null;

  useLayoutEffect(() => {
    window.scrollTo(0, detailsRoom ? 0 : listScroll.current);
  }, [routeRoom]);

  function openRoom(n) {
    listScroll.current = window.scrollY;
    pushedDetails.current = true;
    window.location.hash = `/room/${n}`;
  }

  function closeRoom() {
    if (pushedDetails.current) {
      window.history.back();
    } else {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setRouteRoom(null);
    }
  }

  function start(n) {
    dispatch({ type: 'start', number: n });
    setTab('todo');
    if (!detailsRoom) scrollToTop();
  }
  const pause = (n) => dispatch({ type: 'pause', number: n });
  function complete(n) {
    dispatch({ type: 'complete', number: n, at: Date.now() });
    setTab('todo');
    listScroll.current = 0;
    if (detailsRoom) closeRoom();
    else scrollToTop();
  }
  function undo() {
    dispatch({ type: 'undo' });
    setTab('todo');
    scrollToTop();
  }

  function applyFlagAction(action) {
    const next = reducer(state, action);
    setNotice(flagOutcomeMessage(state.rooms, next.rooms, action.number));
    dispatch(action);
    setFlagTarget(undefined);
  }

  // Reject up front if storage is full rather than silently losing state.
  function addPhoto(number, photo) {
    const action = { type: 'addPhoto', number, photo };
    if (!saveState(reducer(state, action))) return false;
    dispatch(action);
    return true;
  }
  const removePhoto = (number, id) => dispatch({ type: 'removePhoto', number, id });

  function signOut() {
    dispatch({ type: 'signOut' });
    if (routeRoom != null) window.history.replaceState(null, '', window.location.pathname);
    setRouteRoom(null);
    setTab('todo');
    setQuery('');
    setTypeFilter('all');
    setNotice(null);
  }

  function resetDemo() {
    dispatch({ type: 'reset' });
    setConfirmingReset(false);
    setTab('todo');
    setQuery('');
    setTypeFilter('all');
    if (routeRoom != null) closeRoom();
    setNotice('Demo reset. All five rooms are back to Not started, with no flags.');
  }

  if (!state.session) {
    return <SignIn onSignIn={(session) => dispatch({ type: 'signIn', session })} />;
  }

  const todo = sortTodo(state.rooms);

  return (
    <>
      {detailsRoom ? (
        <RoomDetails
          room={detailsRoom}
          rooms={state.rooms}
          onBack={closeRoom}
          onStart={start}
          onPause={pause}
          onComplete={complete}
          onFlag={setFlagTarget}
          onAddPhoto={addPhoto}
          onRemovePhoto={removePhoto}
        />
      ) : (
        <MyRooms
          rooms={state.rooms}
          session={state.session}
          tab={tab}
          onTab={setTab}
          query={query}
          onQuery={setQuery}
          typeFilter={typeFilter}
          onTypeFilter={setTypeFilter}
          onOpen={openRoom}
          onStart={start}
          onPause={pause}
          onComplete={complete}
          onFlag={setFlagTarget}
          onSignOut={signOut}
          onReset={() => setConfirmingReset(true)}
        />
      )}

      <BottomNav onMyWork={() => (detailsRoom ? closeRoom() : scrollToTop())} />

      {flagTarget !== undefined && (
        <FlagSheet
          rooms={state.rooms}
          presetRoom={flagTarget}
          onSave={(number, flag) => applyFlagAction({ type: 'saveFlag', number, flag })}
          onRemove={(number) => applyFlagAction({ type: 'removeFlag', number })}
          onClose={() => setFlagTarget(undefined)}
        />
      )}

      {confirmingReset && (
        <ConfirmDialog
          title="Reset demo?"
          body="This restores the original five rooms and clears all progress and flags in this browser. You'll stay signed in."
          confirmLabel="Reset demo"
          onConfirm={resetDemo}
          onCancel={() => setConfirmingReset(false)}
        />
      )}

      <Toasts
        undoRoom={state.undo}
        nextRoom={todo[0]}
        onUndo={undo}
        onDismissUndo={() => dispatch({ type: 'dismissUndo' })}
        notice={notice}
        onDismissNotice={() => setNotice(null)}
      />
    </>
  );
}
