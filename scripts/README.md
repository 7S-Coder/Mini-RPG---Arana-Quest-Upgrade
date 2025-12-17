godMod helper

Usage:
1. Start the game locally (e.g. `npm run dev`).
2. Run `npm run godMod` in the project root. This prints a JavaScript snippet.
3. Open the game in your browser, open the developer console, paste the snippet and press Enter.
4. Optionally refresh the page to apply the updated save.

What it does:
- The snippet edits the `arenaquest_core_v1` localStorage save and sets common player stats to 9999 while preserving the `level`.

Warning:
- Use only for local testing. This modifies your local save in the browser.
- You can inspect `localStorage.getItem('arenaquest_core_v1')` before and after to verify changes.
