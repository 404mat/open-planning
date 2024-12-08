import { NewRoomResponse } from '@poker-planning/shared/dist/models/api/NewRoomResponse';
import { NewRoomOptions } from '@poker-planning/shared/dist/models/api/NewRoomOptions';

export class ApiService {
  init() {
    console.log('initialized api service');
  }

  async createRoom(
    roomId?: string,
    options?: NewRoomOptions
  ): Promise<NewRoomResponse> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/create-room`;
    const roomIdPath = roomId ? `/${roomId}` : '';

    const response = await fetch(`${url}${roomIdPath}`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
    const data = await response.json();

    return data as NewRoomResponse;
  }
}

export const apiService = new ApiService();
