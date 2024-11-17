import { useState } from "react";
import { RoomOptions } from "@/app/types";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (options: RoomOptions) => void;
  initialOptions: RoomOptions;
}

export default function CreateRoomModal({
  isOpen,
  onClose,
  onSubmit,
  initialOptions,
}: CreateRoomModalProps) {
  const [options, setOptions] = useState<RoomOptions>(initialOptions);

  const handleOptionChange = (
    key: keyof RoomOptions,
    value: string | number | boolean
  ) => {
    setOptions((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Room Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Name
            </label>
            <input
              type="text"
              value={options.roomName}
              onChange={(e) => handleOptionChange("roomName", e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm 
                focus:border-gray-500 focus:ring-gray-500 
                bg-gray-50 p-2 text-gray-900
                placeholder:text-gray-400"
              placeholder="Optional room name..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Users
            </label>
            <input
              type="number"
              min="2"
              max="50"
              value={options.maxUsers}
              onChange={(e) =>
                handleOptionChange("maxUsers", parseInt(e.target.value))
              }
              className="block w-full rounded-md border-gray-300 shadow-sm 
                focus:border-gray-500 focus:ring-gray-500 
                bg-gray-50 p-2 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Idle Timeout (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={options.idleTimeout}
              onChange={(e) =>
                handleOptionChange("idleTimeout", parseInt(e.target.value))
              }
              className="block w-full rounded-md border-gray-300 shadow-sm 
                focus:border-gray-500 focus:ring-gray-500 
                bg-gray-50 p-2 text-gray-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="userCanFlip"
              checked={options.userCanFlip}
              onChange={(e) =>
                handleOptionChange("userCanFlip", e.target.checked)
              }
              className="rounded border-gray-300 text-gray-600 
                focus:ring-gray-500"
            />
            <label htmlFor="userCanFlip" className="text-sm text-gray-700">
              Allow users to flip cards
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md
              text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(options)}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md
              hover:bg-gray-500 transition-colors"
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
}
