// Game state
let gameState = {
    selections: {},
    spiralNumber: 0,
    allItems: []
};

// Initialize game
function init() {
    setupCategories();
    document.getElementById('start-spiral').addEventListener('click', startSpiralPhase);
    document.getElementById('play-again').addEventListener('click', resetGame);
    document.getElementById('share-twitter').addEventListener('click', shareTwitter);
    document.getElementById('share-tumblr').addEventListener('click', shareTumblr);
    document.getElementById('copy-discord').addEventListener('click', copyDiscord);
}

// Setup categories with three items each
function setupCategories() {
    const container = document.getElementById('categories');

    Object.keys(gameData).forEach(categoryKey => {
        const category = gameData[categoryKey];
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';

        const title = document.createElement('div');
        title.className = 'category-title';
        title.textContent = category.title;
        categoryDiv.appendChild(title);

        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'category-items';

        // Three items per category
        // 1. User input
        const userItem = createUserInput(categoryKey);
        itemsDiv.appendChild(userItem);

        // 2. Random with limited rerolls
        const rerollItem = createRerollItem(categoryKey, category.options);
        itemsDiv.appendChild(rerollItem);

        // 3. Random with no rerolls
        const lockedItem = createLockedItem(categoryKey, category.options);
        itemsDiv.appendChild(lockedItem);

        categoryDiv.appendChild(itemsDiv);
        container.appendChild(categoryDiv);
    });
}

function createUserInput(categoryKey) {
    const item = document.createElement('div');
    item.className = 'category-item';
    item.dataset.category = categoryKey;
    item.dataset.type = 'user';

    const number = document.createElement('span');
    number.className = 'item-number';
    number.textContent = '1.';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '...';
    input.dataset.categoryKey = categoryKey;

    const content = document.createElement('div');
    content.className = 'item-content';
    content.appendChild(input);

    item.appendChild(number);
    item.appendChild(content);

    return item;
}

function createRerollItem(categoryKey, options) {
    const item = document.createElement('div');
    item.className = 'category-item';
    item.dataset.category = categoryKey;
    item.dataset.type = 'reroll';

    const number = document.createElement('span');
    number.className = 'item-number';
    number.textContent = '2.';

    const content = document.createElement('div');
    content.className = 'item-content';

    const display = document.createElement('div');
    display.className = 'random-display';

    const usedOptions = new Set();
    let rerollsLeft = 3;

    function getRandomOption() {
        const available = options.filter(opt => !usedOptions.has(opt));
        if (available.length === 0) return options[Math.floor(Math.random() * options.length)];
        return available[Math.floor(Math.random() * available.length)];
    }

    let currentOption = getRandomOption();
    usedOptions.add(currentOption);

    const text = document.createElement('span');
    text.className = 'random-text';
    text.textContent = currentOption;

    const rerollBtn = document.createElement('button');
    rerollBtn.className = 'reroll-btn';
    rerollBtn.textContent = '↻';

    const count = document.createElement('span');
    count.className = 'reroll-count';
    count.textContent = `(${rerollsLeft})`;

    rerollBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (rerollsLeft > 0) {
            currentOption = getRandomOption();
            usedOptions.add(currentOption);
            text.textContent = currentOption;
            rerollsLeft--;
            count.textContent = `(${rerollsLeft})`;
            if (rerollsLeft === 0) {
                rerollBtn.disabled = true;
            }
        }
    });

    display.appendChild(text);
    display.appendChild(rerollBtn);
    display.appendChild(count);
    content.appendChild(display);

    item.appendChild(number);
    item.appendChild(content);
    item.dataset.value = currentOption;

    // Update dataset when rerolled
    rerollBtn.addEventListener('click', () => {
        item.dataset.value = currentOption;
    });

    return item;
}

function createLockedItem(categoryKey, options) {
    const item = document.createElement('div');
    item.className = 'category-item';
    item.dataset.category = categoryKey;
    item.dataset.type = 'locked';

    const number = document.createElement('span');
    number.className = 'item-number';
    number.textContent = '3.';

    const randomOption = options[Math.floor(Math.random() * options.length)];

    const content = document.createElement('div');
    content.className = 'item-content';
    content.textContent = randomOption;

    item.appendChild(number);
    item.appendChild(content);
    item.dataset.value = randomOption;

    return item;
}

// Spiral phase
function startSpiralPhase() {
    // Collect all selections
    const items = document.querySelectorAll('.category-item');
    gameState.allItems = [];

    items.forEach(item => {
        const category = item.dataset.category;
        const type = item.dataset.type;

        let value;
        if (type === 'user') {
            const input = item.querySelector('input');
            value = input.value.trim() || 'Nothing';
        } else {
            value = item.dataset.value;
        }

        gameState.allItems.push({
            category,
            value,
            element: item.cloneNode(true)
        });
    });

    // Show spiral overlay
    document.getElementById('spiral-overlay').classList.remove('hidden');

    startSpiralDrawing();
}

function startSpiralDrawing() {
    const canvas = document.getElementById('spiral-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    let angle = 0;
    let radius = 5;
    let drawing = true;

    ctx.strokeStyle = '#7B68EE';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);

    const maxRadius = Math.min(canvas.width, canvas.height) / 2 - 50;
    const spiralPoints = [];

    function drawSpiral() {
        if (!drawing) return;

        angle += 0.15;
        radius += 0.15;

        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        spiralPoints.push({ x, y, angle, radius });

        ctx.lineTo(x, y);
        ctx.stroke();

        if (radius < maxRadius) {
            requestAnimationFrame(drawSpiral);
        } else {
            // Spiral reached edge, loop back
            angle = 0;
            radius = 5;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            requestAnimationFrame(drawSpiral);
        }
    }

    drawSpiral();

    // Stop on spacebar
    document.addEventListener('keydown', function stopSpiral(e) {
        if (e.code === 'Space' && drawing) {
            e.preventDefault();
            drawing = false;
            document.removeEventListener('keydown', stopSpiral);

            // Draw line from center to edge at random angle
            const lineAngle = Math.random() * Math.PI * 2;
            const lineEndX = centerX + (maxRadius + 20) * Math.cos(lineAngle);
            const lineEndY = centerY + (maxRadius + 20) * Math.sin(lineAngle);

            ctx.strokeStyle = '#9484EE';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(lineEndX, lineEndY);
            ctx.stroke();

            // Count intersections
            let intersections = 0;
            for (let i = 1; i < spiralPoints.length; i++) {
                const p1 = spiralPoints[i - 1];
                const p2 = spiralPoints[i];

                if (lineIntersectsSegment(
                    centerX, centerY, lineEndX, lineEndY,
                    p1.x, p1.y, p2.x, p2.y
                )) {
                    intersections++;
                }
            }

            gameState.spiralNumber = Math.max(2, intersections || 3);

            setTimeout(() => {
                document.getElementById('spiral-overlay').classList.add('hidden');
                startElimination();
            }, 1000);
        }
    });

    function lineIntersectsSegment(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        if (denom === 0) return false;

        const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
        const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;

        return (ua > 0.001 && ua < 0.999 && ub > 0.001 && ub < 0.999);
    }
}

// Elimination phase
function startElimination() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('elimination-screen').classList.remove('hidden');

    const display = document.getElementById('elimination-display');

    // Rebuild categories display
    const categories = {};
    gameState.allItems.forEach(item => {
        if (!categories[item.category]) {
            categories[item.category] = {
                title: gameData[item.category].title,
                items: []
            };
        }
        categories[item.category].items.push(item);
    });

    Object.keys(categories).forEach(catKey => {
        const cat = categories[catKey];
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';

        const title = document.createElement('div');
        title.className = 'category-title';
        title.textContent = cat.title;
        categoryDiv.appendChild(title);

        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'category-items';

        cat.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'category-item';
            itemDiv.textContent = item.value;
            itemDiv.dataset.category = item.category;
            itemDiv.dataset.eliminated = 'false';
            itemsDiv.appendChild(itemDiv);
            item.displayElement = itemDiv;
        });

        categoryDiv.appendChild(itemsDiv);
        display.appendChild(categoryDiv);
    });

    // Start elimination animation
    setTimeout(() => animateElimination(), 1000);
}

function animateElimination() {
    const items = [...gameState.allItems];
    const eliminationNumber = gameState.spiralNumber;
    let currentIndex = 0;
    let count = 0;

    function eliminateNext() {
        if (items.filter(item => !item.eliminated).length === Object.keys(gameData).length) {
            // One item left per category
            setTimeout(() => showResults(), 1000);
            return;
        }

        // Find next non-eliminated item
        let attempts = 0;
        while (items[currentIndex].eliminated && attempts < items.length * 2) {
            currentIndex = (currentIndex + 1) % items.length;
            attempts++;
        }

        if (attempts >= items.length * 2) {
            setTimeout(() => showResults(), 1000);
            return;
        }

        // Highlight current item
        items[currentIndex].displayElement.classList.add('highlight');

        count++;

        setTimeout(() => {
            items[currentIndex].displayElement.classList.remove('highlight');

            if (count === eliminationNumber) {
                // Eliminate this item (only if not the last in category)
                const category = items[currentIndex].category;
                const remainingInCategory = items.filter(item =>
                    item.category === category && !item.eliminated
                );

                if (remainingInCategory.length > 1) {
                    items[currentIndex].eliminated = true;
                    items[currentIndex].displayElement.classList.add('crossed-out');
                }
                count = 0;
            }

            currentIndex = (currentIndex + 1) % items.length;
            setTimeout(eliminateNext, 400);
        }, 300);
    }

    eliminateNext();
}

// Results phase
function showResults() {
    document.getElementById('elimination-screen').classList.add('hidden');

    // Circle the winners
    gameState.allItems.forEach(item => {
        if (!item.eliminated) {
            item.displayElement.classList.add('final');
        }
    });

    setTimeout(() => {
        document.getElementById('elimination-screen').classList.add('hidden');
        document.getElementById('results-screen').classList.remove('hidden');

        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

        const winners = {};
        gameState.allItems.forEach(item => {
            if (!item.eliminated) {
                winners[item.category] = item.value;
            }
        });

        gameState.winners = winners;

        Object.keys(gameData).forEach(catKey => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';

            const label = document.createElement('div');
            label.className = 'result-label';
            label.textContent = gameData[catKey].title;

            const value = document.createElement('div');
            value.className = 'result-value';
            value.textContent = winners[catKey] || 'Unknown';

            resultItem.appendChild(label);
            resultItem.appendChild(value);
            resultsDiv.appendChild(resultItem);
        });
    }, 1500);
}

// Share functions
function getResultsText() {
    const winners = gameState.winners;
    let text = '🔮 My MASH Future 🔮\n\n';
    text += `🏠 Home: ${winners.home}\n`;
    text += `💕 Spouse: ${winners.spouse}\n`;
    text += `🚗 Car: ${winners.car}\n`;
    text += `👶 Kids: ${winners.kids}\n`;
    text += `💼 Job: ${winners.job}\n`;
    text += `📍 Location: ${winners.location}\n`;
    text += `💰 Salary: ${winners.salary}\n`;
    return text;
}

function shareTwitter() {
    const text = encodeURIComponent(getResultsText() + '\n\nPlay MASH: ' + window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
}

function shareTumblr() {
    const text = encodeURIComponent(getResultsText());
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.tumblr.com/widgets/share/tool?posttype=text&title=My%20MASH%20Future&content=${text}&canonicalUrl=${url}`, '_blank');
}

function copyDiscord() {
    const text = getResultsText();
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copy-discord');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

// Reset game
function resetGame() {
    gameState = {
        selections: {},
        spiralNumber: 0,
        allItems: []
    };

    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('elimination-screen').classList.add('hidden');
    document.getElementById('spiral-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');

    // Clear and rebuild
    document.getElementById('categories').innerHTML = '';
    document.getElementById('elimination-display').innerHTML = '';
    setupCategories();
}

// Start game
init();
