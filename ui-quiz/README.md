# UIの名前クイズ

AIでアプリやWebサイトを作る人のための、UI部品の名前を覚えるクイズです。
「画面の端からにゅっと出るやつ」を「Drawer」と言えるようになると、AIへの指示が正確になります。

- **43語**を初級（16語）・中級（15語）・上級（12語）に分けて出題
- 問題の図はスクリーンショットではなく、**実際に動くHTML/CSSのUI**
- 出題形式は4種類：見た目から／説明から／場面から／どっち？（間違えやすい2つの比較）
- 正解後に「AIへの指示の例」を表示（コピーしてそのまま使える）
- 回答後と用語一覧に「名前の由来」を表示（Toast はなぜトーストなのか、など）
- 2回続けて正解すると「覚えた」。間違えた用語は出やすくなり、復習モードでまとめて解き直せる
- 学習記録はブラウザ（localStorage）に保存。ログイン不要
- スマホ対応・ダークモード対応・数字キー（1〜4）で回答可

## 使い方

`index.html` をブラウザで開くだけで動きます（サーバー不要・外部ライブラリなし）。
GitHub Pages などの静的ホスティングにそのまま置いて公開できます。

## ファイル構成

```
ui-quiz/
├── index.html
├── css/
│   ├── style.css     アプリ本体の見た目
│   └── demos.css     問題に出すデモUIの見た目
├── js/
│   ├── data.js       用語と比較問題のデータ
│   ├── engine.js     出題ロジック（問題の組み立て・選択肢・学習記録）
│   ├── demos.js      用語ごとの動くデモ
│   └── app.js        画面（ホーム・クイズ・結果・用語一覧）
└── tests/
    └── engine.test.js
```

## 用語を追加するには

1. `js/data.js` の `TERMS` に1件追加する（`id`・`name`・`kana`・`origin`・`level`・`desc`・`scenario`・`prompt`・`confusers`）
2. `js/demos.js` に同じ `id` のデモを追加する。注目してほしい部分には `class="is-target"` を付け、デモの中には答えの名前を書かない
3. 必要なら `PAIRS` に間違えやすい2つの比較問題を足す
4. `node ui-quiz/tools/build-dictionary.js` を実行して、`index.html` の「UI用語集」を作り直す
5. テストを実行する

```
node --test ui-quiz/tests/*.test.js
```

テストでは、id の重複、存在しない用語の参照、デモの抜け、説明文に答えが書かれていないか、選択肢の組み立てなどを確認しています。

## 検索エンジン・SNS向けの設定

- `index.html` には、検索結果に出るタイトルと説明文、SNSで共有したときのカード表示（OGP）、構造化データを書いている
- クイズの画面は JavaScript で組み立てるため、用語の名前・説明・由来は「UI用語集」として最初から HTML にも書いている（`tools/build-dictionary.js` で `js/data.js` から生成）
- 共有用の画像 `og-image.png` の元は `tools/og-image.html`（1200×630 で撮影）
- リポジトリのトップに、Google Search Console に送るための `sitemap.xml` がある
- URL（`https://getittraversable.github.io/desktop-tutorial/ui-quiz/`）は `index.html` と `sitemap.xml` に直接書いているので、公開先が変わったら両方を直す

## 説明文について

説明文はすべてこのプロジェクト用に書き下ろしたものです。内容の確認には MDN、WAI-ARIA Authoring Practices、Apple Human Interface Guidelines、Material Design などの公開資料を参照しています。
用語を調べるときは [Name That UI](https://namethatui.com/) も便利です。
