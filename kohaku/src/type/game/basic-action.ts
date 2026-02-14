export enum BasicAction {
  Fight = 'fight',
  Investigate = 'investigate',
  Evade = 'evade',
  Move = 'move',
  Parley = 'parley',
  Resign = 'resign',
  Play = 'play',
  Draw = 'draw',
  Resource = 'resource',
}

export type TestingBasicAction =
  | BasicAction.Fight
  | BasicAction.Investigate
  | BasicAction.Evade
  | BasicAction.Parley;
