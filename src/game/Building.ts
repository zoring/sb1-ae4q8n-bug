export interface Building {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sprite: string;
  color: string;
  description: string;
  type: 'shop' | 'inn' | 'blacksmith' | 'storage' | 'decoration';
  interactionRange?: number;
  level?: number;
  maxLevel?: number;
  upgradeCost?: number;
  effects?: {
    healAmount?: number;
    manaRegeneration?: number;
    expBonus?: number;
    goldBonus?: number;
  };
}