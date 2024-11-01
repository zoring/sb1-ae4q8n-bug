export interface Dialogue {
  npcName: string;
  messages: string[];
}

export class DialogueSystem {
  private dialogueElement: HTMLDivElement;
  private currentDialogue: Dialogue | null = null;
  private currentMessageIndex: number = 0;

  constructor() {
    this.dialogueElement = document.createElement('div');
    this.setupDialogueBox();
    document.body.appendChild(this.dialogueElement);
  }

  private setupDialogueBox() {
    Object.assign(this.dialogueElement.style, {
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
      fontSize: '16px',
      display: 'none',
      zIndex: '1000'
    });
  }

  startDialogue(dialogue: Dialogue) {
    this.currentDialogue = dialogue;
    this.currentMessageIndex = 0;
    this.showCurrentMessage();
  }

  nextMessage(): boolean {
    if (!this.currentDialogue) return false;

    this.currentMessageIndex++;
    if (this.currentMessageIndex >= this.currentDialogue.messages.length) {
      this.endDialogue();
      return false;
    }

    this.showCurrentMessage();
    return true;
  }

  private showCurrentMessage() {
    if (!this.currentDialogue) return;

    const message = this.currentDialogue.messages[this.currentMessageIndex];
    this.dialogueElement.style.display = 'block';
    this.dialogueElement.innerHTML = `
      <div style="margin-bottom: 10px; color: #4CAF50;">
        ${this.currentDialogue.npcName}:
      </div>
      <div>${message}</div>
      <div style="margin-top: 10px; color: #999; font-size: 14px;">
        按空格键继续...
      </div>
    `;
  }

  private endDialogue() {
    this.currentDialogue = null;
    this.dialogueElement.style.display = 'none';
  }

  isDialogueActive(): boolean {
    return this.currentDialogue !== null;
  }
}