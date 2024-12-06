import { Socket } from 'socket.io';

export function handleError(socket: Socket, message: string): void {
  if (socket) {
    socket.emit('exception', { error: message });
  } else {
    throw Error(message);
  }
}
