/*
 * 画面の切り替えと操作
 * 画面は home / quiz / result / glossary の4つ。#app の中身を描き直して切り替える。
 */
(function () {
  const { engine, demos, LEVELS } = UIQuiz;
  const STORAGE_KEY = "uiquiz.progress.v1";
  const QUESTIONS_PER_ROUND = 10;

  const app = document.getElementById("app");

  // ── 学習記録（ブラウザに保存。使えない環境では保存せずに動かす）──
  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function saveProgress(p) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch (e) {
      /* 保存できなくてもクイズは続けられる */
    }
  }

  let progress = loadProgress();
  let session = null;

  const levelLabel = (id) => (id === "all" ? "すべて" : LEVELS.find((l) => l.id === id).label);

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  // 静的に書いてある「UI用語集」（index.html）は、ホーム画面のときだけ見せる
  const dictionary = document.getElementById("dictionary");
  function showDictionary(visible) {
    if (dictionary) dictionary.hidden = !visible;
  }

  function view(html) {
    app.innerHTML = html;
    showDictionary(false);
    window.scrollTo(0, 0);
    const heading = app.querySelector("h1, h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }

  function meter(done, total) {
    const pct = total ? Math.round((done / total) * 100) : 0;
    return `<div class="meter" role="img" aria-label="${total}語中${done}語を覚えた"><span style="width:${pct}%"></span></div>`;
  }

  // ── ホーム ──
  function renderHome() {
    const levels = LEVELS.map((l) => ({ ...l, stats: engine.levelStats(l.id, progress) }));
    const all = engine.levelStats("all", progress);
    view(`
      <section class="hero">
        <p class="eyebrow">AIでアプリを作る人のための</p>
        <h1>UIの名前クイズ</h1>
        <p class="lead">「あの、画面の端からにゅっと出るやつ」を「Drawer」と言えるようになると、AIへの指示が一気に正確になります。実際に動くUIを見ながら、名前を覚えましょう。</p>
      </section>

      <section class="levels" aria-label="レベルを選ぶ">
        ${levels
          .map(
            (l) => `
          <article class="level-card level-${l.id}">
            <div class="level-head"><h2 class="level-title">${l.label}</h2><span class="muted">${l.stats.total}語</span></div>
            <p class="muted">${l.note}</p>
            ${meter(l.stats.mastered, l.stats.total)}
            <p class="small muted">覚えた ${l.stats.mastered} / ${l.stats.total}</p>
            <button class="btn btn-primary" data-start="${l.id}">${QUESTIONS_PER_ROUND}問に挑戦</button>
          </article>`
          )
          .join("")}
      </section>

      <section class="home-actions">
        <button class="btn btn-secondary" data-start="all">全レベルから出題</button>
        ${all.review ? `<button class="btn btn-secondary" data-review>間違えた用語を復習（${all.review}語）</button>` : ""}
        <button class="btn btn-secondary" data-glossary>用語一覧を見る</button>
      </section>

      <section class="howto">
        <h2 class="section-title">出題のしかた</h2>
        <ul class="howto-list">
          <li><b>見た目から</b> 実際に動くUIを見て名前を答える</li>
          <li><b>説明から</b> 見た目や役割の説明から名前を答える</li>
          <li><b>場面から</b> 「こんなとき何を使う？」に答える</li>
          <li><b>どっち？</b> 間違えやすい2つを見分ける</li>
        </ul>
        <p class="small muted">2回続けて正解すると「覚えた」になります。間違えた用語は、次の出題で出やすくなります。正解したあとに出る「AIへの指示の例」は、そのままコピーして使えます。</p>
      </section>

      <footer class="footer">
        <button class="link" data-reset>学習記録をリセット</button>
        <p class="small muted">説明はMDN・WAI-ARIA・Apple Human Interface Guidelines・Material Designなどの公開資料をもとに書いています。用語の調べものには <a href="https://namethatui.com/" target="_blank" rel="noopener">Name That UI</a> も便利です。</p>
      </footer>
    `);

    showDictionary(true);
    app.querySelectorAll("[data-start]").forEach((b) => b.addEventListener("click", () => startQuiz(b.dataset.start, "normal")));
    const review = app.querySelector("[data-review]");
    if (review) review.addEventListener("click", () => startQuiz("all", "review"));
    app.querySelector("[data-glossary]").addEventListener("click", () => renderGlossary("all"));
    // confirm() が使えない環境もあるので、2回押しで確認する
    const reset = app.querySelector("[data-reset]");
    let armed = null;
    reset.addEventListener("click", () => {
      if (!armed) {
        reset.textContent = "本当に消す場合は、もう一度押してください";
        armed = setTimeout(() => {
          armed = null;
          reset.textContent = "学習記録をリセット";
        }, 4000);
        return;
      }
      clearTimeout(armed);
      progress = {};
      saveProgress(progress);
      renderHome();
    });
  }

  // ── クイズ ──
  function startQuiz(level, mode) {
    const questions = engine.buildSession({ level, mode, count: QUESTIONS_PER_ROUND, progress, hasDemo: demos.has });
    if (!questions.length) return renderHome();
    session = { level, mode, questions, index: 0, answers: [] };
    renderQuestion();
  }

  const PROMPTS = {
    visual: "点線で囲まれた部分の名前は？",
    description: "この説明に当てはまるUIは？",
    scenario: "こんなとき、使うUIは？",
    pair: "どっちのこと？",
  };
  const TYPE_LABELS = { visual: "見た目から", description: "説明から", scenario: "場面から", pair: "どっち？" };

  function optionLabel(term) {
    return `<span class="opt-text"><span class="opt-name">${esc(term.name)}</span><span class="opt-kana">${esc(term.kana)}</span></span>`;
  }

  function renderQuestion() {
    const q = session.questions[session.index];
    const total = session.questions.length;
    view(`
      <div class="quiz-top">
        <button class="link" data-quit>← やめる</button>
        <span class="muted small">${levelLabel(session.level)}${session.mode === "review" ? "・復習" : ""}</span>
        <span class="quiz-count">${session.index + 1} / ${total}</span>
      </div>
      ${meter(session.index, total)}

      <section class="question">
        <span class="qtype">${TYPE_LABELS[q.type]}</span>
        <h2 class="qtext">${PROMPTS[q.type]}</h2>
        ${
          q.type === "visual"
            ? `<div class="demo-frame"><div data-stage></div><p class="small muted">触って動かせます</p></div>`
            : `<blockquote class="qquote">${esc(q.text)}</blockquote>`
        }
        <div class="options ${q.options.length === 2 ? "options-2" : ""}" role="group" aria-label="選択肢">
          ${q.options
            .map((id, i) => `<button class="option" data-id="${id}"><span class="opt-key">${i + 1}</span>${optionLabel(engine.getTerm(id))}</button>`)
            .join("")}
        </div>
        <div data-feedback aria-live="polite"></div>
      </section>
    `);

    if (q.type === "visual") demos.render(q.termId, app.querySelector("[data-stage]"));
    // 回答はその都度保存しているので、確認なしでホームに戻ってよい
    app.querySelector("[data-quit]").addEventListener("click", renderHome);
    app.querySelectorAll(".option").forEach((b) => b.addEventListener("click", () => answer(b.dataset.id)));
  }

  function answer(chosenId) {
    const q = session.questions[session.index];
    if (session.answers.length > session.index) return;
    const correct = chosenId === q.termId;
    session.answers.push({ termId: q.termId, chosenId, correct });
    progress = engine.recordAnswer(progress, q.termId, correct);
    saveProgress(progress);

    app.querySelectorAll(".option").forEach((b) => {
      b.disabled = true;
      if (b.dataset.id === q.termId) b.classList.add("is-correct");
      else if (b.dataset.id === chosenId) b.classList.add("is-wrong");
    });

    const term = engine.getTerm(q.termId);
    const chosen = engine.getTerm(chosenId);
    const last = session.index === session.questions.length - 1;
    const fb = app.querySelector("[data-feedback]");
    fb.innerHTML = `
      <div class="feedback ${correct ? "feedback-ok" : "feedback-ng"}">
        <p class="verdict">${correct ? "正解！" : "おしい！"}</p>
        <h3 class="answer-name">${esc(term.name)} <span class="muted">${esc(term.kana)}</span></h3>
        ${q.type !== "visual" ? `<div class="demo-frame demo-frame-sm"><div data-stage></div></div>` : ""}
        <p>${esc(term.desc)}</p>
        ${originLine(term)}
        ${q.explain ? `<p class="explain">${esc(q.explain)}</p>` : ""}
        ${!correct ? `<p class="chosen-note"><b>選んだ「${esc(chosen.name)}」は：</b>${esc(chosen.desc)}</p>` : ""}
        ${promptBox(term)}
        <button class="btn btn-primary btn-next" data-next>${last ? "結果を見る" : "次の問題へ"}</button>
      </div>
    `;
    if (q.type !== "visual") demos.render(q.termId, fb.querySelector("[data-stage]"));
    bindCopy(fb);
    const next = fb.querySelector("[data-next]");
    next.addEventListener("click", goNext);
    next.focus({ preventScroll: true });
    fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function goNext() {
    session.index++;
    if (session.index < session.questions.length) renderQuestion();
    else renderResult();
  }

  function originLine(term) {
    return `<p class="origin"><span class="origin-label">名前の由来</span>${esc(term.origin)}</p>`;
  }

  function promptBox(term) {
    return `
      <div class="prompt-box">
        <div class="prompt-head"><span class="small">AIへの指示の例</span><button class="btn btn-small" data-copy="${esc(term.prompt)}">コピー</button></div>
        <p class="prompt-text">${esc(term.prompt)}</p>
      </div>`;
  }

  function bindCopy(root) {
    root.querySelectorAll("[data-copy]").forEach((b) =>
      b.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(b.dataset.copy);
          b.textContent = "コピーしました";
        } catch (e) {
          // コピーできない環境では、文を選択して手動でコピーしてもらう
          const text = b.closest(".prompt-box").querySelector(".prompt-text");
          const range = document.createRange();
          range.selectNodeContents(text);
          getSelection().removeAllRanges();
          getSelection().addRange(range);
          b.textContent = "選択しました";
        }
        setTimeout(() => (b.textContent = "コピー"), 1600);
      })
    );
  }

  // ── 結果 ──
  function renderResult() {
    const score = session.answers.filter((a) => a.correct).length;
    const total = session.answers.length;
    const message =
      score === total ? "全問正解！この調子で次のレベルへ。" : score >= total * 0.7 ? "よくできました！間違えた用語は次の出題で出やすくなります。" : "少しずつで大丈夫。間違えた用語を復習してみましょう。";
    const wrong = session.answers.filter((a) => !a.correct).length;
    view(`
      <section class="result">
        <p class="eyebrow">${levelLabel(session.level)}${session.mode === "review" ? "・復習" : ""}の結果</p>
        <h1 class="score">${score}<span> / ${total}</span></h1>
        <p class="lead">${message}</p>
        <div class="home-actions">
          <button class="btn btn-primary" data-again>もう一度</button>
          ${wrong ? `<button class="btn btn-secondary" data-review>間違えた用語を復習</button>` : ""}
          <button class="btn btn-secondary" data-home>ホームへ</button>
        </div>
      </section>
      <section>
        <h2 class="section-title">今回出た用語</h2>
        <ul class="result-list">
          ${session.answers
            .map((a) => {
              const t = engine.getTerm(a.termId);
              return `<li class="result-item">
                <span class="mark ${a.correct ? "mark-ok" : "mark-ng"}" aria-label="${a.correct ? "正解" : "不正解"}">${a.correct ? "✓" : "✗"}</span>
                <details><summary><b>${esc(t.name)}</b> <span class="muted">${esc(t.kana)}</span></summary>
                  <p>${esc(t.desc)}</p>${originLine(t)}${promptBox(t)}</details>
              </li>`;
            })
            .join("")}
        </ul>
      </section>
    `);
    bindCopy(app);
    app.querySelector("[data-again]").addEventListener("click", () => startQuiz(session.level, session.mode));
    app.querySelector("[data-home]").addEventListener("click", renderHome);
    const review = app.querySelector("[data-review]");
    if (review) review.addEventListener("click", () => startQuiz("all", "review"));
  }

  // ── 用語一覧 ──
  function renderGlossary(level) {
    const terms = engine.termsFor(level);
    view(`
      <div class="quiz-top"><button class="link" data-home>← ホーム</button></div>
      <h1>用語一覧</h1>
      <div class="filter" role="group" aria-label="レベルで絞り込む">
        ${["all"].concat(LEVELS.map((l) => l.id))
          .map((id) => `<button class="filter-btn" aria-pressed="${id === level}" data-level="${id}">${levelLabel(id)}</button>`)
          .join("")}
      </div>
      <div class="glossary">
        ${terms
          .map(
            (t) => `
          <article class="term">
            <div class="demo-frame demo-frame-sm"><div data-stage="${t.id}"></div></div>
            <div class="term-body">
              <div class="term-head"><h2 class="term-name">${esc(t.name)}</h2>
                <span class="tag tag-${t.level}">${levelLabel(t.level)}</span>
                ${engine.isMastered(progress[t.id]) ? `<span class="tag tag-done">覚えた</span>` : ""}</div>
              <p class="muted">${esc(t.kana)}</p>
              <p>${esc(t.desc)}</p>
              ${originLine(t)}
              ${promptBox(t)}
            </div>
          </article>`
          )
          .join("")}
      </div>
    `);
    app.querySelectorAll("[data-stage]").forEach((s) => demos.render(s.dataset.stage, s));
    bindCopy(app);
    app.querySelector("[data-home]").addEventListener("click", renderHome);
    app.querySelectorAll("[data-level]").forEach((b) => b.addEventListener("click", () => renderGlossary(b.dataset.level)));
  }

  // 数字キーで選択、Enterで次へ
  document.addEventListener("keydown", (e) => {
    if (!session || !app.querySelector(".question") || e.target.matches("input, textarea")) return;
    const n = Number(e.key);
    if (n >= 1 && n <= 4) {
      const opt = app.querySelectorAll(".option")[n - 1];
      if (opt && !opt.disabled) opt.click();
    }
  });

  renderHome();
})();
