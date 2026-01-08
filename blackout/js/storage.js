// Local Storage Manager
const Storage = {
    KEYS: {
        CURRENT_BOOK: 'dailybread_current_book',
        CURRENT_TEXT: 'dailybread_current_text',
        BLACKOUTS: 'dailybread_blackouts',
        STYLE: 'dailybread_style',
        HAS_SEEN_HINT: 'dailybread_has_seen_hint'
    },

    // Save current book information
    saveBook(bookData) {
        try {
            localStorage.setItem(this.KEYS.CURRENT_BOOK, JSON.stringify(bookData));
        } catch (e) {
            console.error('Error saving book data:', e);
        }
    },

    // Get current book information
    getBook() {
        try {
            const data = localStorage.getItem(this.KEYS.CURRENT_BOOK);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading book data:', e);
            return null;
        }
    },

    // Save current text chunk
    saveText(textData) {
        try {
            localStorage.setItem(this.KEYS.CURRENT_TEXT, JSON.stringify(textData));
        } catch (e) {
            console.error('Error saving text data:', e);
        }
    },

    // Get current text chunk
    getText() {
        try {
            const data = localStorage.getItem(this.KEYS.CURRENT_TEXT);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading text data:', e);
            return null;
        }
    },

    // Save blackout data
    saveBlackouts(blackouts) {
        try {
            localStorage.setItem(this.KEYS.BLACKOUTS, JSON.stringify(blackouts));
        } catch (e) {
            console.error('Error saving blackouts:', e);
        }
    },

    // Get blackout data
    getBlackouts() {
        try {
            const data = localStorage.getItem(this.KEYS.BLACKOUTS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading blackouts:', e);
            return [];
        }
    },

    // Save current blackout style
    saveStyle(style) {
        try {
            localStorage.setItem(this.KEYS.STYLE, style);
        } catch (e) {
            console.error('Error saving style:', e);
        }
    },

    // Get current blackout style
    getStyle() {
        try {
            return localStorage.getItem(this.KEYS.STYLE) || 'bar';
        } catch (e) {
            console.error('Error loading style:', e);
            return 'bar';
        }
    },

    // Clear all data
    clearAll() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (e) {
            console.error('Error clearing storage:', e);
        }
    },

    // Clear only blackout data (for starting fresh with same text)
    clearBlackouts() {
        try {
            localStorage.removeItem(this.KEYS.BLACKOUTS);
        } catch (e) {
            console.error('Error clearing blackouts:', e);
        }
    },

    // Save whether user has seen the hint
    saveHasSeenHint(value) {
        try {
            localStorage.setItem(this.KEYS.HAS_SEEN_HINT, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving hint status:', e);
        }
    },

    // Get whether user has seen the hint
    getHasSeenHint() {
        try {
            const data = localStorage.getItem(this.KEYS.HAS_SEEN_HINT);
            return data ? JSON.parse(data) : false;
        } catch (e) {
            console.error('Error loading hint status:', e);
            return false;
        }
    }
};
