// Blackout Poetry Editor
const Editor = {
    currentStyle: 'bar',
    selectedElements: new Set(),
    undoStack: [],
    maxUndoSteps: 50,

    // Initialize the editor with text
    init(text) {
        this.selectedElements.clear();
        this.undoStack = [];

        const container = document.getElementById('poetry-text');
        container.innerHTML = '';

        // Split text into words and spaces, creating selectable spans
        const tokens = this.tokenizeText(text);

        tokens.forEach((token, index) => {
            if (token.trim().length > 0) {
                // Create a span for each word
                const span = document.createElement('span');
                span.textContent = token;
                span.dataset.index = index;
                span.className = 'word';

                span.addEventListener('click', () => this.toggleWord(span));

                container.appendChild(span);
            } else {
                // Add whitespace as text node
                container.appendChild(document.createTextNode(token));
            }
        });

        // Load saved blackouts if any
        const savedBlackouts = Storage.getBlackouts();
        if (savedBlackouts.length > 0) {
            savedBlackouts.forEach(index => {
                const span = container.querySelector(`[data-index="${index}"]`);
                if (span) {
                    span.classList.add('selected');
                    this.selectedElements.add(index);
                }
            });
        }

        // Load saved style
        this.currentStyle = Storage.getStyle();
        this.updateStyleButtons();

        // Setup canvas
        this.setupCanvas();
    },

    // Tokenize text into words and whitespace
    tokenizeText(text) {
        const tokens = [];
        let currentToken = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (char === ' ' || char === '\n' || char === '\t') {
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = '';
                }
                tokens.push(char);
            } else {
                currentToken += char;
            }
        }

        if (currentToken) {
            tokens.push(currentToken);
        }

        return tokens;
    },

    // Setup canvas for drawing blackouts
    setupCanvas() {
        const container = document.getElementById('poetry-canvas-container');
        const canvas = document.getElementById('blackout-canvas');
        const textDiv = document.getElementById('poetry-text');

        // Set canvas size to match container
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;

        // Redraw blackouts
        this.redrawBlackouts();
    },

    // Toggle word selection
    toggleWord(span) {
        const index = parseInt(span.dataset.index);

        // Save state for undo
        this.saveState();

        if (this.selectedElements.has(index)) {
            this.selectedElements.delete(index);
            span.classList.remove('selected');
        } else {
            this.selectedElements.add(index);
            span.classList.add('selected');
        }

        // Save to storage
        Storage.saveBlackouts(Array.from(this.selectedElements));

        // Redraw
        this.redrawBlackouts();
    },

    // Save current state for undo
    saveState() {
        this.undoStack.push(new Set(this.selectedElements));

        // Limit undo stack size
        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }
    },

    // Undo last action
    undo() {
        if (this.undoStack.length === 0) {
            return;
        }

        const previousState = this.undoStack.pop();
        this.selectedElements = new Set(previousState);

        // Update UI
        const container = document.getElementById('poetry-text');
        const allSpans = container.querySelectorAll('span');

        allSpans.forEach(span => {
            const index = parseInt(span.dataset.index);
            if (this.selectedElements.has(index)) {
                span.classList.add('selected');
            } else {
                span.classList.remove('selected');
            }
        });

        // Save to storage
        Storage.saveBlackouts(Array.from(this.selectedElements));

        // Redraw
        this.redrawBlackouts();
    },

    // Clear all blackouts
    clearAll() {
        this.saveState();

        this.selectedElements.clear();

        const container = document.getElementById('poetry-text');
        const allSpans = container.querySelectorAll('span');
        allSpans.forEach(span => span.classList.remove('selected'));

        Storage.clearBlackouts();
        this.redrawBlackouts();
    },

    // Set blackout style
    setStyle(style) {
        this.currentStyle = style;
        Storage.saveStyle(style);
        this.updateStyleButtons();
        this.redrawBlackouts();
    },

    // Update style button states
    updateStyleButtons() {
        document.getElementById('style-bar').classList.remove('active');
        document.getElementById('style-scribble').classList.remove('active');

        if (this.currentStyle === 'bar') {
            document.getElementById('style-bar').classList.add('active');
        } else {
            document.getElementById('style-scribble').classList.add('active');
        }
    },

    // Redraw all blackouts on canvas
    redrawBlackouts() {
        const canvas = document.getElementById('blackout-canvas');
        const ctx = canvas.getContext('2d');
        const container = document.getElementById('poetry-text');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw blackouts based on style
        this.selectedElements.forEach(index => {
            const span = container.querySelector(`[data-index="${index}"]`);
            if (!span) return;

            const rect = span.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // Calculate position relative to container
            const x = rect.left - containerRect.left + container.scrollLeft;
            const y = rect.top - containerRect.top + container.scrollTop;
            const width = rect.width;
            const height = rect.height;

            ctx.fillStyle = '#000000';

            if (this.currentStyle === 'bar') {
                // Simple black bar
                ctx.fillRect(x, y, width, height);
            } else {
                // Scribble effect
                this.drawScribble(ctx, x, y, width, height);
            }
        });
    },

    // Draw scribble effect
    drawScribble(ctx, x, y, width, height) {
        const scribbleCount = Math.ceil(width / 10);

        ctx.beginPath();

        for (let i = 0; i < scribbleCount; i++) {
            const startX = x + Math.random() * width;
            const startY = y + Math.random() * height;

            ctx.moveTo(startX, startY);

            // Create random scribble path
            const points = 5 + Math.floor(Math.random() * 5);
            for (let j = 0; j < points; j++) {
                const nextX = x + Math.random() * width;
                const nextY = y + Math.random() * height;
                ctx.lineTo(nextX, nextY);
            }
        }

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        // Fill the area
        ctx.fillRect(x, y, width, height);
    },

    // Get canvas for export
    getCanvas() {
        return document.getElementById('blackout-canvas');
    },

    // Get poetry container for export
    getContainer() {
        return document.getElementById('poetry-canvas-container');
    }
};

// Handle window resize
window.addEventListener('resize', () => {
    if (document.getElementById('editor-screen').classList.contains('active')) {
        Editor.setupCanvas();
    }
});
