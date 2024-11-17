'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateRoomModal from './components/CreateRoomModal';
import { RoomOptions } from './types';
import { generateRoomId, isValidRoomId } from './utils/roomIdGenerator';
import { validateRoomId } from './utils/inputValidation';
import UserNameInput from './components/user/UserNameInput';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomOptions, setRoomOptions] = useState<RoomOptions>({
    roomName: '',
    maxUsers: 10,
    userCanFlip: true,
    idleTimeout: 30,
  });
  const [inputError, setInputError] = useState('');
  const router = useRouter();

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRoomId(roomId);

    if (!validation.isValid) {
      setInputError(validation.error);
      return;
    }

    router.push(`/room/${roomId}`);
  };

  const handleQuickCreate = () => {
    const newRoomId = generateRoomId();
    router.push(`/room/${newRoomId}`);
  };

  const handleCreateWithOptions = (options: RoomOptions) => {
    // TODO: options should not be in the URL, but sent to the server
    const newRoomId = generateRoomId();
    const queryParams = new URLSearchParams();

    if (options.roomName) {
      queryParams.append('name', options.roomName);
    }
    queryParams.append('maxUsers', options.maxUsers.toString());
    queryParams.append('userCanFlip', options.userCanFlip.toString());
    queryParams.append('idleTimeout', options.idleTimeout.toString());

    const queryString = queryParams.toString();
    router.push(`/room/${newRoomId}${queryString ? `?${queryString}` : ''}`);
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
              <label
                htmlFor="roomId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Room ID
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setRoomId(newValue);
                  setInputError(validateInput(newValue));
                }}
                className={`block w-full rounded-md shadow-sm 
                  focus:border-gray-500 focus:ring-gray-500 
                  bg-gray-50 p-2.5 text-gray-900
                  placeholder:text-gray-400
                  ${inputError ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="e.g., happy-blue-dolphin"
              />
              {inputError && (
                <p className="mt-1 text-sm text-red-600">{inputError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!!inputError || !roomId.trim()}
              className={`w-full py-2.5 px-4 rounded-md 
                transition-colors text-base sm:text-lg
                ${
                  inputError || !roomId.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
            >
              Join Room
            </button>
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
            <button
              onClick={handleQuickCreate}
              className="w-full bg-gray-600 text-white py-2.5 px-4 rounded-md 
                hover:bg-gray-500 transition-colors text-base sm:text-lg"
            >
              Quick Create
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full border-2 border-gray-600 text-gray-600 py-2.5 px-4 rounded-md 
                hover:bg-gray-50 transition-colors text-base sm:text-lg"
            >
              Customize Room
            </button>
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
