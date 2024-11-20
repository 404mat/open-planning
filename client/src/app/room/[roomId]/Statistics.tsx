interface StatisticsProps {
  players: {
    id: string;
    name: string;
    selectedCard: string | null;
  }[];
  isRevealed: boolean;
}

export function Statistics({ players, isRevealed }: StatisticsProps) {
  const PLACEHOLDER_VALUE = '--';

  // Calculate statistics
  const participatingPlayers = players.filter((p) => p.selectedCard !== null);
  const participationRate = Math.round(
    (participatingPlayers.length / players.length) * 100
  );

  const numericPlayers = participatingPlayers
    .map((p) => ({
      ...p,
      numericValue: parseFloat(p.selectedCard!),
    }))
    .filter((p) => !isNaN(p.numericValue));

  const averageScore =
    numericPlayers.length > 0
      ? Math.round(
          (numericPlayers.reduce((a, b) => a + b.numericValue, 0) /
            numericPlayers.length) *
            10
        ) / 10
      : 0;

  const lowestScore =
    numericPlayers.length > 0
      ? Math.min(...numericPlayers.map((p) => p.numericValue))
      : 0;
  const highestScore =
    numericPlayers.length > 0
      ? Math.max(...numericPlayers.map((p) => p.numericValue))
      : 0;

  return (
    <div className="flex flex-col gap-1 text-sm text-gray-600 w-[180px]">
      <div className="flex justify-between items-center">
        <span>Participation:</span>
        <span className="font-semibold text-gray-800">
          {isRevealed ? `${participationRate}%` : PLACEHOLDER_VALUE}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span>Average:</span>
        <span className="font-semibold text-gray-800">
          {isRevealed ? averageScore : PLACEHOLDER_VALUE}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span>Lowest:</span>
        <span className="font-semibold text-gray-800">
          {isRevealed ? lowestScore : PLACEHOLDER_VALUE}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span>Highest:</span>
        <span className="font-semibold text-gray-800">
          {isRevealed ? highestScore : PLACEHOLDER_VALUE}
        </span>
      </div>
    </div>
  );
}
