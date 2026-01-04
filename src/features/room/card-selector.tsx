import { PlayingCard } from '@/components/playing-card';
import { useToast } from '@/hooks/use-toast';

interface CardSelectorProps {
  cards: string[];
  selectedCard: string | null;
  onSelectCard: (card: string | null) => void;
  isLocked?: boolean;
}

export function CardSelector({
  cards,
  selectedCard,
  onSelectCard,
  isLocked = false,
}: CardSelectorProps) {
  const { warningToast } = useToast();

  const handleCardClick = (card: string) => {
    if (isLocked) {
      warningToast({
        text: 'An admin has locked this feature for now.',
      });
      return;
    }
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
            disabled={isLocked}
          />
        ))}
      </div>
    </div>
  );
}
