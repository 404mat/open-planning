import { FIBONACCI_SYSTEM, NUMBERS_SYSTEM, TSHIRT_SYSTEM } from './constants';

export function getVotingSystemvalues(type: string) {
  switch (type) {
    case 'fibonacci':
      return FIBONACCI_SYSTEM;
    case 'numbers':
      return NUMBERS_SYSTEM;
    case 'tshirt':
      return TSHIRT_SYSTEM;
    default:
      return FIBONACCI_SYSTEM;
  }
}
