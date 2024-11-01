import { EquipmentSystem } from './Equipment';
import { SkillSystem } from './SkillSystem';
import { Pet } from './Pet';
import '../styles/player.css';

interface PlayerStats {
  level: number;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  exp: number;
  nextLevelExp: number;
}

export class Player {
  private x: number;
  private y: number;
  private size: number;
  private stats: PlayerStats;
  private gold: number;
  private healthPotions: number;
  private equipment: EquipmentSystem;
  private skills: SkillSystem;
  private pet: Pet | null = null;
  private element: HTMLDivElement;
  private buffs: Map<string, { value: number; duration: number }> = new Map();

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.size = 32;
    this.stats = {
      level: 1,
      maxHp: 100,
      currentHp: 100,
      attack: 15,
      defense: 10,
      exp: 0,
      nextLevelExp: 100
    };
    this.gold = 100;
    this.healthPotions = 3;
    this.equipment = new EquipmentSystem();
    this.skills = new SkillSystem();
    
    this.createPlayerElement();
  }

  private createPlayerElement() {
    this.element = document.createElement('div');
    this.element.className = 'player';
    
    this.element.innerHTML = `
      <div class="player-name">玩家 Lv.${this.stats.level}</div>
      <div class="player-body">
        <div class="player-head"></div>
        <div class="player-helmet"></div>
        <div class="player-torso"></div>
        <div class="player-armor"></div>
        <div class="player-legs">
          <div class="player-leg"></div>
          <div class="player-leg"></div>
        </div>
        <div class="player-pants"></div>
        <div class="player-arms">
          <div class="player-arm"></div>
          <div class="player-arm"></div>
        </div>
        <div class="player-weapon"></div>
      </div>
      <div class="player-health-bar">
        <div class="player-health-fill"></div>
      </div>
      <div class="player-buffs"></div>
    `;

    document.body.appendChild(this.element);
    this.updatePosition();
    this.updateEquipment();
  }

  getPosition() {
    return {
      x: this.x,
      y: this.y,
      size: this.size
    };
  }

  private updatePosition() {
    Object.assign(this.element.style, {
      transform: `translate(${this.x}px, ${this.y}px)`
    });
  }

  private updateEquipment() {
    const equipment = this.equipment.getAllEquippedItems();
    
    // 更新头盔
    const helmet = equipment.get('helmet');
    const helmetElement = this.element.querySelector('.player-helmet') as HTMLElement;
    if (helmet) {
      helmetElement.style.backgroundImage = `url(${helmet.icon})`;
      helmetElement.className = `player-helmet equipment-${helmet.rarity}`;
    } else {
      helmetElement.style.backgroundImage = 'none';
      helmetElement.className = 'player-helmet';
    }

    // 更新盔甲
    const armor = equipment.get('armor');
    const armorElement = this.element.querySelector('.player-armor') as HTMLElement;
    if (armor) {
      armorElement.style.backgroundImage = `url(${armor.icon})`;
      armorElement.className = `player-armor equipment-${armor.rarity}`;
    } else {
      armorElement.style.backgroundImage = 'none';
      armorElement.className = 'player-armor';
    }

    // 更新裤子
    const pants = equipment.get('pants');
    const pantsElement = this.element.querySelector('.player-pants') as HTMLElement;
    if (pants) {
      pantsElement.style.backgroundImage = `url(${pants.icon})`;
      pantsElement.className = `player-pants equipment-${pants.rarity}`;
    } else {
      pantsElement.style.backgroundImage = 'none';
      pantsElement.className = 'player-pants';
    }

    // 更新武器
    const weapon = equipment.get('weapon');
    const weaponElement = this.element.querySelector('.player-weapon') as HTMLElement;
    if (weapon) {
      weaponElement.style.backgroundImage = `url(${weapon.icon})`;
      weaponElement.className = `player-weapon equipment-${weapon.rarity}`;
    } else {
      weaponElement.style.backgroundImage = 'none';
      weaponElement.className = 'player-weapon';
    }
  }

  move(dx: number, dy: number) {
    this.x += dx * 5;
    this.y += dy * 5;
    
    this.x = Math.max(0, Math.min(this.x, 800 - this.size));
    this.y = Math.max(0, Math.min(this.y, 600 - this.size));
    
    this.updatePosition();

    if (this.pet) {
      this.pet.followPlayer(this.x + this.size / 2, this.y + this.size / 2);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // 更新生命值条
    const healthFill = this.element.querySelector('.player-health-fill') as HTMLElement;
    const healthPercentage = this.stats.currentHp / this.stats.maxHp;
    healthFill.style.width = `${healthPercentage * 100}%`;
    
    if (healthPercentage > 0.5) {
      healthFill.className = 'player-health-fill';
    } else if (healthPercentage > 0.2) {
      healthFill.className = 'player-health-fill warning';
    } else {
      healthFill.className = 'player-health-fill danger';
    }

    // 更新名称和等级
    const nameElement = this.element.querySelector('.player-name') as HTMLElement;
    nameElement.textContent = `玩家 Lv.${this.stats.level}`;

    // 更新Buff显示
    const buffsElement = this.element.querySelector('.player-buffs') as HTMLElement;
    buffsElement.innerHTML = '';
    this.buffs.forEach((buff, buffName) => {
      if (buff.duration > 0) {
        const buffElement = document.createElement('div');
        buffElement.className = 'player-buff';
        buffElement.textContent = buffName[0];
        buffsElement.appendChild(buffElement);
      }
    });
  }

  getStats(): PlayerStats {
    const equipStats = this.equipment.calculateTotalStats();
    let totalAttack = this.stats.attack + equipStats.attack;
    let totalDefense = this.stats.defense + equipStats.defense;

    this.buffs.forEach(buff => {
      if (buff.duration > 0) {
        totalAttack *= (1 + buff.value);
      }
    });

    return {
      ...this.stats,
      maxHp: this.stats.maxHp + equipStats.health,
      attack: Math.floor(totalAttack),
      defense: totalDefense
    };
  }

  takeDamage(damage: number) {
    this.stats.currentHp = Math.max(0, this.stats.currentHp - damage);
  }

  heal(amount: number) {
    const totalStats = this.getStats();
    this.stats.currentHp = Math.min(totalStats.maxHp, this.stats.currentHp + amount);
  }

  isDead(): boolean {
    return this.stats.currentHp <= 0;
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
    
    this.stats.maxHp += 20;
    this.stats.currentHp = this.stats.maxHp;
    this.stats.attack += 5;
    this.stats.defense += 3;

    this.skills.setPlayerLevel(this.stats.level);
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
      fontSize: '20px',
      textAlign: 'center',
      zIndex: '2000'
    });
    
    message.innerHTML = `
      <div style="color: #FFC107; font-size: 24px; margin-bottom: 10px">Level Up!</div>
      <div>等级提升到 ${this.stats.level}</div>
      <div style="font-size: 16px; color: #fff; margin-top: 10px">
        生命值 +20<br>
        攻击力 +5<br>
        防御力 +3
      </div>
    `;
    
    document.body.appendChild(message);
    setTimeout(() => document.body.removeChild(message), 3000);
  }

  getEquipment(): EquipmentSystem {
    return this.equipment;
  }

  getSkills(): SkillSystem {
    return this.skills;
  }

  gainGold(amount: number) {
    this.gold += amount;
  }

  spendGold(amount: number): boolean {
    if (this.gold >= amount) {
      this.gold -= amount;
      return true;
    }
    return false;
  }

  getGold(): number {
    return this.gold;
  }

  useHealthPotion(): boolean {
    if (this.healthPotions > 0) {
      this.healthPotions--;
      this.heal(50);
      return true;
    }
    return false;
  }

  addHealthPotion() {
    this.healthPotions++;
  }

  getHealthPotions(): number {
    return this.healthPotions;
  }

  addBuff(name: string, value: number, duration: number) {
    this.buffs.set(name, { value, duration });
  }

  updateBuffs() {
    this.buffs.forEach((buff, name) => {
      buff.duration--;
      if (buff.duration <= 0) {
        this.buffs.delete(name);
      }
    });
  }
}