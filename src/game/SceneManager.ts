import { Scene, SceneConfig } from './Scene';
import { Building } from './Building';

export class SceneManager {
  private scenes: Map<string, SceneConfig> = new Map();
  private currentScene: Scene;
  private ctx: CanvasRenderingContext2D;
  private transitionElement: HTMLDivElement;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.setupScenes();
    this.currentScene = new Scene(this.scenes.get('village')!, ctx);
    this.setupTransitionUI();
  }

  private setupScenes() {
    const villageBuildings: Building[] = [
      {
        id: 'shop',
        name: '杂货店',
        x: 100,
        y: 150,
        width: 80,
        height: 80,
        sprite: '🏪',
        color: '#795548',
        description: '村里的杂货店，可以买到各种日常用品和补给。',
        type: 'shop',
        level: 1,
        maxLevel: 5,
        upgradeCost: 1000,
        effects: {
          goldBonus: 0.1
        }
      },
      {
        id: 'inn',
        name: '旅馆',
        x: 250,
        y: 200,
        width: 100,
        height: 100,
        sprite: '🏨',
        color: '#8d6e63',
        description: '温馨的旅馆，可以在这里休息恢复体力。',
        type: 'inn',
        level: 1,
        maxLevel: 5,
        upgradeCost: 800,
        effects: {
          healAmount: 50,
          manaRegeneration: 20
        }
      },
      {
        id: 'blacksmith',
        name: '铁匠铺',
        x: 450,
        y: 180,
        width: 90,
        height: 90,
        sprite: '⚒️',
        color: '#6d4c41',
        description: '村里的铁匠铺，可以在这里强化装备。',
        type: 'blacksmith',
        level: 1,
        maxLevel: 5,
        upgradeCost: 1200
      },
      {
        id: 'storage',
        name: '仓库',
        x: 600,
        y: 150,
        width: 70,
        height: 70,
        sprite: '🏛️',
        color: '#5d4037',
        description: '村里的公共仓库，可以存放物品。',
        type: 'storage',
        level: 1,
        maxLevel: 3,
        upgradeCost: 500
      },
      {
        id: 'fountain',
        name: '喷泉',
        x: 350,
        y: 350,
        width: 60,
        height: 60,
        sprite: '⛲',
        color: '#4e342e',
        description: '村子中心的喷泉，是村民们休息聊天的地方。',
        type: 'decoration',
        effects: {
          manaRegeneration: 5
        }
      },
      {
        id: 'garden',
        name: '花园',
        x: 180,
        y: 400,
        width: 120,
        height: 80,
        sprite: '🌺',
        color: '#3e2723',
        description: '美丽的花园，种植着各种花草。',
        type: 'decoration',
        effects: {
          expBonus: 0.05
        }
      }
    ];

    const scenes: SceneConfig[] = [
      {
        id: 'village',
        name: '和平村',
        background: '#4a9375',
        width: 800,
        height: 600,
        spawnMonsters: false,
        description: '一个宁静祥和的村庄，这里不会出现怪物。',
        buildings: villageBuildings
      },
      {
        id: 'wilderness',
        name: '危险荒野',
        background: '#2d4a1e',
        width: 800,
        height: 600,
        spawnMonsters: true,
        description: '充满危险的荒野地带，时刻警惕怪物的袭击。'
      }
    ];

    scenes.forEach(scene => this.scenes.set(scene.id, scene));
  }

  private setupTransitionUI() {
    this.transitionElement = document.createElement('div');
    Object.assign(this.transitionElement.style, {
      position: 'absolute',
      top: '10px',
      right: '10px',
      padding: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      borderRadius: '8px',
      fontFamily: 'Arial',
      fontSize: '14px',
      zIndex: '1000'
    });

    document.body.appendChild(this.transitionElement);
    this.updateTransitionUI();
  }

  private updateTransitionUI() {
    const currentSceneId = this.currentScene.getId();
    const targetSceneId = currentSceneId === 'village' ? 'wilderness' : 'village';
    const targetScene = this.scenes.get(targetSceneId)!;

    this.transitionElement.innerHTML = `
      <div style="margin-bottom: 5px">当前位置: ${this.currentScene.getName()}</div>
      <button onclick="window.game.switchScene('${targetSceneId}')"
        style="padding: 5px 10px; background: #4CAF50; border: none; border-radius: 4px; color: white; cursor: pointer;">
        前往${targetScene.name}
      </button>
    `;
  }

  switchScene(sceneId: string) {
    const sceneConfig = this.scenes.get(sceneId);
    if (!sceneConfig) return;

    const oldScene = this.currentScene;
    this.currentScene = new Scene(sceneConfig, this.ctx);
    
    this.showTransitionMessage(oldScene.getName(), this.currentScene.getName());
    this.updateTransitionUI();
  }

  private showTransitionMessage(fromScene: string, toScene: string) {
    const message = document.createElement('div');
    Object.assign(message.style, {
      position: 'absolute',
      top: '50%',
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
      <div>离开 ${fromScene}</div>
      <div style="margin: 10px 0">↓</div>
      <div>进入 ${toScene}</div>
    `;
    
    document.body.appendChild(message);
    setTimeout(() => document.body.removeChild(message), 2000);
  }

  getCurrentScene(): Scene {
    return this.currentScene;
  }

  draw() {
    this.currentScene.draw();
  }
}