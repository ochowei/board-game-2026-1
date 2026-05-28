#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const START_MONEY = 10000;
const PASS_START_BONUS = 2000;
const TAX_AMOUNT = 500;

const randomEvents = [
  { msg: "在夜市撿到錢包", val: 300 },
  { msg: "發票中大獎", val: 1000 },
  { msg: "機車違停被拖吊", val: -200 },
  { msg: "被測速照相拍到", val: -500 }
];

function parseArgs(argv) {
  const options = {
    turns: 40,
    seed: Date.now(),
    verbose: true
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--turns") {
      options.turns = Number(argv[i + 1]);
      i += 1;
    } else if (arg === "--seed") {
      options.seed = Number(argv[i + 1]);
      i += 1;
    } else if (arg === "--quiet") {
      options.verbose = false;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  if (!Number.isInteger(options.turns) || options.turns <= 0) {
    throw new Error("--turns 需要是正整數");
  }

  if (!Number.isFinite(options.seed)) {
    throw new Error("--seed 需要是數字");
  }

  return options;
}

function printHelp() {
  console.log(`台灣環島大富翁 CLI 模擬器\n\n用法:\n  node scripts/simulate-game.js [--turns 40] [--seed 123] [--quiet]\n\n選項:\n  --turns <n>   模擬回合數（每位玩家輪流，預設 40）\n  --seed <n>    指定亂數種子，確保結果可重現\n  --quiet       只輸出最終摘要，不輸出逐回合事件`);
}

function createRng(seed) {
  let state = (Math.trunc(seed) >>> 0) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function randomInt(min, max, rnd) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

function loadTiles() {
  const mapPath = path.resolve("src/maps/taiwan-loop.tmj");
  const mapJson = JSON.parse(fs.readFileSync(mapPath, "utf8"));
  const layer = mapJson.layers.find((item) => item.name === "Path");

  if (!layer?.objects?.length) {
    throw new Error("地圖內找不到 Path 物件層");
  }

  const getProp = (obj, key, fallback = 0) => {
    const prop = obj.properties?.find((item) => item.name === key);
    return prop ? prop.value : fallback;
  };

  return [...layer.objects]
    .sort((a, b) => a.id - b.id)
    .map((obj) => ({
      id: obj.id,
      name: obj.name,
      type: obj.type,
      price: Number(getProp(obj, "price", 0)),
      rent: Number(getProp(obj, "rent", 0)),
      owner: null
    }));
}

function simulateGame({ turns, seed, verbose }) {
  const rnd = createRng(seed);
  const tiles = loadTiles();
  const players = [
    { id: "human", name: "玩家", money: START_MONEY, pos: 0, properties: [] },
    { id: "ai", name: "電腦", money: START_MONEY, pos: 0, properties: [] }
  ];

  const logs = [];
  let winner = null;
  let actualTurns = 0;

  const addLog = (msg) => {
    logs.push(msg);
    if (verbose) console.log(msg);
  };

  for (let round = 1; round <= turns && !winner; round += 1) {
    actualTurns = round;
    for (const player of players) {
      const opponent = players.find((p) => p.id !== player.id);
      const steps = randomInt(1, 6, rnd);
      const targetPos = player.pos + steps;

      addLog(`\n[第 ${round} 回合] ${player.name} 擲出 ${steps} 點`);

      if (targetPos >= tiles.length) {
        player.money += PASS_START_BONUS;
        addLog(`${player.name} 經過起點，獲得 $${PASS_START_BONUS}`);
      }

      player.pos = targetPos % tiles.length;
      const tile = tiles[player.pos];
      addLog(`${player.name} 抵達 ${tile.name}（${tile.type}）`);

      if (tile.type === "TAX") {
        player.money -= TAX_AMOUNT;
        addLog(`${player.name} 繳稅 $${TAX_AMOUNT}`);
      } else if (tile.type === "CHANCE" || tile.type === "FATE") {
        const ev = randomEvents[randomInt(0, randomEvents.length - 1, rnd)];
        player.money += ev.val;
        const moneyText = ev.val >= 0 ? `+$${ev.val}` : `-$${Math.abs(ev.val)}`;
        addLog(`${player.name} 遇到事件：${ev.msg}（${moneyText}）`);
      } else if (tile.type === "PROP") {
        if (tile.owner === null && player.money >= tile.price) {
          player.money -= tile.price;
          tile.owner = player.id;
          player.properties.push(tile.id);
          addLog(`${player.name} 買下 ${tile.name}，花費 $${tile.price}`);
        } else if (tile.owner && tile.owner !== player.id) {
          player.money -= tile.rent;
          opponent.money += tile.rent;
          addLog(`${player.name} 支付租金 $${tile.rent} 給 ${opponent.name}`);
        }
      }

      addLog(`資產狀態：玩家 $${players[0].money} / 電腦 $${players[1].money}`);

      if (player.money < 0 || opponent.money < 0) {
        winner = player.money > opponent.money ? player.id : opponent.id;
        break;
      }
    }
  }

  const [human, ai] = players;
  if (!winner) {
    winner = human.money === ai.money ? "draw" : human.money > ai.money ? "human" : "ai";
  }

  return {
    turns: actualTurns,
    seed,
    winner,
    players,
    propertyStatus: tiles.filter((tile) => tile.type === "PROP").map((tile) => ({
      name: tile.name,
      owner: tile.owner ?? "無"
    }))
  };
}

function printSummary(result) {
  console.log("\n================ 模擬結果 ================");
  console.log(`Seed: ${result.seed}`);
  console.log(`回合數: ${result.turns}`);

  const winnerName =
    result.winner === "human" ? "玩家" : result.winner === "ai" ? "電腦" : "平手";
  console.log(`勝利者: ${winnerName}`);

  for (const player of result.players) {
    console.log(`- ${player.name}: 金額 $${player.money}, 地產數 ${player.properties.length}`);
  }

  console.log("\n地產所有權：");
  for (const tile of result.propertyStatus) {
    const ownerName = tile.owner === "human" ? "玩家" : tile.owner === "ai" ? "電腦" : "無";
    console.log(`- ${tile.name}: ${ownerName}`);
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = simulateGame(options);
  printSummary(result);
}

main();
