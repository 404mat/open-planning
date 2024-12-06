export interface Room {
  id: string;
  participants: Participant[];
  currentStory?: string;
  votes: Record<string, string>;
  revealed: boolean;
  lastUpdate: Date;
}

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
}

// TODO: use this to format error to client,
// potentially export this to shared package between client and server
export interface CallbackResponse {
  roomId?: string;
  room?: Room;
  error?: string;
}
