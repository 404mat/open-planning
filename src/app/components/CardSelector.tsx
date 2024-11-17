import { PokerCard } from './PokerCard';

interface CardSelectorProps {
  cards: string[];
  selectedCard: string | null;
  onSelectCard: (card: string) => void;
}

export function CardSelector({
  cards,
  selectedCard,
  onSelectCard,
}: CardSelectorProps) {
  return (
    <div className="w-full flex justify-center p-8">
      <div className="flex gap-4">
        {cards.map((card) => (
          <PokerCard
            key={card}
            value={card}
            isSelected={selectedCard === card}
            onClick={() => onSelectCard(card)}
            showPattern={false}
          />
        ))}
      </div>
    </div>
  );
}
