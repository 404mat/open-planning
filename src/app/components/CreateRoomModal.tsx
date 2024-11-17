import { useState } from "react";
import { RoomOptions } from "@/app/types";
import {
  validateRoomName,
  validateMaxUsers,
  validateIdleTimeout,
  ValidationResult,
} from "../utils/inputValidation";

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
  const [errors, setErrors] = useState<
    Partial<Record<keyof RoomOptions, string>>
  >({});

  if (!isOpen) {
    return null;
  }

  const validateField = (key: keyof RoomOptions, value: any): string => {
    let result: ValidationResult;

    switch (key) {
      case "roomName":
        result = validateRoomName(value as string);
        return result.error;
      case "maxUsers":
        result = validateMaxUsers(value as number);
        return result.error;
      case "idleTimeout":
        result = validateIdleTimeout(value as number);
        return result.error;
      default:
        return "";
    }
  };

  const handleOptionChange = (
    key: keyof RoomOptions,
    value: string | number | boolean
  ) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key !== "userCanFlip") {
      // Skip validation for boolean fields
      const error = validateField(key, value);
      setErrors((prev) => ({
        ...prev,
        [key]: error,
      }));
    }
  };

  const isValid = () => {
    const newErrors: Partial<Record<keyof RoomOptions, string>> = {};
    let hasErrors = false;

    (Object.keys(options) as Array<keyof RoomOptions>).forEach((key) => {
      if (key !== "userCanFlip") {
        const error = validateField(key, options[key]);
        if (error) {
          newErrors[key] = error;
          hasErrors = true;
        }
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = () => {
    if (isValid()) {
      onSubmit(options);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
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
              Room Name (Optional)
            </label>
            <input
              type="text"
              value={options.roomName}
              onChange={(e) => handleOptionChange("roomName", e.target.value)}
              className={`block w-full rounded-md shadow-sm 
                focus:border-gray-500 focus:ring-gray-500 
                bg-gray-50 p-2 text-gray-900
                placeholder:text-gray-400
                ${errors.roomName ? "border-red-300" : "border-gray-300"}`}
              placeholder="Enter room name..."
            />
            {errors.roomName && (
              <p className="mt-1 text-sm text-red-600">{errors.roomName}</p>
            )}
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
              className={`block w-full rounded-md shadow-sm 
                focus:border-gray-500 focus:ring-gray-500 
                bg-gray-50 p-2 text-gray-900
                ${errors.maxUsers ? "border-red-300" : "border-gray-300"}`}
            />
            {errors.maxUsers && (
              <p className="mt-1 text-sm text-red-600">{errors.maxUsers}</p>
            )}
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
              className={`block w-full rounded-md shadow-sm 
                focus:border-gray-500 focus:ring-gray-500 
                bg-gray-50 p-2 text-gray-900
                ${errors.idleTimeout ? "border-red-300" : "border-gray-300"}`}
            />
            {errors.idleTimeout && (
              <p className="mt-1 text-sm text-red-600">{errors.idleTimeout}</p>
            )}
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
            onClick={handleSubmit}
            disabled={Object.keys(errors).some(
              (key) => !!errors[key as keyof RoomOptions]
            )}
            className={`flex-1 px-4 py-2 rounded-md transition-colors
              ${
                Object.keys(errors).some(
                  (key) => !!errors[key as keyof RoomOptions]
                )
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-600 text-white hover:bg-gray-500"
              }`}
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
}
