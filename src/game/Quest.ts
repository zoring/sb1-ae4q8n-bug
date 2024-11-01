export interface QuestRequirement {
  type: 'talk' | 'kill' | 'collect' | 'visit' | 'upgrade' | 'trade' | 'escort' | 'defend';
  target: string;
  count?: number;
  currentCount?: number;
  description?: string;
}

export class Quest {
  private id: string;
  private title: string;
  private description: string;
  private requirements: QuestRequirement[];
  private completed: boolean;
  private reward: number;
  private type: 'main' | 'side' | 'daily' | 'weekly';
  private timeLimit?: number;
  private startTime?: number;
  private chainedQuestId?: string;
  private requiredLevel: number;
  private reputation: number;

  constructor(
    id: string,
    title: string,
    description: string,
    requirements: QuestRequirement[],
    reward: number,
    type: 'main' | 'side' | 'daily' | 'weekly' = 'side',
    requiredLevel: number = 1,
    timeLimit?: number,
    chainedQuestId?: string
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.requirements = requirements.map(req => ({
      ...req,
      currentCount: 0
    }));
    this.completed = false;
    this.reward = reward;
    this.type = type;
    this.requiredLevel = requiredLevel;
    this.timeLimit = timeLimit;
    this.chainedQuestId = chainedQuestId;
    this.reputation = 0;

    if (timeLimit) {
      this.startTime = Date.now();
    }
  }

  public getId(): string {
    return this.id;
  }

  public getTitle(): string {
    return this.title;
  }

  public getDescription(): string {
    return this.description;
  }

  public getRequirements(): QuestRequirement[] {
    return this.requirements;
  }

  public isCompleted(): boolean {
    return this.completed;
  }

  public getReward(): number {
    return this.reward;
  }

  public getType(): string {
    return this.type;
  }

  public getRequiredLevel(): number {
    return this.requiredLevel;
  }

  public getChainedQuestId(): string | undefined {
    return this.chainedQuestId;
  }

  public getReputation(): number {
    return this.reputation;
  }

  public getRemainingTime(): number | undefined {
    if (!this.timeLimit || !this.startTime) return undefined;
    const elapsed = Date.now() - this.startTime;
    return Math.max(0, this.timeLimit - elapsed);
  }

  public isExpired(): boolean {
    if (!this.timeLimit || !this.startTime) return false;
    return Date.now() - this.startTime > this.timeLimit;
  }

  public updateProgress(type: string, target: string): void {
    if (this.completed || this.isExpired()) return;

    const requirement = this.requirements.find(
      req => req.type === type && req.target === target
    );

    if (requirement && requirement.currentCount !== undefined && requirement.count) {
      requirement.currentCount = Math.min(requirement.count, (requirement.currentCount + 1));
      this.checkCompletion();
    }
  }

  private checkCompletion(): void {
    this.completed = this.requirements.every(req => {
      if (req.count) {
        return (req.currentCount || 0) >= req.count;
      }
      return req.currentCount === 1;
    });

    if (this.completed) {
      this.calculateReputation();
    }
  }

  private calculateReputation(): void {
    // 基础声望值
    let baseReputation = 10;

    // 根据任务类型调整声望
    switch (this.type) {
      case 'main':
        baseReputation *= 2;
        break;
      case 'daily':
        baseReputation *= 0.5;
        break;
      case 'weekly':
        baseReputation *= 1.5;
        break;
    }

    // 根据任务难度（需求数量）调整声望
    const totalRequirements = this.requirements.reduce((sum, req) => sum + (req.count || 1), 0);
    baseReputation *= (1 + totalRequirements * 0.1);

    // 如果是限时任务且提前完成，给予额外声望奖励
    if (this.timeLimit && this.startTime) {
      const timeUsed = Date.now() - this.startTime;
      const timeRatio = timeUsed / this.timeLimit;
      if (timeRatio < 0.8) {
        baseReputation *= (1 + (0.8 - timeRatio));
      }
    }

    this.reputation = Math.floor(baseReputation);
  }

  public getProgress(): string {
    return this.requirements.map(req => {
      const current = req.currentCount || 0;
      const total = req.count || 1;
      const description = req.description || this.getDefaultDescription(req);
      return `${description}: ${current}/${total}`;
    }).join('\n');
  }

  private getDefaultDescription(req: QuestRequirement): string {
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
      case 'trade':
        return `与${req.target}交易`;
      case 'escort':
        return `护送${req.target}`;
      case 'defend':
        return `保护${req.target}`;
      default:
        return req.target;
    }
  }

  public reset(): void {
    if (this.type === 'daily' || this.type === 'weekly') {
      this.completed = false;
      this.requirements.forEach(req => {
        req.currentCount = 0;
      });
      if (this.timeLimit) {
        this.startTime = Date.now();
      }
    }
  }
}