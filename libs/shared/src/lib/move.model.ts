import {MoveEnum} from './move.enum';

export interface Move {
  id?: string;
  opponent1?: MoveEnum;
  opponent2?: MoveEnum;
  moveNumber: number;
}

export const MOVES_COLLECTION = 'Moves'
