/*
 * 出題ロジック（画面に依存しない部分）
 *
 * 学習記録 progress は { [termId]: { seen, correct, streak, review } } の形。
 *   streak  連続で正解した回数
 *   review  間違えて、まだ覚え直していない用語なら true
 * 2回続けて正解すると「覚えた」とみなし、review を外す。
 */
window.UIQuiz = window.UIQuiz || {};

UIQuiz.engine = (function () {
  const MASTER_STREAK = 2;
  const CHOICES = 4;

  const QUESTION_TYPES = ["visual", "description", "scenario", "pair"];

  function levelRank(level) {
    return UIQuiz.LEVELS.findIndex((l) => l.id === level);
  }

  function termsFor(level) {
    return level === "all" ? UIQuiz.TERMS.slice() : UIQuiz.TERMS.filter((t) => t.level === level);
  }

  function getTerm(id) {
    return UIQuiz.TERMS.find((t) => t.id === id);
  }

  function shuffle(list, rng) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function isMastered(p) {
    return !!p && p.streak >= MASTER_STREAK;
  }

  function needsReview(p) {
    return !!p && p.review;
  }

  // 間違えた用語・まだ出ていない用語ほど出やすくする
  function weightOf(p) {
    if (!p || p.seen === 0) return 3;
    if (p.review) return 5;
    if (isMastered(p)) return 1;
    return 2;
  }

  function pickWeighted(terms, count, progress, rng) {
    const pool = terms.map((t) => ({ t, w: weightOf(progress[t.id]) }));
    const picked = [];
    while (picked.length < count && pool.length) {
      const total = pool.reduce((s, x) => s + x.w, 0);
      let r = rng() * total;
      let i = 0;
      while (r >= pool[i].w && i < pool.length - 1) {
        r -= pool[i].w;
        i++;
      }
      picked.push(pool[i].t);
      pool.splice(i, 1);
    }
    return picked;
  }

  // 選択肢: 間違えやすい用語を優先し、同じレベルの用語で埋める。
  // 問題よりも難しいレベルの用語は、まだ習っていない可能性があるので出さない。
  function buildOptions(term, rng) {
    const rank = levelRank(term.level);
    const allowed = (t) => t.id !== term.id && levelRank(t.level) <= rank;
    const confusers = shuffle(
      term.confusers.map(getTerm).filter((t) => t && allowed(t)),
      rng
    ).slice(0, CHOICES - 1);
    const rest = shuffle(
      UIQuiz.TERMS.filter((t) => allowed(t) && !confusers.includes(t)),
      rng
    ).sort((x, y) => (x.level === term.level ? 0 : 1) - (y.level === term.level ? 0 : 1));
    const others = confusers.concat(rest).slice(0, CHOICES - 1);
    return shuffle([term].concat(others), rng).map((t) => t.id);
  }

  function pairsFor(term, maxRank) {
    return UIQuiz.PAIRS.filter(
      (p) => (p.a === term.id || p.b === term.id) && levelRank(p.level) <= maxRank
    );
  }

  function buildQuestion(term, maxRank, rng, hasDemo) {
    const pairs = pairsFor(term, maxRank);
    const types = QUESTION_TYPES.filter((type) => {
      if (type === "visual") return hasDemo(term.id);
      if (type === "pair") return pairs.length > 0;
      return true;
    });
    const type = types[Math.floor(rng() * types.length)];

    if (type === "pair") {
      const pair = pairs[Math.floor(rng() * pairs.length)];
      const candidates = pair.statements.filter((s) => s.answer === term.id);
      const statement = candidates[Math.floor(rng() * candidates.length)];
      return {
        type,
        termId: term.id,
        text: statement.text,
        explain: pair.explain,
        options: shuffle([pair.a, pair.b], rng),
      };
    }
    return {
      type,
      termId: term.id,
      text: type === "description" ? term.desc : type === "scenario" ? term.scenario : "",
      options: buildOptions(term, rng),
    };
  }

  /*
   * 1回分の問題を作る。
   *   level     beginner | intermediate | advanced | all
   *   mode      "normal" か "review"（間違えた用語だけ）
   *   hasDemo   用語 id にデモがあるかを返す関数
   */
  function buildSession({ level, mode = "normal", count = 10, progress = {}, rng = Math.random, hasDemo = () => true }) {
    let terms = termsFor(level);
    if (mode === "review") terms = terms.filter((t) => needsReview(progress[t.id]));
    const maxRank = level === "all" ? UIQuiz.LEVELS.length - 1 : levelRank(level);
    return pickWeighted(terms, count, progress, rng).map((t) =>
      buildQuestion(t, Math.max(maxRank, levelRank(t.level)), rng, hasDemo)
    );
  }

  function recordAnswer(progress, termId, correct) {
    const prev = progress[termId] || { seen: 0, correct: 0, streak: 0, review: false };
    const next = {
      seen: prev.seen + 1,
      correct: prev.correct + (correct ? 1 : 0),
      streak: correct ? prev.streak + 1 : 0,
      review: correct ? prev.review && prev.streak + 1 < MASTER_STREAK : true,
    };
    return Object.assign({}, progress, { [termId]: next });
  }

  function levelStats(level, progress) {
    const terms = termsFor(level);
    return {
      total: terms.length,
      mastered: terms.filter((t) => isMastered(progress[t.id])).length,
      review: terms.filter((t) => needsReview(progress[t.id])).length,
    };
  }

  return {
    MASTER_STREAK,
    levelRank,
    termsFor,
    getTerm,
    shuffle,
    isMastered,
    needsReview,
    buildOptions,
    buildSession,
    recordAnswer,
    levelStats,
  };
})();
