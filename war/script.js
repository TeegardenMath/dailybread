// Card Constants
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const SUIT_SYMBOLS = {
    hearts: '\u2665',
    diamonds: '\u2666',
    clubs: '\u2663',
    spades: '\u2660'
};
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const CARD_VALUES = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11 };

const FACE_CARD_ART = {
    'J': ['🤴', '🧙', '🎭', '🗡️'],
    'Q': ['👸', '🧝', '🌹', '💎'],
    'K': ['👑', '🦁', '⚔️', '🏰']
};

// Opponents
const OPPONENTS = [
    { id: 'rookie', name: 'Rookie', winsRequired: 0, coinReward: 5, maxBet: 5, deckBias: null },
    { id: 'dealer', name: 'The Dealer', winsRequired: 5, coinReward: 10, maxBet: 10, deckBias: { high: 0.1 } },
    { id: 'shark', name: 'Card Shark', winsRequired: 15, coinReward: 15, maxBet: 20, deckBias: { high: 0.2 } },
    { id: 'hustler', name: 'The Hustler', winsRequired: 30, coinReward: 25, maxBet: 50, deckBias: { high: 0.3 } },
    { id: 'champion', name: 'Champion', winsRequired: 50, coinReward: 40, maxBet: 100, deckBias: { high: 0.4 } },
    { id: 'legend', name: 'The Legend', winsRequired: 100, coinReward: 75, maxBet: 200, deckBias: { high: 0.5 } }
];

// Store items
const STORE_ITEMS = [
    { id: 'booster', name: 'Booster Pack', desc: '15 random cards', price: 1, type: 'consumable', repeatable: true },
    { id: 'speed2x', name: 'Speed 2x', desc: 'Unlock 2x speed', price: 10, type: 'upgrade', tier: 1 },
    { id: 'speed3x', name: 'Speed 3x', desc: 'Unlock 3x speed', price: 20, type: 'upgrade', tier: 2, requires: 'speed2x' },
    { id: 'speed5x', name: 'Speed 5x', desc: 'Unlock 5x speed', price: 40, type: 'upgrade', tier: 3, requires: 'speed3x' },
    { id: 'speed10x', name: 'Speed 10x', desc: 'Unlock 10x speed', price: 80, type: 'upgrade', tier: 4, requires: 'speed5x' },
    { id: 'back_blue', name: 'Blue Deck', desc: 'Blue card backs', price: 5, type: 'cosmetic' },
    { id: 'back_purple', name: 'Purple Deck', desc: 'Purple card backs', price: 10, type: 'cosmetic' },
    { id: 'back_gold', name: 'Gold Deck', desc: 'Gold card backs', price: 25, type: 'cosmetic' },
    { id: 'blackjack', name: 'Blackjack', desc: '+1 coin when cards sum to 21', price: 15, type: 'upgrade', winsRequired: 10 },
    { id: 'betting', name: 'High Stakes', desc: 'Unlock betting on games', price: 20, type: 'upgrade', winsRequired: 20 },
    { id: 'deck_up', name: 'Bigger Deck', desc: '+4 cards to deck', price: 15, type: 'deck_mod', repeatable: true },
    { id: 'deck_down', name: 'Smaller Deck', desc: '-4 cards from deck', price: 15, type: 'deck_mod', repeatable: true }
];

// Game State
let coins = 10;
let totalWins = 0;
let playerCollection = [];
let playerHand = [];
let opponentHand = [];
let playerDiscard = [];
let opponentDiscard = [];
let boosterPacks = [];
let currentPackCards = [];
let currentPackIndex = 0;
let selectedDeckCard = null;
let selectedNewCard = null;

let baseGameSpeed = 800;
let currentSpeedMultiplier = 1;
let unlockedSpeeds = [1];
let isPlaying = true;
let gameEnding = false;

let currentOpponent = OPPONENTS[0];
let currentBet = 0;
let purchasedItems = [];
let deckBack = '';
let hasBlackjack = false;
let hasBetting = false;
let targetDeckSize = 52;

// Rarity weights
const RARITY_WEIGHTS = {
    '2': 100, '3': 95, '4': 90, '5': 85, '6': 80,
    '7': 75, '8': 70, '9': 65, '10': 60,
    'J': 40, 'Q': 35, 'K': 30, 'A': 20
};

// Initialize
function init() {
    loadGame();
    if (playerCollection.length === 0) {
        playerCollection = createStandardDeck();
    }
    setupEventListeners();
    renderOpponents();
    renderStore();
    renderSpeedControls();
    updateUI();
    startNewGame();
    startGameLoop();
}

// Save/Load
function saveGame() {
    const save = {
        coins, totalWins, playerCollection, boosterPacks,
        purchasedItems, deckBack, unlockedSpeeds, currentSpeedMultiplier,
        currentOpponent: currentOpponent.id, targetDeckSize
    };
    localStorage.setItem('warGame', JSON.stringify(save));
}

function loadGame() {
    const save = localStorage.getItem('warGame');
    if (save) {
        const data = JSON.parse(save);
        coins = data.coins ?? 10;
        totalWins = data.totalWins || 0;
        playerCollection = data.playerCollection || [];
        boosterPacks = data.boosterPacks || [];
        purchasedItems = data.purchasedItems || [];
        deckBack = data.deckBack || '';
        unlockedSpeeds = data.unlockedSpeeds || [1];
        currentSpeedMultiplier = data.currentSpeedMultiplier || 1;
        targetDeckSize = data.targetDeckSize || 52;
        currentOpponent = OPPONENTS.find(o => o.id === data.currentOpponent) || OPPONENTS[0];

        hasBlackjack = purchasedItems.includes('blackjack');
        hasBetting = purchasedItems.includes('betting');
    }
}

// Deck creation
function createStandardDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (const value of VALUES) {
            deck.push({
                suit, value,
                id: `${value}_${suit}_${Date.now()}_${Math.random()}`,
                foil: false, specialArt: false
            });
        }
    }
    return deck;
}

function createOpponentDeck(opponent) {
    const deck = createStandardDeck();
    if (opponent.deckBias?.high) {
        // Replace some low cards with high cards
        const highCards = ['10', 'J', 'Q', 'K', 'A'];
        const replaceCount = Math.floor(52 * opponent.deckBias.high);
        for (let i = 0; i < replaceCount && i < deck.length; i++) {
            if (!highCards.includes(deck[i].value)) {
                deck[i].value = highCards[Math.floor(Math.random() * highCards.length)];
            }
        }
    }
    return deck;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Game flow
function startNewGame() {
    gameEnding = false;

    // Use player's collection (adjusted to target size)
    let gameDeck = [...playerCollection];
    while (gameDeck.length < targetDeckSize) {
        const card = createStandardDeck()[Math.floor(Math.random() * 52)];
        card.id = `filler_${Date.now()}_${Math.random()}`;
        gameDeck.push(card);
    }
    if (gameDeck.length > targetDeckSize) {
        gameDeck = gameDeck.slice(0, targetDeckSize);
    }

    playerHand = gameDeck.map(c => ({...c}));
    shuffleDeck(playerHand);

    opponentHand = createOpponentDeck(currentOpponent);
    shuffleDeck(opponentHand);

    playerDiscard = [];
    opponentDiscard = [];

    document.getElementById('player-played').innerHTML = '';
    document.getElementById('opponent-played').innerHTML = '';
    document.getElementById('opponent-name').textContent = currentOpponent.name;

    updateDeckCounts();
    updateDeckBack();
}

function getCardPower(card) {
    return VALUES.indexOf(card.value);
}

function getCardValue(card) {
    return CARD_VALUES[card.value];
}

// Card rendering
function createCardElement(card) {
    const div = document.createElement('div');
    div.className = 'card';
    div.classList.add(card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black');
    if (card.foil) div.classList.add('foil');
    if (card.specialArt) div.classList.add('special-art');

    const symbol = SUIT_SYMBOLS[card.suit];
    let centerContent = symbol;
    if (card.specialArt && ['J', 'Q', 'K'].includes(card.value)) {
        centerContent = FACE_CARD_ART[card.value][SUITS.indexOf(card.suit)];
    }

    div.innerHTML = `
        <div class="card-corner top">${card.value}<br>${symbol}</div>
        <div class="card-center">${centerContent}</div>
        <div class="card-corner bottom">${card.value}<br>${symbol}</div>
    `;
    div.dataset.cardId = card.id;
    return div;
}

// Game loop
function playRound() {
    if (!isPlaying || gameEnding) return;

    if (playerHand.length === 0) {
        if (playerDiscard.length === 0) { endGame(false); return; }
        playerHand = [...playerDiscard];
        playerDiscard = [];
        shuffleDeck(playerHand);
    }
    if (opponentHand.length === 0) {
        if (opponentDiscard.length === 0) { endGame(true); return; }
        opponentHand = [...opponentDiscard];
        opponentDiscard = [];
        shuffleDeck(opponentHand);
    }

    const playerCard = playerHand.shift();
    const opponentCard = opponentHand.shift();

    displayPlayedCard(playerCard, 'player');
    displayPlayedCard(opponentCard, 'opponent');

    // Check blackjack bonus
    if (hasBlackjack) {
        const sum = getCardValue(playerCard) + getCardValue(opponentCard);
        if (sum === 21) {
            coins++;
            showBlackjackBonus();
            updateUI();
            saveGame();
        }
    }

    setTimeout(() => {
        if (!gameEnding) {
            compareCards(playerCard, opponentCard, [playerCard], [opponentCard]);
        }
    }, 200 / currentSpeedMultiplier);
}

function displayPlayedCard(card, side) {
    const slot = document.getElementById(`${side}-played`);
    slot.innerHTML = '';
    const cardEl = createCardElement(card);
    cardEl.classList.add('playing');
    slot.appendChild(cardEl);
    updateDeckCounts();
}

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

function handleWar(playerPile, opponentPile) {
    if (gameEnding) return;

    const battleZone = document.getElementById('battle-zone');
    battleZone.classList.add('battle-flash');
    setTimeout(() => battleZone.classList.remove('battle-flash'), 600);

    const playerWarCards = [], opponentWarCards = [];

    for (let i = 0; i < 4; i++) {
        if (playerHand.length === 0 && playerDiscard.length > 0) {
            playerHand = [...playerDiscard]; playerDiscard = []; shuffleDeck(playerHand);
        }
        if (opponentHand.length === 0 && opponentDiscard.length > 0) {
            opponentHand = [...opponentDiscard]; opponentDiscard = []; shuffleDeck(opponentHand);
        }
        if (playerHand.length > 0) playerWarCards.push(playerHand.shift());
        if (opponentHand.length > 0) opponentWarCards.push(opponentHand.shift());
    }

    if (playerWarCards.length === 0) {
        opponentDiscard.push(...playerPile, ...opponentPile);
        checkGameEnd(); return;
    }
    if (opponentWarCards.length === 0) {
        playerDiscard.push(...playerPile, ...opponentPile);
        checkGameEnd(); return;
    }

    setTimeout(() => {
        if (gameEnding) return;
        const newPlayerCard = playerWarCards[playerWarCards.length - 1];
        const newOpponentCard = opponentWarCards[opponentWarCards.length - 1];
        displayPlayedCard(newPlayerCard, 'player');
        displayPlayedCard(newOpponentCard, 'opponent');

        setTimeout(() => {
            if (!gameEnding) {
                compareCards(newPlayerCard, newOpponentCard,
                    [...playerPile, ...playerWarCards],
                    [...opponentPile, ...opponentWarCards]);
            }
        }, 200 / currentSpeedMultiplier);
    }, 300 / currentSpeedMultiplier);
}

function checkGameEnd() {
    if (gameEnding) return;
    const playerTotal = playerHand.length + playerDiscard.length;
    const opponentTotal = opponentHand.length + opponentDiscard.length;
    if (playerTotal === 0) endGame(false);
    else if (opponentTotal === 0) endGame(true);
}

function endGame(playerWon) {
    if (gameEnding) return;
    gameEnding = true;

    if (playerWon) {
        totalWins++;
        let reward = currentOpponent.coinReward;
        if (currentBet > 0) reward += currentBet * 2;
        coins += reward;
        showNotification(`Victory! +${reward} coins`, 'win');
    } else {
        if (currentBet > 0) {
            showNotification(`Defeat! Lost ${currentBet} coins`, 'lose');
        } else {
            showNotification('Defeat!', 'lose');
        }
    }

    currentBet = 0;
    updateUI();
    renderStore();
    renderOpponents();
    saveGame();

    setTimeout(() => startNewGame(), 1500 / currentSpeedMultiplier);
}

function updateDeckCounts() {
    document.getElementById('player-count').textContent = playerHand.length + playerDiscard.length;
    document.getElementById('opponent-count').textContent = opponentHand.length + opponentDiscard.length;
}

function updateDeckBack() {
    const deckCard = document.getElementById('player-deck-card');
    deckCard.className = 'deck-card';
    if (deckBack) deckCard.classList.add(deckBack);
}

// UI Updates
function updateUI() {
    document.getElementById('coin-count').textContent = coins;
    document.getElementById('wins-count').textContent = `${totalWins} wins`;
    document.getElementById('current-bet').textContent = currentBet;

    const bettingArea = document.getElementById('betting-area');
    bettingArea.classList.toggle('hidden', !hasBetting);

    renderBoosterPacks();
}

function showNotification(text, type) {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = text;
    container.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function showBlackjackBonus() {
    const bonus = document.getElementById('blackjack-bonus');
    bonus.classList.remove('hidden');
    setTimeout(() => bonus.classList.add('hidden'), 1000);
}

// Opponents
function renderOpponents() {
    const list = document.getElementById('opponent-list');
    list.innerHTML = '';

    OPPONENTS.forEach(opp => {
        const div = document.createElement('div');
        div.className = 'opponent-item';

        const unlocked = totalWins >= opp.winsRequired;
        if (!unlocked) div.classList.add('locked');
        if (opp.id === currentOpponent.id) div.classList.add('selected');

        div.innerHTML = `
            <div class="opponent-item-name">${opp.name}</div>
            <div class="opponent-item-info">+${opp.coinReward} coins</div>
            ${!unlocked ? `<div class="opponent-item-unlock">${opp.winsRequired - totalWins} more wins</div>` : ''}
        `;

        if (unlocked) {
            div.addEventListener('click', () => selectOpponent(opp));
        }
        list.appendChild(div);
    });
}

function selectOpponent(opponent) {
    currentOpponent = opponent;
    renderOpponents();
    startNewGame();
    saveGame();
}

// Store
function renderStore() {
    const container = document.getElementById('store-items');
    container.innerHTML = '';

    STORE_ITEMS.forEach(item => {
        if (item.winsRequired && totalWins < item.winsRequired) return;
        if (item.requires && !purchasedItems.includes(item.requires)) return;
        if (!item.repeatable && purchasedItems.includes(item.id)) return;
        if (item.id === 'deck_down' && targetDeckSize <= 20) return;
        if (item.id === 'deck_up' && targetDeckSize >= 100) return;

        const div = document.createElement('div');
        div.className = 'store-item';

        const canAfford = coins >= item.price;
        if (!canAfford) div.classList.add('disabled');

        div.innerHTML = `
            <div class="store-item-name">${item.name}</div>
            <div class="store-item-desc">${item.desc}</div>
            <div class="store-item-price">🪙 ${item.price}</div>
        `;

        if (canAfford) {
            div.addEventListener('click', () => purchaseItem(item));
        }
        container.appendChild(div);
    });
}

function purchaseItem(item) {
    if (coins < item.price) return;

    coins -= item.price;

    switch (item.type) {
        case 'consumable':
            if (item.id === 'booster') awardBoosterPack();
            break;
        case 'upgrade':
            purchasedItems.push(item.id);
            if (item.id.startsWith('speed')) {
                const speed = parseInt(item.id.replace('speed', '').replace('x', ''));
                unlockedSpeeds.push(speed);
                renderSpeedControls();
            }
            if (item.id === 'blackjack') hasBlackjack = true;
            if (item.id === 'betting') hasBetting = true;
            break;
        case 'cosmetic':
            purchasedItems.push(item.id);
            deckBack = item.id.replace('back_', 'back-');
            updateDeckBack();
            break;
        case 'deck_mod':
            if (item.id === 'deck_up') targetDeckSize += 4;
            if (item.id === 'deck_down') targetDeckSize -= 4;
            break;
    }

    updateUI();
    renderStore();
    saveGame();
}

// Speed controls
function renderSpeedControls() {
    const container = document.getElementById('speed-controls');
    container.innerHTML = '';

    unlockedSpeeds.sort((a, b) => a - b).forEach(speed => {
        const btn = document.createElement('button');
        btn.className = 'speed-btn';
        if (speed === currentSpeedMultiplier) btn.classList.add('active');
        btn.textContent = `${speed}x`;
        btn.addEventListener('click', () => setSpeed(speed));
        container.appendChild(btn);
    });
}

function setSpeed(speed) {
    currentSpeedMultiplier = speed;
    renderSpeedControls();
    saveGame();
}

// Betting
function adjustBet(delta) {
    const maxBet = Math.min(coins, currentOpponent.maxBet);
    currentBet = Math.max(0, Math.min(maxBet, currentBet + delta));
    if (currentBet > 0) coins -= delta > 0 ? delta : 0;
    if (delta < 0 && currentBet >= 0) coins -= delta;
    updateUI();
}

// Booster packs
function awardBoosterPack() {
    const cards = [];
    let hasFoil = false;
    for (let i = 0; i < 15; i++) {
        const card = generateRandomCard();
        if (i === 14 && !hasFoil) card.foil = true;
        if (card.foil) hasFoil = true;
        cards.push(card);
    }
    boosterPacks.push(cards);
    renderBoosterPacks();
    saveGame();
}

function generateRandomCard() {
    const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let selectedValue = '2';
    for (const [value, weight] of Object.entries(RARITY_WEIGHTS)) {
        random -= weight;
        if (random <= 0) { selectedValue = value; break; }
    }
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    return {
        suit, value: selectedValue,
        id: `${selectedValue}_${suit}_${Date.now()}_${Math.random()}`,
        foil: Math.random() < 0.10,
        specialArt: ['J', 'Q', 'K'].includes(selectedValue) && Math.random() < 0.20
    };
}

function renderBoosterPacks() {
    const container = document.getElementById('booster-packs');
    container.innerHTML = '';
    boosterPacks.forEach((pack, index) => {
        const div = document.createElement('div');
        div.className = 'booster-pack';
        div.addEventListener('click', () => openBoosterPack(index));
        container.appendChild(div);
    });
}

function openBoosterPack(index) {
    const pack = boosterPacks[index];
    if (!pack) return;
    playPackOpenSound();

    const packEls = document.querySelectorAll('.booster-pack');
    if (packEls[index]) packEls[index].classList.add('pack-opening');

    setTimeout(() => {
        boosterPacks.splice(index, 1);
        renderBoosterPacks();
        currentPackCards = pack;
        currentPackIndex = 0;
        showPackOpener();
        saveGame();
    }, 500);
}

function playPackOpenSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
}

// Pack opener overlay
function showPackOpener() {
    isPlaying = false;
    document.getElementById('pack-opener').classList.remove('hidden');
    renderCurrentPackCard();
    updateCardStack();
    updateCardCounter();
    updateNavArrows();
}

function renderCurrentPackCard() {
    const container = document.getElementById('current-card');
    container.innerHTML = '';
    if (currentPackCards[currentPackIndex]) {
        container.appendChild(createCardElement(currentPackCards[currentPackIndex]));
    }
}

function updateCardStack() {
    const stack = document.getElementById('card-stack');
    stack.innerHTML = '';
    const remaining = currentPackCards.length - currentPackIndex - 1;
    const visible = Math.min(remaining, 5);
    for (let i = visible - 1; i >= 0; i--) {
        const idx = currentPackIndex + 1 + i;
        if (idx < currentPackCards.length) {
            const cardEl = createCardElement(currentPackCards[idx]);
            cardEl.classList.add('stack-card-visual');
            cardEl.style.transform = `translateX(${(i + 1) * 8}px)`;
            cardEl.style.zIndex = -i - 1;
            stack.appendChild(cardEl);
        }
    }
}

function updateCardCounter() {
    document.getElementById('card-counter').textContent =
        `Card ${currentPackIndex + 1} of ${currentPackCards.length}`;
}

function updateNavArrows() {
    document.getElementById('prev-card').disabled = currentPackIndex === 0;
    document.getElementById('next-card').disabled = currentPackIndex === currentPackCards.length - 1;
}

function navigatePackCards(dir) {
    currentPackIndex = Math.max(0, Math.min(currentPackCards.length - 1, currentPackIndex + dir));
    renderCurrentPackCard();
    updateCardStack();
    updateCardCounter();
    updateNavArrows();
}

// Swap screen
function showSwapScreen() {
    document.getElementById('pack-opener').classList.add('hidden');
    document.getElementById('swap-screen').classList.remove('hidden');
    selectedDeckCard = null;
    selectedNewCard = null;
    renderSwapScreenDecks();
    updateSwapButton();
}

function renderSwapScreenDecks() {
    const deckGrid = document.getElementById('your-deck-grid');
    const newGrid = document.getElementById('new-cards-grid');
    deckGrid.innerHTML = '';
    newGrid.innerHTML = '';

    const sorted = [...playerCollection].sort((a, b) => {
        const suitDiff = SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
        return suitDiff !== 0 ? suitDiff : VALUES.indexOf(a.value) - VALUES.indexOf(b.value);
    });

    sorted.forEach(card => {
        const el = createCardElement(card);
        el.addEventListener('click', () => selectDeckCard(card, el));
        deckGrid.appendChild(el);
    });

    currentPackCards.forEach(card => {
        const el = createCardElement(card);
        el.addEventListener('click', () => selectNewCard(card, el));
        newGrid.appendChild(el);
    });
}

function selectDeckCard(card, el) {
    document.querySelectorAll('#your-deck-grid .card.selected').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    selectedDeckCard = card;
    const slot = document.getElementById('swap-out');
    slot.innerHTML = '';
    slot.appendChild(createCardElement(card));
    updateSwapButton();
}

function selectNewCard(card, el) {
    document.querySelectorAll('#new-cards-grid .card.selected').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    selectedNewCard = card;
    const slot = document.getElementById('swap-in');
    slot.innerHTML = '';
    slot.appendChild(createCardElement(card));
    updateSwapButton();
}

function updateSwapButton() {
    document.getElementById('swap-btn').disabled = !selectedDeckCard || !selectedNewCard;
}

function performSwap() {
    if (!selectedDeckCard || !selectedNewCard) return;
    const idx = playerCollection.findIndex(c => c.id === selectedDeckCard.id);
    if (idx !== -1) playerCollection[idx] = selectedNewCard;
    const newIdx = currentPackCards.findIndex(c => c.id === selectedNewCard.id);
    if (newIdx !== -1) currentPackCards.splice(newIdx, 1);
    selectedDeckCard = null;
    selectedNewCard = null;
    document.getElementById('swap-out').innerHTML = '<span>Select from deck</span>';
    document.getElementById('swap-in').innerHTML = '<span>Select new card</span>';
    renderSwapScreenDecks();
    updateSwapButton();
    saveGame();
}

function discardRemainingCards() {
    currentPackCards = [];
    document.getElementById('swap-screen').classList.add('hidden');
    isPlaying = true;
    saveGame();
}

// Deck viewer
function showDeckViewer() {
    isPlaying = false;
    document.getElementById('deck-viewer').classList.remove('hidden');
    const grid = document.getElementById('deck-grid');
    grid.innerHTML = '';

    const sorted = [...playerCollection].sort((a, b) => {
        const suitDiff = SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
        return suitDiff !== 0 ? suitDiff : VALUES.indexOf(a.value) - VALUES.indexOf(b.value);
    });

    sorted.forEach(card => {
        const el = createCardElement(card);
        el.addEventListener('mouseenter', e => showMagnifiedCard(card, e));
        el.addEventListener('mouseleave', hideMagnifiedCard);
        el.addEventListener('click', e => {
            showMagnifiedCard(card, e);
            setTimeout(hideMagnifiedCard, 2000);
        });
        grid.appendChild(el);
    });
}

function showMagnifiedCard(card, event) {
    const mag = document.getElementById('magnified-card');
    mag.innerHTML = '';
    mag.classList.remove('hidden');
    mag.appendChild(createCardElement(card));
    const rect = event.target.getBoundingClientRect();
    let x = rect.left + rect.width / 2;
    let y = rect.top - 120;
    if (y < 10) y = rect.bottom + 10;
    if (x < 100) x = 100;
    if (x > window.innerWidth - 100) x = window.innerWidth - 100;
    mag.style.left = `${x}px`;
    mag.style.top = `${y}px`;
}

function hideMagnifiedCard() {
    document.getElementById('magnified-card').classList.add('hidden');
}

function closeDeckViewer() {
    document.getElementById('deck-viewer').classList.add('hidden');
    isPlaying = true;
}

// Event listeners
function setupEventListeners() {
    document.getElementById('player-deck').addEventListener('click', showDeckViewer);
    document.getElementById('close-deck-viewer').addEventListener('click', closeDeckViewer);
    document.getElementById('deck-viewer').addEventListener('click', e => {
        if (e.target.id === 'deck-viewer') closeDeckViewer();
    });

    document.getElementById('prev-card').addEventListener('click', () => navigatePackCards(-1));
    document.getElementById('next-card').addEventListener('click', () => navigatePackCards(1));
    document.getElementById('add-to-deck-btn').addEventListener('click', showSwapScreen);

    document.addEventListener('keydown', e => {
        if (!document.getElementById('pack-opener').classList.contains('hidden')) {
            if (e.key === 'ArrowLeft') navigatePackCards(-1);
            if (e.key === 'ArrowRight') navigatePackCards(1);
            if (e.key === 'Escape') showSwapScreen();
        }
        if (!document.getElementById('deck-viewer').classList.contains('hidden') && e.key === 'Escape') {
            closeDeckViewer();
        }
    });

    document.getElementById('swap-btn').addEventListener('click', performSwap);
    document.getElementById('discard-btn').addEventListener('click', discardRemainingCards);

    document.getElementById('bet-increase').addEventListener('click', () => {
        if (currentBet < Math.min(coins + currentBet, currentOpponent.maxBet)) {
            currentBet++;
            updateUI();
        }
    });
    document.getElementById('bet-decrease').addEventListener('click', () => {
        if (currentBet > 0) {
            currentBet--;
            updateUI();
        }
    });
}

// Game loop
function startGameLoop() {
    setInterval(() => {
        if (isPlaying && !gameEnding) {
            playRound();
        }
    }, baseGameSpeed / currentSpeedMultiplier);
}

document.addEventListener('DOMContentLoaded', init);
