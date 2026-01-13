// Quiz state
let state = {
  phase: 1,
  questionNumber: 0,
  selectedTags: [],
  usedCategories: [],
  estimatedPool: 15000000,
  currentFics: [],
  finalFic: null,
  lastAction: null
};

const PHASE_1_QUESTIONS = 10;
const MAX_QUESTIONS = 25;
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest='
];
let currentProxyIndex = 0;
const FETCH_TIMEOUT = 30000; // 30 seconds

// Initialize
function startQuiz() {
  state = {
    phase: 1,
    questionNumber: 0,
    selectedTags: [],
    usedCategories: [],
    estimatedPool: 15000000,
    currentFics: [],
    finalFic: null,
    lastAction: null
  };

  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('question-container').style.display = 'block';
  document.getElementById('result').classList.remove('visible');

  nextQuestion();
}

function restartQuiz() {
  document.getElementById('quiz-area').style.display = 'block';
  document.getElementById('result').classList.remove('visible');
  document.getElementById('start-screen').style.display = 'block';
  document.getElementById('question-container').style.display = 'none';
  document.getElementById('progress').style.width = '0%';
}

// Phase 1: Use curated tags
function selectPhase1Question() {
  // Get categories we haven't used recently
  const recentCategories = state.usedCategories.slice(-3);
  const availableCategories = CATEGORY_LIST.filter(c => !recentCategories.includes(c));

  // Pick a random category
  const categoryKey = availableCategories[Math.floor(Math.random() * availableCategories.length)];
  const category = TAG_CATEGORIES[categoryKey];

  // Get two different tags from this category
  const shuffled = [...category.tags].sort(() => Math.random() - 0.5);
  const tagA = shuffled[0];
  const tagB = shuffled[1];

  state.usedCategories.push(categoryKey);

  return {
    question: category.question,
    options: [tagA, tagB],
    category: categoryKey
  };
}

// Phase 2: Use real tags from fetched fics
async function selectPhase2Question() {
  showLoading(true);

  try {
    // Fetch current search results
    const searchUrl = buildSearchUrl(state.selectedTags);
    const html = await fetchWithProxy(searchUrl);

    // Parse the results
    const parsed = parseSearchResults(html);
    state.currentFics = parsed.fics;
    state.estimatedPool = parsed.totalCount;

    // If we're down to a small number, we're done
    if (parsed.totalCount <= 1 || parsed.fics.length <= 1) {
      showLoading(false);
      return { done: true, fic: parsed.fics[0] };
    }

    // If we have 2-5 fics, let user choose between them by unique tags
    if (parsed.totalCount <= 5) {
      showLoading(false);
      return selectFinalChoice(parsed.fics);
    }

    // Find distinctive tags across the fics
    const distinctiveTags = findDistinctiveTags(parsed.fics);

    if (distinctiveTags.length < 2) {
      // Not enough distinctive tags, just pick the first fic
      showLoading(false);
      return { done: true, fic: parsed.fics[0] };
    }

    // Pick two non-overlapping tags
    const tagA = distinctiveTags[0];
    let tagB = null;

    for (let i = 1; i < distinctiveTags.length; i++) {
      const candidate = distinctiveTags[i];
      // Check they don't appear on all the same fics
      const overlapRatio = calculateOverlap(tagA, candidate, parsed.fics);
      if (overlapRatio < 0.7) {
        tagB = candidate;
        break;
      }
    }

    if (!tagB) {
      tagB = distinctiveTags[1];
    }

    showLoading(false);

    return {
      question: "Which tag calls to you?",
      options: [
        { name: tagA.name, count: tagA.frequency },
        { name: tagB.name, count: tagB.frequency }
      ],
      fromFics: true
    };

  } catch (error) {
    console.error('Phase 2 error:', error);
    showLoading(false);
    throw error;
  }
}

function selectFinalChoice(fics) {
  // Find the most distinctive tag on each fic
  const options = fics.slice(0, 4).map(fic => {
    const uniqueTag = findMostDistinctiveTag(fic, fics);
    return {
      name: uniqueTag || fic.tags[0] || fic.title,
      fic: fic,
      isFinal: true
    };
  });

  return {
    question: "Final choice — which vibe is yours?",
    options: options,
    isFinalChoice: true
  };
}

function findMostDistinctiveTag(targetFic, allFics) {
  const targetTags = new Set(targetFic.tags);

  // Find tags that are on this fic but few/no others
  let bestTag = null;
  let bestScore = -1;

  for (const tag of targetFic.tags) {
    if (BORING_TAGS.has(tag)) continue;
    if (state.selectedTags.includes(tag)) continue;

    let othersWithTag = 0;
    for (const fic of allFics) {
      if (fic !== targetFic && fic.tags.includes(tag)) {
        othersWithTag++;
      }
    }

    const uniqueness = 1 - (othersWithTag / allFics.length);
    const quirkiness = computeQuirkiness(tag);
    const score = uniqueness * 0.6 + quirkiness * 0.4;

    if (score > bestScore) {
      bestScore = score;
      bestTag = tag;
    }
  }

  return bestTag;
}

function findDistinctiveTags(fics) {
  const tagCounts = {};

  // Count how many fics have each tag
  for (const fic of fics) {
    for (const tag of fic.tags) {
      if (!tagCounts[tag]) {
        tagCounts[tag] = { name: tag, frequency: 0, fics: [] };
      }
      tagCounts[tag].frequency++;
      tagCounts[tag].fics.push(fic);
    }
  }

  // Filter and score tags
  const candidates = Object.values(tagCounts)
    .filter(t => {
      // Skip boring tags
      if (BORING_TAGS.has(t.name)) return false;
      // Skip tags we already selected
      if (state.selectedTags.includes(t.name)) return false;
      // Skip universal tags (on all fics) and unique tags (on just one)
      if (t.frequency === fics.length) return false;
      if (t.frequency < 2) return false;
      return true;
    })
    .map(t => ({
      ...t,
      score: computeDistinctivenessScore(t, fics.length)
    }))
    .sort((a, b) => b.score - a.score);

  return candidates;
}

function computeDistinctivenessScore(tag, totalFics) {
  // Best tags split the pool roughly in half
  const splitRatio = tag.frequency / totalFics;
  const balanceScore = 1 - Math.abs(0.5 - splitRatio) * 2;

  // Bonus for quirky tags
  const quirkScore = computeQuirkiness(tag.name);

  return balanceScore * 0.5 + quirkScore * 0.5;
}

function computeQuirkiness(tagName) {
  let score = 0;

  // Longer tags tend to be more specific
  if (tagName.length > 20) score += 0.2;
  if (tagName.length > 35) score += 0.2;

  // Contains fun patterns
  for (const pattern of QUIRKY_PATTERNS) {
    if (pattern.test(tagName)) {
      score += 0.3;
      break;
    }
  }

  // Has interesting punctuation
  if (tagName.includes('!') || tagName.includes('?')) score += 0.1;

  // Contains numbers (like "5 Times")
  if (/\d/.test(tagName)) score += 0.15;

  // Lowercase start suggests casual tag
  if (tagName[0] === tagName[0].toLowerCase() && tagName[0] !== tagName[0].toUpperCase()) {
    score += 0.1;
  }

  return Math.min(score, 1);
}

function calculateOverlap(tagA, tagB, fics) {
  const ficsWithA = new Set(tagA.fics);
  const ficsWithB = new Set(tagB.fics);

  let overlap = 0;
  for (const fic of ficsWithA) {
    if (ficsWithB.has(fic)) overlap++;
  }

  return overlap / Math.min(ficsWithA.size, ficsWithB.size);
}

// Main question flow
async function nextQuestion() {
  state.questionNumber++;
  updateProgress();

  try {
    let questionData;

    if (state.phase === 1 && state.questionNumber <= PHASE_1_QUESTIONS) {
      questionData = selectPhase1Question();
    } else {
      if (state.phase === 1) {
        state.phase = 2;
        await showPhaseTransition();
      }
      questionData = await selectPhase2Question();
    }

    // Check if we're done
    if (questionData.done) {
      showResult(questionData.fic);
      return;
    }

    displayQuestion(questionData);

  } catch (error) {
    showError("Couldn't reach AO3. The Archive might be busy.");
    state.lastAction = nextQuestion;
  }
}

function displayQuestion(data) {
  document.getElementById('question-number').textContent = `Question ${state.questionNumber}`;
  document.getElementById('question-text').textContent = data.question;
  updatePhaseIndicator();

  const optionsContainer = document.getElementById('options');
  optionsContainer.innerHTML = '';

  for (const option of data.options) {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option.name;
    btn.onclick = () => selectOption(option, data.isFinalChoice);
    optionsContainer.appendChild(btn);
  }
}

async function selectOption(option, isFinal) {
  if (isFinal && option.fic) {
    // User selected a specific fic
    showResult(option.fic);
    return;
  }

  state.selectedTags.push(option.name);

  // Update pool estimate for Phase 1
  if (state.phase === 1) {
    const tagRate = (option.count || 500000) / 15000000;
    state.estimatedPool = Math.round(state.estimatedPool * tagRate);
  }

  // Check if we should end
  if (state.questionNumber >= MAX_QUESTIONS) {
    await fetchAndShowResult();
    return;
  }

  nextQuestion();
}

async function fetchAndShowResult() {
  showLoading(true);

  try {
    const searchUrl = buildSearchUrl(state.selectedTags);
    const html = await fetchWithProxy(searchUrl);
    const parsed = parseSearchResults(html);

    if (parsed.fics.length > 0) {
      showResult(parsed.fics[0]);
    } else {
      // No results - try removing last tag and retry
      state.selectedTags.pop();
      const retryUrl = buildSearchUrl(state.selectedTags);
      const retryHtml = await fetchWithProxy(retryUrl);
      const retryParsed = parseSearchResults(retryHtml);

      if (retryParsed.fics.length > 0) {
        showResult(retryParsed.fics[0]);
      } else {
        showError("Couldn't find a matching fic. Try again with different choices!");
      }
    }
  } catch (error) {
    showError("Couldn't reach AO3. The Archive might be busy.");
    state.lastAction = fetchAndShowResult;
  }
}

// AO3 fetching and parsing
function buildSearchUrl(tags) {
  const tagQuery = tags.map(t => `"${t}"`).join(' ');
  const params = new URLSearchParams({
    'work_search[query]': tagQuery,
    'work_search[sort_column]': 'kudos_count',
    'work_search[sort_direction]': 'desc',
    'commit': 'Search'
  });
  return `https://archiveofourown.org/works/search?${params.toString()}`;
}

async function fetchWithProxy(url, retryCount = 0) {
  const proxy = CORS_PROXIES[currentProxyIndex];
  const proxyUrl = proxy + encodeURIComponent(url);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    // Try next proxy
    if (retryCount < CORS_PROXIES.length - 1) {
      currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
      return fetchWithProxy(url, retryCount + 1);
    }
    throw error;
  }
}

function parseSearchResults(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Get total count
  let totalCount = 0;
  const heading = doc.querySelector('h2.heading');
  if (heading) {
    const match = heading.textContent.match(/(\d[\d,]*)\s+Works? found/i);
    if (match) {
      totalCount = parseInt(match[1].replace(/,/g, ''));
    }
  }

  // Parse work listings
  const fics = [];
  const workItems = doc.querySelectorAll('li.work.blurb');

  for (const item of workItems) {
    const fic = parseWorkItem(item);
    if (fic) {
      fics.push(fic);
    }
  }

  return { totalCount, fics };
}

function parseWorkItem(item) {
  try {
    // Title and URL
    const titleLink = item.querySelector('h4.heading a');
    if (!titleLink) return null;

    const title = titleLink.textContent.trim();
    const url = 'https://archiveofourown.org' + titleLink.getAttribute('href');

    // Author
    const authorLink = item.querySelector('h4.heading a[rel="author"]');
    const author = authorLink ? authorLink.textContent.trim() : 'Anonymous';

    // Fandom
    const fandomLinks = item.querySelectorAll('h5.fandoms a');
    const fandoms = Array.from(fandomLinks).map(a => a.textContent.trim());

    // Tags
    const tagLinks = item.querySelectorAll('ul.tags a.tag');
    const tags = Array.from(tagLinks).map(a => a.textContent.trim());

    // Required tags (rating, warning, category)
    const requiredTags = item.querySelectorAll('.required-tags span');
    const rating = requiredTags[0]?.textContent.trim() || '';
    const warning = requiredTags[1]?.textContent.trim() || '';
    const category = requiredTags[2]?.textContent.trim() || '';

    // Summary
    const summaryEl = item.querySelector('blockquote.summary');
    const summary = summaryEl ? summaryEl.textContent.trim() : '';

    // Stats
    const statsEl = item.querySelector('dl.stats');
    let words = '', chapters = '', kudos = '', hits = '';

    if (statsEl) {
      const wordsEl = statsEl.querySelector('dd.words');
      const chaptersEl = statsEl.querySelector('dd.chapters');
      const kudosEl = statsEl.querySelector('dd.kudos');
      const hitsEl = statsEl.querySelector('dd.hits');

      words = wordsEl?.textContent.trim() || '';
      chapters = chaptersEl?.textContent.trim() || '';
      kudos = kudosEl?.textContent.trim() || '';
      hits = hitsEl?.textContent.trim() || '';
    }

    return {
      title,
      url,
      author,
      fandoms,
      tags,
      rating,
      warning,
      category,
      summary,
      words,
      chapters,
      kudos,
      hits
    };

  } catch (error) {
    console.error('Error parsing work item:', error);
    return null;
  }
}

// UI helpers
function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
  document.getElementById('question-container').style.display = show ? 'none' : 'block';
  document.getElementById('error').style.display = 'none';
}

function showError(message) {
  document.getElementById('error').style.display = 'block';
  document.getElementById('error-message').textContent = message;
  document.getElementById('loading').style.display = 'none';
  document.getElementById('question-container').style.display = 'none';
}

function retryLastAction() {
  if (state.lastAction) {
    state.lastAction();
  } else {
    restartQuiz();
  }
}

function updateProgress() {
  const progress = Math.min((state.questionNumber / 15) * 100, 100);
  document.getElementById('progress').style.width = `${progress}%`;
}

async function showPhaseTransition() {
  document.getElementById('question-container').style.display = 'none';
  document.getElementById('transition').style.display = 'block';
  await new Promise(resolve => setTimeout(resolve, 1500));
  document.getElementById('transition').style.display = 'none';
}

function updatePhaseIndicator() {
  const indicator = document.getElementById('phase-indicator');
  if (state.phase === 1) {
    indicator.textContent = `~${formatNumber(state.estimatedPool)} fics remaining`;
  } else {
    indicator.textContent = state.estimatedPool > 0
      ? `${formatNumber(state.estimatedPool)} fics remaining`
      : 'Searching the Archive...';
  }
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toString();
}

// Results
function showResult(fic) {
  if (!fic) {
    showError("Couldn't find your fic. Try again!");
    return;
  }

  state.finalFic = fic;

  document.getElementById('quiz-area').style.display = 'none';
  document.getElementById('result').classList.add('visible');
  document.getElementById('progress').style.width = '100%';

  // Populate fic card
  const titleLink = document.getElementById('fic-title-link');
  titleLink.textContent = fic.title;
  titleLink.href = fic.url;

  document.getElementById('fic-author').textContent = fic.author;
  document.getElementById('fic-fandom').textContent = fic.fandoms.join(', ');

  // Meta info
  const metaContainer = document.getElementById('fic-meta');
  metaContainer.innerHTML = '';

  if (fic.rating) {
    addMetaItem(metaContainer, fic.rating);
  }
  if (fic.category) {
    addMetaItem(metaContainer, fic.category);
  }
  if (fic.words) {
    addMetaItem(metaContainer, fic.words + ' words');
  }
  if (fic.chapters) {
    addMetaItem(metaContainer, fic.chapters + ' chapters');
  }

  // Selected tags (ones the user chose)
  const selectedTagsContainer = document.getElementById('selected-tags');
  selectedTagsContainer.innerHTML = '';

  for (const tag of state.selectedTags) {
    if (fic.tags.includes(tag)) {
      const tagEl = document.createElement('span');
      tagEl.className = 'tag selected';
      tagEl.textContent = tag;
      selectedTagsContainer.appendChild(tagEl);
    }
  }

  // Other tags
  const otherTagsContainer = document.getElementById('other-tags');
  otherTagsContainer.innerHTML = '';

  const otherTags = fic.tags.filter(t => !state.selectedTags.includes(t)).slice(0, 10);
  for (const tag of otherTags) {
    const tagEl = document.createElement('span');
    tagEl.className = 'tag';
    tagEl.textContent = tag;
    otherTagsContainer.appendChild(tagEl);
  }

  // Summary
  document.getElementById('fic-summary').textContent = fic.summary || 'No summary provided.';

  // Stats
  const statsContainer = document.getElementById('fic-stats');
  statsContainer.innerHTML = '';

  if (fic.kudos) {
    statsContainer.innerHTML += `<span>❤️ ${fic.kudos} kudos</span>`;
  }
  if (fic.hits) {
    statsContainer.innerHTML += `<span>👁 ${fic.hits} hits</span>`;
  }

  // Share buttons
  setupShareButtons(fic);
}

function addMetaItem(container, text) {
  const item = document.createElement('span');
  item.className = 'fic-meta-item';
  item.textContent = text;
  container.appendChild(item);
}

function setupShareButtons(fic) {
  const quizUrl = window.location.href.split('?')[0];
  const shareText = `I'm the fic "${fic.title}"! Which AO3 fic are you?`;

  // Twitter
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(quizUrl)}`;
  document.getElementById('share-twitter').href = twitterUrl;

  // Tumblr
  const tumblrUrl = `https://www.tumblr.com/widgets/share/tool?posttype=link&title=${encodeURIComponent('Which AO3 Fic Are You?')}&caption=${encodeURIComponent(shareText)}&content=${encodeURIComponent(quizUrl)}`;
  document.getElementById('share-tumblr').href = tumblrUrl;
}

function copyResult(event) {
  event.preventDefault();

  const quizUrl = window.location.href.split('?')[0];
  const fic = state.finalFic;
  const shareText = `I'm the fic "${fic.title}"! Which AO3 fic are you? ${quizUrl}`;

  navigator.clipboard.writeText(shareText).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  });
}
