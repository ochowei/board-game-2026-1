import Phaser from "phaser";
import { COLORS } from "./gameData";

const MAP_URL = new URL("./maps/taiwan-loop.tmj", import.meta.url).toString();

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
    this.initializeState();
  }

  initializeState() {
    this.boardUI = [];
    this.logMessages = [];
    this.pathPoints = [];
    this.tileData = [];
    this.boardProjection = {
      skewX: 0.35,
      scaleY: 0.75,
      offsetX: 40,
      offsetY: 30
    };

    this.players = {
      human: { id: "human", name: "玩家", money: 10000, pos: 0, color: COLORS.player },
      ai: { id: "ai", name: "電腦", money: 10000, pos: 0, color: COLORS.ai }
    };
    this.currentTurn = "human";
    this.gameState = "WAITING_ROLL";
  }

  preload() {
    this.load.tilemapTiledJSON("taiwan-map", MAP_URL);
  }

  create() {
    this.initializeState();
    this.loadMapData();
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.drawTaiwanBackground();
    this.drawBoard();
    this.createTokens();
    this.createSidebar();

    this.addLog("遊戲開始！這次我們來環島！");
    this.addLog("玩家回合，請擲骰子。");
    this.updateStats();
  }

  loadMapData() {
    const map = this.make.tilemap({ key: "taiwan-map" });
    const layer = map.getObjectLayer("Path");

    if (!layer || !layer.objects || layer.objects.length === 0) {
      throw new Error("找不到 Tiled 物件層 Path，請確認地圖格式。");
    }

    const getProp = (obj, key, fallback = null) => {
      const prop = obj.properties?.find((item) => item.name === key);
      return prop ? prop.value : fallback;
    };

    const ordered = [...layer.objects].sort((a, b) => a.id - b.id);
    this.pathPoints = ordered.map((obj) => ({ x: obj.x, y: obj.y }));
    this.tileData = ordered.map((obj) => ({
      name: obj.name,
      type: obj.type,
      desc: getProp(obj, "desc", ""),
      price: Number(getProp(obj, "price", 0)),
      rent: Number(getProp(obj, "rent", 0)),
      owner: null
    }));
  }

  get boardSize() {
    return this.tileData.length;
  }

  drawTaiwanBackground() {
    const projectedPath = this.pathPoints.map((point) => this.projectPoint(point));
    const polygon = this.add.polygon(0, 0, projectedPath, 0xbdc3c7, 0.3).setOrigin(0);
    polygon.setStrokeStyle(4, 0x95a5a6, 0.5);
  }

  projectPoint(point) {
    return {
      x: point.x + point.y * this.boardProjection.skewX + this.boardProjection.offsetX,
      y: point.y * this.boardProjection.scaleY + this.boardProjection.offsetY
    };
  }

  getTilePos(index) {
    return this.projectPoint(this.pathPoints[index]);
  }

  drawBoard() {
    for (let i = 0; i < this.boardSize; i += 1) {
      const pos = this.getTilePos(i);
      const data = this.tileData[i];

      const rect = this.add.rectangle(pos.x, pos.y, 50, 50, COLORS.board).setStrokeStyle(2, 0x7f8c8d);

      const nameText = this.add
        .text(pos.x, pos.y - 8, data.name, {
          fontSize: "13px",
          color: COLORS.text,
          fontStyle: "bold"
        })
        .setOrigin(0.5);

      let infoStr = "";
      if (data.type === "PROP") infoStr = `$${data.price}`;
      else if (data.desc) infoStr = data.desc;

      const infoText = this.add
        .text(pos.x, pos.y + 12, infoStr, {
          fontSize: "10px",
          color: COLORS.text
        })
        .setOrigin(0.5);

      const ownerBar = this.add
        .rectangle(pos.x, pos.y - 22, 44, 6, COLORS.neutral)
        .setOrigin(0.5, 0)
        .setVisible(false);

      this.boardUI[i] = { rect, nameText, infoText, ownerBar };
    }
  }

  createTokens() {
    const startPos = this.getTilePos(0);
    this.humanToken = this.add.circle(startPos.x - 10, startPos.y, 8, COLORS.player).setStrokeStyle(2, 0xffffff);
    this.aiToken = this.add.circle(startPos.x + 10, startPos.y, 8, COLORS.ai).setStrokeStyle(2, 0xffffff);
  }

  createSidebar() {
    const startX = 600;
    this.add.rectangle(startX, 0, 400, 600, COLORS.logBg).setOrigin(0);
    this.add
      .text(startX + 200, 30, "環島大富翁", { fontSize: "28px", color: "#fff", fontStyle: "bold" })
      .setOrigin(0.5);

    this.humanStatText = this.add.text(startX + 30, 80, "", { fontSize: "20px", color: "#3498db", fontStyle: "bold" });
    this.aiStatText = this.add.text(startX + 220, 80, "", { fontSize: "20px", color: "#e74c3c", fontStyle: "bold" });

    this.add.rectangle(startX + 20, 130, 360, 250, 0x2c3e50).setOrigin(0);
    this.logTextDisplay = this.add.text(startX + 30, 140, "", {
      fontSize: "16px",
      color: COLORS.logText,
      wordWrap: { width: 340 },
      lineSpacing: 5
    });

    this.diceDisplay = this.add.text(startX + 200, 420, "🎲", { fontSize: "48px" }).setOrigin(0.5);

    this.btnRoll = this.createButton(startX + 200, 490, "擲骰子", () => this.rollDice());
    this.btnAction1 = this.createButton(startX + 100, 550, "購買", () => this.buyProperty()).setVisible(false);
    this.btnAction2 = this.createButton(startX + 300, 550, "不買/結束", () => this.endTurn()).setVisible(false);
  }

  createButton(x, y, text, callback) {
    const btn = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 120, 40, 0xf39c12).setInteractive({ useHandCursor: true });
    const txt = this.add.text(0, 0, text, { fontSize: "18px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5);

    bg.on("pointerover", () => bg.setFillStyle(0xe67e22));
    bg.on("pointerout", () => bg.setFillStyle(0xf39c12));
    bg.on("pointerdown", () => {
      bg.setFillStyle(0xd35400);
      callback();
    });
    bg.on("pointerup", () => bg.setFillStyle(0xe67e22));

    btn.add([bg, txt]);
    return btn;
  }

  updateStats() {
    this.humanStatText.setText(`玩家金錢:\n$${this.players.human.money}`);
    this.aiStatText.setText(`電腦金錢:\n$${this.players.ai.money}`);

    if (this.players.human.money < 0) this.gameOver("ai");
    if (this.players.ai.money < 0) this.gameOver("human");
  }

  addLog(msg) {
    this.logMessages.push(msg);
    if (this.logMessages.length > 10) this.logMessages.shift();
    this.logTextDisplay.setText(this.logMessages.join("\n"));
  }

  rollDice() {
    if (this.gameState !== "WAITING_ROLL" || this.currentTurn !== "human") return;
    this.gameState = "MOVING";
    this.btnRoll.setVisible(false);

    const steps = Phaser.Math.Between(1, 6);
    this.diceDisplay.setText(`🎲 ${steps}`);
    this.addLog(`玩家擲出了 ${steps} 點`);
    this.movePlayer("human", steps);
  }

  doAiTurn() {
    this.gameState = "MOVING";
    this.btnRoll.setVisible(false);
    this.time.delayedCall(1000, () => {
      const steps = Phaser.Math.Between(1, 6);
      this.diceDisplay.setText(`🎲 ${steps}`);
      this.addLog(`電腦擲出了 ${steps} 點`);
      this.movePlayer("ai", steps);
    });
  }

  movePlayer(playerId, steps) {
    const player = this.players[playerId];
    const token = playerId === "human" ? this.humanToken : this.aiToken;
    const targetPos = player.pos + steps;

    const path = [];
    for (let i = 1; i <= steps; i += 1) {
      const nextIndex = (player.pos + i) % this.boardSize;
      const visualPos = this.getTilePos(nextIndex);
      const offsetX = playerId === "human" ? -10 : 10;
      path.push({ x: visualPos.x + offsetX, y: visualPos.y });
    }

    if (targetPos >= this.boardSize) {
      player.money += 2000;
      this.addLog(`${player.name} 繞台灣一圈！獲得 $2000`);
      this.updateStats();
    }

    player.pos = targetPos % this.boardSize;

    const tweens = path.map((point) => ({
      targets: token,
      x: point.x,
      y: point.y,
      duration: 200,
      ease: "Linear"
    }));

    this.tweens.chain({
      tweens,
      onComplete: () => {
        this.handleTileEvent(playerId);
      }
    });
  }

  handleTileEvent(playerId) {
    const player = this.players[playerId];
    const tile = this.tileData[player.pos];

    this.gameState = "ACTION";
    this.addLog(`${player.name} 停在 【${tile.name}】`);

    if (tile.type === "START" || tile.type === "FREE") {
      this.endTurn();
    } else if (tile.type === "CHANCE" || tile.type === "FATE") {
      this.handleRandomEvent(player);
      this.endTurn();
    } else if (tile.type === "TAX") {
      player.money -= 500;
      this.addLog(`${player.name} 繳交過路稅金 $500`);
      this.updateStats();
      this.endTurn();
    } else if (tile.type === "PROP") {
      if (tile.owner === null) {
        if (playerId === "human") {
          this.btnAction1.setVisible(true);
          this.btnAction2.setVisible(true);
        } else {
          this.time.delayedCall(1000, () => {
            if (player.money >= tile.price) this.buyPropertyLogic("ai", player.pos);
            else this.addLog("電腦資金不足，放棄購買");
            this.endTurn();
          });
        }
      } else if (tile.owner !== playerId) {
        const owner = this.players[tile.owner];
        player.money -= tile.rent;
        owner.money += tile.rent;
        this.addLog(`${player.name} 支付過路費 $${tile.rent} 給 ${owner.name}`);
        this.updateStats();
        this.endTurn();
      } else {
        this.addLog("巡視自己的縣市！");
        this.endTurn();
      }
    }
  }

  handleRandomEvent(player) {
    const events = [
      { msg: "在夜市撿到錢包，獲得 $300", val: 300 },
      { msg: "發票中大獎，獲得 $1000", val: 1000 },
      { msg: "機車違停被拖吊，失去 $200", val: -200 },
      { msg: "被測速照相拍到，失去 $500", val: -500 }
    ];
    const ev = Phaser.Utils.Array.GetRandom(events);
    player.money += ev.val;
    this.addLog(`隨機事件: ${ev.msg}`);
    this.updateStats();
  }

  buyProperty() {
    if (this.currentTurn !== "human") return;
    const pos = this.players.human.pos;
    const tile = this.tileData[pos];

    if (this.players.human.money >= tile.price) {
      this.buyPropertyLogic("human", pos);
      this.btnAction1.setVisible(false);
      this.btnAction2.setVisible(false);
      this.endTurn();
    } else {
      this.addLog("資金不足，無法購買！");
    }
  }

  buyPropertyLogic(playerId, pos) {
    const player = this.players[playerId];
    const tile = this.tileData[pos];

    player.money -= tile.price;
    tile.owner = playerId;

    const ui = this.boardUI[pos];
    ui.ownerBar.setFillStyle(player.color).setVisible(true);
    ui.infoText.setText(`租金 $${tile.rent}`);

    this.addLog(`${player.name} 花費 $${tile.price} 買下了 【${tile.name}】`);
    this.updateStats();
  }

  endTurn() {
    this.btnAction1.setVisible(false);
    this.btnAction2.setVisible(false);

    if (this.gameState === "GAME_OVER") return;

    this.currentTurn = this.currentTurn === "human" ? "ai" : "human";
    this.gameState = "WAITING_ROLL";

    this.time.delayedCall(1000, () => {
      if (this.currentTurn === "human") {
        this.addLog("--- 玩家回合 ---");
        this.btnRoll.setVisible(true);
      } else {
        this.addLog("--- 電腦回合 ---");
        this.doAiTurn();
      }
    });
  }

  gameOver(winnerId) {
    this.gameState = "GAME_OVER";
    this.btnRoll.setVisible(false);
    this.btnAction1.setVisible(false);
    this.btnAction2.setVisible(false);

    const winner = this.players[winnerId];
    this.addLog(`\n🎉 遊戲結束！\n🏆 勝利者是：${winner.name}`);

    this.add.rectangle(0, 0, 1000, 600, 0x000000, 0.8).setOrigin(0);
    this.add
      .text(500, 250, "GAME OVER", { fontSize: "64px", color: "#e74c3c", fontStyle: "bold" })
      .setOrigin(0.5);
    this.add.text(500, 330, `${winner.name} 獲勝！`, { fontSize: "32px", color: "#fff" }).setOrigin(0.5);

    const restartBtn = this.add.rectangle(500, 420, 200, 50, 0x3498db).setInteractive({ useHandCursor: true });
    this.add.text(500, 420, "重新開始", { fontSize: "24px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5);

    restartBtn.on("pointerdown", () => {
      this.tileData.forEach((tile) => {
        tile.owner = null;
      });
      this.scene.restart();
    });
  }
}
