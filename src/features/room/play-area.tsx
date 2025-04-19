import { useMemo } from 'react';
import {
  useSessionMutation,
  useSessionQuery,
} from 'convex-helpers/react/sessions';
import { api } from '@convex/_generated/api';
import type { Doc } from '@convex/_generated/dataModel';
import { PlayingCard } from '@/components/playing-card';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParticipantListProps {
  roomData: Doc<'rooms'>;
  player: Doc<'players'> | null | undefined;
}

export function PlayArea({ roomData, player }: ParticipantListProps) {
  const { errorToast } = useToast();

  const changeRevealStatus = useSessionMutation(api.rooms.updateReveal);
  const resetRoomVotes = useSessionMutation(api.participants.resetAllVotes);

  // Change the reveal status of the votes
  const handleRevealVotes = () => {
    changeRevealStatus({
      roomId: roomData._id,
      isRevealed: !roomData.isRevealed,
    });
  };

  // Clear all votes
  const handleResetVotes = async () => {
    const { success } = await resetRoomVotes({
      roomId: roomData._id,
    });
    if (!success) {
      errorToast({
        text: 'Failed to reset votes. Please try again.',
      });
    } else {
      changeRevealStatus({
        roomId: roomData._id,
        isRevealed: false,
      });
    }
  };

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
    <div className="flex-grow flex flex-col items-center justify-center p-4 gap-12">
      {/* cards */}
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

      {/* controls */}
      <div className="flex gap-4">
        <Button
          onClick={handleRevealVotes}
          className="group grid"
          data-revealed={roomData.isRevealed}
        >
          <span className="[grid-area:1/1] group-data-[revealed=true]:invisible">
            Reveal votes !
          </span>
          <span className="[grid-area:1/1] group-data-[revealed=false]:invisible">
            Hide votes
          </span>
        </Button>
        <Button variant={'secondary'} onClick={handleResetVotes}>
          <XIcon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
          Reset votes
        </Button>
      </div>
    </div>
  );
}
