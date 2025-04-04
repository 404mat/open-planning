/**
 * Retrieves a value from localStorage for a given key.
 *
 * @param key The key to retrieve from localStorage.
 * @returns The string value if the key exists and its value is not empty, otherwise null.
 */
export function getLocalStorageValue(key: string): string | null {
  const value = localStorage.getItem(key);
  if (value !== null && value !== '') {
    return value;
  }
  return null;
}

/**
 * Sets a value in localStorage for a given key.
 *
 * @param key The key to set in localStorage.
 * @param value The string value to set.
 */
export function setLocalStorageValue(key: string, value: string): void {
  localStorage.setItem(key, value);
}
