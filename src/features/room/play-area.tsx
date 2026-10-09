import { PlayingCard } from '@/components/playing-card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { XIcon, Crown, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { RoomActions } from '@/hooks/use-room';
import type { Participant, Room } from 'shared/protocol';

interface PlayAreaProps {
  room: Room;
  participants: Participant[];
  currentSessionId: string;
  actions: RoomActions;
}

export function PlayArea({ room, participants, currentSessionId, actions }: PlayAreaProps) {
  const { errorToast, warningToast, successToast } = useToast();

  // Find current user's participant data
  const currentParticipant = participants.find((p) => p.sessionId === currentSessionId);

  // Check if user can reveal (admin or usersCanReveal is true)
  const canReveal = currentParticipant?.isAdmin || (room.usersCanReveal ?? true);

  // Check if current user is admin
  const isAdmin = currentParticipant?.isAdmin ?? false;

  // Change the reveal status of the votes
  const handleRevealVotes = async () => {
    if (!canReveal) {
      warningToast({
        text: 'An admin has locked this feature for now.',
      });
      return;
    }

    try {
      actions.reveal(!room.isRevealed);
    } catch {
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
      // Resetting also hides the votes, in a single server-side step.
      actions.resetVotes();
    } catch {
      errorToast({
        text: 'Failed to reset votes. Please try again.',
      });
    }
  };

  // Make a participant admin
  const handleMakeAdmin = (targetSessionId: string) => {
    try {
      actions.promoteAdmin(targetSessionId);
      successToast({
        text: 'Admin status updated successfully.',
      });
    } catch {
      errorToast({
        text: 'Failed to update admin status. Please try again.',
      });
    }
  };

  // Remove a participant from the room
  const handleKickPlayer = (targetSessionId: string) => {
    try {
      actions.kick(targetSessionId);
      successToast({
        text: 'Player removed from room.',
      });
    } catch {
      errorToast({
        text: 'Failed to remove player. Please try again.',
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
          const canManage = isAdmin && !isCurrentUser;

          const card = (
            <PlayingCard
              key={participant.sessionId}
              value={participant.vote || null}
              subtext={{
                text: participant.name,
                isCurrentUser,
                isAdmin: participant.isAdmin,
              }}
              isRevealed={room.isRevealed}
              isSelected={false}
            />
          );

          // Wrap in dropdown menu if admin and not current user
          if (canManage) {
            return (
              <DropdownMenu key={participant.sessionId}>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer">{card}</div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem
                    onClick={() => handleMakeAdmin(participant.sessionId)}
                    disabled={participant.isAdmin}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    {participant.isAdmin ? 'Already Admin' : 'Make Admin'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleKickPlayer(participant.sessionId)}
                    variant="destructive"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Kick Player
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          return card;
        })}
      </div>

      {/* controls */}
      <div className="flex gap-4">
        <Button
          onClick={handleRevealVotes}
          className={`group grid ${!canReveal ? 'opacity-50 cursor-not-allowed' : ''}`}
          data-revealed={room.isRevealed}
        >
          <span className="[grid-area:1/1] group-data-[revealed=true]:invisible">
            Reveal votes !
          </span>
          <span className="[grid-area:1/1] group-data-[revealed=false]:invisible">Hide votes</span>
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
