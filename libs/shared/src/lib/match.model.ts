import {MoveEnum} from './move.enum';

export interface Match {
  id?: string;
  isOpen: boolean;
  creator: string;
  opponent1: string;
  opponent2?: string;
  currentMoveNumber: number;
  moves: {opponent1: MoveEnum, opponent2: MoveEnum, moveNumber: number}[];
  winner?: string;
}

export const MATCH_COLLECTION = 'Matches'
