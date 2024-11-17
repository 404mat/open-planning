import { PokerCard } from '@/app/components/PokerCard';

interface Player {
  id: string;
  name: string;
  selectedCard: string | null;
}

interface PlayAreaProps {
  players: Player[];
  cardsRevealed: boolean;
  onToggleCards: () => void;
}

export function PlayArea({
  players,
  cardsRevealed,
  onToggleCards,
}: PlayAreaProps) {
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
                value={player.selectedCard}
                isRevealed={cardsRevealed}
              />
              <span className="text-sm font-medium text-gray-700">
                {player.name}
              </span>
            </div>
          </div>
        );
      })}

      {/* Table */}
      <div className="absolute w-full max-w-lg h-[180px] bg-gray-200 rounded-lg shadow-xl">
        {/* Table pattern */}
        <div className="absolute inset-4 border-2 border-gray-300 rounded-lg" />

        {/* Toggle button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={onToggleCards}
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
  );
}
