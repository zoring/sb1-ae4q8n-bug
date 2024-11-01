export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  level: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats: {
    attack?: number;
    defense?: number;
    health?: number;
    critRate?: number;
    critDamage?: number;
  };
  upgradeCost: number;
  maxLevel: number;
}

export class EquipmentSystem {
  private equippedItems: Map<string, Equipment> = new Map();
  private upgradeWindowElement: HTMLDivElement;
  private isVisible: boolean = false;

  constructor() {
    this.upgradeWindowElement = document.createElement('div');
    this.setupUpgradeWindow();
    document.body.appendChild(this.upgradeWindowElement);
    this.setupInitialEquipment();
  }

  private setupInitialEquipment() {
    const starterSword: Equipment = {
      id: 'starter_sword',
      name: '新手剑',
      type: 'weapon',
      level: 1,
      rarity: 'common',
      stats: {
        attack: 5
      },
      upgradeCost: 50,
      maxLevel: 10
    };

    const starterArmor: Equipment = {
      id: 'starter_armor',
      name: '新手布甲',
      type: 'armor',
      level: 1,
      rarity: 'common',
      stats: {
        defense: 3,
        health: 20
      },
      upgradeCost: 50,
      maxLevel: 10
    };

    this.equippedItems.set('weapon', starterSword);
    this.equippedItems.set('armor', starterArmor);
  }

  private setupUpgradeWindow() {
    Object.assign(this.upgradeWindowElement.style, {
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

  equipItem(slot: string, item: Equipment) {
    this.equippedItems.set(slot, item);
  }

  unequipItem(slot: string): Equipment | undefined {
    const item = this.equippedItems.get(slot);
    if (item) {
      this.equippedItems.delete(slot);
    }
    return item;
  }

  getEquippedItem(slot: string): Equipment | undefined {
    return this.equippedItems.get(slot);
  }

  getAllEquippedItems(): Map<string, Equipment> {
    return new Map(this.equippedItems);
  }

  calculateTotalStats(): { attack: number; defense: number; health: number } {
    let totalStats = { attack: 0, defense: 0, health: 0 };
    
    this.equippedItems.forEach(item => {
      if (item.stats.attack) totalStats.attack += item.stats.attack;
      if (item.stats.defense) totalStats.defense += item.stats.defense;
      if (item.stats.health) totalStats.health += item.stats.health;
    });

    return totalStats;
  }

  upgradeItem(slot: string, gold: number): boolean {
    const item = this.equippedItems.get(slot);
    if (!item || item.level >= item.maxLevel) return false;

    const upgradeCost = Math.floor(item.upgradeCost * Math.pow(1.5, item.level));
    if (gold < upgradeCost) return false;

    item.level++;
    
    // 升级属性
    if (item.stats.attack) item.stats.attack = Math.floor(item.stats.attack * 1.2);
    if (item.stats.defense) item.stats.defense = Math.floor(item.stats.defense * 1.2);
    if (item.stats.health) item.stats.health = Math.floor(item.stats.health * 1.2);

    return true;
  }

  showUpgradeWindow(playerGold: number) {
    this.isVisible = true;
    this.upgradeWindowElement.style.display = 'block';
    this.updateUpgradeWindow(playerGold);
  }

  hideUpgradeWindow() {
    this.isVisible = false;
    this.upgradeWindowElement.style.display = 'none';
  }

  isUpgradeWindowVisible(): boolean {
    return this.isVisible;
  }

  private getRarityColor(rarity: string): string {
    const colors = {
      common: '#ffffff',
      uncommon: '#1eff00',
      rare: '#0070dd',
      epic: '#a335ee',
      legendary: '#ff8000'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  }

  private updateUpgradeWindow(playerGold: number) {
    let content = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <h2>装备升级</h2>
        <div>金币: ${playerGold} 🪙</div>
      </div>
      <div style="display: grid; gap: 15px;">
    `;

    this.equippedItems.forEach((item, slot) => {
      const upgradeCost = Math.floor(item.upgradeCost * Math.pow(1.5, item.level));
      const canUpgrade = item.level < item.maxLevel && playerGold >= upgradeCost;
      const rarityColor = this.getRarityColor(item.rarity);

      content += `
        <div style="padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; border: 1px solid ${rarityColor}">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="color: ${rarityColor}">${item.name} +${item.level}</div>
            <div>${slot}</div>
          </div>
          <div style="font-size: 14px; color: #888; margin-bottom: 10px">
            ${Object.entries(item.stats)
              .filter(([_, value]) => value !== undefined)
              .map(([stat, value]) => `${stat}: +${value}`)
              .join(' | ')}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 14px;">
              ${item.level < item.maxLevel ? 
                `升级费用: ${upgradeCost} 🪙` : 
                '<span style="color: #4CAF50">已达到最大等级</span>'}
            </div>
            ${item.level < item.maxLevel ? `
              <button onclick="window.game.upgradeEquipment('${slot}')"
                style="padding: 5px 10px; background: ${canUpgrade ? '#4CAF50' : '#666'}; 
                border: none; border-radius: 4px; color: white; cursor: ${canUpgrade ? 'pointer' : 'not-allowed'}">
                升级
              </button>
            ` : ''}
          </div>
        </div>
      `;
    });

    content += `
      </div>
      <div style="margin-top: 20px; text-align: right;">
        <button onclick="window.game.closeUpgrade()"
          style="padding: 8px 16px; background: #666; border: none; border-radius: 4px; color: white; cursor: pointer;">
          关闭
        </button>
      </div>
    `;

    this.upgradeWindowElement.innerHTML = content;
  }
}