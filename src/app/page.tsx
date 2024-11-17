"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/room/${roomId}`);
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    router.push(`/room/${newRoomId}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
        Scrum Poker
      </h1>

      <div className="flex gap-8 w-full max-w-4xl">
        {/* Join Room Card */}
        <div className="flex-1 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Join Existing Room
          </h2>

          <form onSubmit={handleJoinRoom} className="space-y-6">
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
                onChange={(e) => setRoomId(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm 
                  focus:border-gray-500 focus:ring-gray-500 
                  bg-gray-50 p-3 text-gray-900
                  placeholder:text-gray-400"
                placeholder="Enter room ID..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-800 text-white py-3 px-4 rounded-md 
                hover:bg-gray-700 transition-colors text-lg"
            >
              Join Room
            </button>
          </form>
        </div>

        {/* Create Room Card */}
        <div className="flex-1 bg-white p-8 rounded-lg shadow-lg flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Create New Room
          </h2>

          <p className="text-gray-600 mb-6 flex-grow">
            Start a new planning session and invite your team members to join.
          </p>

          <button
            onClick={handleCreateRoom}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-md 
              hover:bg-gray-500 transition-colors text-lg"
          >
            Create Room
          </button>
        </div>
      </div>
    </main>
  );
}
