import {MoveEnum} from './move.enum';

export const matchCheck = (opponent1Move: MoveEnum, opponent2Move: MoveEnum): 'opponent1' | 'opponent2' | 'tie' => {
  if (opponent1Move === opponent2Move) {
    return 'tie';
  }

  if (opponent1Move === MoveEnum.ROCK && opponent2Move === MoveEnum.PAPER) {
    return 'opponent2';
  }

  if (opponent1Move === MoveEnum.ROCK && opponent2Move === MoveEnum.SCISSOR) {
    return 'opponent1';
  }

  if (opponent1Move === MoveEnum.PAPER && opponent2Move === MoveEnum.ROCK) {
    return 'opponent1';
  }

  if (opponent1Move === MoveEnum.PAPER && opponent2Move === MoveEnum.SCISSOR) {
    return 'opponent2';
  }

  if (opponent1Move === MoveEnum.SCISSOR && opponent2Move === MoveEnum.ROCK) {
    return 'opponent2';
  }

  if (opponent1Move === MoveEnum.SCISSOR && opponent2Move === MoveEnum.PAPER) {
    return 'opponent1';
  }

  return 'tie';
}
