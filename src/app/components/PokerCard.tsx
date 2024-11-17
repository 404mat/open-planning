interface PokerCardProps {
  value: string | null;
  isSelected?: boolean;
  isRevealed?: boolean;
  onClick?: () => void;
  showPattern?: boolean;
}

export function PokerCard({
  value,
  isSelected = false,
  isRevealed = false,
  onClick,
  showPattern = true,
}: PokerCardProps) {
  if (!value) {
    return (
      <div className="w-[60px] h-[84px] rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 shadow-md flex items-center justify-center">
        <div className="w-[54px] h-[78px] rounded-lg border-2 border-gray-300/30 m-[3px]" />
      </div>
    );
  }

  return (
    <>
      {isRevealed ? (
        <div
          onClick={onClick}
          className={`w-[60px] h-[84px] bg-white rounded-lg shadow-md relative overflow-hidden
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
            {value}
          </div>
          <div className="absolute bottom-1 right-2 text-red-400/20 font-bold text-sm rotate-180">
            {value}
          </div>

          {/* Center value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`text-2xl font-bold ${isSelected ? 'text-blue-600' : ''}`}
            >
              {value}
            </span>
          </div>

          {/* Card texture */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent)] pointer-events-none" />
        </div>
      ) : (
        <div className="w-[60px] h-[84px] rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 shadow-md flex items-center justify-center">
          <div className="w-[54px] h-[78px] rounded-lg border-2 border-gray-300/30 m-[3px]" />
        </div>
      )}
    </>
  );
}
