export function validateJoinRoomInput(input: string): {
  isValid: boolean;
  roomId: string;
  errorMessage?: string;
} {
  const trimmedInput = input.trim();
  if (trimmedInput === '') {
    return {
      isValid: false,
      errorMessage: 'Room ID cannot be empty.',
      roomId: '',
    };
  }

  let potentialRoomId = trimmedInput;

  // Try parsing as URL to extract ID from path if possible
  try {
    const url = new URL(trimmedInput);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      // If it's a URL with a path, assume the last segment is the ID
      potentialRoomId = pathSegments[pathSegments.length - 1];
    } else {
      // URL without a path (e.g., http://domain.com) is not a valid room source
      return {
        isValid: false,
        errorMessage: 'Invalid URL format for room ID.',
        roomId: '',
      };
    }
  } catch {
    // Not a valid URL, potentialRoomId remains the trimmedInput
  }

  // Validate the potentialRoomId (extracted or original input)
  if (potentialRoomId.length < 5) {
    return {
      isValid: false,
      errorMessage: 'Room ID must be at least 5 characters long',
      roomId: '',
    };
  }
  if (potentialRoomId.length > 20) {
    return {
      isValid: false,
      errorMessage: 'Room ID must be at most 20 characters long',
      roomId: '',
    };
  }

  const validIdRegex = /^[a-zA-Z0-9-]+$/;
  if (!validIdRegex.test(potentialRoomId)) {
    return {
      isValid: false,
      errorMessage: 'The provided room ID syntax is not valid.',
      roomId: '',
    };
  }

  return { isValid: true, roomId: potentialRoomId };
}
