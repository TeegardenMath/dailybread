# Notes for Future Claude Iterations

## About This Project Series
This user is doing daily web development projects. Each project is a small, creative web application built from scratch. Projects live in subdirectories of `dailybread/`. When complete, create the next day's folder with updated notes.

## User's Working Style & Preferences

### Aesthetic & Design Philosophy
- **Minimalism is key**: Clean, simple interfaces without unnecessary text, headers, or UI chrome
- **Discoverable interactions**: Users discover functionality through interaction, not explicit instructions
- **Authentic design**: Use realistic details (varied fonts, heights, authentic colors) over generic styling
- **Compact layouts**: Tight spacing, no excessive padding or margins

### Technical Preferences
- **Don't over-engineer**: Only implement what's requested. The user will ask for features when they want them
- **No premature documentation**: Don't create README files or extensive comments unless asked
- **Read existing code first**: Always read files before modifying them
- **Test before committing**: Verify fixes work before pushing

### Color & Visual Design
- Purple/lavender color schemes tend to work well
- Avoid washed-out colors - use genuine muted/vintage colors
- If struggling with color direction, ask for examples

## Technical Patterns That Work Well

### localStorage for Game State
- Save game state to localStorage at every meaningful action (purchases, wins, config changes)
- Use a single save key with a JSON object containing all state
- Load on init with sensible defaults for missing keys
- Pattern:
```javascript
function saveGame() {
    localStorage.setItem('gameKey', JSON.stringify({ coins, inventory, settings }));
}
function loadGame() {
    const save = localStorage.getItem('gameKey');
    if (save) {
        const data = JSON.parse(save);
        coins = data.coins || 0;
        // ... with defaults for each field
    }
}
```

### Preventing Duplicate Callbacks/State Issues
- When game loops or animations can trigger state changes, use guard flags
- Set flags immediately at function start, not after async operations
- Pattern for game ending:
```javascript
let gameEnding = false;
function endGame() {
    if (gameEnding) return;
    gameEnding = true;
    // ... handle end game
    setTimeout(() => { gameEnding = false; startNewGame(); }, delay);
}
```

### Separating Permanent vs Temporary State
- For deck-building games: keep permanent collection separate from in-game hands
- Don't derive permanent state from temporary game state (e.g., don't read deck contents mid-game)
- Copy collections when starting new games: `playerHand = [...playerCollection]`

### CORS Issues
- Many APIs require CORS proxies
- Use: `https://corsproxy.io/?` + encodeURIComponent(url)
- Always wrap in try-catch with fallback

### UI State Management
- Show/hide elements rather than destroying and recreating
- Use classList.add/remove('hidden') pattern consistently
- For overlays: position: fixed with z-index, semi-transparent background

## Common Pitfalls to Avoid

1. **Multiple callback triggers**: Game loops continuing during end-game transitions
2. **State confusion**: Reading game state when you meant permanent state
3. **DOM structure assumptions**: CSS targeting elements that don't exist in all contexts
4. **Over-engineering**: Adding features, abstractions, or error handling that wasn't requested

## Git Workflow
- Clean commits after features are working
- Concise, descriptive commit messages
- Always verify git status before committing
- Push after committing unless told otherwise

## What To Do At Project End

1. **Create next project directory** with this notes file (updated with learnings)
2. **Commit the changes**

---

## Project-Specific Notes

### War (Deck-Building Idle Game) - Completed 2026-01-09

**What worked:**
- localStorage for full game state persistence (coins, collection, purchases, unlocks)
- Three-column layout (opponents | game | store) with flexbox
- Tiered unlock system (speed upgrades require previous tier via `requires` field)
- Opponent deck bias (replace low cards with high cards based on percentage)
- Guard flag pattern to prevent multiple endGame() calls

**Bugs that needed multiple fixes:**
- **Multiple booster packs on win**: Game loop continued calling endGame during reset delay. Fix: `gameEnding` flag set immediately, checked in all game functions
- **Duplicate cards in deck viewer**: Reading `playerHand + playerDiscard` during games included opponent's cards. Fix: Separate `playerCollection` array for permanent 52-card deck
- **Deck not obviously viewable**: Added "View Deck" label with hover highlight

**Architecture patterns:**
- Store items as data array with `type`, `requires`, `winsRequired`, `repeatable` flags
- Opponents as data array with `winsRequired`, `coinReward`, `maxBet`, `deckBias`
- Single `saveGame()` function called at all state change points
- Single `loadGame()` on init with defaults for all fields

---

### MASH Project - Completed 2026-01-08

**What worked:**
- Canvas overlay for spiral (semi-transparent background)
- Line segment intersection algorithm for counting spiral crossings
- Separating large data sets into separate data.js file
- Grid layout (2 columns) for compact presentation

**Bugs that needed multiple fixes:**
- **Circle styling (5+ attempts)**: CSS targeting elements that didn't exist in elimination display. Fix: Ensure target DOM elements exist in ALL contexts where styles apply
- **Reroll spacing**: flex: 1 pushed button far right. Fix: inline-block instead

**Technical lessons:**
- When applying conditional styling, verify target DOM elements exist in ALL rendering contexts
- For inline-block elements to size to content, avoid flex: 1
- Large data sets (200+ items) drastically reduce repeats

---

### Blackout Poetry - Completed 2026-01-08

**What worked:**
- Browser native text selection + spacebar interaction
- HTML5 Canvas for drawing blackouts
- CORS proxy for Project Gutenberg
- Minimal UI with discovery-based interaction

**Bugs that needed multiple fixes:**
- Canvas positioning: Required accounting for scroll offset
- Performance: Abandoned character-by-character wrapping for native text selection

---

[Future Claude: Add your reflections here when the AO3 project is complete]
