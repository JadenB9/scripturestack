/**
 * Twelve core NT doctrinal topics with keyword sets.
 * Used by the Doctrine Map heatmap on the frequency analytics page.
 */

export type Doctrine = {
  id: string;
  label: string;
  keywords: string[];
};

export const DOCTRINES: Doctrine[] = [
  { id: "salvation", label: "Salvation", keywords: ["saved", "salvation", "save", "rescue", "deliver", "redeem", "redemption", "ransom"] },
  { id: "grace", label: "Grace", keywords: ["grace", "gracious", "mercy", "merciful", "kindness", "favor"] },
  { id: "faith", label: "Faith", keywords: ["faith", "believe", "believes", "believed", "trust", "faithful"] },
  { id: "righteousness", label: "Righteousness", keywords: ["righteous", "righteousness", "just", "justice", "justify", "justified", "justification"] },
  { id: "love", label: "Love", keywords: ["love", "loved", "loves", "loving", "beloved", "charity"] },
  { id: "spirit", label: "Spirit", keywords: ["spirit", "ghost", "spiritual", "comforter", "paraclete"] },
  { id: "kingdom", label: "Kingdom", keywords: ["kingdom", "king", "reign", "rule", "throne"] },
  { id: "law", label: "Law & Works", keywords: ["law", "works", "commandment", "commandments", "keep", "obey", "obedience"] },
  { id: "resurrection", label: "Resurrection", keywords: ["resurrection", "raised", "rose", "risen", "rise", "alive"] },
  { id: "church", label: "Church & Body", keywords: ["church", "body", "members", "member", "congregation", "assembly", "brothers", "brethren"] },
  { id: "judgment", label: "Judgment & Wrath", keywords: ["judgment", "judge", "judged", "wrath", "condemnation", "condemned", "hell"] },
  { id: "hope", label: "Hope & Return", keywords: ["hope", "coming", "return", "appear", "appearing", "lord's day"] },
];

export const ENGLISH_STOPWORDS = new Set([
  "a", "an", "and", "or", "but", "if", "then", "the", "of", "in", "on", "at", "for", "with",
  "by", "to", "from", "as", "is", "are", "was", "were", "be", "been", "being", "have", "has",
  "had", "do", "does", "did", "not", "no", "yes", "this", "that", "these", "those", "i", "you",
  "he", "she", "it", "we", "they", "them", "us", "my", "your", "his", "her", "its", "our",
  "their", "me", "him", "will", "shall", "may", "can", "would", "could", "should", "also",
  "so", "because", "when", "where", "why", "how", "what", "which", "who", "whom", "whose",
  "than", "thou", "thee", "ye", "thy", "thine", "hath", "unto", "shalt", "hast", "art", "doth",
  "out", "up", "down", "over", "under", "into", "through", "all", "any", "some", "more", "most",
  "other", "such", "only", "own", "same", "very", "just", "too", "there", "here", "now", "yet",
  "one", "two", "three", "four", "five", "let", "thereof", "thereby", "therein", "therefore",
]);
