import { Item, ITEMS } from './items/Item';

interface InventorySlot {
  item: Item;
  quantity: number;
}

export class Inventory {
  private items: Map<string, InventorySlot> = new Map();
  private gold: number = 100;
  private maxSlots: number = 20;
  private inventoryWindowElement: HTMLDivElement;
  private isVisible: boolean = false;

  constructor() {
    this.inventoryWindowElement = document.createElement('div');
    this.setupInventoryWindow();
    document.body.appendChild(this.inventoryWindowElement);
  }

  private setupInventoryWindow() {
    Object.assign(this.inventoryWindowElement.style, {
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

  showInventoryWindow() {
    this.isVisible = true;
    this.updateInventoryWindow();
    this.inventoryWindowElement.style.display = 'block';
  }

  hideInventoryWindow() {
    this.isVisible = false;
    this.inventoryWindowElement.style.display = 'none';
  }

  isInventoryWindowVisible(): boolean {
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

  private updateInventoryWindow() {
    let content = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <h2>物品栏 (${this.items.size}/${this.maxSlots})</h2>
        <div>金币: ${this.gold} 🪙</div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-height: 400px; overflow-y: auto;">
    `;

    this.items.forEach((slot, itemId) => {
      const rarityColor = this.getRarityColor(slot.item.rarity);
      content += `
        <div style="padding: 10px; background: rgba(255,255,255,0.1); border-radius: 4px; border: 1px solid ${rarityColor}">
          <div style="color: ${rarityColor}">
            ${slot.item.icon} ${slot.item.name}
          </div>
          <div style="font-size: 12px; color: #888;">数量: ${slot.quantity}</div>
          <div style="font-size: 12px; color: #999; margin-top: 5px;">${slot.item.description}</div>
          ${slot.item.type === 'potion' ? `
            <button onclick="window.game.useItem('${itemId}')"
              style="width: 100%; margin-top: 5px; padding: 4px; background: #4CAF50; border: none; border-radius: 4px; color: white; cursor: pointer;">
              使用
            </button>
          ` : ''}
        </div>
      `;
    });

    content += `
      </div>
      <div style="margin-top: 20px; text-align: right;">
        <button onclick="window.game.closeInventory()"
          style="padding: 8px 16px; background: #666; border: none; border-radius: 4px; color: white; cursor: pointer;">
          关闭
        </button>
      </div>
    `;

    this.inventoryWindowElement.innerHTML = content;
  }

  addItem(item: Item, quantity: number = 1): boolean {
    if (this.items.size >= this.maxSlots && !this.items.has(item.id)) {
      this.showMessage('物品栏已满！', 'common');
      return false;
    }

    const existingSlot = this.items.get(item.id);
    if (existingSlot) {
      existingSlot.quantity += quantity;
    } else {
      this.items.set(item.id, { item, quantity });
    }

    this.showMessage(`获得 ${item.name} x${quantity}`, item.rarity);
    if (this.isVisible) {
      this.updateInventoryWindow();
    }
    return true;
  }

  removeItem(itemId: string, quantity: number = 1): boolean {
    const slot = this.items.get(itemId);
    if (!slot || slot.quantity < quantity) return false;

    slot.quantity -= quantity;
    if (slot.quantity <= 0) {
      this.items.delete(itemId);
    }

    if (this.isVisible) {
      this.updateInventoryWindow();
    }
    return true;
  }

  useItem(itemId: string): boolean {
    const slot = this.items.get(itemId);
    if (!slot) return false;

    if (slot.item.type === 'potion') {
      // 使用药水效果
      if (slot.item.stats?.health) {
        // TODO: 恢复生命值
        this.showMessage(`使用了 ${slot.item.name}，恢复了 ${slot.item.stats.health} 点生命值`, slot.item.rarity);
      }
      if (slot.item.stats?.mana) {
        // TODO: 恢复魔法值
        this.showMessage(`使用了 ${slot.item.name}，恢复了 ${slot.item.stats.mana} 点魔法值`, slot.item.rarity);
      }
      return this.removeItem(itemId);
    }
    return false;
  }

  private showMessage(text: string, rarity: string) {
    const message = document.createElement('div');
    Object.assign(message.style, {
      position: 'absolute',
      top: '20%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '10px 20px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: this.getRarityColor(rarity),
      borderRadius: '4px',
      fontFamily: 'Arial',
      fontSize: '16px',
      zIndex: '2000'
    });
    
    message.textContent = text;
    document.body.appendChild(message);
    setTimeout(() => document.body.removeChild(message), 2000);
  }

  getItemQuantity(itemId: string): number {
    return this.items.get(itemId)?.quantity || 0;
  }

  getGold(): number {
    return this.gold;
  }

  addGold(amount: number) {
    this.gold += amount;
    if (this.isVisible) {
      this.updateInventoryWindow();
    }
  }

  removeGold(amount: number): boolean {
    if (this.gold >= amount) {
      this.gold -= amount;
      if (this.isVisible) {
        this.updateInventoryWindow();
      }
      return true;
    }
    return false;
  }

  getAllItems(): Array<{ item: string; quantity: number }> {
    return Array.from(this.items.entries()).map(([itemId, slot]) => ({
      item: itemId,
      quantity: slot.quantity
    }));
  }
}