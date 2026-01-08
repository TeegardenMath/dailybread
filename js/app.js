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
        document.getElementById('back-to-books-btn').addEventListener('click', () => this.backToBooks());

        // Editor Screen
        document.getElementById('style-bar').addEventListener('click', () => Editor.setStyle('bar'));
        document.getElementById('style-scribble').addEventListener('click', () => Editor.setStyle('scribble'));
        document.getElementById('clear-blackouts-btn').addEventListener('click', () => {
            if (confirm('Clear all blackouts?')) {
                Editor.clearAll();
            }
        });
        document.getElementById('undo-btn').addEventListener('click', () => Editor.undo());
        document.getElementById('back-to-chunk-selection-btn').addEventListener('click', () => this.backToChunkFromEditor());

        // Export
        document.getElementById('export-jpg-btn').addEventListener('click', () => ExportManager.exportAsJPG());
        document.getElementById('export-pdf-btn').addEventListener('click', () => ExportManager.exportAsPDF());
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

        // Show full text without wrapping in spans
        const preview = document.getElementById('text-preview');
        this.renderTextPreview();

        // Reset selection state
        this.selectionStart = null;
        this.selectionEnd = null;
        this.selectionMode = 'start'; // 'start', 'end', or 'done'

        // Show prompt
        this.updateSelectionPrompt();

        // Add click handler
        this.textClickHandler = this.handleTextClick.bind(this);
        preview.addEventListener('click', this.textClickHandler);
    },

    // Render text preview efficiently
    renderTextPreview() {
        const preview = document.getElementById('text-preview');
        preview.innerHTML = '';

        if (this.selectionStart === null) {
            // No selection yet - show plain text
            preview.textContent = this.fullBookText;
        } else if (this.selectionEnd === null) {
            // Start selected - show grayed before, normal after
            const before = document.createElement('span');
            before.className = 'grayed-text';
            before.textContent = this.fullBookText.substring(0, this.selectionStart);

            const marker = document.createElement('span');
            marker.className = 'selection-marker';
            marker.textContent = this.fullBookText[this.selectionStart];

            const after = document.createElement('span');
            after.textContent = this.fullBookText.substring(this.selectionStart + 1);

            preview.appendChild(before);
            preview.appendChild(marker);
            preview.appendChild(after);
        } else {
            // Both selected - show grayed before/after, highlighted selection
            const before = document.createElement('span');
            before.className = 'grayed-text';
            before.textContent = this.fullBookText.substring(0, this.selectionStart);

            const startMarker = document.createElement('span');
            startMarker.className = 'selection-marker';
            startMarker.textContent = this.fullBookText[this.selectionStart];

            const selected = document.createElement('span');
            selected.textContent = this.fullBookText.substring(this.selectionStart + 1, this.selectionEnd);

            const endMarker = document.createElement('span');
            endMarker.className = 'selection-marker';
            endMarker.textContent = this.fullBookText[this.selectionEnd];

            const after = document.createElement('span');
            after.className = 'grayed-text';
            after.textContent = this.fullBookText.substring(this.selectionEnd + 1);

            preview.appendChild(before);
            preview.appendChild(startMarker);
            preview.appendChild(selected);
            preview.appendChild(endMarker);
            preview.appendChild(after);
        }
    },

    // Handle clicks on text during manual selection
    handleTextClick(e) {
        const preview = document.getElementById('text-preview');
        const range = document.caretRangeFromPoint(e.clientX, e.clientY);

        if (!range) return;

        // Calculate character index from the click position
        let index = 0;
        let node = range.startContainer;

        // Get all text nodes
        const walker = document.createTreeWalker(preview, NodeFilter.SHOW_TEXT);
        let currentNode;

        while (currentNode = walker.nextNode()) {
            if (currentNode === node) {
                index += range.startOffset;
                break;
            } else {
                index += currentNode.length;
            }
        }

        if (this.selectionMode === 'start') {
            this.selectionStart = index;
            this.selectionMode = 'end';
            this.renderTextPreview();
            this.updateSelectionPrompt();
        } else if (this.selectionMode === 'end') {
            if (index <= this.selectionStart) {
                this.updateSelectionPrompt('Please click after your starting point');
                setTimeout(() => this.updateSelectionPrompt(), 2000);
                return;
            }
            this.selectionEnd = index;
            this.selectionMode = 'done';
            this.renderTextPreview();
            this.updateSelectionPrompt();
        } else if (this.selectionMode === 'done') {
            this.finalizeManualSelection();
        }
    },

    // Update the selection prompt
    updateSelectionPrompt(customMessage = null) {
        const prompt = document.getElementById('selection-prompt');

        if (customMessage) {
            prompt.textContent = customMessage;
            prompt.classList.remove('hidden');
            return;
        }

        if (this.selectionMode === 'start') {
            prompt.textContent = 'Click where you want your passage to start';
        } else if (this.selectionMode === 'end') {
            prompt.textContent = 'Click where you want your passage to end';
        } else if (this.selectionMode === 'done') {
            prompt.textContent = 'Click anywhere to accept this passage';
        }

        prompt.classList.remove('hidden');
    },

    // Finalize manual selection
    finalizeManualSelection() {
        const chunk = this.fullBookText.substring(this.selectionStart, this.selectionEnd + 1);
        this.currentText = chunk;

        // Show the selected chunk in the main passage display
        const passageDisplay = document.getElementById('passage-text');
        passageDisplay.textContent = chunk;

        // Clean up manual selection mode
        this.cancelManualSelection();
    },

    // Cancel manual selection
    cancelManualSelection() {
        document.getElementById('manual-selection-area').classList.add('hidden');
        document.getElementById('passage-display').classList.remove('hidden');
        document.getElementById('selection-prompt').classList.add('hidden');

        // Show main buttons, hide cancel
        document.getElementById('reroll-passage-btn').classList.remove('hidden');
        document.getElementById('choose-passage-btn').classList.remove('hidden');
        document.getElementById('accept-passage-btn').classList.remove('hidden');
        document.getElementById('cancel-manual-btn').classList.add('hidden');

        // Remove click handler
        const preview = document.getElementById('text-preview');
        if (this.textClickHandler) {
            preview.removeEventListener('click', this.textClickHandler);
            this.textClickHandler = null;
        }
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
