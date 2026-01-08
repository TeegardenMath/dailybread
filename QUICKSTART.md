# Quick Start Guide

## Getting Started with Daily Bread

### Option 1: View Locally

1. Open `index.html` directly in your web browser
   - Simply double-click the file, or
   - Right-click and select "Open with" your preferred browser

### Option 2: Run with Local Server (Recommended)

Using a local server prevents CORS issues with external APIs:

**Python 3:**
```bash
python -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Node.js (with http-server):**
```bash
npx http-server -p 8000
```

Then open: `http://localhost:8000`

### Option 3: Deploy to GitHub Pages

1. Create a new repository on GitHub (e.g., `dailybread`)

2. Initialize git and push:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Daily Bread blackout poetry app"
   git branch -M main
   git remote add origin https://github.com/TeegardenMath/dailybread.git
   git push -u origin main
   ```

3. Enable GitHub Pages:
   - Go to repository Settings
   - Navigate to Pages section
   - Set Source to "main" branch
   - Save

4. Your site will be live at: `https://teegardenmath.github.io/dailybread`

## Usage Tips

### Creating Great Blackout Poetry

1. **Start with shorter passages** - 100-300 words work best
2. **Read through first** - Understand the text before blacking out
3. **Look for hidden meanings** - Find unexpected connections
4. **Experiment with both styles** - Try both bar and scribble effects
5. **Save often** - The app auto-saves, but refresh carefully

### Keyboard Shortcuts

While there are no formal keyboard shortcuts, you can:
- Click individual words to toggle blackout
- Use browser zoom (Cmd/Ctrl +/-) to adjust text size
- Use Undo button to revert last change

### Export Best Practices

- **JPG** - Best for sharing on social media (smaller file size)
- **PDF** - Best for printing or archiving (higher quality, preserves text)

### Troubleshooting

**Book won't load:**
- Try a different book
- Check your internet connection
- Some older books may have formatting issues

**Export not working:**
- Ensure you're using a modern browser
- Check that JavaScript is enabled
- Try a different export format

**Lost my work:**
- Check if you cleared browser data
- Try returning to the editor screen to trigger auto-load

## Browser Requirements

- **Recommended**: Chrome, Firefox, Safari, Edge (latest versions)
- **JavaScript**: Must be enabled
- **Local Storage**: Must be enabled for auto-save

## Need Help?

If you encounter issues or have questions, please check:
- The main [README.md](README.md) for technical details
- The [PLAN.md](PLAN.md) for implementation details

Enjoy creating blackout poetry!
