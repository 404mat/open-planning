import { useState } from 'react';

import { RoomOptions } from '@/app/types';
import {
  validateRoomName,
  validateMaxUsers,
  validateIdleTimeout,
  ValidationResult,
} from '@/utils/inputValidation';
import { Cross } from '@/app/components/icons/Cross';
import TextInput from '@/app/components/elements/TextInput';
import NumberSelector from '@/app/components/elements/NumberSelector';
import ButtonAction from '@/app/components/elements/ButtonAction';
import CardCheckbox from '@/app/components/elements/CardCheckbox';
import { MAX_IDLE_TIMEOUT, MAX_MAX_USERS, MIN_IDLE_TIMEOUT } from '@/constants';
import { MIN_MAX_USERS } from '@/constants';

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
      case 'roomName':
        result = validateRoomName(value as string);
        return result.error;
      case 'maxUsers':
        result = validateMaxUsers(value as number);
        return result.error;
      case 'idleTimeout':
        result = validateIdleTimeout(value as number);
        return result.error;
      default:
        return '';
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

    if (key !== 'userCanFlip' && key !== 'allowCardChange') {
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
      if (key !== 'userCanFlip' && key !== 'allowCardChange') {
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
            <Cross />
          </button>
        </div>

        <div className="space-y-4">
          <TextInput
            label="Room Name (optional)"
            id="roomName"
            required={false}
            placeholder="Enter room name..."
            onChange={(e) => handleOptionChange('roomName', e)}
            error={errors.roomName}
          />

          <div className="flex gap-8">
            <div className="flex flex-col items-start gap-2">
              <label className="text-sm text-gray-700">Max Users</label>
              <NumberSelector
                value={options.maxUsers}
                min={MIN_MAX_USERS}
                max={MAX_MAX_USERS}
                onChange={(e) => handleOptionChange('maxUsers', e)}
              />
            </div>

            <div className="flex flex-col items-start gap-2">
              <label className="text-sm text-gray-700">Idle Timeout</label>
              <NumberSelector
                value={options.idleTimeout}
                min={MIN_IDLE_TIMEOUT}
                max={MAX_IDLE_TIMEOUT}
                onChange={(e) => handleOptionChange('idleTimeout', e)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <CardCheckbox
              label="Allow users to flip cards"
              description="Users can flip the cards in the room to reveal the votes."
              checked={options.userCanFlip}
              onChange={(e) => handleOptionChange('userCanFlip', e)}
            />

            <CardCheckbox
              label="Allow card change after vote reveal"
              description="Users can change their cards after the vote is revealed."
              checked={options.allowCardChange}
              onChange={(e) => handleOptionChange('allowCardChange', e)}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <ButtonAction
            text="Cancel"
            onClick={onClose}
            variant="secondary"
            size="lg"
          />

          <ButtonAction
            text="Create room"
            onClick={handleSubmit}
            size="lg"
            disabled={Object.keys(errors).some(
              (key) => !!errors[key as keyof RoomOptions]
            )}
          />
        </div>
      </div>
    </div>
  );
}
