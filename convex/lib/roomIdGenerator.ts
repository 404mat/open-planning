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

/**
 * Converts an arbitrary string into a valid room ID format.
 * If the input is null, undefined, or empty, generates a random ID.
 * Otherwise, formats the string:
 * - Converts to lowercase.
 * - Replaces non-alphanumeric characters (excluding hyphens/underscores) with hyphens.
 * - Collapses consecutive hyphens/underscores into a single hyphen.
 * - Removes leading/trailing hyphens/underscores.
 * - Truncates to 20 characters, ensuring it doesn't end with a hyphen/underscore.
 * - Ensures the final ID is at least 5 characters long (pads with '-room' if needed).
 * - Falls back to a generated ID if formatting results in an invalid state.
 * @param inputString The string to format.
 * @returns A formatted string guaranteed to be valid as a room ID.
 */
export function formatStringToRoomId(inputString: string): string {
  if (!inputString) {
    return generateRoomId();
  }

  let formatted = inputString
    .toLowerCase()
    // Replace possessive 's and other non-alphanumeric chars (keep existing hyphens/underscores)
    .replace(/[^a-z0-9_-]+/g, '-')
    // Collapse consecutive hyphens/underscores into one hyphen
    .replace(/[-_]+/g, '-')
    // Remove leading hyphens/underscores
    .replace(/^[_-]+/, '')
    // Remove trailing hyphens/underscores
    .replace(/[_-]+$/, '');

  // Truncate to 20 characters
  if (formatted.length > 20) {
    formatted = formatted.substring(0, 20);
    // Ensure it doesn't end with a hyphen/underscore after truncation
    formatted = formatted.replace(/[_-]+$/, '');
  }

  // Ensure minimum length of 5 characters
  if (formatted.length < 5) {
    // Append a default suffix and re-process potential issues
    formatted += '-room';
    // Re-truncate if appending made it too long
    if (formatted.length > 20) {
      formatted = formatted.substring(0, 20);
      // Ensure it doesn't end with a hyphen/underscore after truncation
      formatted = formatted.replace(/[_-]+$/, '');
    }
    // Ensure it doesn't start with hyphen/underscore if original was empty/invalid
    formatted = formatted.replace(/^[_-]+/, '');
  }

  // Final check: If somehow the string is still invalid (e.g., empty, too short after processing),
  // return a default valid ID. This covers edge cases.
  // Regex checks for 5-20 chars: starts/ends alphanumeric, middle allows -, _
  if (
    !/^[a-z0-9][a-z0-9-_]{3,18}[a-z0-9]$/.test(formatted) ||
    formatted.includes('--') ||
    formatted.includes('__')
  ) {
    // Fallback to a generated ID if formatting fails completely
    return generateRoomId();
  }

  return formatted;
}

/**
 * Appends a random 5-digit suffix to a given string.
 * @param inputString The string to append the suffix to.
 * @returns The string with the appended suffix (e.g., "my-string-12345").
 */
export function appendRandomSuffix(inputString: string): string {
  // Generate a random number between 10000 and 99999
  const randomSuffix = Math.floor(Math.random() * 90000) + 10000;
  return `${inputString}-${randomSuffix}`;
}
