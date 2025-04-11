import { useMemo } from 'react';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { api } from '@convex/_generated/api';
import type { Doc } from '@convex/_generated/dataModel';

interface ParticipantListProps {
  roomData: Doc<'rooms'>;
  player: Doc<'players'> | null | undefined;
}

export function ParticipantList({ roomData, player }: ParticipantListProps) {
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

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-semibold mb-4">Participants</h2>
      {playersData === undefined && participantIds.length > 0 ? (
        <p>Loading participant names...</p>
      ) : roomData.participants.length > 0 ? (
        <ul className="list-disc space-y-1">
          {roomData.participants.map((participant) => (
            <li key={participant.playerId}>
              {playerNamesMap.get(participant.playerId) ?? 'Loading...'}
              {participant.playerId === player?._id ? ' (You)' : ''}
              {participant.isAdmin ? ' (Admin)' : ''}
            </li>
          ))}
        </ul>
      ) : (
        <p>No participants yet.</p>
      )}
    </div>
  );
}
