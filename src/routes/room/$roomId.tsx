import { createFileRoute, Navigate } from '@tanstack/react-router';
import { api } from '@convex/_generated/api';
import { useSessionMutation } from 'convex-helpers/react/sessions';
import { CardSelector } from '@/features/room/card-selector';
import { WelcomePopup } from '@/features/homepage/welcome-popup';
import { ShareDialog } from '@/components/share-dialog';
import { getVotingSystemvalues } from '@/lib/voting';
import { useState, useEffect, useMemo } from 'react';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { useSessionAuth } from '@/hooks/use-session-auth';
import { RoomHeader } from '@/features/room/room-header';
import { PlayArea } from '@/features/room/play-area';
import { useToast } from '@/hooks/use-toast';

export const Route = createFileRoute('/room/$roomId')({
  component: RoomComponent,
});

function RoomComponent() {
  const { roomId: pathSlug } = Route.useParams();
  const [playerName, setPlayerName] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const { errorToast } = useToast();

  const { sessionId, session, isLoading, showWelcomePopup, createPlayer } =
    useSessionAuth();
  const addParticipant = useSessionMutation(api.rooms.addParticipant);
  const participantVote = useSessionMutation(api.participants.updateVote);

  // Fetch room data only if authenticated (sessionId is present)
  const roomData = useSessionQuery(
    api.rooms.get,
    sessionId ? { roomSlug: pathSlug } : 'skip'
  );

  // Fetch participants for the room
  const participants = useSessionQuery(
    api.rooms.getParticipants,
    roomData ? { roomId: roomData._id } : 'skip'
  );

  // Check if current user is in the participants list
  const currentParticipant = useMemo(() => {
    if (!participants || !session) return null;
    return participants.find((p) => p.sessionId === session._id) ?? null;
  }, [participants, session]);

  // Add the current session if they are not already a participant
  useEffect(() => {
    if (roomData && session && session._id && participants !== undefined) {
      const isInRoom = participants?.some((p) => p.sessionId === session._id);
      if (!isInRoom) {
        addParticipant({ roomId: roomData._id, sessionDocId: session._id });
      }
    }
  }, [roomData, session, participants, addParticipant]);

  // show share dialog if user is the only participant
  useEffect(() => {
    if (participants && participants.length === 1) {
      setShowShareDialog(true);
    }
  }, [participants]);

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

  const roomUrl = typeof window !== 'undefined' ? window.location.href : '';

  async function handleCardSelected(value: string | null) {
    if (!session || !roomData) return;
    try {
      await participantVote({
        roomId: roomData._id,
        vote: value ?? '',
      });
      setSelectedCard(value);
    } catch {
      errorToast({
        text: 'Your vote could not be submitted. Please try again.',
      });
    }
  }

  // --- Render Logic ---

  // 1. Handle Auth Loading State
  if (isLoading) {
    // todo: make this look better
    return (
      <div className="flex justify-center items-center h-screen">
        Loading session...
      </div>
    );
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

  // 3. Handle Authenticated State (sessionId is guaranteed to be non-null here)

  // Handle Room Data Loading
  if (roomData === undefined || participants === undefined) {
    // todo make this UI better
    return (
      <div className="flex justify-center items-center h-screen">
        Loading room...
      </div>
    );
  }

  // Handle Room Not Found
  if (roomData === null) {
    // todo redirect to 404
    return <Navigate to="/" />;
  }

  // --- Render Authenticated Room Content ---
  return (
    <>
      {/* Share Dialog */}
      <ShareDialog
        roomUrl={roomUrl}
        isOpen={showShareDialog}
        onOpenChange={setShowShareDialog}
      />

      <div className="flex flex-col justify-between items-center w-full py-5 h-screen">
        <RoomHeader
          roomName={roomData.prettyName}
          playerName={session?.name ?? 'Unknown player'}
          onShareClick={() => setShowShareDialog(true)}
        />

        <PlayArea
          roomData={roomData}
          participants={participants}
          currentSessionId={session?._id}
        />

        <div className="pb-4">
          <CardSelector
            cards={getVotingSystemvalues(roomData.voteSystem)}
            selectedCard={selectedCard}
            onSelectCard={(value) => handleCardSelected(value)}
          />
        </div>
      </div>
    </>
  );
}
