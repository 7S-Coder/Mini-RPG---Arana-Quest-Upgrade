godMod helper

Usage:
1. Start the game locally (e.g. `npm run dev`).
2. Run `npm run godMod` in the project root. This prints a JavaScript snippet.
3. Open the game in your browser, open the developer console, paste the snippet and press Enter.
4. Optionally refresh the page to apply the updated save.

What it does:
- The snippet edits the `arenaquest_core_v1` localStorage save and sets common player stats to 9999 while preserving the `level`.

---

weaponTester helper

Usage:
1. Start the game locally (e.g. `npm run dev`).
2. Run `node scripts/weaponTester.js`. This prints a JavaScript snippet.
3. Open the game in your browser, open the developer console, paste the snippet and press Enter.
4. The game reloads with all test weapons in inventory.

What it does:
- Adds 5 test weapons to inventory (one for each type: sword, dagger, axe, spear, barehand)
- Each weapon has stats scaled to Epic rarity for easy testing
- Equips the Sword with Counter skill by default
- Allows you to switch weapons to test each skill in combat

Warning:
- Use only for local testing. This modifies your local save in the browser.
- You can inspect `localStorage.getItem('arenaquest_core_v1')` before and after to verify changes.
