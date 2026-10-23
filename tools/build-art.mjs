import {drawKnight,drawSkeleton,drawWisp,drawBoss} from './draw-actors.mjs';
import {drawRoom,drawProps,drawFlames} from './draw-room.mjs';
await drawKnight();await drawSkeleton();await drawWisp();await drawBoss();await drawRoom();await drawProps();await drawFlames();
await import('./draw-ui.mjs');
await import('./draw-portrait-room.mjs');
