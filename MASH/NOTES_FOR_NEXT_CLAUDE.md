# Notes for Future Claude Iterations

## About This Project Series
This user is doing daily web development projects. Each project is a small, creative web application that we build together from scratch. When the project is complete, files are organized into a subdirectory and a new directory is created for the next day's project.

## User's Working Style & Preferences

### Aesthetic & Design Philosophy
- **Minimalism is key**: The user consistently prefers clean, simple interfaces without unnecessary text, headers, or UI chrome
- **Discoverable interactions**: They like users to discover functionality through interaction rather than explicit instructions
- **Authentic design**: When using visual metaphors (like book spines), use authentic details (varied fonts, heights, realistic colors) rather than generic placeholder styling
- **Direct manipulation**: The user prefers native browser interactions (text selection, drag) over custom click-based interactions when possible

### Color & Visual Design
- **Iterate on colors**: Be prepared to adjust color palettes 2-3 times based on feedback
- **Avoid washed-out colors**: Don't just reduce opacity/saturation - use genuine muted/vintage colors
- **Ask for examples**: If struggling with color direction, the user may provide reference images

### Performance Matters
- **Watch DOM size**: Creating 100,000+ DOM elements (like wrapping every character in spans) causes severe performance issues
- **Test with large content**: The user works with full book texts - ensure performance scales
- **Prefer native browser features**: Browser text selection is faster than custom implementations

## Technical Patterns That Worked Well

### CORS Issues
- Project Gutenberg and many APIs require CORS proxies
- Use: `https://corsproxy.io/?` + encodeURIComponent(url)
- Always wrap CORS requests in try-catch with fallback URLs

### Canvas Positioning
- When drawing on canvas overlaid on text, reference the canvas container's bounding rect
- **Critical**: Account for scroll offsets (`scrollLeft`, `scrollTop`) in coordinate calculations
- Add scroll event listeners to redraw when container scrolls

### Random Selection Algorithms
- Test edge cases in random selection (beginning, end, boundaries)
- Ensure fallbacks are truly random, not defaulting to first item
- Use proper character class regex (e.g., `/^[A-Z]/`) instead of case comparison

### UI State Management
- Keep track of application state clearly
- Show/hide elements rather than destroying and recreating
- Use classList.add/remove('hidden') pattern consistently

## Common Pitfalls to Avoid

1. **Don't over-engineer**: Only implement what's requested. The user will ask for features when they want them
2. **No premature documentation**: Don't create README files or extensive comments unless asked
3. **Test before committing**: Verify fixes work before pushing
4. **Read existing code**: Always read files before modifying them
5. **Performance test with real data**: Don't optimize for small test cases

## Git Workflow
- User likes clean commits after features are working
- Commit messages should be concise and descriptive
- Always verify git status before committing
- Push after committing unless told otherwise

## What To Do At Project End

When the user says they're done with the current project:

1. **Organize files**: Create subdirectory with project name, move all files into it
2. **Create next project directory**: Create a new subdirectory for tomorrow's project
3. **Update these notes**: Add reflections from the current project below, including:
   - What worked well technically
   - User preferences discovered
   - Bugs that took multiple attempts to fix and why
   - Any new patterns or approaches
4. **Commit the changes**: Commit the reorganization and updated notes

## Project-Specific Notes

### Daily Bread (Blackout Poetry) - Completed 2026-01-08

**What worked:**
- Simple browser text selection + spacebar interaction
- HTML5 Canvas for drawing blackouts
- CORS proxy for Project Gutenberg
- Minimal UI with discovery-based interaction

**Bugs that needed multiple fixes:**
- Canvas positioning: Required accounting for scroll offset (fixed in two stages - first fixed container reference, then added scroll offset)
- Random passage selection: Regex for capital letters + truly random fallback
- Performance: Abandoned character-by-character wrapping for native text selection

**User aesthetic preferences learned:**
- Prefers parchment/paper textures over modern UI
- Likes book/literary metaphors executed authentically
- Wants soft, vintage color palettes
- Minimal buttons, no explanatory text

---

## Notes from MASH Project - Completed 2026-01-08

**What worked:**
- Canvas overlay for spiral (semi-transparent background showing content underneath)
- Line segment intersection algorithm for counting spiral crossings
- Separating large data sets into separate file (data.js with 200+ options per category)
- Numbered entries (1. 2. 3.) instead of descriptive labels for cleaner UI
- Simple border + border-radius on inline-block spans for circles
- Displaying intersection count as number above spiral with white background circle
- Grid layout (2 columns) for compact presentation

**Bugs that needed multiple fixes:**
- **Circle styling (5+ attempts)**: Kept trying pseudo-elements and wrong DOM targets. Root cause: elimination display created simple divs with textContent, so CSS targeting .text-wrapper/.item-content had nothing to match. Solution: Wrap text in .item-text spans during elimination display creation, apply border directly to span.
- **Spiral transition**: Started as separate screen, converted to overlay per user request
- **Reroll spacing**: Used flex: 1 on text which pushed button far right. Fixed by changing to inline-block
- **Spiral line length**: Initially extended to maxRadius, user wanted it to match actual spiral end (radius + small offset)

**User aesthetic preferences learned:**
- Extremely compact layouts (notebook paper aesthetic - minimal line spacing, tight gaps)
- Purple/lavender color schemes (#7B68EE, #D4EBFF) over beige
- Visible reroll counts displayed inline
- No bounding boxes or cards - just underlines for sections
- Numbers instead of descriptive labels
- Clean, simple styling without decorative elements

**Technical lessons:**
- **Critical**: When applying conditional styling (like .final circles), verify target DOM elements exist in ALL contexts where class is applied. Setup screen vs elimination screen had different structures.
- For inline-block elements to size to content, avoid flex: 1 (which forces expansion)
- Canvas overlays: Use rgba background for semi-transparency, position: fixed with z-index
- Line intersection math: Parametric form (ua and ub parameters), check 0 < t < 1 to exclude endpoint intersections
- Large data sets: 200+ items per category drastically reduced repeats
- File organization: Separate data.js from logic helps manage large option arrays

**Data organization pattern:**
- Moved game data to separate data.js file
- Structured as: `const gameData = { category: { title, options: [] } }`
- Load data.js before script.js in HTML
- Makes it easy to expand options without cluttering main logic

---

## Notes from Next Project (gayifier)

[Future Claude: Add your reflections here when this project is complete. Follow the same format as above - what worked, what didn't, user preferences, technical lessons, etc.]
