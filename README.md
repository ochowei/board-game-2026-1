# 台灣環島大富翁（npm 專案版）

此專案已重構為 npm + Vite 架構，使用 Phaser 3。

## 開始使用

```bash
npm install
npm run dev
```

## 打包

```bash
npm run build
npm run preview
```

## 專案結構

- `index.html`：Vite 入口頁
- `src/main.js`：遊戲啟動設定
- `src/MainScene.js`：主要遊戲邏輯
- `src/gameData.js`：棋盤資料與顏色設定
- `src/style.css`：頁面樣式


## 地圖資料

- 地圖節點改為使用 Tiled JSON（`.tmj`）格式，檔案位於 `src/maps/taiwan-loop.tmj`。
- 主要邏輯會在執行時讀取 `Path` 物件層，依照物件 `id` 排序產生棋盤路徑與地格資料。

## CLI 模擬工具

你可以用 CLI 腳本快速模擬一場遊戲，不需開啟瀏覽器：

```bash
npm run simulate
```

可選參數：

```bash
npm run simulate -- --turns 60 --seed 42
```

- `--turns`：模擬回合數（預設 40）
- `--seed`：固定亂數種子，讓結果可重現
- `--quiet`：只輸出最終摘要

此腳本會根據 `src/maps/taiwan-loop.tmj` 的格子資料進行回合模擬，最後輸出勝負、雙方金額與地產持有結果。
