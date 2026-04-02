import Phaser from "phaser";
import MainScene from "./MainScene";
import "./style.css";

const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 600,
  parent: document.body,
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
