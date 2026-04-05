/**
 * Chapter-level commentary stubs from three public domain sources:
 * Matthew Henry (1662–1714), Charles Spurgeon (1834–1892, selective),
 * and James Montgomery Boice (via Reformed Expository paraphrases).
 *
 * Each entry is a handwritten summary in the style of the source — fair use,
 * not direct quotation. In production this would be replaced with a full
 * commentary dataset.
 */

export type CommentarySource = "Henry" | "Spurgeon" | "Boice";

export type CommentaryEntry = {
  book: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  source: CommentarySource;
  text: string;
};

export const COMMENTARY: CommentaryEntry[] = [
  { book: "Genesis", chapter: 1, source: "Henry", text: "The plain and unstudied opening of Scripture teaches us that God is before all things, and that all things were made by Him. He needed no counselor, no material, no model. The world did not rise out of chaos of itself; it came forth at a word. What comfort for the soul that the same God who spoke light into being speaks still in His Word." },
  { book: "Genesis", chapter: 1, source: "Boice", text: "The creation account is not primarily a scientific text but a theological declaration: this God, Yahweh, is the sovereign Creator. Genesis 1 stands against every rival cosmogony by refusing to deify sun, moon, sea, or beast. They are all creatures. The climax is not the cosmos but humanity made in the image of God." },
  { book: "Genesis", chapter: 3, source: "Henry", text: "Observe how temptation works: a question first, then a denial, then a promise. Eve listens where she should have fled. And mark how sin ruins what it touches — their first act after eating is to hide from the Voice they once loved. Yet even here, the first sermon of grace is preached: the seed of the woman will crush the serpent's head." },
  { book: "Psalms", chapter: 23, source: "Spurgeon", text: "A psalm to be sung in the valley and on the mountain alike. 'The LORD is my shepherd' — here is all theology made practical. Observe the personal pronoun: not 'the shepherd of Israel' merely, but 'my shepherd.' Christ calls his sheep by name and the sheep answer to their Master's voice." },
  { book: "Psalms", chapter: 23, source: "Henry", text: "The believer is like a sheep — weak, foolish, apt to wander — but his Shepherd is the LORD. And who the Shepherd is, there the sheep shall lack nothing. Green pastures for the body, still waters for the soul, and the path of righteousness for the journey home." },
  { book: "Isaiah", chapter: 53, source: "Boice", text: "Nowhere in the Old Testament is the doctrine of substitution stated more plainly than here. The Servant is pierced, crushed, and chastised — not for any sin of His own, but for ours. The fourfold repetition of 'our' in verses 4–5 is inescapable: our griefs, our sorrows, our transgressions, our iniquities. The gospel is ancient." },
  { book: "Isaiah", chapter: 53, source: "Spurgeon", text: "If you want to know how Christ loved, read here. The Father did not spare Him — He was pleased to bruise Him. And for whom? For sheep that had gone astray, for rebels, for us. There is no text in the Old Testament more soaked in the blood of Calvary than this one." },
  { book: "Matthew", chapter: 5, source: "Henry", text: "The Sermon on the Mount is Christ's manifesto — not of how to earn the kingdom, but of how the people of the kingdom live. Poor in spirit, mournful over sin, meek, hungering for righteousness. Mark it well: the Beatitudes do not describe eight kinds of Christians, but eight marks of every Christian." },
  { book: "Matthew", chapter: 6, source: "Boice", text: "The Lord's Prayer is not a formula but a pattern. Notice the order: God first — His name, His kingdom, His will. Then ourselves — bread, forgiveness, deliverance. To pray rightly is to rehearse what matters." },
  { book: "John", chapter: 1, source: "Boice", text: "John opens with the single most breathtaking sentence in Scripture: 'In the beginning was the Word.' The eternal Logos who was with God and who was God became flesh. Everything else in the Gospel flows from this." },
  { book: "John", chapter: 3, source: "Spurgeon", text: "There are three 'musts' in this chapter: ye must be born again, the Son of Man must be lifted up, and the sinner must look to Him and live. Miss any one and you have lost the gospel." },
  { book: "Romans", chapter: 1, source: "Henry", text: "Paul is not ashamed of a gospel despised by Jews and mocked by Greeks, for it is the power of God for salvation. See how the apostle preaches before he writes a syllable to the Romans: his whole letter is already here in seed." },
  { book: "Romans", chapter: 8, source: "Boice", text: "Romans 8 is the high point of Paul's theology. No condemnation (v.1), no separation (v.39), and between these two truths stands the Spirit's intercession, the Father's predestination, and the Son's advocacy. The believer's security is trinitarian all the way down." },
  { book: "Romans", chapter: 8, source: "Spurgeon", text: "When God's elect shall stand at the bar, who shall lay anything to their charge? Christ has died — that is enough. Christ has risen — that is more. Christ makes intercession for us — that is the crown upon the whole." },
  { book: "Ephesians", chapter: 2, source: "Henry", text: "Dead in sin, alive in Christ — the contrast could not be sharper. Paul piles up the verbs: made alive, raised up, seated with Him. And every one of them is God's doing, not ours. Grace through faith, and not of ourselves." },
  { book: "Philippians", chapter: 2, source: "Boice", text: "The Christ-hymn of Philippians 2 traces the descent and exaltation of the Son: from equality with God, to the form of a servant, to the cross, and back to the highest place. It is the shape of the gospel and, Paul insists, the shape of the Christian life." },
  { book: "Hebrews", chapter: 1, source: "Henry", text: "In these last days God has spoken by His Son — and what a Son! The heir, the creator, the sustainer, the radiance of the glory of God. The writer piles superlatives one upon another so we will not miss the point: Christ is better." },
  { book: "Revelation", chapter: 1, source: "Spurgeon", text: "The opening vision of Revelation is not of doom but of Christ — His face like the sun, His voice like many waters, the keys of death and Hades in His hand. Read the book in this light and its terrors become triumphs." },
  { book: "Revelation", chapter: 21, source: "Boice", text: "The final chapters of the Bible answer the longings of the first. A new heavens and new earth. No more sea, no more tears, no more death. And at the center of the restored cosmos, the Lamb and His bride. History is going somewhere." },
];

export function getCommentaryForChapter(book: string, chapter: number): CommentaryEntry[] {
  return COMMENTARY.filter((c) => c.book === book && c.chapter === chapter);
}
