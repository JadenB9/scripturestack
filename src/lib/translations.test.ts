import { test } from "node:test";
import assert from "node:assert/strict";
import { diffWords, isAltTranslation } from "./translations";

function changed(base: string, other: string): string[] {
  return diffWords(base, other)
    .filter((t) => t.differs)
    .map((t) => t.text);
}

test("identical verses have no differences", () => {
  assert.deepEqual(changed("In the beginning God created", "In the beginning God created"), []);
});

test("one inserted word doesn't mark the rest of the verse", () => {
  assert.deepEqual(
    changed("For God so loved the world", "For God so greatly loved the world"),
    ["greatly"]
  );
});

test("case and punctuation are ignored", () => {
  assert.deepEqual(changed("the Lord is my shepherd;", "The LORD is my shepherd,"), []);
});

test("every word of `other` comes back in order", () => {
  const out = diffWords("a b c", "c b a").map((t) => t.text);
  assert.deepEqual(out, ["c", "b", "a"]);
});

test("isAltTranslation only accepts the public-domain ids", () => {
  assert.equal(isAltTranslation("KJV"), true);
  assert.equal(isAltTranslation("ESV"), false);
  assert.equal(isAltTranslation("kjv"), false);
});
