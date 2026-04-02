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
