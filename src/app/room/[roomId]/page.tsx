'use client';
import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { PokerCard } from '@/app/components/PokerCard';
import { CardSelector } from '@/app/components/CardSelector';
import { InviteModal } from '@/app/components/InviteModal';
import { RoomHeader } from './RoomHeader';
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

  const getPlayerPosition = (index: number) => {
    const radius = 20; // reduced radius to bring players closer
    const angleStep = (2 * Math.PI) / players.length;
    const angleOffset = -Math.PI / 2; // Start from top

    const angle = angleStep * index + angleOffset;
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);

    return { x, y };
  };

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

      {/* table */}
      <div className="flex-1 flex items-center justify-center p-8">
        {/* Players positioned behind table */}
        {players.map((player, index) => {
          const pos = getPlayerPosition(index);
          return (
            <div
              key={index}
              className="absolute transition-all duration-500 ease-in-out"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `translate(-50%, -50%)`,
                zIndex: 10,
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <PokerCard
                  value={player.selectedCard ?? '-'}
                  isRevealed={cardsRevealed}
                />
                <span className="text-sm font-medium text-gray-700">
                  {player.name}
                </span>
              </div>
            </div>
          );
        })}

        {/* Felt table */}
        <div className="absolute w-full max-w-lg h-[180px] bg-gray-200 rounded-lg shadow-xl">
          {/* Table pattern */}
          <div className="absolute inset-4 border-2 border-gray-300 rounded-lg" />

          {/* Toggle button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handleToggleCards}
              className={`px-6 py-2 rounded-full font-medium shadow-md transition-all
                ${
                  cardsRevealed
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } active:scale-95`}
            >
              {cardsRevealed ? 'Hide Cards' : 'Reveal Cards'}
            </button>
          </div>
        </div>
      </div>

      <CardSelector
        cards={POKER_CARDS}
        selectedCard={selectedCard}
        onSelectCard={setSelectedCard}
      />
    </div>
  );
}
