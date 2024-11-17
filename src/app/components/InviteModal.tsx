'use client';
import { useState, useEffect } from 'react';
import { Cross } from '@/app/components/icons/Cross';
import { Link } from '@/app/components/icons/Link';

interface InviteModalProps {
  roomId: string;
  onClose: () => void;
}

export function InviteModal({ roomId, onClose }: InviteModalProps) {
  const [fullLink, setFullLink] = useState('');

  useEffect(() => {
    setFullLink(window.location.href);
  }, []);

  const copyToClipboard = (type: 'id' | 'link') => {
    const textToCopy = type === 'id' ? roomId : fullLink;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('Copied to clipboard!');
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Cross />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Invite others to join
        </h2>
        <p className="text-gray-600 mb-6">
          Share this room with your team members to start collaborating
          together.
        </p>

        <div className="mb-4">
          <input
            readOnly
            disabled
            value={roomId}
            className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-600 text-center text-lg font-medium"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => copyToClipboard('link')}
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Link />
            Copy full link
          </button>
          <button
            onClick={() => copyToClipboard('id')}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Copy room ID
          </button>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
