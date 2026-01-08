# Daily Bread - Blackout Poetry Web App

## Project Overview
Single-page interactive blackout poetry creator hosted on Github Pages.

## Key Requirements
- **Platform**: Static site for Github Pages
- **Responsive**: Works on phone, iPad, laptop, desktop
- **Text Source**: Project Gutenberg
- **Username**: TeegardenMath

## Core Features

### 1. Text Selection
- Curated list of classic texts from Project Gutenberg
- Search functionality for Gutenberg database
- API: Gutenberg API (gutendex.com or direct text access)

### 2. Text Chunk Selection
- User can scroll and select start/end points
- OR get random chunk of reasonable size (~200-500 words)

### 3. Blackout Editor
- Select words, sentences, or individual letters
- Two blackout styles:
  - Simple black censor bars
  - Naturalistic uneven scribble
- Clean, intuitive interface

### 4. Persistence
- Local storage to save work in progress
- Auto-save as user works

### 5. Export & Share
- Export formats: PDF, JPG, PNG
- Social media sharing buttons
- Include link back to site (github.io/TeegardenMath)

## Technical Stack
- **Frontend**: HTML5, CSS3, JavaScript (vanilla or lightweight framework)
- **Rendering**: Canvas or SVG for blackout effects
- **APIs**:
  - Project Gutenberg (gutendex.com for metadata, gutenberg.org for texts)
- **Libraries**:
  - jsPDF (PDF export)
  - html2canvas (image export)
  - Font Awesome (icons)

## File Structure
```
/
├── index.html          # Main page
├── css/
│   └── style.css       # Styles
├── js/
│   ├── app.js          # Main app logic
│   ├── gutenberg.js    # API interactions
│   ├── editor.js       # Blackout editor
│   ├── storage.js      # Local storage
│   └── export.js       # Export functionality
└── README.md           # Project documentation
```

## Implementation Plan
1. Research Gutenberg API
2. Build basic HTML structure with responsive design
3. Implement text selection (curated + search)
4. Build chunk selection interface
5. Create blackout editor with both styles
6. Add local storage
7. Implement export (PDF/JPG)
8. Add social sharing
9. Test and polish
