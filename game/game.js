// Sous la Terre — speech test with one monster (Champi, "where I live").
// Loop: Champi asks aloud -> child speaks -> lenient check -> mood rises.
// One miss: "Encore ?" and a slow repeat. Two misses: tap choices.
// Five good answers -> SPARE. Every attempt is logged on this device so a
// grown-up can judge whether speech recognition is good enough (PRD §9, §10.1).
(function () {
  "use strict";

  var MOOD_MAX = 5;
  var QUESTIONS = [
    { kind: "where", fr: "Où habites-tu ?", en: "Where do you live?" },
    { kind: "where", fr: "Tu habites où ?", en: "Where do you live?" },
    { kind: "townOrVillage", fr: "Tu habites dans une ville ou dans un village ?", en: "Do you live in a town or a village?" }
  ];
  // Tap fallback. Both "j'habite" lines answer either question.
  var CHOICES = [
    { fr: "J'habite dans une ville.", ok: true },
    { fr: "J'habite dans un petit village.", ok: true },
    { fr: "J'ai dix ans.", ok: false },
    { fr: "Je m'appelle Champi.", ok: false }
  ];
  var CHEERS = [
    ["Oh ! Merci !", "Oh! Thank you!"],
    ["Super !", "Great!"],
    ["C'est joli !", "That's lovely!"],
    ["Génial !", "Brilliant!"],
    ["Bravo !", "Well done!"]
  ];

  var $ = function (id) { return document.getElementById(id); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  // ---- Saved data (this device only) ----
  var KEY = "sous-la-terre-speechtest-v1";
  function load() {
    try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && d.attempts) return d; } catch (e) {}
    return { attempts: [], spared: 0, stars: 0 };
  }
  var saved = load();
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} }
  function record(a) { a.t = Date.now(); saved.attempts.push(a); persist(); }

  // ---- Music: a tiny chiptune that brightens with Champi's mood ----
  var music = (function () {
    var ctx, master, step = 0, mood = 0, muted = false, ducked = false, running = false;
    var SAD = [57, null, 60, null, 64, null, 62, 60, 57, null, 55, null, 57, null, null, null];
    var HAPPY = [60, 64, 67, 72, 67, 64, 65, 69, 67, 64, 60, 64, 62, null, 60, null];
    var BASS_SAD = [45, 45, 41, 40], BASS_HAPPY = [48, 45, 41, 43];
    function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
    function note(m, type, dur, vol) {
      var t = ctx.currentTime + 0.03, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = hz(m);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.05);
    }
    function level() {
      if (!master) return;
      master.gain.setTargetAtTime(muted || ducked ? 0 : 0.12, ctx.currentTime, 0.08);
    }
    function tick() {
      if (!running) return;
      var happy = mood >= 3, beat = mood >= MOOD_MAX ? 0.17 : 0.26 - mood * 0.012;
      var m = (happy ? HAPPY : SAD)[step % 16];
      if (m) note(m, happy ? "square" : "triangle", beat * 1.6, 0.5);
      if (mood >= 1 && step % 4 === 0) note((happy ? BASS_HAPPY : BASS_SAD)[(step / 4) % 4], "triangle", beat * 3.5, 0.6);
      if (mood >= MOOD_MAX && step % 2 === 1 && m) note(m + 12, "sine", beat, 0.25);
      step++;
      setTimeout(tick, beat * 1000);
    }
    return {
      start: function () {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC || running) return;
        ctx = ctx || new AC(); ctx.resume();
        master = master || ctx.createGain(); master.connect(ctx.destination);
        master.gain.value = 0; running = true; level(); tick();
      },
      setMood: function (n) { mood = n; },
      duck: function (on) { ducked = on; level(); },
      toggleMute: function () { muted = !muted; level(); return muted; }
    };
  })();

  // ---- Voice out (French text-to-speech) ----
  var frVoice = null;
  function pickVoice() {
    if (!window.speechSynthesis) return;
    var vs = speechSynthesis.getVoices();
    frVoice = vs.find(function (v) { return v.lang === "fr-FR"; }) ||
              vs.find(function (v) { return /^fr/i.test(v.lang); }) || null;
  }
  if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

  function say(text, slow) {
    if (!window.speechSynthesis) return Promise.resolve();
    music.duck(true);
    return new Promise(function (resolve) {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "fr-FR"; if (frVoice) u.voice = frVoice;
      u.rate = slow ? 0.65 : 0.95; u.pitch = 1.15;
      // Safari sometimes never fires onend; don't let the game hang.
      var guard = setTimeout(resolve, 2500 + text.length * 160);
      u.onend = u.onerror = function () { clearTimeout(guard); resolve(); };
      speechSynthesis.speak(u);
    }).then(function () { music.duck(false); });
  }

  // ---- Voice in (speech recognition) ----
  // Resolves { alts: [...] } (possibly empty = heard nothing) or { error }.
  function listen() {
    return new Promise(function (resolve) {
      var rec = new SR(), alts = [], done = false;
      rec.lang = "fr-FR"; rec.interimResults = false; rec.maxAlternatives = 5; rec.continuous = false;
      function finish(r) { if (!done) { done = true; clearTimeout(soft); clearTimeout(hard); resolve(r); } }
      rec.onresult = function (e) {
        var res = e.results[0];
        for (var i = 0; i < res.length; i++) alts.push(res[i].transcript);
        finish({ alts: alts });
      };
      rec.onerror = function (e) { finish(e.error === "no-speech" || e.error === "aborted" ? { alts: [] } : { error: e.error }); };
      rec.onend = function () { finish({ alts: alts }); };
      var soft = setTimeout(function () { try { rec.stop(); } catch (e) {} }, 9000);
      var hard = setTimeout(function () { finish({ alts: alts }); }, 12000);
      try { rec.start(); } catch (e) { finish({ error: "start-failed" }); }
    });
  }

  // ---- Screen helpers ----
  function line(fr, en) { $("lineFr").textContent = fr; $("lineEn").textContent = en || ""; }
  function show(which) {
    ["speakActions", "choiceActions", "spareActions", "endActions"].forEach(function (id) { $(id).hidden = id !== which; });
  }
  function setBusy(on) { $("speakBtn").disabled = on; $("repeatBtn").disabled = on; }

  var moodEl = $("mood");
  for (var i = 0; i < MOOD_MAX; i++) moodEl.appendChild(document.createElement("span"));
  function drawMood(n) {
    Array.prototype.forEach.call(moodEl.children, function (s, i) { s.classList.toggle("on", i < n); });
    moodEl.setAttribute("aria-label", "Champi's mood: " + n + " of " + MOOD_MAX);
    // Mouth goes from frown (control point above the corners) to smile (below).
    var cy = 152 + (176 - 152) * n / MOOD_MAX;
    $("mouth").setAttribute("d", "M88 162 Q100 " + cy + " 112 162");
    $("tear").style.display = n >= 2 ? "none" : "";
    $("monster").style.filter = "saturate(" + (0.25 + 0.75 * n / MOOD_MAX) + ") brightness(" + (0.75 + 0.25 * n / MOOD_MAX) + ")";
    music.setMood(n);
  }

  // ---- The encounter ----
  var tapOnly = !SR;
  var game = { seq: [], idx: 0, mood: 0, misses: 0, usedTap: false, busy: false };

  // Five questions, shuffled, never the same one twice in a row.
  function buildSequence() {
    var seq = [];
    while (seq.length < MOOD_MAX) {
      var pool = QUESTIONS.filter(function (q) { return q !== seq[seq.length - 1]; });
      seq.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return seq;
  }

  async function startEncounter() {
    game = { seq: buildSequence(), idx: 0, mood: 0, misses: 0, usedTap: tapOnly, busy: false };
    drawMood(0);
    show(null); setBusy(true);
    line("Oh… bonjour…", "You fell down a hole into the dungeon. A sad little mushroom blocks the path. Nobody ever tells Champi where they live…");
    await say("Oh… bonjour…");
    await wait(2200);
    ask();
  }

  async function ask(slow) {
    var q = game.seq[game.idx];
    var tapNow = tapOnly || game.misses >= 2;
    line(q.fr, tapNow && !tapOnly ? "Tap the right answer, and say it out loud too!" : q.en);
    if (tapNow) { showChoices(); await say(q.fr, slow); return; }
    show("speakActions"); setBusy(true);
    await say(q.fr, slow);
    setBusy(false);
  }

  async function onSpeak() {
    if (game.busy) return;
    game.busy = true; setBusy(true);
    var q = game.seq[game.idx], btn = $("speakBtn");
    if (window.speechSynthesis) speechSynthesis.cancel();
    btn.classList.add("listening"); btn.textContent = "👂 Je t'écoute…";
    music.duck(true);
    var r = await listen();
    music.duck(false);
    btn.classList.remove("listening"); btn.textContent = "🎤 Parle !";
    game.busy = false;

    if (r.error) {
      record({ q: q.fr, mode: "error", error: r.error });
      if (r.error === "not-allowed" || r.error === "service-not-allowed" || r.error === "audio-capture") {
        tapOnly = true; game.usedTap = true;
        line("Hmm…", "The microphone isn't available, so tap your answer instead (and say it out loud too!).");
        showChoices(); return;
      }
      line(q.fr, "Oops, the speech checker didn't work that time. Tap 🎤 and try again.");
      setBusy(false); return;
    }
    if (!r.alts.length) {
      record({ q: q.fr, mode: "silence" });
      line(q.fr, "I didn't hear anything. Tap 🎤, then speak nice and clearly.");
      setBusy(false); return;
    }

    var result = Match.check(q.kind, r.alts);
    record({ q: q.fr, mode: "speech", try: game.misses + 1, ok: result.ok, heard: result.heard, alts: r.alts, misjudged: false });
    if (result.ok) return correct();

    game.misses++;
    line("Encore ?", "Say it again? Listen carefully…");
    await say("Encore ?");
    await wait(300);
    ask(true);
  }

  function showChoices() {
    var box = $("choiceActions");
    box.innerHTML = "";
    CHOICES.slice().sort(function () { return Math.random() - 0.5; }).forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "choice"; b.textContent = c.fr;
      b.onclick = async function () {
        if (game.busy) return;
        game.busy = true;
        var q = game.seq[game.idx];
        record({ q: q.fr, mode: "tap", ok: c.ok, heard: c.fr });
        await say(c.fr);
        game.busy = false;
        if (c.ok) { game.usedTap = true; return correct(); }
        b.disabled = true;
        line("Hmm, non…", "Not quite. Try another one!");
      };
      box.appendChild(b);
    });
    show("choiceActions");
  }

  async function correct() {
    game.mood++; game.misses = 0;
    drawMood(game.mood);
    var cheer = CHEERS[game.mood - 1];
    show(null);
    line(cheer[0], cheer[1]);
    await say(cheer[0]);
    if (game.mood < MOOD_MAX) { game.idx++; await wait(500); return ask(); }
    line("Je suis content !", "Champi is happy now! You can SPARE Champi.");
    await say("Je suis content !");
    show("spareActions");
  }

  async function onSpare() {
    var star = !game.usedTap;
    saved.spared++; if (star) saved.stars++; persist();
    show(null);
    line("Merci ! Au revoir !", star
      ? "★ You spared Champi using only your voice — you earned a star! (Stars: " + saved.stars + ")"
      : "You spared Champi! Next time, cheer Champi up using only your voice to earn a ★.");
    await say("Merci ! Au revoir !");
    show("endActions");
  }

  // ---- Grown-ups panel ----
  function pct(a, b) { return b ? Math.round(100 * a / b) + "%" : "–"; }
  function summary() {
    var A = saved.attempts;
    var spoken = A.filter(function (a) { return a.mode === "speech"; });
    var first = spoken.filter(function (a) { return a.try === 1; });
    var rejected = spoken.filter(function (a) { return !a.ok; });
    var misjudged = rejected.filter(function (a) { return a.misjudged; });
    return [
      ["Spoken answers checked", spoken.length],
      ["Accepted on first try", pct(first.filter(function (a) { return a.ok; }).length, first.length)],
      ["Marked wrong", rejected.length],
      ["…but he was right (grown-up ticked)", misjudged.length + " (" + pct(misjudged.length, spoken.length) + " of spoken answers; target under 20%)"],
      ["Times nothing was heard", A.filter(function (a) { return a.mode === "silence"; }).length],
      ["Speech service errors", A.filter(function (a) { return a.mode === "error"; }).length],
      ["Tap answers used", A.filter(function (a) { return a.mode === "tap"; }).length],
      ["Champi spared / stars", saved.spared + " / " + saved.stars],
      ["French voice", frVoice ? frVoice.name : "none found (browser default)"],
      ["Speech recognition", SR ? "available" : "not available in this browser"]
    ];
  }

  function renderParent() {
    $("stats").innerHTML = "";
    summary().forEach(function (r) {
      var k = document.createElement("span"), v = document.createElement("b");
      k.textContent = r[0]; v.textContent = r[1];
      $("stats").append(k, v);
    });
    var log = $("log");
    log.innerHTML = "";
    saved.attempts.slice(-40).reverse().forEach(function (a) {
      if (a.mode !== "speech") return;
      var li = document.createElement("li");
      var verdict = document.createElement("span");
      verdict.textContent = (a.ok ? "✓ accepted" : "✗ marked wrong") + " · try " + a.try + " · " + a.q;
      li.appendChild(verdict);
      if (!a.ok) {
        var label = document.createElement("label"), cb = document.createElement("input");
        cb.type = "checkbox"; cb.checked = !!a.misjudged;
        cb.onchange = function () { a.misjudged = cb.checked; persist(); renderParent(); };
        label.append(cb, "He was right");
        li.appendChild(label);
      } else li.appendChild(document.createElement("span"));
      var heard = document.createElement("span");
      heard.className = "heard";
      heard.textContent = "Heard: “" + (a.alts || [a.heard]).join("” / “") + "”";
      li.appendChild(heard);
      log.appendChild(li);
    });
    if (!log.children.length) log.innerHTML = "<li>No spoken answers yet.</li>";
  }

  $("copyBtn").onclick = function () {
    var text = "Sous la Terre speech test — " + new Date().toLocaleString() + "\n" +
      summary().map(function (r) { return r[0] + ": " + r[1]; }).join("\n") + "\n\n" +
      saved.attempts.filter(function (a) { return a.mode === "speech"; }).map(function (a) {
        return (a.ok ? "OK " : (a.misjudged ? "WRONG(misjudged) " : "WRONG ")) + a.q + " -> " + (a.alts || []).join(" | ");
      }).join("\n");
    navigator.clipboard.writeText(text).then(
      function () { $("copyBtn").textContent = "Copied ✓"; setTimeout(function () { $("copyBtn").textContent = "Copy results"; }, 1500); },
      function () { prompt("Copy these results:", text); });
  };
  $("parentBtn").onclick = function () { renderParent(); $("parentDialog").showModal(); };
  $("closeParent").onclick = function () { $("parentDialog").close(); };

  // ---- Wiring ----
  if (!SR) $("noSpeechNote").hidden = false;
  $("startBtn").onclick = function () {
    music.start(); pickVoice();
    $("startScreen").hidden = true; $("gameScreen").hidden = false;
    startEncounter();
  };
  $("speakBtn").onclick = onSpeak;
  $("repeatBtn").onclick = async function () {
    if (game.busy) return;
    setBusy(true); await say(game.seq[game.idx].fr, true); setBusy(false);
  };
  $("spareBtn").onclick = onSpare;
  $("againBtn").onclick = startEncounter;
  $("muteBtn").onclick = function () {
    var m = music.toggleMute();
    $("muteBtn").textContent = m ? "♪ Music off" : "♪ Music on";
    $("muteBtn").setAttribute("aria-pressed", String(m));
  };
})();
