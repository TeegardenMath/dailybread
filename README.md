# Daily Bread - Blackout Poetry Creator

Create beautiful blackout poetry from classic literature with an intuitive, interactive web interface.

## About

Daily Bread is a single-page web application that allows users to create blackout poetry from Project Gutenberg's vast collection of classic literature. Select a text, choose a passage, and black out words to reveal your hidden poetry.

## Features

- **Extensive Library**: Access thousands of classic texts from Project Gutenberg
- **Curated Classics**: Quick access to popular works like Pride and Prejudice, Frankenstein, and Moby Dick
- **Powerful Search**: Find any book in the Project Gutenberg database
- **Flexible Selection**: Choose a random passage or manually select your own
- **Two Blackout Styles**:
  - Clean black censor bars
  - Natural, hand-drawn scribble effect
- **Auto-Save**: Your work is automatically saved to local storage
- **Export Options**: Download your creations as JPG or PDF
- **Social Sharing**: Share your poetry on Twitter and Facebook
- **Fully Responsive**: Works perfectly on phones, tablets, and desktops

## How to Use

1. **Choose a Text**: Browse curated classics or search the Project Gutenberg database
2. **Select a Passage**: Get a random chunk or manually select start and end points
3. **Create Your Poetry**: Click words to black them out, revealing your hidden poem
4. **Export & Share**: Download as JPG/PDF or share on social media

## Technical Details

### Technologies Used

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **APIs**:
  - [Gutendex](https://gutendex.com) - Project Gutenberg metadata
  - Project Gutenberg - Full text content
- **Libraries**:
  - [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
  - [html2canvas](https://html2canvas.hertzen.com/) - Canvas rendering for export

### File Structure

```
/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Styles and responsive design
├── js/
│   ├── app.js          # Main application logic and UI flow
│   ├── gutenberg.js    # Project Gutenberg API integration
│   ├── editor.js       # Blackout poetry editor
│   ├── storage.js      # Local storage management
│   └── export.js       # Export and sharing functionality
├── PLAN.md             # Development plan
└── README.md           # This file
```

## Deployment

This project is designed to be hosted on GitHub Pages:

1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to main branch
4. Site will be available at `https://teegardenmath.github.io/dailybread`

## Local Development

To run locally:

1. Clone the repository
2. Open `index.html` in a web browser
3. Or use a local server:
   ```bash
   python -m http.server 8000
   ```
   Then navigate to `http://localhost:8000`

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Credits

- Classic texts sourced from [Project Gutenberg](https://www.gutenberg.org)
- API provided by [Gutendex](https://gutendex.com)

## License

This project is open source and available for educational and personal use.

## Author

Created for TeegardenMath

---

*Create, blackout, reveal. Find the poetry hidden in classic literature.*
