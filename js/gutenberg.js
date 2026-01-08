// Project Gutenberg API Integration
const Gutenberg = {
    API_BASE: 'https://gutendex.com',
    GUTENBERG_BASE: 'https://www.gutenberg.org',

    // Curated list of popular classics with their Gutenberg IDs
    CURATED_BOOKS: [
        { id: 1342, title: 'Pride and Prejudice', author: 'Jane Austen' },
        { id: 84, title: 'Frankenstein', author: 'Mary Wollstonecraft Shelley' },
        { id: 1661, title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle' },
        { id: 2701, title: 'Moby Dick', author: 'Herman Melville' },
        { id: 174, title: 'The Picture of Dorian Gray', author: 'Oscar Wilde' },
        { id: 1952, title: 'The Yellow Wallpaper', author: 'Charlotte Perkins Gilman' },
        { id: 11, title: 'Alice\'s Adventures in Wonderland', author: 'Lewis Carroll' },
        { id: 1260, title: 'Jane Eyre', author: 'Charlotte Brontë' },
        { id: 98, title: 'A Tale of Two Cities', author: 'Charles Dickens' },
        { id: 1080, title: 'A Modest Proposal', author: 'Jonathan Swift' },
        { id: 16, title: 'Peter Pan', author: 'J. M. Barrie' },
        { id: 768, title: 'Wuthering Heights', author: 'Emily Brontë' }
    ],

    // Fetch book metadata from Gutendex
    async fetchBookMetadata(bookId) {
        try {
            const response = await fetch(`${this.API_BASE}/books/${bookId}`);
            if (!response.ok) throw new Error('Book not found');
            return await response.json();
        } catch (error) {
            console.error('Error fetching book metadata:', error);
            throw error;
        }
    },

    // Search books by title or author
    async searchBooks(query) {
        try {
            const response = await fetch(`${this.API_BASE}/books?search=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Error searching books:', error);
            throw error;
        }
    },

    // Fetch full text of a book
    async fetchBookText(bookId) {
        // Use CORS proxy to avoid browser CORS restrictions
        const CORS_PROXY = 'https://corsproxy.io/?';

        // Try multiple text file formats
        const formats = [
            `${this.GUTENBERG_BASE}/files/${bookId}/${bookId}-0.txt`,
            `${this.GUTENBERG_BASE}/cache/epub/${bookId}/pg${bookId}.txt`,
            `https://www.gutenberg.org/ebooks/${bookId}.txt.utf-8`
        ];

        for (let url of formats) {
            try {
                const proxiedUrl = CORS_PROXY + encodeURIComponent(url);
                const response = await fetch(proxiedUrl);
                if (response.ok) {
                    let text = await response.text();
                    // Clean up Project Gutenberg header and footer
                    text = this.cleanGutenbergText(text);
                    return text;
                }
            } catch (error) {
                console.log(`Failed to fetch from ${url}:`, error);
            }
        }

        throw new Error('Could not fetch book text from any source');
    },

    // Clean up Project Gutenberg boilerplate text
    cleanGutenbergText(text) {
        // Remove header (everything before "*** START OF")
        const startMarkers = [
            '*** START OF THIS PROJECT GUTENBERG',
            '*** START OF THE PROJECT GUTENBERG',
            '***START OF THE PROJECT GUTENBERG'
        ];

        for (let marker of startMarkers) {
            const startIndex = text.indexOf(marker);
            if (startIndex !== -1) {
                // Find the end of the header line
                const lineEnd = text.indexOf('\n', startIndex);
                if (lineEnd !== -1) {
                    text = text.substring(lineEnd + 1);
                }
                break;
            }
        }

        // Remove footer (everything after "*** END OF")
        const endMarkers = [
            '*** END OF THIS PROJECT GUTENBERG',
            '*** END OF THE PROJECT GUTENBERG',
            '***END OF THE PROJECT GUTENBERG'
        ];

        for (let marker of endMarkers) {
            const endIndex = text.indexOf(marker);
            if (endIndex !== -1) {
                text = text.substring(0, endIndex);
                break;
            }
        }

        // Trim whitespace
        text = text.trim();

        return text;
    },

    // Get a random chunk of text
    getRandomChunk(fullText, wordCount = 300) {
        const words = fullText.split(/\s+/);

        if (words.length <= wordCount) {
            return fullText;
        }

        // Try to find a good starting point (not in the middle of a sentence)
        const maxAttempts = 10;
        for (let i = 0; i < maxAttempts; i++) {
            const randomStart = Math.floor(Math.random() * (words.length - wordCount));
            const chunk = words.slice(randomStart, randomStart + wordCount).join(' ');

            // Check if it starts with a capital letter (likely beginning of sentence)
            if (chunk[0] === chunk[0].toUpperCase()) {
                return chunk;
            }
        }

        // If we couldn't find a good spot, just return from the beginning
        return words.slice(0, wordCount).join(' ');
    },

    // Extract text between two indices
    extractChunk(fullText, startIndex, endIndex) {
        return fullText.substring(startIndex, endIndex).trim();
    },

    // Format book display information
    formatBookInfo(book) {
        const authors = book.authors && book.authors.length > 0
            ? book.authors.map(a => a.name).join(', ')
            : 'Unknown Author';

        const downloads = book.download_count || 0;

        return {
            id: book.id,
            title: book.title,
            author: authors,
            downloads: downloads
        };
    }
};
