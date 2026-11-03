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
