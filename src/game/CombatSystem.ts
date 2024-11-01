import { Player } from './Player';
import { Monster } from './Monster';
import { ITEMS } from './items/Item';

interface CombatAnimation {
  type: 'attack' | 'skill' | 'heal' | 'damage' | 'buff';
  source: 'player' | 'monster' | 'pet';
  target: 'player' | 'monster';
  value: number;
  skillName?: string;
  duration: number;
  currentFrame: number;
}

export class CombatSystem {
  private combatWindowElement: HTMLDivElement;
  private animationElement: HTMLDivElement;
  private isInCombat: boolean = false;
  private currentMonster: Monster | null = null;
  private player: Player;
  private turnCount: number = 0;
  private currentAnimation: CombatAnimation | null = null;
  private animationFrameId: number | null = null;

  constructor(player: Player) {
    this.player = player;
    this.combatWindowElement = document.createElement('div');
    this.animationElement = document.createElement('div');
    
    Object.assign(this.combatWindowElement.style, {
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '600px',
      padding: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      borderRadius: '8px',
      fontFamily: 'Arial',
      display: 'none',
      zIndex: '1000'
    });

    Object.assign(this.animationElement.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '1001'
    });

    document.body.appendChild(this.combatWindowElement);
    document.body.appendChild(this.animationElement);
  }

  startCombat(monster: Monster) {
    this.isInCombat = true;
    this.currentMonster = monster;
    this.turnCount = 0;
    this.updateCombatWindow();
    this.combatWindowElement.style.display = 'block';
    
    this.playAnimation({
      type: 'buff',
      source: 'monster',
      target: 'monster',
      value: 0,
      skillName: '出现',
      duration: 1000,
      currentFrame: 0
    });
    
    this.showCombatMessage(`${monster.getSprite()} ${monster.getName()}出现了！`);
  }

  attack() {
    if (!this.currentMonster || !this.isInCombat) return;

    this.turnCount++;
    const playerStats = this.player.getStats();
    const monsterStats = this.currentMonster.getStats();

    const playerDamage = Math.max(1, playerStats.attack - monsterStats.defense);
    this.currentMonster.takeDamage(playerDamage);

    const pet = this.player.getPet?.();
    if (pet?.isLoyalEnough?.()) {
      const petSkill = pet.useSkill('assist_attack');
      if (petSkill) {
        const petDamage = Math.floor(playerDamage * petSkill.damage);
        this.currentMonster.takeDamage(petDamage);
        
        this.playAnimation({
          type: 'skill',
          source: 'pet',
          target: 'monster',
          value: petDamage,
          skillName: petSkill.name,
          duration: 500,
          currentFrame: 0
        });

        this.showCombatMessage(`${pet.getName()}使用${petSkill.name}造成了${petDamage}点伤害！`);
      }
    }

    this.playAnimation({
      type: 'attack',
      source: 'player',
      target: 'monster',
      value: playerDamage,
      duration: 500,
      currentFrame: 0
    });

    setTimeout(() => {
      this.playAnimation({
        type: 'damage',
        source: 'player',
        target: 'monster',
        value: playerDamage,
        duration: 500,
        currentFrame: 0
      });
    }, 500);

    this.showCombatMessage(`你对${this.currentMonster.getName()}造成了${playerDamage}点伤害！`);

    if (this.currentMonster.isDead()) {
      this.endCombat(true);
      return;
    }

    setTimeout(() => {
      this.monsterTurn();
    }, 1000);
  }

  usePotion() {
    if (!this.isInCombat) return;
    
    if (this.player.useHealthPotion()) {
      this.playAnimation({
        type: 'heal',
        source: 'player',
        target: 'player',
        value: 50,
        duration: 500,
        currentFrame: 0
      });

      this.showCombatMessage('你使用了生命药水，恢复了50点生命值！');
      this.updateCombatWindow();

      setTimeout(() => {
        this.monsterTurn();
      }, 1000);
    } else {
      this.showCombatMessage('你没有生命药水了！');
    }
  }

  flee() {
    if (!this.isInCombat) return;

    const fleeChance = Math.random();
    if (fleeChance > 0.3) {
      this.showCombatMessage('你成功逃脱了战斗！');
      this.endCombat(false);
    } else {
      this.showCombatMessage('逃跑失败！');
      setTimeout(() => {
        this.monsterTurn();
      }, 1000);
    }
  }

  private monsterTurn() {
    if (!this.currentMonster || !this.isInCombat) return;

    this.currentMonster.updateCooldowns();
    const monsterSkill = this.currentMonster.useSkill();
    const playerStats = this.player.getStats();

    if (monsterSkill.type === 'damage') {
      const monsterDamage = Math.max(1, monsterSkill.damage - playerStats.defense);
      this.player.takeDamage(monsterDamage);

      this.playAnimation({
        type: 'skill',
        source: 'monster',
        target: 'player',
        value: monsterDamage,
        skillName: monsterSkill.name,
        duration: 500,
        currentFrame: 0
      });

      setTimeout(() => {
        this.playAnimation({
          type: 'damage',
          source: 'monster',
          target: 'player',
          value: monsterDamage,
          duration: 500,
          currentFrame: 0
        });
      }, 500);

      this.showCombatMessage(
        `${this.currentMonster.getName()}使用了${monsterSkill.name}，造成了${monsterDamage}点伤害！`
      );
    } else if (monsterSkill.type === 'heal') {
      const healAmount = Math.abs(monsterSkill.damage);
      this.currentMonster.heal(healAmount);

      this.playAnimation({
        type: 'heal',
        source: 'monster',
        target: 'monster',
        value: healAmount,
        skillName: monsterSkill.name,
        duration: 500,
        currentFrame: 0
      });

      this.showCombatMessage(
        `${this.currentMonster.getName()}使用了${monsterSkill.name}，恢复了${healAmount}点生命值！`
      );
    }

    if (this.player.isDead()) {
      this.endCombat(false);
      return;
    }

    this.updateCombatWindow();
  }

  private endCombat(victory: boolean) {
    if (victory && this.currentMonster) {
      const exp = this.currentMonster.getExp();
      const gold = this.currentMonster.getGold();
      const drops = this.currentMonster.getDrops();
      
      this.player.gainExp(exp);
      this.player.gainGold(gold);
      
      let message = `战斗胜利！获得${exp}经验值和${gold}金币！`;
      
      if (drops.length > 0) {
        message += '\n获得物品：';
        drops.forEach(item => {
          message += `\n${item.icon} ${item.name}`;
        });
      }
      
      this.showCombatMessage(message);
    } else if (!victory) {
      this.showCombatMessage(this.player.isDead() ? '你被击败了！' : '你逃离了战斗！');
    }

    setTimeout(() => {
      this.isInCombat = false;
      this.currentMonster = null;
      this.combatWindowElement.style.display = 'none';
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      this.animationElement.innerHTML = '';
    }, 2000);
  }

  private updateCombatWindow() {
    if (!this.currentMonster) return;

    const playerStats = this.player.getStats();
    const monsterStats = this.currentMonster.getStats();

    const healthBarStyle = `
      width: 150px;
      height: 20px;
      background: #666;
      border-radius: 10px;
      overflow: hidden;
      margin-top: 5px;
    `;

    const getHealthBarFill = (current: number, max: number) => `
      width: ${(current / max * 100)}%;
      height: 100%;
      background: ${current / max > 0.5 ? '#4CAF50' : current / max > 0.2 ? '#FFC107' : '#f44336'};
      transition: width 0.3s ease;
    `;

    this.combatWindowElement.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <h3 style="color: #4CAF50;">玩家 Lv.${playerStats.level}</h3>
          <div style="${healthBarStyle}">
            <div style="${getHealthBarFill(playerStats.currentHp, playerStats.maxHp)}"></div>
          </div>
          <div>HP: ${playerStats.currentHp}/${playerStats.maxHp}</div>
          <div>攻击力: ${playerStats.attack}</div>
          <div>防御力: ${playerStats.defense}</div>
          <div>药水: ${this.player.getHealthPotions()}个</div>
        </div>
        <div style="text-align: right;">
          <h3 style="color: #f44336;">${this.currentMonster.getSprite()} ${this.currentMonster.getName()} Lv.${monsterStats.level}</h3>
          <div style="${healthBarStyle}">
            <div style="${getHealthBarFill(monsterStats.currentHp, monsterStats.maxHp)}"></div>
          </div>
          <div>HP: ${monsterStats.currentHp}/${monsterStats.maxHp}</div>
          <div>攻击力: ${monsterStats.attack}</div>
          <div>防御力: ${monsterStats.defense}</div>
        </div>
      </div>
      <div style="display: flex; justify-content: center; gap: 10px;">
        <button onclick="window.game.attack()"
          style="padding: 8px 16px; background: #4CAF50; border: none; border-radius: 4px; color: white; cursor: pointer;">
          攻击
        </button>
        <button onclick="window.game.usePotion()"
          style="padding: 8px 16px; background: #2196F3; border: none; border-radius: 4px; color: white; cursor: pointer;">
          使用药水 (${this.player.getHealthPotions()})
        </button>
        <button onclick="window.game.useSkill('slash')"
          style="padding: 8px 16px; background: #9c27b0; border: none; border-radius: 4px; color: white; cursor: pointer;">
          技能
        </button>
        <button onclick="window.game.flee()"
          style="padding: 8px 16px; background: #f44336; border: none; border-radius: 4px; color: white; cursor: pointer;">
          逃跑
        </button>
      </div>
    `;
  }

  private playAnimation(animation: CombatAnimation) {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.currentAnimation = animation;
    this.animateFrame();
  }

  private animateFrame() {
    if (!this.currentAnimation) return;

    const { type, source, target, value, skillName, duration, currentFrame } = this.currentAnimation;
    const progress = currentFrame / duration;

    if (progress >= 1) {
      this.currentAnimation = null;
      this.animationElement.innerHTML = '';
      return;
    }

    let animationHtml = '';
    const sourcePos = source === 'player' ? { x: '30%', y: '60%' } : { x: '70%', y: '40%' };
    const targetPos = target === 'player' ? { x: '30%', y: '60%' } : { x: '70%', y: '40%' };

    switch (type) {
      case 'attack':
        const attackX = sourcePos.x + (targetPos.x - sourcePos.x) * progress;
        const attackY = sourcePos.y + (targetPos.y - sourcePos.y) * progress;
        animationHtml = `
          <div style="position: absolute; left: ${attackX}; top: ${attackY}; transform: translate(-50%, -50%);">
            ⚔️
          </div>
        `;
        break;

      case 'skill':
        const skillX = sourcePos.x + (targetPos.x - sourcePos.x) * progress;
        const skillY = sourcePos.y + (targetPos.y - sourcePos.y) * progress;
        const skillIcon = source === 'player' ? '✨' : '💫';
        animationHtml = `
          <div style="position: absolute; left: ${skillX}; top: ${skillY}; transform: translate(-50%, -50%);">
            ${skillIcon}
          </div>
        `;
        break;

      case 'heal':
        const healY = targetPos.y - progress * 50;
        animationHtml = `
          <div style="position: absolute; left: ${targetPos.x}; top: ${healY}%; transform: translate(-50%, -50%);
            opacity: ${1 - progress};">
            +${value} 💚
          </div>
        `;
        break;

      case 'damage':
        const damageY = targetPos.y - progress * 50;
        animationHtml = `
          <div style="position: absolute; left: ${targetPos.x}; top: ${damageY}%; transform: translate(-50%, -50%);
            opacity: ${1 - progress}; color: #f44336;">
            -${value} 💔
          </div>
        `;
        break;

      case 'buff':
        const buffY = targetPos.y - Math.sin(progress * Math.PI) * 20;
        animationHtml = `
          <div style="position: absolute; left: ${targetPos.x}; top: ${buffY}%; transform: translate(-50%, -50%);
            opacity: ${1 - progress};">
            ${skillName} ⭐
          </div>
        `;
        break;
    }

    this.animationElement.innerHTML = animationHtml;
    this.currentAnimation.currentFrame += 16;
    this.animationFrameId = requestAnimationFrame(() => this.animateFrame());
  }

  private showCombatMessage(message: string) {
    const messageElement = document.createElement('div');
    Object.assign(messageElement.style, {
      position: 'absolute',
      top: '40%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '10px 20px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      borderRadius: '4px',
      fontFamily: 'Arial',
      fontSize: '16px',
      zIndex: '2000',
      whiteSpace: 'pre-line'
    });
    
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    setTimeout(() => document.body.removeChild(messageElement), 1500);
  }

  isInCombatState(): boolean {
    return this.isInCombat;
  }
}