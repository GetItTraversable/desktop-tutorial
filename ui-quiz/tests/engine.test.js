// 問題データと出題ロジックのテスト。実行: node --test ui-quiz/tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..", "js");
const ctx = vm.createContext({});
ctx.window = ctx;
for (const file of ["data.js", "engine.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), ctx, { filename: file });
}
const { TERMS, PAIRS, LEVELS, engine } = ctx.UIQuiz;
const plain = (v) => JSON.parse(JSON.stringify(v));

// demos.js は DOM を使うので、定義されている id だけを文字列から拾う
const demoSource = fs.readFileSync(path.join(root, "demos.js"), "utf8");
const demoIds = new Set([...demoSource.matchAll(/^\s*D(?:\.([\w]+)|\["([\w-]+)"\])\s*=/gm)].map((m) => m[1] || m[2]));

function seeded(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

test("用語の id は重複しない", () => {
  const ids = TERMS.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("どの用語にも必要な項目がそろっている", () => {
  const levelIds = LEVELS.map((l) => l.id);
  for (const t of TERMS) {
    for (const key of ["name", "kana", "origin", "desc", "scenario", "prompt"]) {
      assert.ok(t[key] && t[key].length > 0, `${t.id}.${key}`);
    }
    assert.ok(levelIds.includes(t.level), `${t.id}.level`);
    assert.ok(t.confusers.length > 0, `${t.id}.confusers`);
  }
});

test("各レベルに、4択を作れるだけの用語がある", () => {
  for (const l of LEVELS) assert.ok(engine.termsFor(l.id).length >= 10, l.id);
});

test("間違えやすい用語の id はすべて存在する", () => {
  const ids = new Set(TERMS.map((t) => t.id));
  for (const t of TERMS) {
    for (const c of t.confusers) {
      assert.ok(ids.has(c), `${t.id} → ${c}`);
      assert.notEqual(c, t.id);
    }
  }
});

test("すべての用語にデモがあり、余分なデモもない", () => {
  const ids = TERMS.map((t) => t.id);
  for (const id of ids) assert.ok(demoIds.has(id), `デモがない: ${id}`);
  for (const id of demoIds) assert.ok(ids.includes(id), `用語がない: ${id}`);
});

test("説明文と場面には答えの名前を書かず、指示の例には書く", () => {
  for (const t of TERMS) {
    const english = t.name.split(" (")[0].toLowerCase();
    assert.ok(!t.desc.toLowerCase().includes(english), `${t.id}.desc に ${english}`);
    assert.ok(!t.scenario.toLowerCase().includes(english), `${t.id}.scenario に ${english}`);
    assert.ok(t.prompt.toLowerCase().includes(english), `${t.id}.prompt に名前を入れる`);
  }
});

test("比較問題は2つの用語のどちらかが答えで、レベルが合っている", () => {
  for (const p of PAIRS) {
    const a = engine.getTerm(p.a);
    const b = engine.getTerm(p.b);
    assert.ok(a && b, `${p.a} / ${p.b}`);
    assert.equal(engine.levelRank(p.level), Math.max(engine.levelRank(a.level), engine.levelRank(b.level)), `${p.a}/${p.b} level`);
    for (const s of p.statements) assert.ok([p.a, p.b].includes(s.answer));
  }
});

test("選択肢は4つで重複がなく、正解を含み、問題より難しい用語を出さない", () => {
  const rng = seeded(1);
  for (const t of TERMS) {
    for (let i = 0; i < 20; i++) {
      const opts = engine.buildOptions(t, rng);
      assert.equal(opts.length, 4, t.id);
      assert.equal(new Set(opts).size, 4, t.id);
      assert.ok(opts.includes(t.id));
      for (const id of opts) assert.ok(engine.levelRank(engine.getTerm(id).level) <= engine.levelRank(t.level), `${t.id} に ${id}`);
    }
  }
});

test("1回分の問題は指定レベルの用語だけで、同じ用語が重ならない", () => {
  for (const l of LEVELS) {
    const qs = engine.buildSession({ level: l.id, count: 10, rng: seeded(7) });
    assert.equal(qs.length, 10);
    assert.equal(new Set(qs.map((q) => q.termId)).size, 10);
    for (const q of qs) {
      assert.equal(engine.getTerm(q.termId).level, l.id);
      assert.ok(q.options.includes(q.termId));
    }
  }
});

test("初級の回では、中級の比較問題を出さない", () => {
  for (let seed = 0; seed < 50; seed++) {
    const qs = engine.buildSession({ level: "beginner", count: 16, rng: seeded(seed) });
    for (const q of qs.filter((x) => x.type === "pair")) {
      for (const id of q.options) assert.equal(engine.getTerm(id).level, "beginner");
    }
  }
});

test("デモがない用語には、見た目の問題を出さない", () => {
  const qs = engine.buildSession({ level: "all", count: TERMS.length, rng: seeded(3), hasDemo: () => false });
  assert.ok(qs.every((q) => q.type !== "visual"));
});

test("2回続けて正解すると覚えた、間違えると復習に入る", () => {
  let p = {};
  p = engine.recordAnswer(p, "modal", false);
  assert.equal(p.modal.review, true);
  assert.equal(engine.isMastered(p.modal), false);
  p = engine.recordAnswer(p, "modal", true);
  assert.equal(p.modal.review, true);
  p = engine.recordAnswer(p, "modal", true);
  assert.equal(p.modal.review, false);
  assert.equal(engine.isMastered(p.modal), true);
  assert.deepEqual(plain(p.modal), { seen: 3, correct: 2, streak: 2, review: false });
});

test("復習モードは間違えた用語だけを出す", () => {
  let p = {};
  p = engine.recordAnswer(p, "toast", false);
  p = engine.recordAnswer(p, "drawer", false);
  p = engine.recordAnswer(p, "tabs", true);
  const qs = engine.buildSession({ level: "all", mode: "review", count: 10, progress: p, rng: seeded(5) });
  assert.deepEqual(plain(qs.map((q) => q.termId).sort()), ["drawer", "toast"]);
});

test("index.html の UI用語集が data.js と一致している", () => {
  const { build, INDEX } = require("../tools/build-dictionary.js");
  assert.equal(fs.readFileSync(INDEX, "utf8"), build(), "node ui-quiz/tools/build-dictionary.js を実行してください");
});
