import { PlayingCard } from '@/components/playing-card';

interface CardSelectorProps {
  cards: string[];
  selectedCard: string | null;
  onSelectCard: (card: string | null) => void;
}

export function CardSelector({
  cards,
  selectedCard,
  onSelectCard,
}: CardSelectorProps) {
  const handleCardClick = (card: string) => {
    if (selectedCard === card) {
      onSelectCard(null);
    } else {
      onSelectCard(card);
    }
  };

  return (
    <div className="w-full flex justify-center p-8">
      <div className="flex gap-4">
        {cards.map((card) => (
          <PlayingCard
            key={card}
            value={card}
            isSelected={selectedCard === card}
            isRevealed={true}
            onClick={() => handleCardClick(card)}
          />
        ))}
      </div>
    </div>
  );
}
