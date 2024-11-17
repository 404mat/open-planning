interface PokerCardProps {
  value: string | null;
  isSelected?: boolean;
  onClick?: () => void;
  showPattern?: boolean;
}

export function PokerCard({
  value,
  isSelected,
  onClick,
  showPattern = true,
}: PokerCardProps) {
  if (!value) {
    return (
      <div className="w-16 h-24 rounded-lg shadow-lg bg-white relative overflow-hidden">
        {showPattern && (
          <div className="absolute inset-0 bg-gray-100">
            <div className="absolute inset-1 border border-gray-300 rounded-md"></div>
            <div className="absolute inset-2 grid grid-cols-3 grid-rows-3 gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-sm"></div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-16 h-24 rounded-lg shadow-lg flex items-center justify-center text-xl font-bold transition-transform hover:scale-110
        ${
          isSelected
            ? 'bg-gray-800 text-white transform scale-110'
            : 'bg-white text-gray-800 hover:bg-gray-50'
        }`}
    >
      {value}
    </button>
  );
}
