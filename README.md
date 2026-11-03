# Housekeeping · My rooms (MVP)

A mobile-first web app for one hotel housekeeper's shift. Maya Chen signs in, sees her assigned rooms in priority order, cleans them one at a time, and can flag a room as higher priority when something changes.

## Run locally

Requires Node 18+.

```bash
npm install
npm run dev        # http://localhost:5173 (use a 390px mobile viewport in DevTools)
npm test           # unit tests for priority + workflow rules
npm run build      # production build into dist/
npm run preview    # serve the production build
```

## Demo credentials

| Staff ID | PIN  |
| -------- | ---- |
| `MC1042` | `2468` |

This is **demo sign-in only**, not real authentication. The sign-in screen also has a "Fill in demo credentials" button.

## Suggested demo

1. Sign in. To do shows **106, 104, 103, 105, 107**.
2. Tap **Flag room**, choose Room 103, select **High**, then **Guest waiting**, and save. Room 103 moves to the top: it ties 106 at High and has the lower room number.
3. Tap **Start clean** on 103. It becomes the "Cleaning now" card, and other rooms show "Finish or pause room 103 first."
4. Tap **Mark clean**. The confirmation offers **Undo** and shows the next room. Room 103 appears in **Done** as "Clean — awaiting inspection."
5. Start room 106.

## Rules implemented

- **Effective priority**: the higher of the supervisor priority and Maya's flag. Levels are compared by their order (Low < Medium < High); no numeric score is calculated or shown.
- A flag can raise priority but never lower it. Removing a flag restores the supervisor priority. If the two are tied, the card shows Maya's reason.
- **To do order**: High, then Medium, then Low; room number ascending within each level. The active room and Done rooms are kept out of this ordering.
- Only one room can be active at a time. **Pause** returns the room to To do without changing its priority. **Undo** returns a completed room to In progress, and the Undo option is dismissed as soon as another cleaning action starts.
- Flagging never changes the cleaning state. Completed rooms keep their flag history but can't be flagged.
- **Service filter**: **Checkout** shows Full service rooms (guest departed); **Refresh** shows stayovers. It combines with the To do / In progress / Done tabs and with search, and its counts reflect the current tab.
- **Photos (optional)**: while a room is In progress, room details lets you add up to 4 photos, each with an optional caption, and remove them (with a confirmation). Photos never block Mark clean. After completion they are read-only, and Reset demo deletes them.
- **Bottom bar**: **My work** is the current screen, and tapping it from room details returns to the list. **Messages** is shown for design fidelity but intentionally does nothing, since messaging is out of scope.

## Important files

| File | Purpose |
| ---- | ------- |
| `src/data.js` | Demo user, the five rooms, and flag reasons |
| `src/priority.js` | Effective priority, sorting, and the "moved / didn't move" message |
| `src/photos.js` | Resizes photos in the browser (max 800px, JPEG at quality 0.6) before saving |
| `src/store.js` | Reducer for all actions (with guards against double actions) and localStorage persistence |
| `src/App.jsx` | Wiring: navigation (`#/room/<n>`), toasts, dialogs |
| `src/components/` | Screens (`SignIn`, `MyRooms`, `RoomDetails`, `FlagSheet`) and shared pieces |
| `src/logic.test.js` | Vitest unit tests for the rules above |
| `src/styles.css` | Plain CSS; green and warm neutral palette |

## Scope and limitations

- Housekeeper side only. There is no supervisor dashboard, room assignment, inspection, messaging, notifications, or maintenance.
- No backend. Data is hardcoded and saved in this browser's `localStorage`. It doesn't sync across devices or browsers.
- Flags are not sent to anyone. The app says so in the flag sheet.
- Photos are compressed into `localStorage` (about 5 MB per site). Each is roughly 50–100 KB; if the browser runs out of space, the app says so instead of failing silently.
- If the project lives in an iCloud-synced folder (Desktop/Documents), the first `npm run dev` load can take 20+ seconds; move it elsewhere for faster startup.
- **Reset demo** (at the bottom of My rooms, with a confirmation) restores the five rooms and clears flags. You stay signed in.
- Signing out clears the session but keeps room progress in this browser, like a shared device at the start of a shift.
- Pausing returns a room to "Not started"; the app doesn't record partial progress.
