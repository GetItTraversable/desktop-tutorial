/*
 * index.html の「UI用語集」を js/data.js から作り直す。
 *
 * クイズの画面は JavaScript で組み立てるので、検索エンジンが内容を読み取りやすいように、
 * 用語の名前・説明・由来を最初から HTML に書いておく。
 * data.js を変えたら実行する: node ui-quiz/tools/build-dictionary.js
 * （テストで、index.html が最新かどうかを確認している）
 */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const INDEX = path.join(root, "index.html");
const START = "<!-- dictionary:start（tools/build-dictionary.js で生成。直接編集しない） -->";
const END = "<!-- dictionary:end -->";

function loadData() {
  const ctx = vm.createContext({});
  ctx.window = ctx;
  vm.runInContext(fs.readFileSync(path.join(root, "js", "data.js"), "utf8"), ctx);
  return ctx.UIQuiz;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

function render({ LEVELS, TERMS }) {
  const indent = "        ";
  const levels = LEVELS.map((l) => {
    const terms = TERMS.filter((t) => t.level === l.id);
    const items = terms
      .map(
        (t) =>
          `${indent}    <div class="dict-item" id="term-${t.id}">\n` +
          `${indent}      <dt><span class="dict-name">${esc(t.name)}</span> <span class="dict-kana">${esc(t.kana)}</span></dt>\n` +
          `${indent}      <dd>${esc(t.desc)}</dd>\n` +
          `${indent}      <dd class="dict-origin"><span>名前の由来</span>${esc(t.origin)}</dd>\n` +
          `${indent}    </div>`
      )
      .join("\n");
    return (
      `${indent}<details class="dict-level level-${l.id}">\n` +
      `${indent}  <summary><h3>${l.label}（${terms.length}語）</h3><span class="muted small">${esc(l.note)}</span></summary>\n` +
      `${indent}  <dl class="dict-list">\n${items}\n${indent}  </dl>\n` +
      `${indent}</details>`
    );
  });
  return `${START}\n${levels.join("\n")}\n${indent}${END}`;
}

function build() {
  const html = fs.readFileSync(INDEX, "utf8");
  const a = html.indexOf(START);
  const b = html.indexOf(END);
  if (a < 0 || b < 0) throw new Error("index.html に dictionary の目印が見つかりません");
  return html.slice(0, a) + render(loadData()) + html.slice(b + END.length);
}

module.exports = { build, INDEX };

if (require.main === module) {
  fs.writeFileSync(INDEX, build());
  console.log("index.html の UI用語集を更新しました");
}
