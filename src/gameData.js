export const BOARD_SIZE = 24;

export const TILE_DATA = [
  { name: "起點", type: "START", desc: "經過+2000" },
  { name: "基隆", type: "PROP", price: 800, rent: 80, owner: null },
  { name: "宜蘭", type: "PROP", price: 1000, rent: 100, owner: null },
  { name: "機會", type: "CHANCE", desc: "隨機事件" },
  { name: "花蓮", type: "PROP", price: 1400, rent: 140, owner: null },
  { name: "繳稅", type: "TAX", desc: "支付 500" },
  { name: "台東", type: "PROP", price: 1200, rent: 120, owner: null },
  { name: "命運", type: "FATE", desc: "隨機事件" },
  { name: "屏東", type: "PROP", price: 1500, rent: 150, owner: null },
  { name: "停車場", type: "FREE", desc: "無事發生" },
  { name: "高雄", type: "PROP", price: 2800, rent: 280, owner: null },
  { name: "台南", type: "PROP", price: 2500, rent: 250, owner: null },
  { name: "機會", type: "CHANCE", desc: "隨機事件" },
  { name: "嘉義", type: "PROP", price: 1300, rent: 130, owner: null },
  { name: "雲林", type: "PROP", price: 1100, rent: 110, owner: null },
  { name: "彰化", type: "PROP", price: 1200, rent: 120, owner: null },
  { name: "台中", type: "PROP", price: 2200, rent: 220, owner: null },
  { name: "命運", type: "FATE", desc: "隨機事件" },
  { name: "苗栗", type: "PROP", price: 1000, rent: 100, owner: null },
  { name: "新竹", type: "PROP", price: 1800, rent: 180, owner: null },
  { name: "桃園", type: "PROP", price: 1200, rent: 120, owner: null },
  { name: "繳稅", type: "TAX", desc: "支付 500" },
  { name: "新北", type: "PROP", price: 1500, rent: 150, owner: null },
  { name: "台北", type: "PROP", price: 2000, rent: 200, owner: null }
];

export const TAIWAN_POINTS = [
  { x: 320, y: 55 },
  { x: 355, y: 75 },
  { x: 385, y: 105 },
  { x: 410, y: 140 },
  { x: 430, y: 185 },
  { x: 445, y: 235 },
  { x: 450, y: 290 },
  { x: 440, y: 350 },
  { x: 415, y: 410 },
  { x: 380, y: 460 },
  { x: 340, y: 500 },
  { x: 290, y: 525 },
  { x: 240, y: 510 },
  { x: 200, y: 470 },
  { x: 165, y: 420 },
  { x: 145, y: 365 },
  { x: 135, y: 305 },
  { x: 135, y: 245 },
  { x: 145, y: 185 },
  { x: 165, y: 135 },
  { x: 195, y: 95 },
  { x: 230, y: 65 },
  { x: 265, y: 45 },
  { x: 295, y: 45 }
];

export const COLORS = {
  bg: 0xecf0f1,
  board: 0xbdc3c7,
  text: "#2c3e50",
  player: 0x3498db,
  ai: 0xe74c3c,
  neutral: 0x95a5a6,
  logBg: 0x34495e,
  logText: "#ecf0f1"
};
