import { Item, ITEMS } from './items/Item';
import { Inventory } from './Inventory';

export class TradeSystem {
  private tradeWindowElement: HTMLDivElement;
  private inventory: Inventory;
  private isVisible: boolean = false;
  private currentTrader: string = '';

  constructor(inventory: Inventory) {
    this.inventory = inventory;
    this.tradeWindowElement = document.createElement('div');
    this.setupTradeWindow();
    document.body.appendChild(this.tradeWindowElement);
  }

  private setupTradeWindow() {
    Object.assign(this.tradeWindowElement.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '800px',
      padding: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      borderRadius: '8px',
      fontFamily: 'Arial',
      display: 'none',
      zIndex: '1000'
    });
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

  private getItemCard(item: Item, quantity?: number, isSelling: boolean = false): string {
    const rarityColor = this.getRarityColor(item.rarity);
    const price = isSelling ? Math.floor(item.price * 0.7) : item.price;
    const buttonStyle = isSelling ? 
      'background: #f44336' : 
      'background: #4CAF50';

    return `
      <div style="display: flex; justify-content: space-between; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 4px; border: 1px solid ${rarityColor}">
        <div>
          <div style="color: ${rarityColor}">
            ${item.icon} ${item.name} ${quantity ? `x${quantity}` : ''}
            ${item.level ? `<span style="color: #888">[等级 ${item.level}]</span>` : ''}
          </div>
          <div style="font-size: 12px; color: #999; margin: 4px 0">${item.description}</div>
          ${item.stats ? `
            <div style="font-size: 12px; color: #888">
              ${Object.entries(item.stats).map(([stat, value]) => `
                ${stat === 'attack' ? '攻击力' :
                  stat === 'defense' ? '防御力' :
                  stat === 'health' ? '生命值' :
                  stat === 'mana' ? '魔法值' : stat}: +${value}
              `).join(' ')}
            </div>
          ` : ''}
        </div>
        <div style="text-align: right">
          <div style="margin-bottom: 4px;">${price} 🪙</div>
          <button onclick="window.game.${isSelling ? 'sellItem' : 'buyItem'}('${item.id}')"
            style="padding: 4px 8px; ${buttonStyle}; border: none; border-radius: 4px; color: white; cursor: pointer;">
            ${isSelling ? '出售' : '购买'}
          </button>
        </div>
      </div>
    `;
  }

  public showTradeWindow(traderName: string) {
    this.currentTrader = traderName;
    this.isVisible = true;
    this.updateTradeWindow();
    this.tradeWindowElement.style.display = 'block';
  }

  public hideTradeWindow() {
    this.isVisible = false;
    this.tradeWindowElement.style.display = 'none';
  }

  public isTradeWindowVisible(): boolean {
    return this.isVisible;
  }

  private updateTradeWindow() {
    const shopItems = Object.values(ITEMS).filter(item => 
      this.currentTrader === '商人' ? true : item.type === 'potion'
    );

    this.tradeWindowElement.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <h2>${this.currentTrader}的商店</h2>
        <div>你的金币: ${this.inventory.getGold()} 🪙</div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <h3 style="margin-bottom: 10px">商店物品</h3>
          <div style="display: grid; gap: 10px; max-height: 500px; overflow-y: auto;">
            ${shopItems.map(item => this.getItemCard(item, undefined, false)).join('')}
          </div>
        </div>
        <div>
          <h3 style="margin-bottom: 10px">你的物品</h3>
          <div style="display: grid; gap: 10px; max-height: 500px; overflow-y: auto;">
            ${this.inventory.getAllItems().map(({item: itemId, quantity}) => 
              this.getItemCard(ITEMS[itemId], quantity, true)
            ).join('')}
          </div>
        </div>
      </div>
      <div style="margin-top: 20px; text-align: right;">
        <button onclick="window.game.closeTrade()"
          style="padding: 8px 16px; background: #666; border: none; border-radius: 4px; color: white; cursor: pointer;">
          关闭
        </button>
      </div>
    `;
  }

  public buyItem(itemId: string) {
    const item = ITEMS[itemId];
    if (item && this.inventory.getGold() >= item.price) {
      this.inventory.removeGold(item.price);
      this.inventory.addItem(item);
      this.updateTradeWindow();
      this.showMessage(`购买了 ${item.name}`, item.rarity);
    } else {
      this.showMessage('金币不足！', 'common');
    }
  }

  public sellItem(itemId: string) {
    const item = ITEMS[itemId];
    if (item && this.inventory.removeItem(itemId)) {
      const sellPrice = Math.floor(item.price * 0.7);
      this.inventory.addGold(sellPrice);
      this.updateTradeWindow();
      this.showMessage(`出售了 ${item.name}`, item.rarity);
    }
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
}