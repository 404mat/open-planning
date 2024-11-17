import { useState, useEffect } from 'react';
import { validateUserName } from '../../../utils/inputValidation';
import Modal from './Modal';

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

  const modalFooter = (
    <div className="flex gap-3">
      <button
        onClick={handleCancel}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md
          text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={!tempUserName.trim()}
        className={`flex-1 px-4 py-2 rounded-md transition-colors
          ${
            !tempUserName.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-500'
          }`}
      >
        Save
      </button>
    </div>
  );

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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCancel}
        title="Set Your Name"
        footer={modalFooter}
      >
        <div>
          <label
            htmlFor="userName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Name
          </label>
          <input
            id="userName"
            type="text"
            value={tempUserName}
            onChange={(e) => {
              setTempUserName(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="Enter your name"
            className={`block w-full rounded-md shadow-sm 
              focus:border-gray-500 focus:ring-gray-500 
              bg-gray-50 p-2 text-gray-900
              ${error ? 'border-red-300' : 'border-gray-300'}`}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      </Modal>
    </>
  );
}
