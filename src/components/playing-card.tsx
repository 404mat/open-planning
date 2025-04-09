import { CARD_HEIGHT, CARD_WIDTH } from '@/lib/constants';

interface PokerCardProps {
  value: string | null;
  isSelected?: boolean;
  isRevealed?: boolean;
  subtext?: string;
  onClick?: () => void;
}

export function PlayingCard({
  value,
  isSelected = false,
  isRevealed = false,
  subtext,
  onClick,
}: PokerCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 w-max">
      <div
        className="relative"
        style={{
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          perspective: '1000px',
        }}
      >
        {/* card transition when flipped */}
        <div
          className={`w-full h-full transition-transform duration-700 [transform-style:preserve-3d] relative
          ${isRevealed ? '[transform:rotateY(0deg)]' : '[transform:rotateY(180deg)]'}
        `}
        >
          {/* Front of card (revealed) */}
          <div
            onClick={onClick}
            className={`w-full h-full bg-white rounded-lg shadow-md absolute backface-hidden
            ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}
            ${
              isSelected
                ? 'ring-4 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110'
                : ''
            }`}
          >
            {/* Card inner border */}
            <div className="absolute inset-[3px] border border-gray-200 rounded-md"></div>

            {/* Card corners */}
            <div className="absolute top-1 left-2 text-red-400/20 font-bold text-sm">
              {value ?? '-'}
            </div>
            <div className="absolute bottom-1 right-2 text-red-400/20 font-bold text-sm rotate-180">
              {value ?? '-'}
            </div>

            {/* Center value */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`text-2xl font-bold ${
                  isSelected ? 'text-blue-600' : 'text-gray-800'
                }`}
              >
                {value ?? '-'}
              </span>
            </div>

            {/* Card texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent)] pointer-events-none" />
          </div>

          {/* Back of card */}
          <div
            className={`w-full h-full rounded-lg shadow-md absolute backface-hidden [transform:rotateY(180deg)] flex items-center justify-center ${
              value
                ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                : 'bg-gradient-to-br from-gray-300 to-gray-500'
            }`}
          >
            <div
              className={`w-[54px] h-[78px] rounded-lg border-2 m-[3px] ${
                value ? 'border-blue-400/30' : 'border-gray-300/30'
              }`}
            >
              {/* Card back texture */}
              <div
                className={`absolute inset-0 bg-gradient-to-br pointer-events-none ${
                  value ? 'from-blue-400/10' : 'from-gray-300/10'
                } to-transparent`}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent)] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-700">{subtext}</span>
    </div>
  );
}
