import { Building } from './Building';
import '../styles/buildings.css';

export interface SceneConfig {
  id: string;
  name: string;
  background: string;
  width: number;
  height: number;
  spawnMonsters: boolean;
  description: string;
  buildings?: Building[];
}

export class Scene {
  private config: SceneConfig;
  private ctx: CanvasRenderingContext2D;
  private hoveredBuilding: Building | null = null;
  private buildingElements: Map<string, HTMLDivElement> = new Map();

  constructor(config: SceneConfig, ctx: CanvasRenderingContext2D) {
    this.config = config;
    this.ctx = ctx;
    this.setupBuildingInteraction();
    this.createBuildingElements();
  }

  private setupBuildingInteraction() {
    const canvas = this.ctx.canvas;
    
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.hoveredBuilding = null;
      if (this.config.buildings) {
        for (const building of this.config.buildings) {
          if (x >= building.x && x <= building.x + building.width &&
              y >= building.y && y <= building.y + building.height) {
            this.hoveredBuilding = building;
            break;
          }
        }
      }
    });
  }

  private createBuildingElements() {
    // 清除现有的建筑物元素
    this.buildingElements.forEach(element => element.remove());
    this.buildingElements.clear();

    if (!this.config.buildings) return;

    const container = this.ctx.canvas.parentElement;
    if (!container) return;

    // 创建建筑物容器
    const buildingsContainer = document.createElement('div');
    buildingsContainer.className = 'buildings-container';
    buildingsContainer.style.position = 'absolute';
    buildingsContainer.style.top = '0';
    buildingsContainer.style.left = '0';
    buildingsContainer.style.width = '100%';
    buildingsContainer.style.height = '100%';
    buildingsContainer.style.pointerEvents = 'none';
    container.appendChild(buildingsContainer);

    this.config.buildings.forEach(building => {
      const element = document.createElement('div');
      element.className = `building building-${building.type}`;
      Object.assign(element.style, {
        position: 'absolute',
        left: `${building.x}px`,
        top: `${building.y}px`,
        width: `${building.width}px`,
        height: `${building.height}px`,
        pointerEvents: 'auto'
      });

      // 建筑物名称
      const name = document.createElement('div');
      name.className = 'building-name';
      name.textContent = building.name;
      element.appendChild(name);

      // 建筑物图标
      const sprite = document.createElement('div');
      sprite.className = 'building-sprite';
      sprite.textContent = building.sprite;
      element.appendChild(sprite);

      // 建筑物提示框
      const tooltip = document.createElement('div');
      tooltip.className = 'building-tooltip';
      tooltip.textContent = building.description;
      element.appendChild(tooltip);

      // 建筑物等级
      if (building.level) {
        const level = document.createElement('div');
        level.className = 'building-level';
        level.textContent = `Lv.${building.level}`;
        element.appendChild(level);
      }

      // 建筑物效果图标
      if (building.effects) {
        const effect = document.createElement('div');
        effect.className = 'building-effect';
        effect.textContent = this.getEffectIcon(building.effects);
        element.appendChild(effect);
      }

      buildingsContainer.appendChild(element);
      this.buildingElements.set(building.id, element);
    });
  }

  draw() {
    // 绘制场景背景
    this.ctx.fillStyle = this.config.background;
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);

    // 绘制场景名称
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(this.config.name, 20, 30);
  }

  private getEffectIcon(effects: any): string {
    if (effects.healAmount) return '❤️';
    if (effects.manaRegeneration) return '✨';
    if (effects.expBonus) return '📚';
    if (effects.goldBonus) return '💰';
    return '🎯';
  }

  canSpawnMonsters(): boolean {
    return this.config.spawnMonsters;
  }

  getName(): string {
    return this.config.name;
  }

  getId(): string {
    return this.config.id;
  }

  getDescription(): string {
    return this.config.description;
  }

  getBuildings(): Building[] {
    return this.config.buildings || [];
  }

  getHoveredBuilding(): Building | null {
    return this.hoveredBuilding;
  }
}