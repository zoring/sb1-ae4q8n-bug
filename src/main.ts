import './style.css';
import './styles/buildings.css';
import './styles/player.css';
import { Game } from './game/Game';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <canvas id="gameCanvas"></canvas>
`;

const game = new Game('gameCanvas');
game.start();