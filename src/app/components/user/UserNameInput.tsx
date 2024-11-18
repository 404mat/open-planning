import { useState, useEffect } from 'react';

import { validateUserName } from '@/utils/inputValidation';
import Modal from './Modal';
import TextInput from '@/app/components/elements/TextInput';
import ButtonAction from '@/app/components/elements/ButtonAction';

export default function UserNameInput() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [tempUserName, setTempUserName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
      setTempUserName(savedName);
    }
  }, []);

  const handleSubmit = () => {
    const validation = validateUserName(tempUserName);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    localStorage.setItem('userName', tempUserName);
    setUserName(tempUserName);
    setIsModalOpen(false);
    setError('');
  };

  const handleCancel = () => {
    setTempUserName(userName);
    setError('');
    setIsModalOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 
          rounded-md hover:bg-gray-200 transition-colors"
      >
        <span className="text-gray-600">
          {userName ? `Hello, ${userName}` : 'Set your name'}
        </span>
        <span className="text-gray-500">✎</span>
      </button>

      <Modal isOpen={isModalOpen} onClose={handleCancel} title="Set Your Name">
        <div>
          <TextInput
            id="userName"
            label="Your Name"
            placeholder="Enter your name"
            onKeyDown={handleKeyDown}
            onChange={(val) => {
              setTempUserName(val);
              setError('');
            }}
            error={error}
          />
        </div>

        <div className="flex gap-3">
          <ButtonAction
            text="Cancel"
            size="full"
            variant="secondary"
            onClick={handleCancel}
          />

          <ButtonAction
            text="Save"
            size="full"
            variant="default"
            disabled={!tempUserName.trim()}
            onClick={handleSubmit}
          />
        </div>
      </Modal>
    </>
  );
}
