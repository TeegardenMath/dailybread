// Main Application Logic
const App = {
    currentBook: null,
    currentText: null,
    fullBookText: null,
    selectionStart: null,
    selectionEnd: null,

    // Initialize the app
    async init() {
        this.setupEventListeners();
        await this.loadCuratedBooks();

        // Check if there's saved data
        const savedBook = Storage.getBook();
        const savedText = Storage.getText();

        if (savedBook && savedText) {
            // Ask user if they want to continue
            if (confirm('You have unfinished work. Would you like to continue where you left off?')) {
                this.currentBook = savedBook;
                this.currentText = savedText;
                this.showEditor();
            } else {
                Storage.clearAll();
            }
        }
    },

    // Setup all event listeners
    setupEventListeners() {
        // Text Selection Screen
        document.getElementById('search-btn').addEventListener('click', () => this.handleSearch());
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Passage Selection Screen
        document.getElementById('reroll-passage-btn').addEventListener('click', () => this.rerollPassage());
        document.getElementById('choose-passage-btn').addEventListener('click', () => this.handleManualSelect());
        document.getElementById('accept-passage-btn').addEventListener('click', () => this.acceptPassage());
        document.getElementById('cancel-manual-btn').addEventListener('click', () => this.cancelManualSelection());
        document.getElementById('use-selection-btn').addEventListener('click', () => this.useManualSelection());
        document.getElementById('back-to-books-btn').addEventListener('click', () => this.backToBooks());

        // Editor Screen
        document.getElementById('clear-blackouts-btn').addEventListener('click', () => {
            if (confirm('Clear all blackouts?')) {
                Editor.clearAll();
            }
        });
        document.getElementById('undo-btn').addEventListener('click', () => Editor.undo());
        document.getElementById('back-to-chunk-selection-btn').addEventListener('click', () => this.backToChunkFromEditor());

        // Export dropdown
        document.getElementById('export-btn').addEventListener('click', () => this.toggleExportMenu());
        document.getElementById('export-jpg-btn').addEventListener('click', () => {
            this.hideExportMenu();
            ExportManager.exportAsJPG();
        });
        document.getElementById('export-pdf-btn').addEventListener('click', () => {
            this.hideExportMenu();
            ExportManager.exportAsPDF();
        });

        // Close export menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.export-dropdown')) {
                this.hideExportMenu();
            }
        });
    },

    // Load curated books
    async loadCuratedBooks() {
        const container = document.getElementById('curated-books');
        container.innerHTML = '';

        Gutenberg.CURATED_BOOKS.forEach(book => {
            const card = this.createBookCard(book);
            card.addEventListener('click', () => this.selectBook(book.id, book.title, book.author));
            container.appendChild(card);
        });
    },

    // Create book card element
    createBookCard(bookInfo) {
        const card = document.createElement('div');
        card.className = 'book-card';

        const title = document.createElement('h4');
        title.textContent = bookInfo.title;

        const author = document.createElement('p');
        author.className = 'author';
        author.textContent = bookInfo.author;

        card.appendChild(title);
        card.appendChild(author);

        if (bookInfo.downloads) {
            const downloads = document.createElement('p');
            downloads.className = 'downloads';
            downloads.textContent = `${bookInfo.downloads.toLocaleString()} downloads`;
            card.appendChild(downloads);
        }

        return card;
    },

    // Handle search
    async handleSearch() {
        const query = document.getElementById('search-input').value.trim();

        if (!query) {
            alert('Please enter a search term');
            return;
        }

        this.showLoading();

        try {
            const results = await Gutenberg.searchBooks(query);

            const container = document.getElementById('search-results');
            container.innerHTML = '';

            if (results.length === 0) {
                container.innerHTML = '<p>No results found. Try a different search term.</p>';
            } else {
                // Show first 12 results
                results.slice(0, 12).forEach(book => {
                    const bookInfo = Gutenberg.formatBookInfo(book);
                    const card = this.createBookCard(bookInfo);
                    card.addEventListener('click', () => this.selectBook(bookInfo.id, bookInfo.title, bookInfo.author));
                    container.appendChild(card);
                });
            }
        } catch (error) {
            alert('Search failed. Please try again.');
            console.error(error);
        } finally {
            this.hideLoading();
        }
    },

    // Select a book
    async selectBook(bookId, title, author) {
        this.showLoading();

        try {
            const text = await Gutenberg.fetchBookText(bookId);

            this.currentBook = { id: bookId, title, author };
            this.fullBookText = text;

            Storage.saveBook(this.currentBook);

            this.showScreen('chunk-selection-screen');

            // Show a random passage immediately
            this.showRandomPassage();
        } catch (error) {
            alert('Failed to load book. Please try another.');
            console.error(error);
        } finally {
            this.hideLoading();
        }
    },

    // Show a random passage
    showRandomPassage() {
        const chunk = Gutenberg.getRandomChunk(this.fullBookText, 300);
        this.currentText = chunk;

        const passageDisplay = document.getElementById('passage-text');
        passageDisplay.textContent = chunk;

        document.getElementById('passage-display').classList.remove('hidden');
        document.getElementById('manual-selection-area').classList.add('hidden');
    },

    // Reroll passage
    rerollPassage() {
        this.showRandomPassage();
    },

    // Accept passage and move to editor
    acceptPassage() {
        if (!this.currentText) {
            alert('No text selected');
            return;
        }

        Storage.saveText(this.currentText);
        this.showEditor();
    },

    // Handle manual selection
    handleManualSelect() {
        // Hide passage display and show manual selection
        document.getElementById('passage-display').classList.add('hidden');
        document.getElementById('manual-selection-area').classList.remove('hidden');

        // Hide main buttons, show cancel
        document.getElementById('reroll-passage-btn').classList.add('hidden');
        document.getElementById('choose-passage-btn').classList.add('hidden');
        document.getElementById('accept-passage-btn').classList.add('hidden');
        document.getElementById('cancel-manual-btn').classList.remove('hidden');

        // Show full text
        const preview = document.getElementById('text-preview');
        preview.textContent = this.fullBookText;
    },

    // Use the manually selected text
    useManualSelection() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (!selectedText || selectedText.length === 0) {
            alert('Please select some text first');
            return;
        }

        this.currentText = selectedText;

        // Show the selected chunk in the main passage display
        const passageDisplay = document.getElementById('passage-text');
        passageDisplay.textContent = selectedText;

        // Clean up manual selection mode
        this.cancelManualSelection();
    },

    // Cancel manual selection
    cancelManualSelection() {
        document.getElementById('manual-selection-area').classList.add('hidden');
        document.getElementById('passage-display').classList.remove('hidden');

        // Show main buttons, hide cancel
        document.getElementById('reroll-passage-btn').classList.remove('hidden');
        document.getElementById('choose-passage-btn').classList.remove('hidden');
        document.getElementById('accept-passage-btn').classList.remove('hidden');
        document.getElementById('cancel-manual-btn').classList.add('hidden');
    },


    // Back to book selection
    backToBooks() {
        this.currentBook = null;
        this.fullBookText = null;
        this.currentText = null;
        this.selectionStart = null;
        this.selectionEnd = null;

        document.getElementById('manual-selection-area').classList.add('hidden');
        document.getElementById('passage-display').classList.remove('hidden');
        document.getElementById('passage-text').textContent = '';

        this.showScreen('text-selection-screen');
    },

    // Back to chunk selection from editor
    backToChunkFromEditor() {
        if (confirm('Go back to chunk selection? Your current blackouts will be saved.')) {
            this.showScreen('chunk-selection-screen');
        }
    },

    // Show editor
    showEditor() {
        this.showScreen('editor-screen');
        Editor.init(this.currentText);
    },

    // Toggle export menu
    toggleExportMenu() {
        const menu = document.getElementById('export-menu');
        menu.classList.toggle('hidden');
    },

    // Hide export menu
    hideExportMenu() {
        const menu = document.getElementById('export-menu');
        menu.classList.add('hidden');
    },

    // Show screen
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        document.getElementById(screenId).classList.add('active');
    },

    // Show loading spinner
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    },

    // Hide loading spinner
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
