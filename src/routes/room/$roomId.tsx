import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { CardSelector } from '@/features/room/card-selector';
import { WelcomePopup } from '@/features/homepage/welcome-popup';
import { ShareDialog } from '@/components/share-dialog';
import { getVotingSystemvalues } from '@/lib/voting';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useSessionAuth } from '@/hooks/use-session-auth';
import { useRoom } from '@/hooks/use-room';
import { RoomHeader } from '@/features/room/room-header';
import { PlayArea } from '@/features/room/play-area';
import { useToast } from '@/hooks/use-toast';

export const Route = createFileRoute('/room/$roomId')({
  component: RoomComponent,
});

function RoomComponent() {
  const { roomId: roomSlug } = Route.useParams();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const { errorToast, warningToast } = useToast();

  const { sessionId, session, isLoading, showWelcomePopup, createPlayer } = useSessionAuth();

  // Live connection to the room Durable Object. Everything below the
  // welcome popup is driven by the snapshots it streams.
  const { room, participants, phase, actions } = useRoom({
    roomSlug,
    sessionId,
    name: session?.name ?? '',
    onError: (message) => errorToast({ text: message }),
  });

  const currentParticipant = useMemo(
    () => participants.find((p) => p.sessionId === sessionId) ?? null,
    [participants, sessionId]
  );

  // show share dialog when participant count changes to 1 from any other number
  const previousParticipantCountRef = useRef<number | null>(null);
  useEffect(() => {
    const currentCount = participants.length;
    const previousCount = previousParticipantCountRef.current;

    // Show dialog when count is 1 and either:
    // - It's the initial load (previousCount is null), OR
    // - It transitioned from a different number (previousCount !== 1)
    if (currentCount === 1 && (previousCount === null || previousCount !== 1)) {
      setShowShareDialog(true);
    }

    // Update the ref with the current count
    previousParticipantCountRef.current = currentCount;
  }, [participants.length]);

  // Initialize selected card with the user's current vote
  useEffect(() => {
    if (currentParticipant) {
      // If the vote is empty (reset), clear the selection, otherwise set it
      if (currentParticipant.vote === '') {
        setSelectedCard(null);
      } else {
        setSelectedCard(currentParticipant.vote);
      }
    } else {
      // User might not be in participants list yet
      setSelectedCard(null);
    }
  }, [currentParticipant]);

  // Kicked or room gone: toast once, then head back to the homepage
  const hasHandledRemovalRef = useRef(false);
  useEffect(() => {
    if ((phase === 'kicked' || phase === 'not-found') && !hasHandledRemovalRef.current) {
      hasHandledRemovalRef.current = true;
      if (phase === 'kicked') {
        errorToast({ text: 'You have been removed from this room.' });
      }
      navigate({ to: '/' });
    }
  }, [phase, errorToast, navigate]);

  async function handleCardSelected(value: string | null) {
    if (!room) return;
    if (room.isLocked) {
      warningToast({
        text: 'An admin has locked this feature for now.',
      });
      return;
    }
    actions.vote(value ?? '');
    setSelectedCard(value);
  }

  async function handleVoteSystemChange(newVoteSystem: string) {
    if (!room) return;
    // The server resets every vote and hides the table in one step.
    actions.setVoteSystem(newVoteSystem);
    setSelectedCard(null);
  }

  async function handleLockChange(newIsLocked: boolean) {
    actions.setLocked(newIsLocked);
  }

  async function handleUsersCanRevealChange(newUsersCanReveal: boolean) {
    actions.setUsersCanReveal(newUsersCanReveal);
  }

  // --- Render Logic ---

  // 1. Handle Auth Loading State
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading session...</div>;
  }

  // 2. Handle Welcome Popup State
  if (showWelcomePopup) {
    return (
      <div className="absolute top-0 left-0 h-screen w-screen flex items-center justify-center">
        <WelcomePopup
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onClose={() => {
            if (playerName.trim()) {
              createPlayer(playerName.trim());
            }
          }}
        />
      </div>
    );
  }

  // 3. Handle Room phases driven by the socket

  if (phase === 'not-found') {
    return <Navigate to="/" />;
  }

  if (room === undefined) {
    return <div className="flex justify-center items-center h-screen">Loading room...</div>;
  }

  // --- Render Connected Room Content ---
  return (
    <>
      {/* Share Dialog */}
      <ShareDialog
        roomUrl={typeof window !== 'undefined' ? window.location.href : ''}
        isOpen={showShareDialog}
        onOpenChange={setShowShareDialog}
      />

      <div className="flex flex-col justify-between items-center w-full py-5 h-screen">
        <RoomHeader
          roomName={room.prettyName}
          playerName={session?.name ?? 'Unknown player'}
          onShareClick={() => setShowShareDialog(true)}
          voteSystem={room.voteSystem}
          isLocked={room.isLocked}
          usersCanReveal={room.usersCanReveal}
          currentStoryUrl={room.currentStoryUrl}
          isAdmin={currentParticipant?.isAdmin ?? false}
          onVoteSystemChange={handleVoteSystemChange}
          onLockChange={handleLockChange}
          onUsersCanRevealChange={handleUsersCanRevealChange}
        />

        <PlayArea
          room={room}
          participants={participants}
          currentSessionId={sessionId}
          actions={actions}
        />

        <div className="pb-4">
          <CardSelector
            cards={getVotingSystemvalues(room.voteSystem)}
            selectedCard={selectedCard}
            onSelectCard={(value) => handleCardSelected(value)}
            isLocked={room.isLocked}
          />
        </div>
      </div>
    </>
  );
}
