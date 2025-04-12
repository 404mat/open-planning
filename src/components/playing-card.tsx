import { motion } from 'motion/react';
import { CARD_HEIGHT, CARD_WIDTH } from '@/lib/constants';

interface PokerCardProps {
  value: string | null;
  isSelected?: boolean;
  isRevealed?: boolean;
  subtext?: { text: string; isCurrentUser?: boolean; isAdmin?: boolean };
  onClick?: () => void;
}

export function PlayingCard({
  value,
  isSelected = false,
  isRevealed = false,
  subtext,
  onClick,
}: PokerCardProps) {
  function getHtmlValue() {
    if (!isRevealed) return <span className="opacity-0">😉</span>;
    return value;
  }

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
        {/* Card flip animation container */}
        <motion.div
          className="w-full h-full [transform-style:preserve-3d] relative"
          initial={false}
          animate={{ rotateY: isRevealed ? 0 : 180 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          {/* Front of card (revealed) */}
          <motion.div
            onClick={onClick}
            className={`w-full h-full bg-white rounded-lg shadow-md absolute backface-hidden
            ${onClick ? 'cursor-pointer' : ''}
            ${isSelected ? 'ring-4 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : ''}`}
            whileHover={onClick ? { scale: 1.05 } : {}}
            animate={{ scale: isSelected ? 1.1 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Card inner border */}
            <div className="absolute inset-[3px] border border-gray-200 rounded-md"></div>

            {/* Card corners */}
            <div className="absolute top-1 left-2 text-red-400/20 font-bold text-sm select-none">
              {getHtmlValue()}
            </div>
            <div className="absolute bottom-1 right-2 text-red-400/20 font-bold text-sm rotate-180 select-none">
              {getHtmlValue()}
            </div>

            {/* Center value */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`text-2xl font-bold select-none ${
                  isSelected ? 'text-blue-600' : 'text-gray-800'
                }`}
              >
                {getHtmlValue()}
              </span>
            </div>

            {/* Card texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent)] pointer-events-none" />
          </motion.div>

          {/* Back of card */}
          <motion.div
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
          </motion.div>
        </motion.div>
      </div>
      {subtext && (
        <span className="text-sm font-medium text-gray-700">{`${subtext.isAdmin ? '👑 ' : ''}${subtext.isCurrentUser ? '• ' : ''} ${subtext.text}`}</span>
      )}
    </div>
  );
}
