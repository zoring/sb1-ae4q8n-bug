interface PetSkill {
  name: string;
  damage: number;
  cooldown: number;
  currentCooldown: number;
  type: 'damage' | 'heal' | 'buff';
  description: string;
}

interface PetStats {
  level: number;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  exp: number;
  nextLevelExp: number;
  loyalty: number;
}

interface PetType {
  name: string;
  sprite: string;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
  };
  skills: PetSkill[];
  description: string;
}

const PET_TYPES: { [key: string]: PetType } = {
  dog: {
    name: '小狗',
    sprite: '🐕',
    baseStats: {
      hp: 80,
      attack: 12,
      defense: 8
    },
    skills: [
      {
        name: '撕咬',
        damage: 0.5,
        cooldown: 3,
        currentCooldown: 0,
        type: 'damage',
        description: '对敌人造成伤害'
      },
      {
        name: '嚎叫',
        damage: 0.2,
        cooldown: 5,
        currentCooldown: 0,
        type: 'buff',
        description: '提升主人的攻击力'
      }
    ],
    description: '忠诚的伙伴，擅长近战攻击。'
  }
};

export class Pet {
  private name: string;
  private type: string;
  private stats: PetStats;
  private sprite: string;
  private x: number = 0;
  private y: number = 0;
  private targetX: number = 0;
  private targetY: number = 0;
  private size: number = 24;
  private followDistance: number = 40;
  private moveSpeed: number = 3;
  private skills: PetSkill[];

  constructor(name: string, type: string) {
    this.name = name;
    this.type = type;
    const petType = PET_TYPES[type];
    this.sprite = petType.sprite;
    this.skills = [...petType.skills];

    this.stats = {
      level: 1,
      maxHp: petType.baseStats.hp,
      currentHp: petType.baseStats.hp,
      attack: petType.baseStats.attack,
      defense: petType.baseStats.defense,
      exp: 0,
      nextLevelExp: 100,
      loyalty: 50
    };
  }

  update(deltaTime: number) {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.followDistance) {
      const angle = Math.atan2(dy, dx);
      this.x += Math.cos(angle) * this.moveSpeed;
      this.y += Math.sin(angle) * this.moveSpeed;
    }

    // Update skill cooldowns
    this.skills.forEach(skill => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown -= deltaTime / 1000;
      }
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.sprite, this.x, this.y);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${this.name} Lv.${this.stats.level}`, this.x, this.y - 20);

    const healthBarWidth = 30;
    const healthBarHeight = 4;
    const healthPercentage = this.stats.currentHp / this.stats.maxHp;

    ctx.fillStyle = '#666';
    ctx.fillRect(this.x - healthBarWidth/2, this.y - 15, healthBarWidth, healthBarHeight);

    ctx.fillStyle = healthPercentage > 0.5 ? '#4CAF50' : healthPercentage > 0.2 ? '#FFC107' : '#f44336';
    ctx.fillRect(
      this.x - healthBarWidth/2,
      this.y - 15,
      healthBarWidth * healthPercentage,
      healthBarHeight
    );
  }

  followPlayer(playerX: number, playerY: number) {
    this.targetX = playerX;
    this.targetY = playerY;
  }

  useSkill(skillId: string): PetSkill | null {
    const skill = this.skills.find(s => s.name === skillId);
    if (!skill || skill.currentCooldown > 0) return null;
    
    skill.currentCooldown = skill.cooldown;
    return { ...skill };
  }

  isLoyalEnough(): boolean {
    return this.stats.loyalty >= 30;
  }

  gainExp(exp: number) {
    this.stats.exp += exp;
    while (this.stats.exp >= this.stats.nextLevelExp) {
      this.levelUp();
    }
  }

  private levelUp() {
    this.stats.level++;
    this.stats.exp -= this.stats.nextLevelExp;
    this.stats.nextLevelExp = Math.floor(this.stats.nextLevelExp * 1.5);
    
    this.stats.maxHp += 10;
    this.stats.currentHp = this.stats.maxHp;
    this.stats.attack += 3;
    this.stats.defense += 2;
    this.stats.loyalty = Math.min(100, this.stats.loyalty + 5);

    this.showLevelUpMessage();
  }

  private showLevelUpMessage() {
    const message = document.createElement('div');
    Object.assign(message.style, {
      position: 'absolute',
      top: '40%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: '#4CAF50',
      borderRadius: '8px',
      fontFamily: 'Arial',
      fontSize: '18px',
      textAlign: 'center',
      zIndex: '2000'
    });
    
    message.innerHTML = `
      <div style="color: #FFC107; margin-bottom: 10px">宠物升级！</div>
      <div>${this.name} 升到了 ${this.stats.level} 级</div>
      <div style="font-size: 14px; color: #fff; margin-top: 10px">
        生命值 +10<br>
        攻击力 +3<br>
        防御力 +2<br>
        忠诚度 +5
      </div>
    `;
    
    document.body.appendChild(message);
    setTimeout(() => document.body.removeChild(message), 2000);
  }

  getName(): string {
    return this.name;
  }

  getStats(): PetStats {
    return { ...this.stats };
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }
}