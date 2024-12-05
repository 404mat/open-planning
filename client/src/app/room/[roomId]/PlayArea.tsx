import { useEffect, useState } from 'react';

import { PokerCard } from '@/app/components/PokerCard';
import { Statistics } from './Statistics';
import { calculateCardPositionsInRectangle } from '@/utils/cardPosition';
import { TABLE_HEIGHT } from '@/constants';
import ButtonAction from '@/app/components/elements/ButtonAction';

interface Player {
  id: string;
  name: string;
  selectedCard: string | null;
}

interface PlayAreaProps {
  players: Player[];
  cardsRevealed: boolean;
  onToggleCards: () => void;
  onClearCards?: () => void;
}

export function PlayArea({
  players,
  cardsRevealed,
  onToggleCards,
  onClearCards,
}: Readonly<PlayAreaProps>) {
  const [cardPositions, setCardPositions] = useState<
    { x: number; y: number }[]
  >([]);

  // Get suggestion text
  const getSuggestionText = () => {
    if (!cardsRevealed) return null;

    const participatingPlayers = players.filter((p) => p.selectedCard !== null);
    const numericPlayers = participatingPlayers
      .map((p) => ({
        ...p,
        numericValue: parseFloat(p.selectedCard!),
      }))
      .filter((p) => !isNaN(p.numericValue));

    if (numericPlayers.length === 0) return null;

    const lowestScore = Math.min(...numericPlayers.map((p) => p.numericValue));
    const highestScore = Math.max(...numericPlayers.map((p) => p.numericValue));
    const lowestPlayer = numericPlayers.find(
      (p) => p.numericValue === lowestScore
    );
    const highestPlayer = numericPlayers.find(
      (p) => p.numericValue === highestScore
    );

    if (lowestScore === highestScore) return 'Everyone agreed! 🎉';

    const difference = highestScore - lowestScore;
    if (difference >= 5) {
      return `${lowestPlayer?.name} (${lowestScore}) and ${highestPlayer?.name} (${highestScore}) should discuss.`;
    } else if (difference >= 2) {
      return `${highestPlayer?.name} could explain their ${highestScore} points.`;
    }
    return 'Estimates are aligned! 👍';
  };

  useEffect(() => {
    setCardPositions(calculateCardPositionsInRectangle(players.length));
  }, [players.length]);

  return (
    <div className="flex-1 flex items-center justify-center p-16">
      {/* Table */}
      <div
        className={`max-w-lg bg-gray-200 rounded-lg shadow-xl relative`}
        style={{ width: '100%', height: `${TABLE_HEIGHT}px` }}
      >
        {/* Table pattern */}
        <div className="absolute inset-4 border-2 border-gray-300 rounded-lg" />

        {/* Toggle and Clear button + statistics */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <ButtonAction
              text={cardsRevealed ? 'Hide Cards' : 'Reveal Cards'}
              onClick={onToggleCards}
              color={!cardsRevealed ? 'bg-blue-500 hover:bg-blue-600' : ''}
            />

            {/* TODO: tooltip for this to explain usage */}
            <ButtonAction
              text="Clear Cards"
              onClick={onClearCards}
              variant="secondary"
              disabled={!cardsRevealed}
            />
          </div>

          <div className="ml-8">
            <Statistics players={players} isRevealed={cardsRevealed} />
          </div>
        </div>

        {/* Suggestion text positioned under table */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 italic whitespace-nowrap">
          {getSuggestionText()}
        </div>

        {/* Players positioned behind table */}
        {players.map((player, index) => {
          const pos = cardPositions[index];
          return (
            <div
              key={index}
              className="absolute transition-all duration-500 ease-in-out flex flex-col items-center gap-2"
              style={{
                left: pos ? `${pos.x}px` : '-1000px',
                top: pos ? `${pos.y}px` : '-1000px',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <PokerCard
                value={player.selectedCard}
                isRevealed={cardsRevealed}
                subtext={player.name}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
