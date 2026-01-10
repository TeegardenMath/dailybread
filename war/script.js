// Card Constants
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const SUIT_SYMBOLS = {
    hearts: '\u2665',
    diamonds: '\u2666',
    clubs: '\u2663',
    spades: '\u2660'
};
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Face card art (emoji placeholders)
const FACE_CARD_ART = {
    'J': ['🤴', '🧙', '🎭', '🗡️'],
    'Q': ['👸', '🧝', '🌹', '💎'],
    'K': ['👑', '🦁', '⚔️', '🏰']
};

// Game State
let playerCollection = []; // Player's permanent 52-card collection
let playerHand = [];       // Cards in hand during current game
let opponentHand = [];
let playerDiscard = [];    // Won cards pile during current game
let opponentDiscard = [];
let boosterPacks = [];
let currentPackCards = [];
let currentPackIndex = 0;
let selectedDeckCard = null;
let selectedNewCard = null;
let gameSpeed = 800;
let isPlaying = true;
let gameEnding = false;    // Prevents multiple endGame calls

// Rarity weights (lower = rarer)
const RARITY_WEIGHTS = {
    '2': 100, '3': 95, '4': 90, '5': 85, '6': 80,
    '7': 75, '8': 70, '9': 65, '10': 60,
    'J': 40, 'Q': 35, 'K': 30, 'A': 20
};

// Initialize game
function init() {
    // Create player's permanent collection
    playerCollection = createStandardDeck();

    setupEventListeners();
    startNewGame();
    startGameLoop();
}

// Create a standard 52-card deck
function createStandardDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (const value of VALUES) {
            deck.push({
                suit,
                value,
                id: `${value}_${suit}_${Date.now()}_${Math.random()}`,
                foil: false,
                specialArt: false
            });
        }
    }
    return deck;
}

// Fisher-Yates shuffle
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Start a new game with current collections
function startNewGame() {
    gameEnding = false;

    // Copy player's collection for this game
    playerHand = playerCollection.map(card => ({...card}));
    shuffleDeck(playerHand);

    // Create fresh opponent deck
    opponentHand = createStandardDeck();
    shuffleDeck(opponentHand);

    playerDiscard = [];
    opponentDiscard = [];

    // Clear played cards
    document.getElementById('player-played').innerHTML = '';
    document.getElementById('opponent-played').innerHTML = '';

    updateDeckCounts();
}

// Get card value for comparison
function getCardPower(card) {
    return VALUES.indexOf(card.value);
}

// Create card DOM element
function createCardElement(card) {
    const div = document.createElement('div');
    div.className = 'card';

    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    div.classList.add(isRed ? 'red' : 'black');

    if (card.foil) div.classList.add('foil');
    if (card.specialArt) div.classList.add('special-art');

    const symbol = SUIT_SYMBOLS[card.suit];
    const displayValue = card.value;

    let centerContent = symbol;
    if (card.specialArt && ['J', 'Q', 'K'].includes(card.value)) {
        const artIndex = SUITS.indexOf(card.suit);
        centerContent = FACE_CARD_ART[card.value][artIndex];
    }

    div.innerHTML = `
        <div class="card-corner top">${displayValue}<br>${symbol}</div>
        <div class="card-center">${centerContent}</div>
        <div class="card-corner bottom">${displayValue}<br>${symbol}</div>
    `;

    div.dataset.cardId = card.id;
    return div;
}

// Play a round
function playRound() {
    if (!isPlaying || gameEnding) return;

    // Check if hands are empty, reshuffle discard
    if (playerHand.length === 0) {
        if (playerDiscard.length === 0) {
            endGame(false);
            return;
        }
        playerHand = [...playerDiscard];
        playerDiscard = [];
        shuffleDeck(playerHand);
    }

    if (opponentHand.length === 0) {
        if (opponentDiscard.length === 0) {
            endGame(true);
            return;
        }
        opponentHand = [...opponentDiscard];
        opponentDiscard = [];
        shuffleDeck(opponentHand);
    }

    const playerCard = playerHand.shift();
    const opponentCard = opponentHand.shift();

    displayPlayedCard(playerCard, 'player');
    displayPlayedCard(opponentCard, 'opponent');

    setTimeout(() => {
        if (!gameEnding) {
            compareCards(playerCard, opponentCard, [playerCard], [opponentCard]);
        }
    }, 300);
}

// Display a played card
function displayPlayedCard(card, side) {
    const slot = document.getElementById(`${side}-played`);
    slot.innerHTML = '';

    const cardEl = createCardElement(card);
    cardEl.classList.add('playing');
    slot.appendChild(cardEl);

    updateDeckCounts();
}

// Update deck count displays
function updateDeckCounts() {
    const playerTotal = playerHand.length + playerDiscard.length;
    const opponentTotal = opponentHand.length + opponentDiscard.length;

    document.getElementById('player-count').textContent = playerTotal;
    document.getElementById('opponent-count').textContent = opponentTotal;
}

// Compare cards and determine winner
function compareCards(playerCard, opponentCard, playerPile, opponentPile) {
    if (gameEnding) return;

    const playerPower = getCardPower(playerCard);
    const opponentPower = getCardPower(opponentCard);

    const playerSlot = document.getElementById('player-played');
    const opponentSlot = document.getElementById('opponent-played');

    if (playerPower > opponentPower) {
        playerSlot.querySelector('.card')?.classList.add('winning');
        opponentSlot.querySelector('.card')?.classList.add('losing');
        playerDiscard.push(...playerPile, ...opponentPile);
    } else if (opponentPower > playerPower) {
        opponentSlot.querySelector('.card')?.classList.add('winning');
        playerSlot.querySelector('.card')?.classList.add('losing');
        opponentDiscard.push(...playerPile, ...opponentPile);
    } else {
        handleWar(playerPile, opponentPile);
        return;
    }

    checkGameEnd();
}

// Handle war (tie)
function handleWar(playerPile, opponentPile) {
    if (gameEnding) return;

    const battleZone = document.getElementById('battle-zone');
    battleZone.classList.add('battle-flash');
    setTimeout(() => battleZone.classList.remove('battle-flash'), 600);

    const playerWarCards = [];
    const opponentWarCards = [];

    for (let i = 0; i < 4; i++) {
        if (playerHand.length === 0 && playerDiscard.length > 0) {
            playerHand = [...playerDiscard];
            playerDiscard = [];
            shuffleDeck(playerHand);
        }
        if (opponentHand.length === 0 && opponentDiscard.length > 0) {
            opponentHand = [...opponentDiscard];
            opponentDiscard = [];
            shuffleDeck(opponentHand);
        }

        if (playerHand.length > 0) {
            playerWarCards.push(playerHand.shift());
        }
        if (opponentHand.length > 0) {
            opponentWarCards.push(opponentHand.shift());
        }
    }

    if (playerWarCards.length === 0) {
        opponentDiscard.push(...playerPile, ...opponentPile);
        checkGameEnd();
        return;
    }
    if (opponentWarCards.length === 0) {
        playerDiscard.push(...playerPile, ...opponentPile);
        checkGameEnd();
        return;
    }

    setTimeout(() => {
        if (gameEnding) return;

        const newPlayerCard = playerWarCards[playerWarCards.length - 1];
        const newOpponentCard = opponentWarCards[opponentWarCards.length - 1];

        displayPlayedCard(newPlayerCard, 'player');
        displayPlayedCard(newOpponentCard, 'opponent');

        setTimeout(() => {
            if (!gameEnding) {
                compareCards(
                    newPlayerCard,
                    newOpponentCard,
                    [...playerPile, ...playerWarCards],
                    [...opponentPile, ...opponentWarCards]
                );
            }
        }, 300);
    }, 400);
}

// Check if game has ended
function checkGameEnd() {
    if (gameEnding) return;

    const playerTotal = playerHand.length + playerDiscard.length;
    const opponentTotal = opponentHand.length + opponentDiscard.length;

    if (playerTotal === 0) {
        endGame(false);
    } else if (opponentTotal === 0) {
        endGame(true);
    }
}

// End the current game
function endGame(playerWon) {
    if (gameEnding) return; // Prevent multiple calls
    gameEnding = true;

    showNotification(playerWon);

    if (playerWon) {
        awardBoosterPack();
    }

    setTimeout(() => {
        startNewGame();
    }, 1500);
}

// Show win/lose notification
function showNotification(isWin) {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${isWin ? 'win' : 'lose'}`;
    notification.textContent = isWin ? 'Victory! +1 Booster Pack' : 'Defeat';
    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Award a booster pack
function awardBoosterPack() {
    const pack = generateBoosterPack();
    boosterPacks.push(pack);
    renderBoosterPacks();
}

// Generate a booster pack with 15 cards
function generateBoosterPack() {
    const cards = [];
    let hasFoil = false;

    for (let i = 0; i < 15; i++) {
        const card = generateRandomCard();

        if (i === 14 && !hasFoil) {
            card.foil = true;
        }

        if (card.foil) hasFoil = true;
        cards.push(card);
    }

    return cards;
}

// Generate a random card with rarity considerations
function generateRandomCard() {
    const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let selectedValue = '2';

    for (const [value, weight] of Object.entries(RARITY_WEIGHTS)) {
        random -= weight;
        if (random <= 0) {
            selectedValue = value;
            break;
        }
    }

    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const isFoil = Math.random() < 0.10;
    const isSpecialArt = ['J', 'Q', 'K'].includes(selectedValue) && Math.random() < 0.20;

    return {
        suit,
        value: selectedValue,
        id: `${selectedValue}_${suit}_${Date.now()}_${Math.random()}`,
        foil: isFoil,
        specialArt: isSpecialArt
    };
}

// Render booster packs
function renderBoosterPacks() {
    const container = document.getElementById('booster-packs');
    container.innerHTML = '';

    boosterPacks.forEach((pack, index) => {
        const packEl = document.createElement('div');
        packEl.className = 'booster-pack';
        packEl.addEventListener('click', () => openBoosterPack(index));
        container.appendChild(packEl);
    });
}

// Open a booster pack
function openBoosterPack(index) {
    const pack = boosterPacks[index];
    if (!pack) return;

    playPackOpenSound();

    const packEls = document.querySelectorAll('.booster-pack');
    if (packEls[index]) {
        packEls[index].classList.add('pack-opening');
    }

    setTimeout(() => {
        boosterPacks.splice(index, 1);
        renderBoosterPacks();

        currentPackCards = pack;
        currentPackIndex = 0;
        showPackOpener();
    }, 500);
}

// Play pack open sound
function playPackOpenSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
        // Audio not supported
    }
}

// Show pack opener overlay
function showPackOpener() {
    isPlaying = false;
    const overlay = document.getElementById('pack-opener');
    overlay.classList.remove('hidden');

    renderCurrentPackCard();
    updateCardStack();
    updateCardCounter();
    updateNavArrows();
}

// Render current card in pack opener
function renderCurrentPackCard() {
    const container = document.getElementById('current-card');
    container.innerHTML = '';

    if (currentPackCards[currentPackIndex]) {
        const cardEl = createCardElement(currentPackCards[currentPackIndex]);
        container.appendChild(cardEl);
    }
}

// Update card stack visualization
function updateCardStack() {
    const stack = document.getElementById('card-stack');
    stack.innerHTML = '';

    const remainingCards = currentPackCards.length - currentPackIndex - 1;
    const visibleStack = Math.min(remainingCards, 5);

    for (let i = visibleStack - 1; i >= 0; i--) {
        const cardIndex = currentPackIndex + 1 + i;
        if (cardIndex < currentPackCards.length) {
            const card = currentPackCards[cardIndex];
            const cardEl = createCardElement(card);
            cardEl.classList.add('stack-card-visual');
            cardEl.style.transform = `translateX(${(i + 1) * 8}px)`;
            cardEl.style.zIndex = -i - 1;
            stack.appendChild(cardEl);
        }
    }
}

// Update card counter
function updateCardCounter() {
    const counter = document.getElementById('card-counter');
    counter.textContent = `Card ${currentPackIndex + 1} of ${currentPackCards.length}`;
}

// Update navigation arrows
function updateNavArrows() {
    document.getElementById('prev-card').disabled = currentPackIndex === 0;
    document.getElementById('next-card').disabled = currentPackIndex === currentPackCards.length - 1;
}

// Navigate pack cards
function navigatePackCards(direction) {
    currentPackIndex += direction;
    currentPackIndex = Math.max(0, Math.min(currentPackIndex, currentPackCards.length - 1));

    renderCurrentPackCard();
    updateCardStack();
    updateCardCounter();
    updateNavArrows();
}

// Show swap screen
function showSwapScreen() {
    document.getElementById('pack-opener').classList.add('hidden');
    document.getElementById('swap-screen').classList.remove('hidden');

    selectedDeckCard = null;
    selectedNewCard = null;

    renderSwapScreenDecks();
    updateSwapButton();
}

// Render decks in swap screen
function renderSwapScreenDecks() {
    const deckGrid = document.getElementById('your-deck-grid');
    const newGrid = document.getElementById('new-cards-grid');

    deckGrid.innerHTML = '';
    newGrid.innerHTML = '';

    // Sort player's permanent collection by suit and value
    const sortedCollection = [...playerCollection].sort((a, b) => {
        const suitDiff = SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
        if (suitDiff !== 0) return suitDiff;
        return VALUES.indexOf(a.value) - VALUES.indexOf(b.value);
    });

    sortedCollection.forEach(card => {
        const cardEl = createCardElement(card);
        cardEl.addEventListener('click', () => selectDeckCard(card, cardEl));
        deckGrid.appendChild(cardEl);
    });

    currentPackCards.forEach(card => {
        const cardEl = createCardElement(card);
        cardEl.addEventListener('click', () => selectNewCard(card, cardEl));
        newGrid.appendChild(cardEl);
    });
}

// Select a card from player's deck
function selectDeckCard(card, element) {
    document.querySelectorAll('#your-deck-grid .card.selected').forEach(el => {
        el.classList.remove('selected');
    });

    element.classList.add('selected');
    selectedDeckCard = card;

    const swapOut = document.getElementById('swap-out');
    swapOut.innerHTML = '';
    swapOut.appendChild(createCardElement(card));

    updateSwapButton();
}

// Select a card from new cards
function selectNewCard(card, element) {
    document.querySelectorAll('#new-cards-grid .card.selected').forEach(el => {
        el.classList.remove('selected');
    });

    element.classList.add('selected');
    selectedNewCard = card;

    const swapIn = document.getElementById('swap-in');
    swapIn.innerHTML = '';
    swapIn.appendChild(createCardElement(card));

    updateSwapButton();
}

// Update swap button state
function updateSwapButton() {
    const swapBtn = document.getElementById('swap-btn');
    swapBtn.disabled = !selectedDeckCard || !selectedNewCard;
}

// Perform swap
function performSwap() {
    if (!selectedDeckCard || !selectedNewCard) return;

    // Find and replace in player's permanent collection
    const index = playerCollection.findIndex(c => c.id === selectedDeckCard.id);
    if (index !== -1) {
        playerCollection[index] = selectedNewCard;
    }

    // Remove from new cards
    const newIndex = currentPackCards.findIndex(c => c.id === selectedNewCard.id);
    if (newIndex !== -1) {
        currentPackCards.splice(newIndex, 1);
    }

    // Reset selection
    selectedDeckCard = null;
    selectedNewCard = null;

    document.getElementById('swap-out').innerHTML = '<span>Select from deck</span>';
    document.getElementById('swap-in').innerHTML = '<span>Select new card</span>';

    renderSwapScreenDecks();
    updateSwapButton();
}

// Discard remaining cards and close swap screen
function discardRemainingCards() {
    currentPackCards = [];
    document.getElementById('swap-screen').classList.add('hidden');
    isPlaying = true;
}

// Show deck viewer
function showDeckViewer() {
    isPlaying = false;
    const overlay = document.getElementById('deck-viewer');
    overlay.classList.remove('hidden');

    const grid = document.getElementById('deck-grid');
    grid.innerHTML = '';

    // Sort player's permanent collection
    const sortedCollection = [...playerCollection].sort((a, b) => {
        const suitDiff = SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
        if (suitDiff !== 0) return suitDiff;
        return VALUES.indexOf(a.value) - VALUES.indexOf(b.value);
    });

    sortedCollection.forEach(card => {
        const cardEl = createCardElement(card);
        cardEl.addEventListener('mouseenter', (e) => showMagnifiedCard(card, e));
        cardEl.addEventListener('mouseleave', hideMagnifiedCard);
        cardEl.addEventListener('click', (e) => {
            showMagnifiedCard(card, e);
            setTimeout(hideMagnifiedCard, 2000);
        });
        grid.appendChild(cardEl);
    });
}

// Show magnified card
function showMagnifiedCard(card, event) {
    const magnified = document.getElementById('magnified-card');
    magnified.innerHTML = '';
    magnified.classList.remove('hidden');

    const cardEl = createCardElement(card);
    magnified.appendChild(cardEl);

    const rect = event.target.getBoundingClientRect();
    let x = rect.left + rect.width / 2;
    let y = rect.top - 120;

    if (y < 10) y = rect.bottom + 10;
    if (x < 100) x = 100;
    if (x > window.innerWidth - 100) x = window.innerWidth - 100;

    magnified.style.left = `${x}px`;
    magnified.style.top = `${y}px`;
}

// Hide magnified card
function hideMagnifiedCard() {
    const magnified = document.getElementById('magnified-card');
    magnified.classList.add('hidden');
}

// Close deck viewer
function closeDeckViewer() {
    document.getElementById('deck-viewer').classList.add('hidden');
    isPlaying = true;
}

// Setup event listeners
function setupEventListeners() {
    // Deck viewer - click on deck or label
    document.getElementById('player-deck').addEventListener('click', showDeckViewer);
    document.getElementById('close-deck-viewer').addEventListener('click', closeDeckViewer);
    document.getElementById('deck-viewer').addEventListener('click', (e) => {
        if (e.target.id === 'deck-viewer') closeDeckViewer();
    });

    // Pack opener navigation
    document.getElementById('prev-card').addEventListener('click', () => navigatePackCards(-1));
    document.getElementById('next-card').addEventListener('click', () => navigatePackCards(1));
    document.getElementById('add-to-deck-btn').addEventListener('click', showSwapScreen);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const packOpener = document.getElementById('pack-opener');
        if (!packOpener.classList.contains('hidden')) {
            if (e.key === 'ArrowLeft') navigatePackCards(-1);
            if (e.key === 'ArrowRight') navigatePackCards(1);
            if (e.key === 'Escape') showSwapScreen();
        }

        const deckViewer = document.getElementById('deck-viewer');
        if (!deckViewer.classList.contains('hidden') && e.key === 'Escape') {
            closeDeckViewer();
        }
    });

    // Swap screen
    document.getElementById('swap-btn').addEventListener('click', performSwap);
    document.getElementById('discard-btn').addEventListener('click', discardRemainingCards);
}

// Start game loop
function startGameLoop() {
    setInterval(() => {
        if (isPlaying && !gameEnding) {
            playRound();
        }
    }, gameSpeed);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
