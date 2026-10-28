// Answer checking for the "where I live" monster.
// Deliberately lenient: being told "wrong" when he was right is the worst
// outcome for confidence, so we check the French sentence pattern and never
// the town name (a French recogniser often mangles English place names).
(function (root) {
  // Lowercase, strip accents and punctuation, collapse spaces.
  // "J'habite à Leeds." -> "j habite a leeds"
  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  // Ways a recogniser has been seen to spell "j'habite" once normalized.
  var HABITE = /^(j?h?abite|jabite|jhabite|chabite)$/;

  function habiteIndex(words) {
    for (var i = 0; i < words.length; i++) {
      if (HABITE.test(words[i])) return i;
    }
    return -1;
  }

  // "Où habites-tu ?" — any "j'habite …" with at least one word after it.
  function isWhereAnswer(text) {
    var words = normalize(text).split(" ").filter(Boolean);
    var i = habiteIndex(words);
    return i !== -1 && i < words.length - 1;
  }

  // "Tu habites dans une ville ou dans un village ?" — "ville" or "village",
  // with or without "j'habite" ("Dans un petit village" is good French too).
  function isTownOrVillageAnswer(text) {
    return /\b(ville|village)\b/.test(normalize(text));
  }

  var CHECKS = { where: isWhereAnswer, townOrVillage: isTownOrVillageAnswer };

  // Recognisers return several guesses; accept if any of them passes.
  function check(kind, alternatives) {
    var test = CHECKS[kind];
    for (var i = 0; i < alternatives.length; i++) {
      if (test(alternatives[i])) return { ok: true, heard: alternatives[i] };
    }
    return { ok: false, heard: alternatives[0] || "" };
  }

  var api = { normalize: normalize, isWhereAnswer: isWhereAnswer,
              isTownOrVillageAnswer: isTownOrVillageAnswer, check: check };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Match = api;
})(this);
