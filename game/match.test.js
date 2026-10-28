// Run with: node --test game/*.test.js
const test = require("node:test");
const assert = require("node:assert");
const M = require("./match.js");

test("where: accepts j'habite + town in the spellings recognisers produce", () => {
  for (const s of ["J'habite à Leeds", "j'habite a Manchester", "jabite à Bristol",
                   "J’habite à Milton Keynes.", "habite à York", "J'habite en Angleterre",
                   "J'habite dans une ville", "j'habite dans un petit village"]) {
    assert.ok(M.isWhereAnswer(s), s);
  }
});

test("where: rejects answers without j'habite or with nothing after it", () => {
  for (const s of ["", "j'habite", "Leeds", "je m'appelle Tom", "j'ai dix ans", "habitat"]) {
    assert.ok(!M.isWhereAnswer(s), s);
  }
});

test("townOrVillage: accepts ville or village, with or without j'habite", () => {
  for (const s of ["J'habite dans une ville", "J'habite dans un petit village",
                   "dans un village", "Ville"]) {
    assert.ok(M.isTownOrVillageAnswer(s), s);
  }
  for (const s of ["j'habite à Leeds", "villa", "villages"]) {
    assert.ok(!M.isTownOrVillageAnswer(s), s);
  }
});

test("check: passes if any alternative matches and reports it", () => {
  assert.deepStrictEqual(M.check("where", ["ja beat a leeds", "j'habite à Leeds"]),
                         { ok: true, heard: "j'habite à Leeds" });
  assert.deepStrictEqual(M.check("where", ["bonjour"]), { ok: false, heard: "bonjour" });
  assert.deepStrictEqual(M.check("where", []), { ok: false, heard: "" });
});
