interface Skill {
  id: string;
  name: string;
  description: string;
  damage: number;
  manaCost: number;
  cooldown: number;
  currentCooldown: number;
  level: number;
  type: 'damage' | 'heal' | 'buff';
  targetType: 'single' | 'self';
  unlockLevel: number;
  icon: string;
}

export class SkillSystem {
  private skills: Map<string, Skill> = new Map();
  private skillWindowElement: HTMLDivElement;
  private isVisible: boolean = false;
  private playerLevel: number = 1;
  private currentMana: number = 100;
  private maxMana: number = 100;

  constructor() {
    this.skillWindowElement = document.createElement('div');
    this.setupSkillWindow();
    document.body.appendChild(this.skillWindowElement);
    this.initializeSkills();
  }

  private initializeSkills() {
    const basicSkills: Skill[] = [
      {
        id: 'slash',
        name: '斩击',
        description: '对敌人造成120%攻击力的伤害',
        damage: 1.2,
        manaCost: 20,
        cooldown: 3,
        currentCooldown: 0,
        level: 1,
        type: 'damage',
        targetType: 'single',
        unlockLevel: 1,
        icon: '⚔️'
      },
      {
        id: 'heal',
        name: '治疗术',
        description: '恢复30%最大生命值',
        damage: 0.3,
        manaCost: 30,
        cooldown: 5,
        currentCooldown: 0,
        level: 1,
        type: 'heal',
        targetType: 'self',
        unlockLevel: 3,
        icon: '💚'
      },
      {
        id: 'fireball',
        name: '火球术',
        description: '发射火球造成150%攻击力的伤害',
        damage: 1.5,
        manaCost: 40,
        cooldown: 4,
        currentCooldown: 0,
        level: 1,
        type: 'damage',
        targetType: 'single',
        unlockLevel: 5,
        icon: '🔥'
      },
      {
        id: 'rage',
        name: '狂暴',
        description: '提升30%攻击力，持续3回合',
        damage: 0.3,
        manaCost: 50,
        cooldown: 6,
        currentCooldown: 0,
        level: 1,
        type: 'buff',
        targetType: 'self',
        unlockLevel: 7,
        icon: '💢'
      }
    ];

    basicSkills.forEach(skill => this.skills.set(skill.id, skill));
  }

  private setupSkillWindow() {
    Object.assign(this.skillWindowElement.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '600px',
      padding: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      borderRadius: '8px',
      fontFamily: 'Arial',
      display: 'none',
      zIndex: '1000'
    });
  }

  showSkillWindow() {
    this.isVisible = true;
    this.updateSkillWindow();
    this.skillWindowElement.style.display = 'block';
  }

  hideSkillWindow() {
    this.isVisible = false;
    this.skillWindowElement.style.display = 'none';
  }

  isSkillWindowVisible(): boolean {
    return this.isVisible;
  }

  private updateSkillWindow() {
    let content = `
      <div style="margin-bottom: 20px;">
        <h2>技能列表</h2>
        <div style="margin-top: 10px;">
          <div style="background: #1a1a1a; border-radius: 4px; height: 20px; margin-bottom: 5px;">
            <div style="width: ${(this.currentMana / this.maxMana) * 100}%; height: 100%; 
              background: #2196F3; border-radius: 4px; transition: width 0.3s ease;"></div>
          </div>
          <div style="font-size: 14px;">魔法值: ${this.currentMana}/${this.maxMana}</div>
        </div>
      </div>
      <div style="display: grid; gap: 15px;">
    `;

    this.skills.forEach(skill => {
      const isUnlocked = this.playerLevel >= skill.unlockLevel;
      const canUse = this.currentMana >= skill.manaCost && skill.currentCooldown === 0;

      content += `
        <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; 
          ${!isUnlocked ? 'filter: grayscale(1);' : ''}">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div>
              ${skill.icon} ${skill.name} Lv.${skill.level}
              ${!isUnlocked ? ` (需要等级 ${skill.unlockLevel})` : ''}
            </div>
            <div style="color: #2196F3;">MP: ${skill.manaCost}</div>
          </div>
          <div style="font-size: 14px; color: #888; margin-bottom: 10px">
            ${skill.description}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 14px;">
              冷却时间: ${skill.currentCooldown > 0 ? skill.currentCooldown : '就绪'}
            </div>
            ${isUnlocked ? `
              <button onclick="window.game.useSkill('${skill.id}')"
                style="padding: 5px 10px; 
                background: ${canUse ? '#4CAF50' : '#666'}; 
                border: none; border-radius: 4px; 
                color: white; 
                cursor: ${canUse ? 'pointer' : 'not-allowed'}">
                使用
              </button>
            ` : ''}
          </div>
        </div>
      `;
    });

    content += `
      </div>
      <div style="margin-top: 20px; text-align: right;">
        <button onclick="window.game.closeSkills()"
          style="padding: 8px 16px; background: #666; border: none; border-radius: 4px; color: white; cursor: pointer;">
          关闭
        </button>
      </div>
    `;

    this.skillWindowElement.innerHTML = content;
  }

  useSkill(skillId: string): Skill | null {
    const skill = this.skills.get(skillId);
    if (!skill) return null;

    if (skill.currentCooldown > 0 || this.currentMana < skill.manaCost) {
      return null;
    }

    this.currentMana -= skill.manaCost;
    skill.currentCooldown = skill.cooldown;
    this.updateSkillWindow();

    return { ...skill };
  }

  updateCooldowns() {
    this.skills.forEach(skill => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown--;
      }
    });
    if (this.isVisible) {
      this.updateSkillWindow();
    }
  }

  regenerateMana(amount: number) {
    this.currentMana = Math.min(this.maxMana, this.currentMana + amount);
    if (this.isVisible) {
      this.updateSkillWindow();
    }
  }

  setPlayerLevel(level: number) {
    this.playerLevel = level;
    if (this.isVisible) {
      this.updateSkillWindow();
    }
  }

  getSkill(skillId: string): Skill | undefined {
    return this.skills.get(skillId);
  }

  upgradeSkill(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) return false;

    skill.level++;
    skill.damage *= 1.2;
    skill.manaCost = Math.floor(skill.manaCost * 1.1);

    if (this.isVisible) {
      this.updateSkillWindow();
    }
    return true;
  }
}