export interface NPCDialogue {
  npcName: string;
  messages: string[];
}

interface NPCQuest {
  id: string;
  title: string;
  description: string;
  reward: {
    gold: number;
    exp: number;
    items?: string[];
  };
}

export class NPC {
  private x: number;
  private y: number;
  private size: number;
  private color: string;
  private name: string;
  private movementTimer: number;
  private movementInterval: number;
  private dialogue: NPCDialogue;
  private quests: NPCQuest[];
  private mood: 'happy' | 'neutral' | 'angry' = 'neutral';
  private sprite: string;
  private interactionRange: number = 50;
  private path: { x: number; y: number }[] = [];
  private currentPathIndex: number = 0;
  private isMovingOnPath: boolean = false;

  constructor(x: number, y: number, name: string, color: string = '#4CAF50', dialogue?: string[]) {
    this.x = x;
    this.y = y;
    this.size = 32;
    this.color = color;
    this.name = name;
    this.movementTimer = 0;
    this.movementInterval = 2000;
    this.dialogue = {
      npcName: name,
      messages: dialogue || [`你好，我是${name}。`]
    };
    this.setupNPCType(name);
  }

  private setupNPCType(name: string) {
    switch (name) {
      case '商人':
        this.sprite = '🧑‍💼';
        this.quests = [{
          id: 'trade_quest',
          title: '收集材料',
          description: '帮我收集5个铁矿石',
          reward: {
            gold: 200,
            exp: 100,
            items: ['health_potion']
          }
        }];
        break;

      case '村民':
        this.sprite = '👨‍🌾';
        this.quests = [{
          id: 'village_quest',
          title: '帮助村民',
          description: '清理村子周围的杂草',
          reward: {
            gold: 100,
            exp: 50
          }
        }];
        break;

      case '守卫':
        this.sprite = '💂‍♂️';
        this.quests = [{
          id: 'guard_quest',
          title: '巡逻任务',
          description: '帮助守卫巡逻村庄',
          reward: {
            gold: 150,
            exp: 80,
            items: ['iron_sword']
          }
        }];
        break;

      default:
        this.sprite = '🧑';
        this.quests = [];
    }

    // 设置NPC巡逻路径
    this.setupPatrolPath();
  }

  private setupPatrolPath() {
    switch (this.name) {
      case '守卫':
        this.path = [
          { x: this.x, y: this.y },
          { x: this.x + 200, y: this.y },
          { x: this.x + 200, y: this.y + 200 },
          { x: this.x, y: this.y + 200 }
        ];
        this.isMovingOnPath = true;
        break;

      case '商人':
        this.path = [
          { x: this.x, y: this.y },
          { x: this.x + 100, y: this.y },
          { x: this.x + 100, y: this.y + 100 },
          { x: this.x, y: this.y + 100 }
        ];
        this.isMovingOnPath = true;
        break;

      default:
        // 其他NPC随机移动
        this.isMovingOnPath = false;
    }
  }

  update(deltaTime: number, npcs: NPC[]) {
    this.movementTimer += deltaTime;
    if (this.movementTimer >= this.movementInterval) {
      if (this.isMovingOnPath) {
        this.moveAlongPath(npcs);
      } else {
        this.randomMove(npcs);
      }
      this.movementTimer = 0;
    }
  }

  private moveAlongPath(npcs: NPC[]) {
    if (this.path.length === 0) return;

    const targetPoint = this.path[this.currentPathIndex];
    const dx = targetPoint.x - this.x;
    const dy = targetPoint.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      // 到达当前路径点，移动到下一个点
      this.currentPathIndex = (this.currentPathIndex + 1) % this.path.length;
    } else {
      // 向目标点移动
      const moveX = (dx / distance) * 32;
      const moveY = (dy / distance) * 32;

      if (!this.checkCollision(this.x + moveX, this.y + moveY, npcs)) {
        this.x += moveX;
        this.y += moveY;
      }
    }
  }

  private checkCollision(newX: number, newY: number, npcs: NPC[]): boolean {
    // 检查与其他NPC的碰撞
    for (const npc of npcs) {
      if (npc === this) continue;

      const dx = Math.abs(newX - npc.x);
      const dy = Math.abs(newY - npc.y);
      
      if (dx < this.size && dy < this.size) {
        return true;
      }
    }

    // 检查边界碰撞
    if (newX < 0 || newX + this.size > 800 ||
        newY < 0 || newY + this.size > 600) {
      return true;
    }

    return false;
  }

  private randomMove(npcs: NPC[]) {
    const directions = [
      { dx: 0, dy: -32 },  // 上
      { dx: 0, dy: 32 },   // 下
      { dx: -32, dy: 0 },  // 左
      { dx: 32, dy: 0 }    // 右
    ];

    // 随机尝试所有方向直到找到可行的移动
    const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
    
    for (const direction of shuffledDirections) {
      const newX = this.x + direction.dx;
      const newY = this.y + direction.dy;
      
      if (!this.checkCollision(newX, newY, npcs)) {
        this.x = newX;
        this.y = newY;
        break;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // 绘制NPC底部阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.size / 2,
      this.y + this.size - 5,
      this.size / 2,
      this.size / 4,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // 绘制NPC主体
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);

    // 绘制NPC表情
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      this.sprite,
      this.x + this.size / 2,
      this.y + this.size / 2
    );

    // 绘制NPC名称
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.x + this.size / 2, this.y - 5);

    // 如果NPC有任务，显示任务标记
    if (this.quests.length > 0) {
      ctx.font = '16px Arial';
      ctx.fillText('❗', this.x + this.size / 2, this.y - 20);
    }

    // 绘制互动范围指示（调试用）
    // ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    // ctx.beginPath();
    // ctx.arc(
    //   this.x + this.size / 2,
    //   this.y + this.size / 2,
    //   this.interactionRange,
    //   0,
    //   Math.PI * 2
    // );
    // ctx.stroke();
  }

  getPosition() {
    return { x: this.x, y: this.y, size: this.size };
  }

  getDialogue() {
    return this.dialogue;
  }

  getName() {
    return this.name;
  }

  getQuests(): NPCQuest[] {
    return this.quests;
  }

  setMood(mood: 'happy' | 'neutral' | 'angry') {
    this.mood = mood;
  }

  isInInteractionRange(playerX: number, playerY: number): boolean {
    const dx = this.x + this.size / 2 - playerX;
    const dy = this.y + this.size / 2 - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.interactionRange;
  }
}