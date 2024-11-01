import { Item, ITEMS } from './items/Item';

interface MonsterStats {
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  level: number;
  speed: number;
}

interface MonsterSkill {
  name: string;
  damage: number;
  cooldown: number;
  currentCooldown: number;
  description: string;
  type: 'damage' | 'debuff' | 'heal';
}

interface MonsterDrop {
  item: Item;
  chance: number; // 0-1
}

export class Monster {
  private name: string;
  private stats: MonsterStats;
  private exp: number;
  private gold: number;
  private skills: MonsterSkill[];
  private drops: MonsterDrop[];
  private type: 'normal' | 'elite' | 'boss';
  private sprite: string;

  constructor(name: string, level: number, type: 'normal' | 'elite' | 'boss' = 'normal') {
    this.name = name;
    this.type = type;
    
    const multiplier = type === 'boss' ? 3 : type === 'elite' ? 1.5 : 1;
    
    this.stats = {
      level,
      maxHp: Math.floor((50 + level * 20) * multiplier),
      currentHp: Math.floor((50 + level * 20) * multiplier),
      attack: Math.floor((10 + level * 5) * multiplier),
      defense: Math.floor((5 + level * 2) * multiplier),
      speed: Math.floor((10 + level) * multiplier)
    };
    
    this.exp = Math.floor((20 + level * 10) * multiplier);
    this.gold = Math.floor((10 + level * 5) * multiplier);
    
    this.setupMonsterType(name);
  }

  private setupMonsterType(name: string) {
    switch (name) {
      case '史莱姆':
        this.sprite = '🟢';
        this.skills = [{
          name: '分裂',
          damage: this.stats.attack * 0.5,
          cooldown: 3,
          currentCooldown: 0,
          description: '分裂成两个小史莱姆进行攻击',
          type: 'damage'
        }];
        this.drops = [
          { item: ITEMS.magic_crystal, chance: 0.3 }
        ];
        break;
        
      case '哥布林':
        this.sprite = '👺';
        this.skills = [{
          name: '突袭',
          damage: this.stats.attack * 1.5,
          cooldown: 4,
          currentCooldown: 0,
          description: '对玩家发动突然袭击',
          type: 'damage'
        }];
        this.drops = [
          { item: ITEMS.wooden_sword, chance: 0.4 },
          { item: ITEMS.iron_ore, chance: 0.6 }
        ];
        break;
        
      case '骷髅':
        this.sprite = '💀';
        this.skills = [{
          name: '骨矛投掷',
          damage: this.stats.attack * 1.2,
          cooldown: 3,
          currentCooldown: 0,
          description: '投掷骨矛进行远程攻击',
          type: 'damage'
        }];
        this.drops = [
          { item: ITEMS.iron_sword, chance: 0.3 },
          { item: ITEMS.health_potion, chance: 0.5 }
        ];
        break;
        
      case '蝙蝠':
        this.sprite = '🦇';
        this.skills = [{
          name: '音波攻击',
          damage: this.stats.attack * 0.8,
          cooldown: 2,
          currentCooldown: 0,
          description: '发出超声波干扰玩家',
          type: 'debuff'
        }];
        this.drops = [
          { item: ITEMS.magic_crystal, chance: 0.4 }
        ];
        break;
        
      default:
        this.sprite = '👾';
        this.skills = [{
          name: '基础攻击',
          damage: this.stats.attack,
          cooldown: 1,
          currentCooldown: 0,
          description: '普通攻击',
          type: 'damage'
        }];
        this.drops = [
          { item: ITEMS.health_potion, chance: 0.3 }
        ];
    }

    // 精英和Boss额外技能
    if (this.type === 'elite' || this.type === 'boss') {
      this.skills.push({
        name: '恢复',
        damage: -Math.floor(this.stats.maxHp * 0.2),
        cooldown: 5,
        currentCooldown: 0,
        description: '恢复生命值',
        type: 'heal'
      });
    }

    if (this.type === 'boss') {
      this.skills.push({
        name: '狂暴',
        damage: this.stats.attack * 2,
        cooldown: 6,
        currentCooldown: 0,
        description: '造成双倍伤害',
        type: 'damage'
      });
      
      // Boss额外掉落
      this.drops.push(
        { item: ITEMS.dragon_scale, chance: 0.5 },
        { item: ITEMS.lucky_charm, chance: 0.3 }
      );
    }
  }

  takeDamage(damage: number) {
    this.stats.currentHp = Math.max(0, this.stats.currentHp - damage);
  }

  heal(amount: number) {
    this.stats.currentHp = Math.min(this.stats.maxHp, this.stats.currentHp + amount);
  }

  isDead(): boolean {
    return this.stats.currentHp <= 0;
  }

  getName(): string {
    const prefix = this.type === 'boss' ? '【Boss】' : this.type === 'elite' ? '【精英】' : '';
    return `${prefix}${this.name}`;
  }

  getStats(): MonsterStats {
    return { ...this.stats };
  }

  getExp(): number {
    return this.exp;
  }

  getGold(): number {
    return this.gold;
  }

  getSprite(): string {
    return this.sprite;
  }

  useSkill(): { name: string; damage: number; type: string } {
    // 找到可用的技能
    const availableSkills = this.skills.filter(skill => skill.currentCooldown === 0);
    
    if (availableSkills.length === 0) {
      // 如果没有可用技能，使用普通攻击
      return {
        name: '普通攻击',
        damage: this.stats.attack,
        type: 'damage'
      };
    }

    // 随机选择一个可用技能
    const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
    
    // 重置技能冷却
    skill.currentCooldown = skill.cooldown;
    
    return {
      name: skill.name,
      damage: skill.damage,
      type: skill.type
    };
  }

  updateCooldowns() {
    this.skills.forEach(skill => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown--;
      }
    });
  }

  getDrops(): Item[] {
    return this.drops
      .filter(() => Math.random() < 0.3) // 30%概率触发掉落检查
      .filter(drop => Math.random() < drop.chance)
      .map(drop => drop.item);
  }
}