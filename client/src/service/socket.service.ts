import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  /**
   * Initializes the socket connection.
   * @param url The Socket.IO server URL.
   */
  init(url: string) {
    if (this.socket) {
      console.warn('Socket is already initialized.');
      return;
    }

    this.socket = io(url);

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected.');
    });
  }

  /**
   * Emits an event to the server.
   * @param event Event name.
   * @param data Event data.
   */
  emit(event: string, data: any) {
    if (!this.socket) {
      console.error('Socket is not initialized.');
      return;
    }
    this.socket.emit(event, data);
  }

  /**
   * Registers a listener for a specific event.
   * @param event Event name.
   * @param callback Callback function to handle the event.
   */
  on(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      console.error('Socket is not initialized.');
      return;
    }
    this.socket.on(event, callback);
  }

  /**
   * Disconnects the socket connection.
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket connection closed.');
    }
  }
}

export const socketService = new SocketService();
