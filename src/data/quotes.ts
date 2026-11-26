/**
 * Quotes Chris keeps around. The home page shows one a day and lets you ask for another.
 * (Copied from the legacy RotatingQuote.astro; that copy goes when the legacy home is deleted.)
 */
export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: Quote[] = [
  {
    text: "The supreme learning is to realize the meaning of selflessness.",
    author: "Atisha",
  },
  {
    text: "Ignorance is the not knowing who we really are — thinking we are a self.",
    author: "Buddha Dharma",
  },
  {
    text: "Every sentient being is I. I is simply the universe aware of itself at a particular place and time.",
    author: "Alan Watts",
  },
  {
    text: "The mind is not a vessel to be filled, but a fire to be kindled.",
    author: "Plutarch",
  },
  {
    text: "I shall pass this way but once; any good that I can do or any kindness I can show to any human being; let me do it now. Let me not defer nor neglect it, for I shall not pass this way again.",
    author: "Etienne de Grellet",
  },
  {
    text: "When we seek to discover the best in others, we somehow bring out the best in ourselves.",
    author: "William Arthur Ward",
  },
  {
    text: "Days of prosperity make us forget adversity. Good times seem out of reach during the bad ones. Both can seem like final destinations, the summation of our days. Then the cosmic joker plays with our ways. Yesterday's condition no longer remains. All commas, no periods, all stops, no stays, the pleasure's for rent, but so is the pain.",
    author: "Matthew McConaughey",
  },
  {
    text: "To fill the hour — that is happiness; to fill the hour, and leave no crevice for a repentance or an approval.",
    author: "Ralph Waldo Emerson",
  },
  {
    text: "We must be aware of the real problems of the world, then with mindfulness we will know what to do or what not to do to help.",
    author: "Thich Nhat Hanh",
  },
];
