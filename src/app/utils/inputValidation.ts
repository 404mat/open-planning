export interface ValidationResult {
  isValid: boolean;
  error: string;
}

export const validateRoomId = (value: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: "Room ID is required" };
  }

  if (value.length < 3 || value.length > 30) {
    return {
      isValid: false,
      error: "Room ID must be between 3 and 30 characters",
    };
  }

  if (!/^[a-zA-Z0-9][a-zA-Z0-9-_]{1,28}[a-zA-Z0-9]$/.test(value)) {
    return {
      isValid: false,
      error: "Room ID must start and end with a letter or number",
    };
  }

  if (value.includes("--") || value.includes("__")) {
    return {
      isValid: false,
      error: "Room ID cannot contain consecutive hyphens or underscores",
    };
  }

  return { isValid: true, error: "" };
};

export const validateUserName = (value: string): ValidationResult => {
  if (!value.trim()) {
    return {
      isValid: false,
      error: "Name is required",
    };
  }

  if (value.length < 2) {
    return {
      isValid: false,
      error: "Name must be at least 2 characters",
    };
  }

  if (value.length > 30) {
    return {
      isValid: false,
      error: "Name cannot exceed 30 characters",
    };
  }

  if (!/^[a-zA-Z0-9\s-_]+$/.test(value)) {
    return {
      isValid: false,
      error:
        "Name can only contain letters, numbers, spaces, hyphens, and underscores",
    };
  }

  return { isValid: true, error: "" };
};

export const validateRoomName = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: true, error: "" }; // Optional field
  }

  if (value.length < 3) {
    return {
      isValid: false,
      error: "Room name must be at least 3 characters",
    };
  }

  if (value.length > 50) {
    return {
      isValid: false,
      error: "Room name cannot exceed 50 characters",
    };
  }

  if (!/^[a-zA-Z0-9\s-_]+$/.test(value)) {
    return {
      isValid: false,
      error:
        "Room name can only contain letters, numbers, spaces, hyphens, and underscores",
    };
  }

  return { isValid: true, error: "" };
};

export const validateMaxUsers = (value: number): ValidationResult => {
  if (value < 2) {
    return {
      isValid: false,
      error: "Room must allow at least 2 users",
    };
  }

  if (value > 50) {
    return {
      isValid: false,
      error: "Room cannot have more than 50 users",
    };
  }

  return { isValid: true, error: "" };
};

export const validateIdleTimeout = (value: number): ValidationResult => {
  if (value < 5) {
    return {
      isValid: false,
      error: "Timeout must be at least 5 minutes",
    };
  }

  if (value > 120) {
    return {
      isValid: false,
      error: "Timeout cannot exceed 120 minutes",
    };
  }

  return { isValid: true, error: "" };
};
