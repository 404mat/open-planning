export function handleError(callback: any, message: string): void {
  if (callback) {
    callback({ error: message });
  } else {
    throw Error(message);
  }
}
