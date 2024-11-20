'use client';
import { useState, useEffect } from 'react';
import { X, Link } from 'lucide-react';

import ButtonAction from '@/app/components/elements/ButtonAction';

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
        <div className="flex flex-row justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Invite others to join
          </h2>
          <X size={24} strokeWidth={2} aria-hidden="true" onClick={onClose} />
        </div>
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
          <ButtonAction
            text="Copy full link"
            onClick={() => copyToClipboard('link')}
            size="full"
            icon={<Link size={24} strokeWidth={2} aria-hidden="true" />}
          />
          <ButtonAction
            text="Copy room ID"
            onClick={() => copyToClipboard('id')}
            size="full"
            variant="secondary"
          />
        </div>

        <div className="flex justify-end mt-6">
          <ButtonAction
            text="Done"
            onClick={onClose}
            variant="secondary"
            size="lg"
          />
        </div>
      </div>
    </div>
  );
}
