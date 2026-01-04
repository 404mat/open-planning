import { useSessionMutation } from 'convex-helpers/react/sessions';
import { api } from '@convex/_generated/api';
import type { Doc, Id } from '@convex/_generated/dataModel';
import { PlayingCard } from '@/components/playing-card';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Participant with name from the getParticipants query
type ParticipantWithName = Doc<'participants'> & { name: string };

interface PlayAreaProps {
  roomData: Doc<'rooms'>;
  participants: ParticipantWithName[];
  currentSessionId: Id<'sessions'> | undefined;
}

export function PlayArea({
  roomData,
  participants,
  currentSessionId,
}: PlayAreaProps) {
  const { errorToast, warningToast } = useToast();

  const changeRevealStatus = useSessionMutation(api.rooms.updateReveal);
  const resetRoomVotes = useSessionMutation(api.participants.resetAllVotes);

  // Find current user's participant data
  const currentParticipant = currentSessionId
    ? participants.find((p) => p.sessionId === currentSessionId)
    : null;

  // Check if user can reveal (admin or usersCanReveal is true)
  const canReveal =
    currentParticipant?.isAdmin || (roomData.usersCanReveal ?? true);

  // Change the reveal status of the votes
  const handleRevealVotes = async () => {
    if (!canReveal) {
      warningToast({
        text: 'An admin has locked this feature for now.',
      });
      return;
    }

    try {
      await changeRevealStatus({
        roomId: roomData._id,
        isRevealed: !roomData.isRevealed,
      });
    } catch (error) {
      errorToast({
        text: 'Failed to update reveal status. Please try again.',
      });
    }
  };

  // Clear all votes
  const handleResetVotes = async () => {
    if (!canReveal) {
      warningToast({
        text: 'An admin has locked this feature for now.',
      });
      return;
    }

    try {
      await resetRoomVotes({
        roomId: roomData._id,
      });
      await changeRevealStatus({
        roomId: roomData._id,
        isRevealed: false,
      });
    } catch (error) {
      errorToast({
        text: 'Failed to reset votes. Please try again.',
      });
    }
  };

  // Empty state
  if (participants.length === 0) {
    return (
      <div className="grow flex flex-col items-center justify-center p-4">
        <p>No participants yet.</p>
      </div>
    );
  }

  // Main content
  return (
    <div className="grow flex flex-col items-center justify-center p-4 gap-12">
      {/* cards */}
      <div className="flex flex-wrap gap-4 justify-center max-w-2xl">
        {participants.map((participant) => {
          const isCurrentUser = participant.sessionId === currentSessionId;

          return (
            <PlayingCard
              key={participant._id}
              value={participant.vote || null}
              subtext={{
                text: participant.name,
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
          className={`group grid ${!canReveal ? 'opacity-50 cursor-not-allowed' : ''}`}
          data-revealed={roomData.isRevealed}
        >
          <span className="[grid-area:1/1] group-data-[revealed=true]:invisible">
            Reveal votes !
          </span>
          <span className="[grid-area:1/1] group-data-[revealed=false]:invisible">
            Hide votes
          </span>
        </Button>
        <Button
          variant={'secondary'}
          onClick={handleResetVotes}
          className={!canReveal ? 'opacity-50 cursor-not-allowed' : ''}
        >
          <XIcon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
          Reset votes
        </Button>
      </div>
    </div>
  );
}
