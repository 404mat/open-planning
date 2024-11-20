import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  animals,
  colors,
} from 'unique-names-generator';

const customConfig: Config = {
  dictionaries: [adjectives, colors, animals],
  separator: '-',
  length: 3,
  style: 'lowerCase',
};

export function generateRoomId(): string {
  return uniqueNamesGenerator(customConfig);
}

export function isValidRoomId(roomId: string): boolean {
  // Allow alphanumeric characters, hyphens, and underscores
  // Must be between 3 and 30 characters
  // Must start and end with alphanumeric characters
  // Cannot have consecutive hyphens or underscores
  return (
    /^[a-zA-Z0-9][a-zA-Z0-9-_]{1,28}[a-zA-Z0-9]$/.test(roomId) &&
    !roomId.includes('--') &&
    !roomId.includes('__')
  );
}
