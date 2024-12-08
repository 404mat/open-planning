'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateRoomModal from '@/app/components/CreateRoomModal';
import { RoomOptions } from '@/app/types';
import { validateRoomId } from '@/utils/inputValidation';
import UserNameInput from '@/app/components/user/UserNameInput';
import TextInput from '@/app/components/elements/TextInput';
import ButtonGo from '@/app/components/elements/ButtonGo';
import ButtonAction from '@/app/components/elements/ButtonAction';
import { apiService } from '@/service/api.service';
import { socketService } from '@/service/socket.service';
import { CreateRoomData } from '@poker-planning/shared/dist/models/socket/CreateRoomData';
import { NewRoomResponse } from '@poker-planning/shared/dist/models/api/NewRoomResponse';
import { NewRoomOptions } from '@poker-planning/shared/dist/models/api/NewRoomOptions';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomOptions, setRoomOptions] = useState<RoomOptions>({
    roomName: '',
    maxUsers: 10,
    userCanFlip: true,
    idleTimeout: 30,
    allowCardChange: false,
  });
  const [inputError, setInputError] = useState('');
  const router = useRouter();

  useEffect(() => {
    setRoomOptions({
      roomName: '',
      maxUsers: 8,
      userCanFlip: false,
      idleTimeout: 30,
      allowCardChange: false,
    });
  }, []);

  // function connectToWebsocket() {
  //   socketService.on('connect', () => {
  //     console.log('Connected to WebSocket');

  //     socketService.emit('join-room', {
  //       roomId: 'placeholder',
  //       name: 'placeholder',
  //     });
  //   });
  // }

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRoomId(roomId);
    // TODO: validate room exists ?

    if (!validation.isValid) {
      setInputError(validation.error);
      return;
    }

    router.push(`/room/${roomId}`);
  };

  const handleQuickCreate = () => {
    apiService.createRoom().then((data: NewRoomResponse) => {
      router.push(`/room/${data.roomId}`);
      socketService.emit(data.socketConnection, {
        roomId: data.roomId,
        participantName: 'placeholder',
      } as CreateRoomData);
    });
  };

  const handleCreateWithOptions = (options: RoomOptions) => {
    // Use room name as ID if provided, otherwise server will generates one
    const userNewRoomId = options.roomName.trim()
      ? options.roomName.toLowerCase().replace(/\s+/g, '-')
      : '';

    const params = {
      roomName: options.roomName,
      maxUsers: options.maxUsers,
      userCanFlip: options.userCanFlip,
      idleTimeout: options.idleTimeout,
      allowCardChange: options.allowCardChange,
    } as NewRoomOptions;

    apiService
      .createRoom(userNewRoomId, params)
      .then((data: NewRoomResponse) => {
        router.push(`/room/${data.roomId}`);
        socketService.emit(data.socketConnection, {
          roomId: data.roomId,
          participantName: 'placeholder',
        } as CreateRoomData);
      });
  };

  const validateInput = (value: string): string => {
    if (!value.trim()) return '';
    const validation = validateRoomId(value);
    return validation.error;
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 sm:p-8 relative">
      <UserNameInput />
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
        Scrum Poker Planning
      </h1>
      <div className="flex flex-col md:flex-row gap-4 sm:gap-8 w-full max-w-3xl">
        {/* Join Room Card */}
        <div className="flex-1 bg-white p-6 sm:p-8 rounded-lg shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
            Join Existing Room
          </h2>

          <form onSubmit={handleJoinRoom} className="space-y-4 sm:space-y-6">
            <div>
              <TextInput
                label="Room ID"
                id="roomId"
                placeholder="Enter provided id here"
                required
                error={inputError}
                onChange={(value) => {
                  setRoomId(value);
                  setInputError(validateInput(value));
                }}
              />
            </div>

            <div className="flex justify-end">
              <ButtonGo
                text="Join Room"
                size="lg"
                disabled={!!inputError || !roomId.trim()}
              />
            </div>
          </form>
        </div>

        {/* Create Room Card */}
        <div className="flex-1 bg-white p-6 sm:p-8 rounded-lg shadow-lg flex flex-col">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
            Create New Room
          </h2>

          <p className="text-gray-600 mb-6 flex-grow">
            Start a new planning session and invite your team members to join.
          </p>

          <div className="space-y-3">
            <ButtonAction
              text="Quick Create"
              onClick={handleQuickCreate}
              size="full"
              variant="default"
            />

            <ButtonAction
              text="Customize Room"
              onClick={() => setIsModalOpen(true)}
              size="full"
              variant="secondary"
            />
          </div>
        </div>
      </div>

      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(options) => {
          handleCreateWithOptions(options);
          setIsModalOpen(false);
        }}
        initialOptions={roomOptions}
      />
    </main>
  );
}
