/*
 * 問題に表示する「本物のUI」のデモ
 *
 * UIQuiz.demos[id](stage) が stage 要素の中にデモを組み立てる。
 * 答えが分かってしまうので、デモの中には用語の名前を書かない。
 * 問題で注目してほしい部分には class="is-target"（点線の枠）を付ける。
 * 1画面に複数のデモが並ぶ（用語一覧）ので、id 属性は使わない。
 */
window.UIQuiz = window.UIQuiz || {};

UIQuiz.demos = (function () {
  const ICONS = {
    bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    right: '<path d="m9 6 6 6-6 6"/>',
    left: '<path d="m15 6-6 6 6 6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    folder: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
    inbox: '<path d="M3 13h5l2 3h4l2-3h5"/><path d="M5 5h14l2 8v6H3v-6z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    pin: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  };

  function icon(name) {
    return (
      '<svg class="m-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + "</svg>"
    );
  }

  function mount(stage, html) {
    stage.innerHTML = html;
    return (sel) => stage.querySelector(sel);
  }

  // stage が画面から外れたら止めるタイマー
  function every(stage, ms, fn) {
    const t = setInterval(() => {
      if (!stage.isConnected) return clearInterval(t);
      fn();
    }, ms);
  }

  const lines = (n) => '<div class="m-line"></div>'.repeat(n);

  const D = {};

  // ───────── 初級 ─────────

  D.button = (stage) => {
    const $ = mount(
      stage,
      `<div class="m-page m-center">
        <div class="m-panel">
          <p class="m-text">入力した内容を確認しました。</p>
          <div class="m-row m-end">
            <button class="m-btn m-ghost">キャンセル</button>
            <button class="m-btn m-primary is-target" data-send>送信する</button>
          </div>
        </div>
      </div>`
    );
    $("[data-send]").addEventListener("click", (e) => {
      e.target.textContent = "送信しました";
      setTimeout(() => (e.target.textContent = "送信する"), 1200);
    });
  };

  D["text-field"] = (stage) => {
    mount(
      stage,
      `<div class="m-page m-center">
        <div class="m-panel">
          <label class="m-label">メールアドレス
            <input class="m-input is-target" type="email" placeholder="example@mail.com" autocomplete="off">
          </label>
        </div>
      </div>`
    );
  };

  D.checkbox = (stage) => {
    const items = ["音楽", "映画", "スポーツ", "料理"];
    mount(
      stage,
      `<div class="m-page m-center">
        <fieldset class="m-panel m-fieldset is-target">
          <legend class="m-text">興味のあるジャンル（いくつでも）</legend>
          ${items
            .map((x, i) => `<label class="m-check"><input type="checkbox" ${i % 2 === 0 ? "checked" : ""}> ${x}</label>`)
            .join("")}
        </fieldset>
      </div>`
    );
  };

  D.radio = (stage) => {
    const items = ["通常配送", "お急ぎ便", "店舗で受け取る"];
    const name = "r" + Math.random().toString(36).slice(2);
    mount(
      stage,
      `<div class="m-page m-center">
        <fieldset class="m-panel m-fieldset is-target">
          <legend class="m-text">配送方法</legend>
          ${items
            .map((x, i) => `<label class="m-check"><input type="radio" name="${name}" ${i === 0 ? "checked" : ""}> ${x}</label>`)
            .join("")}
        </fieldset>
      </div>`
    );
  };

  D.toggle = (stage) => {
    const rows = [
      ["通知を受け取る", true],
      ["ダークモード", false],
      ["自動で保存", true],
    ];
    mount(
      stage,
      `<div class="m-page m-center">
        <div class="m-panel m-list">
          ${rows
            .map(
              ([label, on], i) =>
                `<div class="m-list-row"><span>${label}</span>
                  <button class="m-switch ${i === 0 ? "is-target" : ""}" role="switch" aria-checked="${on}" aria-label="${label}"><span></span></button>
                </div>`
            )
            .join("")}
        </div>
      </div>`
    );
    stage.querySelectorAll(".m-switch").forEach((b) =>
      b.addEventListener("click", () => b.setAttribute("aria-checked", b.getAttribute("aria-checked") !== "true"))
    );
  };

  D.select = (stage) => {
    const prefs = ["北海道", "東京都", "神奈川県", "大阪府"];
    const $ = mount(
      stage,
      `<div class="m-page m-top">
        <div class="m-panel m-narrow is-target">
          <div class="m-label">都道府県</div>
          <button class="m-select" aria-expanded="true"><span data-value>東京都</span>${icon("down")}</button>
          <ul class="m-menu m-select-list">
            ${prefs.map((p) => `<li class="m-menu-item ${p === "東京都" ? "is-selected" : ""}">${p}</li>`).join("")}
          </ul>
        </div>
      </div>`
    );
    const btn = $(".m-select");
    const list = $(".m-select-list");
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", open);
      list.hidden = !open;
    });
    list.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;
      list.querySelectorAll("li").forEach((x) => x.classList.toggle("is-selected", x === li));
      $("[data-value]").textContent = li.textContent;
      btn.click();
    });
  };

  D.navbar = (stage) => {
    mount(
      stage,
      `<div class="m-page">
        <header class="m-header is-target">
          <span class="m-logo">◆ Shop</span>
          <nav class="m-nav"><a class="is-active">ホーム</a><a>料金</a><a>ブログ</a></nav>
        </header>
        <div class="m-body"><div class="m-hero"></div>${lines(3)}</div>
      </div>`
    );
  };

  D.hamburger = (stage) => {
    const $ = mount(
      stage,
      `<div class="m-phone">
        <header class="m-header">
          <span class="m-logo">◆ Shop</span>
          <button class="m-icon-btn is-target" aria-label="メニューを開く" data-open>${icon("menu")}</button>
        </header>
        <div class="m-body"><div class="m-hero"></div>${lines(3)}</div>
        <ul class="m-menu m-drop-menu" hidden><li class="m-menu-item">ホーム</li><li class="m-menu-item">料金</li><li class="m-menu-item">ブログ</li></ul>
      </div>`
    );
    $("[data-open]").addEventListener("click", () => ($(".m-drop-menu").hidden = !$(".m-drop-menu").hidden));
  };

  D.card = (stage) => {
    const items = [
      ["ワイヤレスイヤホン", "¥12,800", "g1"],
      ["スマートウォッチ", "¥24,500", "g2"],
      ["モバイルバッテリー", "¥3,980", "g3"],
    ];
    mount(
      stage,
      `<div class="m-page m-pad">
        <div class="m-grid3">
          ${items
            .map(
              ([title, price, g], i) =>
                `<article class="m-card ${i === 0 ? "is-target" : ""}">
                  <div class="m-thumb ${g}"></div>
                  <div class="m-card-body"><div class="m-card-title">${title}</div><div class="m-muted">${price}</div>
                  <button class="m-btn m-primary m-sm">カートに入れる</button></div>
                </article>`
            )
            .join("")}
        </div>
      </div>`
    );
  };

  D.modal = (stage) => {
    const $ = mount(
      stage,
      `<div class="m-page">
        <div class="m-body">${lines(2)}<button class="m-btn m-danger-ghost m-sm" data-open>${icon("trash")} 削除</button>${lines(2)}</div>
        <div class="m-overlay" data-overlay>
          <div class="m-dialog is-target" role="dialog" aria-label="削除の確認">
            <div class="m-dialog-title">この項目を削除しますか？</div>
            <p class="m-muted">この操作は取り消せません。</p>
            <div class="m-row m-end"><button class="m-btn m-ghost" data-close>キャンセル</button><button class="m-btn m-danger" data-close>削除する</button></div>
          </div>
        </div>
      </div>`
    );
    const overlay = $("[data-overlay]");
    stage.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => (overlay.hidden = true)));
    $("[data-open]").addEventListener("click", () => (overlay.hidden = false));
  };

  D.toast = (stage) => {
    const $ = mount(
      stage,
      `<div class="m-page">
        <div class="m-body">${lines(3)}<button class="m-btn m-primary m-sm" data-save>保存</button></div>
        <div class="m-toast is-target" role="status">${icon("check")} 保存しました</div>
      </div>`
    );
    const toast = $(".m-toast");
    let timer;
    $("[data-save]").addEventListener("click", () => {
      toast.classList.remove("is-shown");
      void toast.offsetWidth;
      toast.classList.add("is-shown");
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove("is-shown"), 3000);
    });
    toast.classList.add("is-shown");
  };

  D.tabs = (stage) => {
    const tabs = {
      説明: "軽くて耳が痛くなりにくい設計です。最大8時間再生できます。",
      仕様: "重さ 5g ／ 充電時間 1.5時間 ／ 防水 IPX4",
      レビュー: "★★★★☆ 「音がクリアで満足しています」",
    };
    const $ = mount(
      stage,
      `<div class="m-page m-pad">
        <div class="m-tablist is-target" role="tablist">
          ${Object.keys(tabs).map((t, i) => `<button role="tab" aria-selected="${i === 0}">${t}</button>`).join("")}
        </div>
        <div class="m-tabpanel m-text"></div>
      </div>`
    );
    const panel = $(".m-tabpanel");
    const show = (name) => {
      stage.querySelectorAll("[role=tab]").forEach((b) => b.setAttribute("aria-selected", b.textContent === name));
      panel.textContent = tabs[name];
    };
    stage.querySelectorAll("[role=tab]").forEach((b) => b.addEventListener("click", () => show(b.textContent)));
    show("説明");
  };

  D.tooltip = (stage) => {
    mount(
      stage,
      `<div class="m-page m-center">
        <div class="m-row">
          <button class="m-icon-btn m-outlined" aria-label="通知">${icon("bell")}</button>
          <span class="m-tip-wrap is-open">
            <button class="m-icon-btn m-outlined" aria-label="削除">${icon("trash")}</button>
            <span class="m-tip is-target" role="tooltip">削除</span>
          </span>
          <button class="m-icon-btn m-outlined" aria-label="設定">${icon("gear")}</button>
        </div>
      </div>`
    );
  };

  D.badge = (stage) => {
    mount(
      stage,
      `<div class="m-page">
        <header class="m-header">
          <span class="m-logo">◆ App</span>
          <span class="m-badge-wrap"><button class="m-icon-btn" aria-label="通知">${icon("bell")}</button><span class="m-badge is-target">3</span></span>
        </header>
        <div class="m-body">${lines(4)}</div>
      </div>`
    );
  };

  D.avatar = (stage) => {
    const comments = [
      ["YT", "山田 太郎", "とても分かりやすい記事でした！", "g1"],
      ["SK", "佐藤 花子", "続きも楽しみにしています。", "g2"],
    ];
    mount(
      stage,
      `<div class="m-page m-pad">
        ${comments
          .map(
            ([ini, name, text, g], i) =>
              `<div class="m-comment"><span class="m-avatar ${g} ${i === 0 ? "is-target" : ""}">${ini}</span>
                <div><div class="m-card-title">${name}</div><div class="m-muted">${text}</div></div></div>`
          )
          .join("")}
      </div>`
    );
  };

  D.spinner = (stage) => {
    mount(
      stage,
      `<div class="m-page m-center">
        <div class="m-panel m-col m-center-x">
          <span class="m-spinner m-spinner-lg is-target" role="status" aria-label="処理中"></span>
          <p class="m-muted">結果を取得しています…</p>
          <button class="m-btn m-primary" disabled><span class="m-spinner"></span> 送信中</button>
        </div>
      </div>`
    );
  };

  // ───────── 中級 ─────────

  D.drawer = (stage) => {
    const $ = mount(
      stage,
      `<div class="m-phone">
        <header class="m-header"><button class="m-icon-btn" aria-label="メニューを開く" data-open>${icon("menu")}</button><span class="m-logo">◆ Shop</span><span></span></header>
        <div class="m-body"><div class="m-hero"></div>${lines(3)}</div>
        <div class="m-overlay m-overlay-left" data-overlay>
          <nav class="m-drawer is-target">
            <div class="m-card-title">メニュー</div>
            <a class="m-menu-item is-selected">ホーム</a><a class="m-menu-item">商品一覧</a><a class="m-menu-item">お問い合わせ</a>
          </nav>
        </div>
      </div>`
    );
    const overlay = $("[data-overlay]");
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.add("is-closed");
    });
    $("[data-open]").addEventListener("click", () => overlay.classList.remove("is-closed"));
  };

  D.popover = (stage) => {
    const $ = mount(
      stage,
      `<div class="m-page m-top">
        <div class="m-pop-wrap">
          <button class="m-btn m-ghost" aria-expanded="true" data-toggle>共有</button>
          <div class="m-popover is-target">
            <div class="m-card-title">リンクを共有</div>
            <div class="m-row"><input class="m-input m-sm" value="https://example.com/a1b2" readonly><button class="m-btn m-primary m-sm" data-copy>コピー</button></div>
          </div>
        </div>
      </div>`
    );
    const btn = $("[data-toggle]");
    const pop = $(".m-popover");
    btn.addEventListener("click", () => {
      pop.hidden = !pop.hidden;
      btn.setAttribute("aria-expanded", !pop.hidden);
    });
    $("[data-copy]").addEventListener("click", (e) => (e.target.textContent = "コピー済み"));
  };

  D.accordion = (stage) => {
    const faq = [
      ["送料はいくらですか？", "5,000円以上のご注文で送料無料です。"],
      ["返品はできますか？", "商品到着から7日以内なら返品できます。"],
      ["支払い方法は？", "クレジットカードとコンビニ払いに対応しています。"],
    ];
    mount(
      stage,
      `<div class="m-page m-pad">
        <div class="m-accordion is-target">
          ${faq
            .map(
              ([q, a], i) =>
                `<div class="m-acc-item"><button class="m-acc-head" aria-expanded="${i === 0}">${q}${icon("down")}</button>
                  <div class="m-acc-body m-muted" ${i === 0 ? "" : "hidden"}>${a}</div></div>`
            )
            .join("")}
        </div>
      </div>`
    );
    stage.querySelectorAll(".m-acc-head").forEach((b) =>
      b.addEventListener("click", () => {
        const open = b.getAttribute("aria-expanded") !== "true";
        b.setAttribute("aria-expanded", open);
        b.nextElementSibling.hidden = !open;
      })
    );
  };

  D.breadcrumb = (stage) => {
    mount(
      stage,
      `<div class="m-page">
        <header class="m-header"><span class="m-logo">◆ Shop</span><span></span></header>
        <div class="m-body">
          <nav class="m-crumbs is-target" aria-label="現在地"><a>ホーム</a>${icon("right")}<a>家電</a>${icon("right")}<span aria-current="page">イヤホン</span></nav>
          <div class="m-h">イヤホン</div>${lines(2)}
        </div>
      </div>`
    );
  };

  D.skeleton = (stage) => {
    const card = `<div class="m-skel-card"><div class="m-skel m-skel-img"></div><div><div class="m-skel m-skel-line"></div><div class="m-skel m-skel-line m-w60"></div></div></div>`;
    mount(stage, `<div class="m-page m-pad"><div class="m-col is-target">${card.repeat(3)}</div></div>`);
  };

  D["empty-state"] = (stage) => {
    mount(
      stage,
      `<div class="m-page">
        <header class="m-header"><span class="m-logo">タスク</span><span></span></header>
        <div class="m-empty is-target">
          <span class="m-empty-icon">${icon("inbox")}</span>
          <div class="m-card-title">まだタスクがありません</div>
          <p class="m-muted">最初のタスクを追加してみましょう。</p>
          <button class="m-btn m-primary m-sm">${icon("plus")} タスクを追加</button>
        </div>
      </div>`
    );
  };

  D.pagination = (stage) => {
    const $ = mount(
      stage,
      `<div class="m-page m-pad">
        <div class="m-muted m-small" data-label>500件中 21〜40件目</div>
        ${lines(3)}
        <nav class="m-pager is-target" aria-label="ページ">
          <button data-p="prev">${icon("left")}</button>
          <button data-p="1">1</button><button data-p="2" aria-current="page">2</button><button data-p="3">3</button>
          <span>…</span><button data-p="25">25</button>
          <button data-p="next">${icon("right")}</button>
        </nav>
      </div>`
    );
    let page = 2;
    const set = (p) => {
      page = Math.min(25, Math.max(1, p));
      stage.querySelectorAll("[data-p]").forEach((b) => {
        if (b.dataset.p === String(page)) b.setAttribute("aria-current", "page");
        else b.removeAttribute("aria-current");
      });
      $("[data-label]").textContent = `500件中 ${(page - 1) * 20 + 1}〜${page * 20}件目`;
    };
    stage.querySelectorAll("[data-p]").forEach((b) =>
      b.addEventListener("click", () => {
        const v = b.dataset.p;
        set(v === "prev" ? page - 1 : v === "next" ? page + 1 : Number(v));
      })
    );
  };

  D["progress-bar"] = (stage) => {
    const $ = mount(
      stage,
      `<div class="m-page m-center">
        <div class="m-panel m-wide">
          <div class="m-row m-between"><span class="m-text">photo.jpg をアップロード中</span><span class="m-muted" data-pct>45%</span></div>
          <div class="m-progress is-target" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="45"><span style="width:45%"></span></div>
        </div>
      </div>`
    );
    let v = 45;
    every(stage, 400, () => {
      v = v >= 100 ? 0 : v + 5;
      $(".m-progress span").style.width = v + "%";
      $(".m-progress").setAttribute("aria-valuenow", v);
      $("[data-pct]").textContent = v + "%";
    });
  };

  D.stepper = (stage) => {
    const steps = ["アカウント", "プロフィール", "完了"];
    mount(
      stage,
      `<div class="m-page m-pad">
        <ol class="m-steps is-target">
          ${steps
            .map(
              (s, i) =>
                `<li class="${i === 0 ? "is-done" : i === 1 ? "is-current" : ""}"><span class="m-step-dot">${i === 0 ? icon("check") : i + 1}</span><span class="m-small">${s}</span></li>`
            )
            .join("")}
        </ol>
        <div class="m-panel"><div class="m-label">ニックネーム<input class="m-input" placeholder="たろう"></div></div>
      </div>`
    );
  };

  D.chip = (stage) => {
    const tags = ["東京", "1万円以下", "駅近"];
    const $ = mount(
      stage,
      `<div class="m-page m-pad">
        <div class="m-search">${icon("search")}<span class="m-muted">ホテルを検索</span></div>
        <div class="m-chips">
          ${tags.map((t, i) => `<span class="m-chip ${i === 0 ? "is-target" : ""}">${t}<button aria-label="${t}を外す">${icon("x")}</button></span>`).join("")}
        </div>
        <button class="m-link m-small" data-reset hidden>条件を元に戻す</button>
        ${lines(2)}
      </div>`
    );
    stage.querySelectorAll(".m-chip button").forEach((b) =>
      b.addEventListener("click", () => {
        b.parentElement.hidden = true;
        $("[data-reset]").hidden = false;
      })
    );
    $("[data-reset]").addEventListener("click", (e) => {
      stage.querySelectorAll(".m-chip").forEach((c) => (c.hidden = false));
      e.target.hidden = true;
    });
  };

  D.banner = (stage) => {
    const $ = mount(
      stage,
      `<div class="m-page">
        <header class="m-header"><span class="m-logo">◆ App</span><span></span></header>
        <div class="m-banner is-target" role="alert">
          ${icon("alert")}<span>メールアドレスが未確認です。</span>
          <button class="m-btn m-sm m-ghost">再送信</button>
          <button class="m-icon-btn m-sm" aria-label="閉じる" data-close>${icon("x")}</button>
        </div>
        <div class="m-body">${lines(3)}<button class="m-link m-small" data-open hidden>お知らせをもう一度表示</button></div>
      </div>`
    );
    $("[data-close]").addEventListener("click", () => {
      $(".m-banner").hidden = true;
      $("[data-open]").hidden = false;
    });
    $("[data-open]").addEventListener("click", (e) => {
      $(".m-banner").hidden = false;
      e.target.hidden = true;
    });
  };

  D.slider = (stage) => {
    const $ = mount(
      stage,
      `<div class="m-page m-center">
        <div class="m-panel m-wide">
          <div class="m-row m-between"><span class="m-text">上限価格</span><strong data-v>¥25,000</strong></div>
          <input class="m-range is-target" type="range" min="0" max="50000" step="1000" value="25000" aria-label="上限価格">
          <div class="m-row m-between m-muted m-small"><span>¥0</span><span>¥50,000</span></div>
        </div>
      </div>`
    );
    $(".m-range").addEventListener("input", (e) => ($("[data-v]").textContent = "¥" + Number(e.target.value).toLocaleString()));
  };

  D.sidebar = (stage) => {
    mount(
      stage,
      `<div class="m-page m-split">
        <aside class="m-side is-target">
          <div class="m-logo">◆ Admin</div>
          <a class="m-menu-item is-selected">ダッシュボード</a><a class="m-menu-item">ユーザー</a><a class="m-menu-item">設定</a>
        </aside>
        <div class="m-body"><div class="m-h">ダッシュボード</div><div class="m-grid3"><div class="m-stat"></div><div class="m-stat"></div><div class="m-stat"></div></div>${lines(2)}</div>
      </div>`
    );
  };

  D.carousel = (stage) => {
    const slides = [
      ["春のセール 最大30%オフ", "g1"],
      ["新商品が入荷しました", "g2"],
      ["送料無料キャンペーン", "g3"],
    ];
    const $ = mount(
      stage,
      `<div class="m-page m-pad">
        <div class="m-carousel is-target">
          <div class="m-track">${slides.map(([t, g]) => `<div class="m-slide ${g}">${t}</div>`).join("")}</div>
          <button class="m-car-btn m-prev" aria-label="前へ">${icon("left")}</button>
          <button class="m-car-btn m-next" aria-label="次へ">${icon("right")}</button>
          <div class="m-dots">${slides.map((_, i) => `<span data-i="${i}"></span>`).join("")}</div>
        </div>
      </div>`
    );
    let i = 0;
    const go = (n) => {
      i = (n + slides.length) % slides.length;
      $(".m-track").style.transform = `translateX(-${i * 100}%)`;
      stage.querySelectorAll(".m-dots span").forEach((d, k) => d.classList.toggle("is-on", k === i));
    };
    $(".m-prev").addEventListener("click", () => go(i - 1));
    $(".m-next").addEventListener("click", () => go(i + 1));
    stage.querySelectorAll(".m-dots span").forEach((d) => d.addEventListener("click", () => go(Number(d.dataset.i))));
    go(0);
  };

  D.fab = (stage) => {
    const memos = ["買い物リスト", "会議のメモ", "読みたい本", "旅行の計画", "アイデア", "週末の予定", "レシピ"];
    mount(
      stage,
      `<div class="m-phone">
        <header class="m-header"><span class="m-logo">メモ</span><span></span></header>
        <div class="m-scroll">${memos.map((m) => `<div class="m-list-row"><span>${m}</span><span class="m-muted m-small">10/18</span></div>`).join("")}</div>
        <button class="m-fab is-target" aria-label="新しいメモ">${icon("plus")}</button>
      </div>`
    );
  };

  // ───────── 上級 ─────────

  D.combobox = (stage) => {
    const cities = ["横浜市", "横須賀市", "横手市", "横芝光町", "川崎市", "相模原市", "鎌倉市", "藤沢市"];
    const $ = mount(
      stage,
      `<div class="m-page m-top">
        <div class="m-panel m-narrow is-target">
          <label class="m-label">市区町村
            <input class="m-input" role="combobox" aria-expanded="true" value="横" autocomplete="off">
          </label>
          <ul class="m-menu m-select-list" role="listbox"></ul>
        </div>
      </div>`
    );
    const input = $("input");
    const list = $("ul");
    const render = () => {
      const q = input.value.trim();
      const hits = cities.filter((c) => c.includes(q)).slice(0, 4);
      list.hidden = !q || hits.length === 0;
      list.innerHTML = hits
        .map((c, i) => `<li class="m-menu-item ${i === 0 ? "is-active" : ""}" role="option"><span>${c.replace(q, `<mark>${q}</mark>`)}</span></li>`)
        .join("");
    };
    input.addEventListener("input", render);
    list.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;
      input.value = li.textContent;
      list.hidden = true;
    });
    render();
  };

  D.segmented = (stage) => {
    const data = {
      日: [3, 5, 2, 6, 4, 7, 5],
      週: [12, 18, 15, 22, 19, 25, 21],
      月: [60, 72, 55, 80, 90, 85, 95],
    };
    const $ = mount(
      stage,
      `<div class="m-page m-pad">
        <div class="m-row m-between">
          <span class="m-card-title">売上</span>
          <div class="m-seg is-target" role="radiogroup" aria-label="期間">
            ${Object.keys(data).map((k, i) => `<button role="radio" aria-checked="${i === 1}">${k}</button>`).join("")}
          </div>
        </div>
        <div class="m-bars"></div>
      </div>`
    );
    const show = (k) => {
      stage.querySelectorAll(".m-seg button").forEach((b) => b.setAttribute("aria-checked", b.textContent === k));
      const max = Math.max(...data[k]);
      $(".m-bars").innerHTML = data[k].map((v) => `<span style="height:${(v / max) * 100}%"></span>`).join("");
    };
    stage.querySelectorAll(".m-seg button").forEach((b) => b.addEventListener("click", () => show(b.textContent)));
    show("週");
  };

  D["command-palette"] = (stage) => {
    const cmds = [
      ["plus", "新規作成"],
      ["gear", "設定を開く"],
      ["search", "ファイルを検索"],
      ["file", "最近使ったファイル"],
      ["bell", "通知を見る"],
    ];
    const $ = mount(
      stage,
      `<div class="m-page">
        <div class="m-body">${lines(4)}</div>
        <div class="m-overlay m-overlay-top">
          <div class="m-palette is-target">
            <div class="m-palette-input">${icon("search")}<input placeholder="コマンドを入力…" aria-label="コマンド"><kbd>⌘K</kbd></div>
            <ul class="m-palette-list"></ul>
          </div>
        </div>
      </div>`
    );
    const input = $("input");
    const render = () => {
      const q = input.value.trim();
      const hits = cmds.filter(([, t]) => t.includes(q));
      $("ul").innerHTML = hits.length
        ? hits.map(([ic, t], i) => `<li class="m-menu-item ${i === 0 ? "is-active" : ""}">${icon(ic)} ${t}</li>`).join("")
        : `<li class="m-muted m-small m-pad-s">見つかりません</li>`;
    };
    input.addEventListener("input", render);
    render();
  };

  D["infinite-scroll"] = (stage) => {
    let n = 0;
    const post = () => {
      n++;
      return `<div class="m-post"><span class="m-avatar m-avatar-sm g${(n % 3) + 1}"></span><div class="m-grow"><div class="m-small"><b>ユーザー${n}</b></div><div class="m-line"></div><div class="m-line m-w60"></div></div></div>`;
    };
    const $ = mount(
      stage,
      `<div class="m-phone">
        <header class="m-header"><span class="m-logo">ホーム</span><span class="m-muted m-small">下へスクロール ↓</span></header>
        <div class="m-scroll is-target"><div data-feed>${Array.from({ length: 4 }, post).join("")}</div>
          <div class="m-loading" hidden><span class="m-spinner"></span> 読み込み中</div></div>
      </div>`
    );
    const scroller = $(".m-scroll");
    const loading = $(".m-loading");
    let busy = false;
    scroller.addEventListener("scroll", () => {
      if (busy || scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 30) return;
      busy = true;
      loading.hidden = false;
      setTimeout(() => {
        $("[data-feed]").insertAdjacentHTML("beforeend", Array.from({ length: 3 }, post).join(""));
        loading.hidden = true;
        busy = false;
      }, 700);
    });
  };

  D["bottom-sheet"] = (stage) => {
    const $ = mount(
      stage,
      `<div class="m-phone m-map">
        <span class="m-pin" style="left:30%;top:28%">${icon("pin")}</span>
        <span class="m-pin is-picked" style="left:58%;top:38%">${icon("pin")}</span>
        <span class="m-pin" style="left:72%;top:18%">${icon("pin")}</span>
        <div class="m-sheet is-target">
          <button class="m-handle" aria-label="開閉"></button>
          <div class="m-card-title">カフェ・ソレイユ</div>
          <div class="m-muted m-small">★4.5 ・ 徒歩3分 ・ 営業中</div>
          <div class="m-row"><button class="m-btn m-primary m-sm">経路</button><button class="m-btn m-ghost m-sm">保存</button></div>
        </div>
      </div>`
    );
    $(".m-handle").addEventListener("click", () => $(".m-sheet").classList.toggle("is-collapsed"));
    stage.querySelectorAll(".m-pin").forEach((p) =>
      p.addEventListener("click", () => {
        stage.querySelectorAll(".m-pin").forEach((x) => x.classList.toggle("is-picked", x === p));
        $(".m-sheet").classList.remove("is-collapsed");
      })
    );
  };

  D["context-menu"] = (stage) => {
    const files = ["企画書.pdf", "見積もり.xlsx", "写真.jpg", "議事録.docx"];
    const $ = mount(
      stage,
      `<div class="m-page m-pad m-rel">
        <div class="m-muted m-small">ファイルを右クリック（長押し）してみてください</div>
        <div class="m-files">${files.map((f, i) => `<div class="m-file ${i === 1 ? "is-selected" : ""}">${icon("file")} ${f}</div>`).join("")}</div>
        <ul class="m-menu m-ctx is-target" style="left:42%;top:96px">
          <li class="m-menu-item">名前を変更</li><li class="m-menu-item">複製</li><li class="m-sep"></li><li class="m-menu-item m-danger-text">削除</li>
        </ul>
      </div>`
    );
    const menu = $(".m-ctx");
    stage.querySelectorAll(".m-file").forEach((f) =>
      f.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const box = stage.querySelector(".m-rel").getBoundingClientRect();
        stage.querySelectorAll(".m-file").forEach((x) => x.classList.toggle("is-selected", x === f));
        menu.style.left = Math.min(e.clientX - box.left, box.width - 150) + "px";
        menu.style.top = Math.min(e.clientY - box.top, box.height - 130) + "px";
        menu.hidden = false;
      })
    );
    stage.addEventListener("click", () => (menu.hidden = true));
  };

  D["data-table"] = (stage) => {
    const rows = [
      ["佐藤 花子", "2026/04/12", "プロ"],
      ["鈴木 一郎", "2025/11/03", "無料"],
      ["高橋 美咲", "2026/08/27", "チーム"],
      ["田中 健", "2026/01/19", "プロ"],
    ];
    const cols = ["名前", "登録日", "プラン"];
    const $ = mount(
      stage,
      `<div class="m-page m-pad">
        <div class="m-table-wrap is-target">
          <table class="m-table">
            <thead><tr><th><input type="checkbox" aria-label="すべて選択"></th>${cols
              .map((c, i) => `<th><button data-col="${i}">${c}<span class="m-sort"></span></button></th>`)
              .join("")}</tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>`
    );
    let sort = { col: 1, dir: -1 };
    const render = () => {
      const sorted = rows.slice().sort((a, b) => a[sort.col].localeCompare(b[sort.col], "ja") * sort.dir);
      $("tbody").innerHTML = sorted
        .map((r, i) => `<tr><td><input type="checkbox" ${i === 0 ? "checked" : ""} aria-label="選択"></td>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
        .join("");
      stage.querySelectorAll("[data-col]").forEach((b) => {
        b.querySelector(".m-sort").textContent = Number(b.dataset.col) === sort.col ? (sort.dir > 0 ? "▲" : "▼") : "";
      });
    };
    stage.querySelectorAll("[data-col]").forEach((b) =>
      b.addEventListener("click", () => {
        const col = Number(b.dataset.col);
        sort = { col, dir: sort.col === col ? -sort.dir : 1 };
        render();
      })
    );
    render();
  };

  D["split-button"] = (stage) => {
    const $ = mount(
      stage,
      `<div class="m-page m-top">
        <div class="m-split-wrap">
          <div class="m-splitbtn is-target">
            <button class="m-btn m-primary" data-main>保存</button>
            <button class="m-btn m-primary" aria-label="その他の保存方法" aria-expanded="true" data-more>${icon("down")}</button>
          </div>
          <ul class="m-menu m-split-menu"><li class="m-menu-item">別名で保存</li><li class="m-menu-item">下書きとして保存</li></ul>
        </div>
      </div>`
    );
    const menu = $(".m-split-menu");
    $("[data-more]").addEventListener("click", (e) => {
      menu.hidden = !menu.hidden;
      e.currentTarget.setAttribute("aria-expanded", !menu.hidden);
    });
    $("[data-main]").addEventListener("click", (e) => {
      e.target.textContent = "保存しました";
      setTimeout(() => (e.target.textContent = "保存"), 1200);
    });
  };

  D["tree-view"] = (stage) => {
    const node = (label, children, open) =>
      children
        ? `<li role="treeitem" aria-expanded="${open}"><button class="m-tree-row">${icon("right")}${icon("folder")} ${label}</button><ul role="group">${children.join("")}</ul></li>`
        : `<li role="treeitem"><button class="m-tree-row m-leaf ${label === "app.js" ? "is-selected" : ""}">${icon("file")} ${label}</button></li>`;
    mount(
      stage,
      `<div class="m-page m-pad">
        <ul class="m-tree is-target" role="tree">
          ${node("プロジェクト", [node("src", [node("app.js"), node("style.css")], true), node("docs", [node("使い方.md")], false), node("README.md")], true)}
        </ul>
      </div>`
    );
    stage.querySelectorAll(".m-tree-row").forEach((b) =>
      b.addEventListener("click", () => {
        const li = b.parentElement;
        if (li.hasAttribute("aria-expanded")) li.setAttribute("aria-expanded", li.getAttribute("aria-expanded") !== "true");
        else stage.querySelectorAll(".m-leaf").forEach((x) => x.classList.toggle("is-selected", x === b));
      })
    );
  };

  D["sticky-header"] = (stage) => {
    const $ = mount(
      stage,
      `<div class="m-page m-scroll m-sticky-demo">
        <header class="m-header m-sticky is-target"><span class="m-logo">◆ Blog</span><nav class="m-nav"><a>記事</a><a>About</a></nav></header>
        <div class="m-body">
          <div class="m-muted m-small">↓ この中をスクロールしてみてください</div>
          <div class="m-hero"></div>${lines(14)}
        </div>
      </div>`
    );
    const box = $(".m-sticky-demo");
    box.addEventListener("scroll", () => $(".m-sticky").classList.toggle("is-stuck", box.scrollTop > 4));
  };

  D["inline-validation"] = (stage) => {
    const $ = mount(
      stage,
      `<div class="m-page m-center">
        <div class="m-panel m-wide is-target">
          <label class="m-label">メールアドレス<input class="m-input" data-email value="taro@example.com"></label>
          <div class="m-hint" data-email-hint></div>
          <label class="m-label">パスワード<input class="m-input" data-pass type="text" value="abc12"></label>
          <div class="m-hint" data-pass-hint></div>
        </div>
      </div>`
    );
    const check = () => {
      const email = $("[data-email]");
      const okEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value);
      email.classList.toggle("is-error", !okEmail);
      email.classList.toggle("is-ok", okEmail);
      $("[data-email-hint]").className = "m-hint " + (okEmail ? "is-ok" : "is-error");
      $("[data-email-hint]").textContent = okEmail ? "✓ 使用できます" : "「@」を含むメールアドレスを入力してください";

      const pass = $("[data-pass]");
      const left = 8 - pass.value.length;
      pass.classList.toggle("is-error", left > 0);
      pass.classList.toggle("is-ok", left <= 0);
      $("[data-pass-hint]").className = "m-hint " + (left > 0 ? "is-error" : "is-ok");
      $("[data-pass-hint]").textContent = left > 0 ? `8文字以上で入力してください（あと${left}文字）` : "✓ OK";
    };
    stage.querySelectorAll("input").forEach((i) => i.addEventListener("input", check));
    check();
  };

  D["mega-menu"] = (stage) => {
    const cols = {
      家電: ["テレビ", "イヤホン", "カメラ", "冷蔵庫"],
      本: ["小説", "ビジネス", "マンガ", "雑誌"],
      ファッション: ["メンズ", "レディース", "靴", "バッグ"],
    };
    const $ = mount(
      stage,
      `<div class="m-page m-rel">
        <header class="m-header">
          <span class="m-logo">◆ Mall</span>
          <nav class="m-nav"><a class="is-active" data-toggle>カテゴリ ▾</a><a>セール</a><a>ヘルプ</a></nav>
        </header>
        <div class="m-mega is-target">
          ${Object.entries(cols)
            .map(([h, items]) => `<div><div class="m-card-title">${h}</div>${items.map((x) => `<a>${x}</a>`).join("")}</div>`)
            .join("")}
        </div>
        <div class="m-body">${lines(3)}</div>
      </div>`
    );
    $("[data-toggle]").addEventListener("click", (e) => {
      $(".m-mega").hidden = !$(".m-mega").hidden;
      e.target.classList.toggle("is-active", !$(".m-mega").hidden);
    });
  };

  return {
    has: (id) => typeof D[id] === "function",
    render(id, stage) {
      stage.classList.add("stage");
      D[id](stage);
    },
    ids: () => Object.keys(D),
  };
})();
