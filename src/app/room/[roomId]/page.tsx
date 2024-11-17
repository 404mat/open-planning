'use client';
import { useState, use, useEffect } from 'react';
import { PokerCard } from '@/app/components/PokerCard';
import { CardSelector } from '@/app/components/CardSelector';
import { useRouter } from 'next/navigation';
import { InviteModal } from '@/app/components/InviteModal';
import { RoomHeader } from './RoomHeader';

const POKER_CARDS = ['1', '2', '3', '5', '8', '13', '21', '?', '☕'];

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
    { id: '1', name: 'Player 1', selectedCard: null },
    { id: '2', name: 'Player 2', selectedCard: '2' },
    { id: '3', name: 'Player 3', selectedCard: '3' },
    { id: '4', name: 'Player 4', selectedCard: '5' },
    { id: '5', name: 'Player 5', selectedCard: '8' },
    { id: '6', name: 'Player 6', selectedCard: null },
    { id: '7', name: 'Player 7', selectedCard: '21' },
  ]);

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

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
              <PokerCard value={player.selectedCard} />
            </div>
          );
        })}

        {/* Felt table */}
        <div className="absolute w-full max-w-lg h-[180px] bg-gray-200 rounded-lg shadow-xl">
          {/* Table pattern */}
          <div className="absolute inset-4 border-2 border-gray-300 rounded-lg" />
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
