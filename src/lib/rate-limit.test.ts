import { test } from "node:test";
import assert from "node:assert/strict";
import { _resetRateLimits, clientKey, rateLimit } from "./rate-limit";

test("allows up to the limit inside one window, then refuses", () => {
  _resetRateLimits();
  const t0 = 1_000_000;
  for (let i = 0; i < 3; i++) {
    assert.equal(rateLimit("a", 3, 60_000, t0 + i).ok, true);
  }
  const r = rateLimit("a", 3, 60_000, t0 + 10);
  assert.equal(r.ok, false);
  assert.equal(r.remaining, 0);
  assert.ok(r.retryAfter >= 59 && r.retryAfter <= 60);
});

test("keys are independent", () => {
  _resetRateLimits();
  rateLimit("a", 1, 60_000, 0);
  assert.equal(rateLimit("a", 1, 60_000, 1).ok, false);
  assert.equal(rateLimit("b", 1, 60_000, 1).ok, true);
});

test("the window resets", () => {
  _resetRateLimits();
  rateLimit("a", 1, 1_000, 0);
  assert.equal(rateLimit("a", 1, 1_000, 500).ok, false);
  assert.equal(rateLimit("a", 1, 1_000, 1_000).ok, true);
});

test("clientKey prefers the first forwarded address", () => {
  const req = new Request("http://x", {
    headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1", "x-real-ip": "10.0.0.1" },
  });
  assert.equal(clientKey(req), "203.0.113.9");
  assert.equal(clientKey(new Request("http://x")), "unknown");
});
