"use client";
import { useState, use } from "react";
import { PokerCard } from "@/app/components/PokerCard";
import { CardSelector } from "@/app/components/CardSelector";

const POKER_CARDS = ["1", "2", "3", "5", "8", "13", "21", "?", "☕"];

interface Player {
  id: string;
  name: string;
  selectedCard: string | null;
}

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const [players] = useState<Player[]>([
    { id: "1", name: "Player 1", selectedCard: null },
    { id: "2", name: "Player 2", selectedCard: "5" },
    { id: "3", name: "Player 3", selectedCard: "3" },
  ]);

  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const getPlayerPosition = (index: number, totalPlayers: number) => {
    const angleStep = (2 * Math.PI) / totalPlayers;
    const angle = index * angleStep - Math.PI / 2;
    const radius = 160;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return {
      left: "50%",
      top: "50%",
      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <h1 className="text-2xl font-bold p-8 text-gray-800">Room: {roomId}</h1>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative w-full max-w-xl h-[200px] mx-auto">
          <div className="absolute inset-0 bg-gray-700 rounded-lg shadow-lg">
            <div className="absolute inset-4 border-2 border-gray-600 rounded-lg"></div>
          </div>

          {players.map((player, index) => (
            <div
              key={player.id}
              className="absolute"
              style={getPlayerPosition(index, players.length)}
            >
              <div className="flex flex-col items-center">
                <PokerCard value={player.selectedCard} />
                <div className="mt-2 text-sm font-medium text-gray-800">
                  {player.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CardSelector
        cards={POKER_CARDS}
        selectedCard={selectedCard}
        onSelectCard={setSelectedCard}
      />
    </div>
  );
}
