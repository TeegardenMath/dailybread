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

## Notes from Next Project (MASH)

[Future Claude: Add your reflections here when this project is complete. Follow the same format as above - what worked, what didn't, user preferences, technical lessons, etc.]
