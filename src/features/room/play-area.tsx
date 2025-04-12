import { useMemo } from 'react';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { api } from '@convex/_generated/api';
import type { Doc } from '@convex/_generated/dataModel';
import { PlayingCard } from '@/components/playing-card';

interface ParticipantListProps {
  roomData: Doc<'rooms'>;
  player: Doc<'players'> | null | undefined;
}

export function PlayArea({ roomData, player }: ParticipantListProps) {
  // Extract participant IDs for fetching names
  const participantIds = useMemo(() => {
    return roomData.participants.map((p) => p.playerId);
  }, [roomData.participants]);

  // Fetch player data for all participants in the room using useSessionQuery
  const playersData = useSessionQuery(
    api.players.getPlayersByIds,
    participantIds.length > 0 ? { playerIds: participantIds } : 'skip'
  );

  // Create a map for easy lookup of player names by their ID
  const playerNamesMap = useMemo(() => {
    const map = new Map<Doc<'players'>['_id'], string>();
    if (playersData) {
      playersData.forEach((playerDoc) => {
        if (playerDoc) {
          map.set(playerDoc._id, playerDoc.name);
        }
      });
    }
    return map;
  }, [playersData]);

  // Loading state
  if (playersData === undefined && participantIds.length > 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <p>Loading participant names...</p>
      </div>
    );
  }

  // Empty state
  if (roomData.participants.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <p>No participants yet.</p>
      </div>
    );
  }

  // Main content
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <div className="flex flex-wrap gap-4 justify-center max-w-2xl">
        {roomData.participants.map((participant) => {
          const playerName = playerNamesMap.get(participant.playerId);
          const isCurrentUser = participant.playerId === player?._id;

          return (
            <PlayingCard
              key={participant.playerId}
              value={participant.vote ?? null}
              subtext={{
                text: playerName ?? 'Loading...',
                isCurrentUser,
                isAdmin: participant.isAdmin,
              }}
              isRevealed={roomData.isRevealed}
              isSelected={false}
            />
          );
        })}
      </div>
    </div>
  );
}
