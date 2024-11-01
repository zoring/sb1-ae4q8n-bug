export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'weapon' | 'armor' | 'potion' | 'material' | 'accessory';
  icon: string;
  stats?: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
  };
  level?: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const ITEMS: { [key: string]: Item } = {
  wooden_sword: {
    id: 'wooden_sword',
    name: '木剑',
    description: '一把简单的木剑',
    price: 50,
    type: 'weapon',
    icon: '🗡️',
    stats: { attack: 5 },
    level: 1,
    rarity: 'common'
  },
  iron_sword: {
    id: 'iron_sword',
    name: '铁剑',
    description: '普通的铁剑，较为耐用',
    price: 150,
    type: 'weapon',
    icon: '⚔️',
    stats: { attack: 12 },
    level: 5,
    rarity: 'uncommon'
  },
  leather_armor: {
    id: 'leather_armor',
    name: '皮甲',
    description: '基础防具',
    price: 80,
    type: 'armor',
    icon: '🛡️',
    stats: { defense: 8 },
    level: 1,
    rarity: 'common'
  },
  iron_armor: {
    id: 'iron_armor',
    name: '铁甲',
    description: '坚固的铁甲',
    price: 200,
    type: 'armor',
    icon: '🛡️',
    stats: { defense: 15 },
    level: 5,
    rarity: 'uncommon'
  },
  health_potion: {
    id: 'health_potion',
    name: '生命药水',
    description: '恢复100点生命值',
    price: 30,
    type: 'potion',
    icon: '🧪',
    stats: { health: 100 },
    rarity: 'common'
  },
  mana_potion: {
    id: 'mana_potion',
    name: '魔法药水',
    description: '恢复50点魔法值',
    price: 40,
    type: 'potion',
    icon: '🧪',
    stats: { mana: 50 },
    rarity: 'common'
  },
  iron_ore: {
    id: 'iron_ore',
    name: '铁矿石',
    description: '制作装备的材料',
    price: 20,
    type: 'material',
    icon: '⛏️',
    rarity: 'common'
  },
  magic_crystal: {
    id: 'magic_crystal',
    name: '魔法水晶',
    description: '蕴含魔法能量的水晶',
    price: 100,
    type: 'material',
    icon: '💎',
    rarity: 'rare'
  },
  lucky_charm: {
    id: 'lucky_charm',
    name: '幸运符咒',
    description: '带来好运的护身符',
    price: 300,
    type: 'accessory',
    icon: '🍀',
    stats: { defense: 5 },
    rarity: 'rare'
  },
  dragon_scale: {
    id: 'dragon_scale',
    name: '龙鳞',
    description: '珍贵的龙鳞，可用于制作高级装备',
    price: 1000,
    type: 'material',
    icon: '🐉',
    rarity: 'epic'
  }
}