'use client';
import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { CardSelector } from '@/app/components/CardSelector';
import { InviteModal } from '@/app/components/InviteModal';
import { RoomHeader } from './RoomHeader';
import { PlayArea } from './PlayArea';
import { POKER_CARDS } from '@/constants';

interface Player {
  id: string;
  name: string;
  selectedCard: string | null;
}

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const router = useRouter();
  const [players] = useState<Player[]>([
    { id: '1', name: 'Emma Thompson', selectedCard: null },
    { id: '2', name: 'James Chen', selectedCard: '2' },
    { id: '3', name: 'Sofia Rodriguez', selectedCard: '3' },
    { id: '4', name: 'Lucas Williams', selectedCard: '5' },
    { id: '5', name: 'Olivia Parker', selectedCard: '8' },
    { id: '6', name: 'Alexander Kim', selectedCard: null },
    { id: '7', name: 'Isabella Martinez', selectedCard: '21' },
  ]);

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [cardsRevealed, setCardsRevealed] = useState(false);

  useEffect(() => {
    if (players.length === 1) {
      setShowInviteModal(true);
    }
  }, []);

  const handleToggleCards = () => {
    setCardsRevealed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {showInviteModal && (
        <InviteModal
          roomId={roomId}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      <RoomHeader roomId={roomId} onInvite={() => setShowInviteModal(true)} />

      <PlayArea
        players={players}
        cardsRevealed={cardsRevealed}
        onToggleCards={handleToggleCards}
      />

      <CardSelector
        cards={POKER_CARDS}
        selectedCard={selectedCard}
        onSelectCard={setSelectedCard}
      />
    </div>
  );
}
