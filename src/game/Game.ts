import { Player } from './Player';
import { NPC } from './NPC';
import { DialogueSystem } from './DialogueSystem';
import { QuestSystem } from './QuestSystem';
import { Inventory } from './Inventory';
import { TradeSystem } from './TradeSystem';
import { CombatSystem } from './CombatSystem';
import { Monster } from './Monster';
import { SceneManager } from './SceneManager';
import { Pet } from './Pet';
import { Building } from './Building';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private pet: Pet;
  private npcs: NPC[];
  private keys: { [key: string]: boolean };
  private lastTime: number;
  private dialogueSystem: DialogueSystem;
  private questSystem: QuestSystem;
  private inventory: Inventory;
  private tradeSystem: TradeSystem;
  private combatSystem: CombatSystem;
  private sceneManager: SceneManager;
  private monsterSpawnTimer: number = 0;
  private monsterSpawnInterval: number = 3000;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    this.canvas.width = 800;
    this.canvas.height = 600;

    this.sceneManager = new SceneManager(this.ctx);
    this.inventory = new Inventory();
    this.tradeSystem = new TradeSystem(this.inventory);
    this.player = new Player(this.canvas.width / 2 - 16, this.canvas.height / 2 - 16);
    this.pet = new Pet('小狗', 'dog');
    this.combatSystem = new CombatSystem(this.player);
    this.dialogueSystem = new DialogueSystem();
    this.questSystem = new QuestSystem();

    this.npcs = this.sceneManager.getCurrentScene().getId() === 'village' ? [
      new NPC(100, 100, '商人', '#4CAF50', [
        '欢迎光临我的商店！',
        '我这里有很多好东西。',
        '要看看我的商品吗？'
      ]),
      new NPC(300, 200, '村民', '#2196F3', [
        '这里的生活很平静。',
        '你是新来的冒险者吗？',
        '我这里有个简单的任务。'
      ]),
      new NPC(500, 400, '守卫', '#FFC107', [
        '站住！',
        '我在这里守卫已经很多年了。',
        '需要帮忙巡逻吗？'
      ])
    ] : [];

    this.keys = {};
    this.lastTime = performance.now();

    // 设置全局游戏方法
    (window as any).game = {
      buyItem: (itemId: string) => this.tradeSystem.buyItem(itemId),
      sellItem: (itemId: string) => this.tradeSystem.sellItem(itemId),
      closeTrade: () => this.tradeSystem.hideTradeWindow(),
      attack: () => this.combatSystem.attack(),
      usePotion: () => this.combatSystem.usePotion(),
      flee: () => this.combatSystem.flee(),
      switchScene: (sceneId: string) => this.sceneManager.switchScene(sceneId),
      useSkill: (skillId: string) => this.player.useSkill(skillId)
    };

    this.setupInputs();
  }

  private checkCollision(x: number, y: number, width: number, height: number): boolean {
    // 检查边界碰撞
    if (x < 0 || x + width > this.canvas.width || y < 0 || y + height > this.canvas.height) {
      return true;
    }

    // 检查与NPC的碰撞
    for (const npc of this.npcs) {
      const npcPos = npc.getPosition();
      if (this.rectIntersect(
        x, y, width, height,
        npcPos.x, npcPos.y, npcPos.size, npcPos.size
      )) {
        return true;
      }
    }

    // 检查与建筑物的碰撞
    const buildings = this.sceneManager.getCurrentScene().getBuildings();
    for (const building of buildings) {
      if (this.rectIntersect(
        x, y, width, height,
        building.x, building.y, building.width, building.height
      )) {
        return true;
      }
    }

    return false;
  }

  private rectIntersect(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ): boolean {
    return x1 < x2 + w2 &&
           x1 + w1 > x2 &&
           y1 < y2 + h2 &&
           y1 + h1 > y2;
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      
      if (e.key === ' ') {
        if (this.dialogueSystem.isDialogueActive()) {
          this.dialogueSystem.nextMessage();
        } else if (this.tradeSystem.isTradeWindowVisible()) {
          this.tradeSystem.hideTradeWindow();
        } else {
          this.checkInteraction();
        }
      }

      if (e.key === 'Escape') {
        if (this.tradeSystem.isTradeWindowVisible()) {
          this.tradeSystem.hideTradeWindow();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  private update() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    if (!this.combatSystem.isInCombatState()) {
      this.monsterSpawnTimer += deltaTime;
      if (this.monsterSpawnTimer >= this.monsterSpawnInterval) {
        this.monsterSpawnTimer = 0;
        if (Math.random() < 0.3) {
          this.spawnMonster();
        }
      }
    }

    if (!this.dialogueSystem.isDialogueActive() && 
        !this.tradeSystem.isTradeWindowVisible() && 
        !this.combatSystem.isInCombatState()) {
      let dx = 0;
      let dy = 0;

      if (this.keys['ArrowUp']) dy = -1;
      if (this.keys['ArrowDown']) dy = 1;
      if (this.keys['ArrowLeft']) dx = -1;
      if (this.keys['ArrowRight']) dx = 1;

      if (dx !== 0 || dy !== 0) {
        const playerPos = this.player.getPosition();
        const moveSpeed = 5;
        const newX = playerPos.x + dx * moveSpeed;
        const newY = playerPos.y + dy * moveSpeed;

        // 分别检查X和Y方向的移动，实现滑动效果
        if (!this.checkCollision(newX, playerPos.y, playerPos.size, playerPos.size)) {
          this.player.move(dx, 0);
        }
        if (!this.checkCollision(playerPos.x, newY, playerPos.size, playerPos.size)) {
          this.player.move(0, dy);
        }

        const updatedPos = this.player.getPosition();
        this.pet.followPlayer(updatedPos.x + updatedPos.size / 2, updatedPos.y + updatedPos.size / 2);
      }
    }

    // Update game entities
    this.pet.update(deltaTime);
    if (this.sceneManager.getCurrentScene().getId() === 'village') {
      this.npcs.forEach(npc => npc.update(deltaTime, this.npcs));
    }
    
    this.lastTime = currentTime;
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw scene and entities
    this.sceneManager.draw();
    if (this.sceneManager.getCurrentScene().getId() === 'village') {
      this.npcs.forEach(npc => npc.draw(this.ctx));
    }
    this.player.draw(this.ctx);
    this.pet.draw(this.ctx);
  }

  private checkInteraction() {
    const playerPos = this.player.getPosition();
    
    for (const npc of this.npcs) {
      const npcPos = npc.getPosition();
      
      const dx = Math.abs(playerPos.x - npcPos.x);
      const dy = Math.abs(playerPos.y - npcPos.y);
      
      if (dx < 50 && dy < 50) {
        if (npc.getName() === '商人') {
          this.tradeSystem.showTradeWindow(npc.getName());
        } else {
          this.dialogueSystem.startDialogue(npc.getDialogue());
        }
        this.questSystem.updateProgress('talk', npc.getName());
        break;
      }
    }
  }

  private spawnMonster() {
    if (this.combatSystem.isInCombatState()) return;
    if (!this.sceneManager.getCurrentScene().canSpawnMonsters()) return;

    const monsterTypes = [
      { name: '史莱姆', weight: 40 },
      { name: '哥布林', weight: 30 },
      { name: '骷髅', weight: 20 },
      { name: '蝙蝠', weight: 10 }
    ];

    const playerStats = this.player.getStats();
    const totalWeight = monsterTypes.reduce((sum, type) => sum + type.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedMonster = monsterTypes[0].name;
    for (const type of monsterTypes) {
      if (random <= type.weight) {
        selectedMonster = type.name;
        break;
      }
      random -= type.weight;
    }

    const rng = Math.random();
    const type = rng < 0.01 ? 'boss' : rng < 0.1 ? 'elite' : 'normal';
    
    const monster = new Monster(selectedMonster, playerStats.level, type);
    this.combatSystem.startCombat(monster);
  }

  public gameLoop = () => {
    this.update();
    this.render();
    requestAnimationFrame(this.gameLoop);
  }

  public start() {
    this.gameLoop();
  }
}