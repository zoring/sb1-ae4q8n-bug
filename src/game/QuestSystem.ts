import { Quest, QuestRequirement } from './Quest';
import { Item, ITEMS } from './items/Item';

interface QuestReward {
  gold: number;
  exp: number;
  items?: Item[];
}

export class QuestSystem {
  private quests: Quest[] = [];
  private activeQuests: Quest[] = [];
  private completedQuests: Set<string> = new Set();
  private questLogElement: HTMLDivElement;
  private questRewards: Map<string, QuestReward> = new Map();

  constructor() {
    this.setupInitialQuests();
    this.setupQuestLog();
  }

  private setupInitialQuests() {
    const mainQuests = [
      {
        id: 'main_quest_1',
        title: '初来乍到',
        description: '与村民对话，了解这个世界。',
        requirements: [{ type: 'talk', target: '村民', count: 1 }],
        reward: {
          gold: 100,
          exp: 100,
          items: [ITEMS.health_potion]
        }
      },
      {
        id: 'main_quest_2',
        title: '装备强化',
        description: '在铁匠铺强化一次装备。',
        requirements: [{ type: 'upgrade', target: 'equipment', count: 1 }],
        reward: {
          gold: 200,
          exp: 150,
          items: [ITEMS.iron_ore]
        }
      }
    ];

    const dailyQuests = [
      {
        id: 'daily_quest_1',
        title: '清理荒野',
        description: '在荒野击败3只怪物。',
        requirements: [{ type: 'kill', target: 'monster', count: 3 }],
        reward: {
          gold: 150,
          exp: 200
        }
      },
      {
        id: 'daily_quest_2',
        title: '收集材料',
        description: '收集3个铁矿石。',
        requirements: [{ type: 'collect', target: 'iron_ore', count: 3 }],
        reward: {
          gold: 120,
          exp: 150,
          items: [ITEMS.health_potion]
        }
      }
    ];

    const sideQuests = [
      {
        id: 'side_quest_1',
        title: '巡逻任务',
        description: '帮助守卫巡逻村庄。',
        requirements: [
          { type: 'talk', target: '守卫', count: 1 },
          { type: 'visit', target: 'checkpoint', count: 3 }
        ],
        reward: {
          gold: 200,
          exp: 180,
          items: [ITEMS.iron_sword]
        }
      }
    ];

    [...mainQuests, ...dailyQuests, ...sideQuests].forEach(questData => {
      const quest = new Quest(
        questData.id,
        questData.title,
        questData.description,
        questData.requirements,
        questData.reward.gold
      );
      this.quests.push(quest);
      this.questRewards.set(questData.id, questData.reward);
    });
  }

  private setupQuestLog() {
    this.questLogElement = document.createElement('div');
    Object.assign(this.questLogElement.style, {
      position: 'absolute',
      top: '50%',
      right: '20px',
      transform: 'translateY(-50%)',
      width: '250px',
      maxHeight: '400px',
      overflowY: 'auto',
      padding: '15px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      borderRadius: '8px',
      fontFamily: 'Arial',
      fontSize: '14px',
      zIndex: '900'
    });
    document.body.appendChild(this.questLogElement);
    this.updateQuestLog();
  }

  public acceptQuest(questId: string): boolean {
    const quest = this.quests.find(q => 
      q.getId() === questId && 
      !this.activeQuests.includes(q) && 
      !this.completedQuests.has(questId)
    );

    if (quest) {
      this.activeQuests.push(quest);
      this.updateQuestLog();
      this.showQuestMessage(`接受任务：${quest.getTitle()}`, 'accept');
      return true;
    }
    return false;
  }

  public updateProgress(type: string, target: string): void {
    this.activeQuests.forEach(quest => {
      quest.updateProgress(type, target);
      if (quest.isCompleted()) {
        this.completeQuest(quest.getId());
      }
    });
    this.updateQuestLog();
  }

  private completeQuest(questId: string): void {
    const questIndex = this.activeQuests.findIndex(q => q.getId() === questId);
    if (questIndex !== -1) {
      const quest = this.activeQuests[questIndex];
      if (quest.isCompleted()) {
        const reward = this.questRewards.get(questId);
        if (reward) {
          this.giveReward(reward);
          this.completedQuests.add(questId);
          this.activeQuests.splice(questIndex, 1);
          this.showQuestCompleteMessage(quest, reward);
        }
      }
    }
  }

  private giveReward(reward: QuestReward) {
    // TODO: 实现奖励发放逻辑
    // this.player.gainExp(reward.exp);
    // this.player.gainGold(reward.gold);
    // if (reward.items) {
    //   reward.items.forEach(item => this.player.inventory.addItem(item));
    // }
  }

  private showQuestMessage(message: string, type: 'accept' | 'progress' | 'complete') {
    const colors = {
      accept: '#4CAF50',
      progress: '#2196F3',
      complete: '#FFC107'
    };

    const messageElement = document.createElement('div');
    Object.assign(messageElement.style, {
      position: 'absolute',
      top: '20%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '10px 20px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: colors[type],
      borderRadius: '4px',
      fontFamily: 'Arial',
      fontSize: '16px',
      zIndex: '2000'
    });
    
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    setTimeout(() => document.body.removeChild(messageElement), 2000);
  }

  private showQuestCompleteMessage(quest: Quest, reward: QuestReward) {
    const message = document.createElement('div');
    Object.assign(message.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: '#FFC107',
      borderRadius: '8px',
      fontFamily: 'Arial',
      fontSize: '18px',
      textAlign: 'center',
      zIndex: '2000'
    });
    
    let rewardText = `
      <div style="color: #4CAF50; font-size: 24px; margin-bottom: 10px">任务完成！</div>
      <div style="margin-bottom: 15px">${quest.getTitle()}</div>
      <div style="color: #fff; font-size: 16px;">
        获得奖励：<br>
        ${reward.gold} 金币<br>
        ${reward.exp} 经验值
    `;

    if (reward.items && reward.items.length > 0) {
      rewardText += '<br>物品：<br>' + reward.items.map(item => 
        `${item.icon} ${item.name}`
      ).join('<br>');
    }

    rewardText += '</div>';
    
    message.innerHTML = rewardText;
    document.body.appendChild(message);
    setTimeout(() => document.body.removeChild(message), 3000);
  }

  private updateQuestLog(): void {
    if (this.activeQuests.length === 0) {
      this.questLogElement.innerHTML = `
        <h3 style="margin: 0 0 10px 0">任务日志</h3>
        <div style="color: #666">无活动任务</div>
      `;
      return;
    }

    this.questLogElement.innerHTML = `
      <h3 style="margin: 0 0 10px 0">任务日志</h3>
      ${this.activeQuests.map(quest => `
        <div style="margin-bottom: 15px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 4px;">
          <div style="color: #4CAF50; margin-bottom: 5px">${quest.getTitle()}</div>
          <div style="font-size: 12px; color: #999; margin-bottom: 5px">${quest.getDescription()}</div>
          <div style="font-size: 12px">
            ${quest.getRequirements().map(req => {
              const current = req.currentCount || 0;
              const total = req.count || 1;
              const progress = (current / total) * 100;
              return `
                <div style="margin-bottom: 5px">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 2px">
                    <span>${this.getRequirementText(req)}</span>
                    <span>${current}/${total}</span>
                  </div>
                  <div style="background: #333; height: 4px; border-radius: 2px;">
                    <div style="width: ${progress}%; height: 100%; background: #4CAF50; border-radius: 2px;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
    `;
  }

  private getRequirementText(req: QuestRequirement): string {
    switch (req.type) {
      case 'talk':
        return `与${req.target}对话`;
      case 'kill':
        return `击败${req.target}`;
      case 'collect':
        return `收集${req.target}`;
      case 'visit':
        return `访问${req.target}`;
      case 'upgrade':
        return `升级${req.target}`;
      default:
        return req.target;
    }
  }

  public getAvailableQuests(): Quest[] {
    return this.quests.filter(quest => 
      !this.activeQuests.includes(quest) && 
      !this.completedQuests.has(quest.getId())
    );
  }

  public getActiveQuests(): Quest[] {
    return this.activeQuests;
  }

  public getCompletedQuests(): string[] {
    return Array.from(this.completedQuests);
  }
}