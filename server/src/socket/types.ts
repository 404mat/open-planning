export interface Room {
  id: string;
  participants: Participant[];
  currentStory?: string;
  votes: Record<string, string>;
  revealed: boolean;
}

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
}

export interface CallbackResponse {
  roomId?: string;
  room?: Room;
  error?: string;
}
