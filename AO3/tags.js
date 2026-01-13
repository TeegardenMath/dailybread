// Curated tag database for Phase 1
// Tags organized by category for balanced question selection

const TAG_CATEGORIES = {
  tone: {
    name: "Tone",
    question: "What's your vibe?",
    tags: [
      { name: "Fluff", count: 2969397 },
      { name: "Angst", count: 2456000 },
      { name: "Hurt/Comfort", count: 1890000 },
      { name: "Crack", count: 523000 },
      { name: "Fluff and Angst", count: 456000 },
      { name: "Tooth-Rotting Fluff", count: 312000 }
    ]
  },

  romance_trajectory: {
    name: "Romance Arc",
    question: "How should love unfold?",
    tags: [
      { name: "Enemies to Lovers", count: 892000 },
      { name: "Friends to Lovers", count: 1240000 },
      { name: "Strangers to Lovers", count: 198000 },
      { name: "Enemies to Friends to Lovers", count: 234000 }
    ]
  },

  pacing: {
    name: "Pacing",
    question: "How fast should things move?",
    tags: [
      { name: "Slow Burn", count: 1456000 },
      { name: "Established Relationship", count: 987000 },
      { name: "Getting Together", count: 412000 },
      { name: "Pre-Relationship", count: 234000 }
    ]
  },

  emotional: {
    name: "Emotional Core",
    question: "What feeling draws you in?",
    tags: [
      { name: "Pining", count: 876000 },
      { name: "Mutual Pining", count: 432000 },
      { name: "Jealousy", count: 198000 },
      { name: "Possessive Behavior", count: 167000 },
      { name: "Protectiveness", count: 234000 },
      { name: "Insecurity", count: 145000 }
    ]
  },

  tropes: {
    name: "Tropes",
    question: "Pick your trope:",
    tags: [
      { name: "Fake/Pretend Relationship", count: 287000 },
      { name: "Mutual Pining", count: 432000 },
      { name: "Bed Sharing", count: 198000 },
      { name: "Only One Bed", count: 156000 },
      { name: "Idiots in Love", count: 345000 },
      { name: "Oblivious", count: 234000 },
      { name: "Denial of Feelings", count: 123000 },
      { name: "Love Confessions", count: 298000 }
    ]
  },

  au_type: {
    name: "Setting",
    question: "What world do you want?",
    tags: [
      { name: "Alternate Universe - Modern Setting", count: 654000 },
      { name: "Alternate Universe - Canon Divergence", count: 534000 },
      { name: "Canon Compliant", count: 567000 },
      { name: "Alternate Universe - Coffee Shops & Cafés", count: 187000 },
      { name: "Alternate Universe - College/University", count: 234000 },
      { name: "Alternate Universe - High School", count: 312000 },
      { name: "Alternate Universe - Soulmates", count: 234000 },
      { name: "Post-Canon", count: 456000 }
    ]
  },

  content_rating: {
    name: "Content",
    question: "What content level?",
    tags: [
      { name: "Fluff", count: 2969397 },
      { name: "Smut", count: 1230000 },
      { name: "Fluff and Smut", count: 456000 },
      { name: "Romance", count: 2340000 },
      { name: "Domestic Fluff", count: 543000 }
    ]
  },

  format: {
    name: "Format",
    question: "How long should it be?",
    tags: [
      { name: "One Shot", count: 4500000 },
      { name: "Short One Shot", count: 890000 },
      { name: "Ficlet", count: 234000 },
      { name: "Drabble", count: 567000 }
    ]
  },

  perspective: {
    name: "Perspective",
    question: "Whose head do you want to be in?",
    tags: [
      { name: "POV First Person", count: 234000 },
      { name: "POV Third Person", count: 456000 },
      { name: "POV Multiple", count: 198000 },
      { name: "Alternating POV", count: 145000 },
      { name: "POV Outsider", count: 123000 }
    ]
  },

  relationships: {
    name: "Relationship Type",
    question: "What kind of relationship?",
    tags: [
      { name: "First Kiss", count: 345000 },
      { name: "First Time", count: 543000 },
      { name: "Established Relationship", count: 987000 },
      { name: "Secret Relationship", count: 156000 },
      { name: "Falling In Love", count: 234000 }
    ]
  },

  found_family: {
    name: "Found Family",
    question: "What about found family?",
    tags: [
      { name: "Found Family", count: 456000 },
      { name: "Team as Family", count: 234000 },
      { name: "Family Fluff", count: 198000 },
      { name: "Adopted Children", count: 87000 },
      { name: "Parental Figures", count: 123000 }
    ]
  },

  tension: {
    name: "Tension Type",
    question: "What keeps you reading?",
    tags: [
      { name: "Unresolved Sexual Tension", count: 234000 },
      { name: "Unresolved Romantic Tension", count: 123000 },
      { name: "Unresolved Emotional Tension", count: 87000 },
      { name: "Sexual Tension", count: 198000 },
      { name: "Romantic Tension", count: 145000 }
    ]
  },

  comfort: {
    name: "Comfort",
    question: "How do characters find comfort?",
    tags: [
      { name: "Hurt/Comfort", count: 1890000 },
      { name: "Emotional Hurt/Comfort", count: 567000 },
      { name: "Sick Character", count: 145000 },
      { name: "Caretaking", count: 198000 },
      { name: "Cuddling & Snuggling", count: 345000 }
    ]
  },

  communication: {
    name: "Communication",
    question: "How do they communicate?",
    tags: [
      { name: "Miscommunication", count: 234000 },
      { name: "Communication", count: 145000 },
      { name: "Heart-to-Heart", count: 87000 },
      { name: "Love Confessions", count: 298000 },
      { name: "Confessions", count: 178000 }
    ]
  },

  darkness: {
    name: "Darkness",
    question: "How dark can it get?",
    tags: [
      { name: "Light Angst", count: 456000 },
      { name: "Angst with a Happy Ending", count: 567000 },
      { name: "Heavy Angst", count: 234000 },
      { name: "Dark", count: 198000 },
      { name: "Angst and Hurt/Comfort", count: 312000 }
    ]
  },

  ending: {
    name: "Ending",
    question: "How should it end?",
    tags: [
      { name: "Happy Ending", count: 1234000 },
      { name: "Angst with a Happy Ending", count: 567000 },
      { name: "Bittersweet Ending", count: 87000 },
      { name: "Ambiguous/Open Ending", count: 123000 },
      { name: "Hopeful Ending", count: 145000 }
    ]
  },

  softness: {
    name: "Softness",
    question: "How soft?",
    tags: [
      { name: "Soft", count: 234000 },
      { name: "Tooth-Rotting Fluff", count: 312000 },
      { name: "Domestic Fluff", count: 543000 },
      { name: "Gentle", count: 123000 },
      { name: "Tenderness", count: 145000 }
    ]
  }
};

// Convert to array for easier iteration
const CATEGORY_LIST = Object.keys(TAG_CATEGORIES);

// Common boring tags to filter out in Phase 2
const BORING_TAGS = new Set([
  "Additional Warnings In Author's Note",
  "Additional Warnings Apply",
  "Author Is Not Religious",
  "Not Beta Read",
  "No Beta We Die Like Men",
  "English",
  "Fanfiction",
  "Originally Posted on Tumblr",
  "Originally Posted on Twitter",
  "Cross-Posted on Tumblr",
  "POV Third Person",
  "POV First Person",
  "Wordcount: 1.000-5.000",
  "Wordcount: 5.000-10.000",
  "Wordcount: 100-500",
  "Wordcount: 500-1.000",
  "One Shot",
  "Short One Shot",
  "Short",
  "Complete",
  "Completed",
  "Inspired by...",
  "Based on...",
  "Gift Fic",
  "Birthday Present",
  "For a Friend"
]);

// Tags that are more likely to be quirky/interesting
const QUIRKY_PATTERNS = [
  /accidental/i,
  /found family/i,
  /soft/i,
  /feral/i,
  /disaster/i,
  /chaotic/i,
  /wholesome/i,
  /unhinged/i,
  /crack treated seriously/i,
  /5\+1/i,
  /five times/i,
  /\d+ times/i,
  /everyone is/i,
  /no one dies/i,
  /fix-?it/i,
  /author/i,
  /technically/i,
  /like a/i,
  /as a/i,
  /but make it/i,
  /is a/i
];
