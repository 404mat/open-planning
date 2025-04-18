import { createFileRoute, Navigate } from '@tanstack/react-router';
import { api } from '@convex/_generated/api';
import { useSessionMutation } from 'convex-helpers/react/sessions';
import { CardSelector } from '@/features/room/card-selector';
import { WelcomePopup } from '@/features/homepage/welcome-popup';
import { ShareDialog } from '@/components/share-dialog';
import { getVotingSystemvalues } from '@/lib/voting';
import { useState, useEffect } from 'react';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { useSessionAuth } from '@/hooks/useSessionAuth';
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

  const { sessionId, player, isLoading, showWelcomePopup, createPlayer } =
    useSessionAuth();
  const addParticipant = useSessionMutation(api.rooms.addParticipant);
  const participantVote = useSessionMutation(api.participants.updateVote);

  // Fetch room data only if authenticated (sessionId is present)
  const roomData = useSessionQuery(
    api.rooms.get,
    sessionId ? { roomSlug: pathSlug } : 'skip'
  );

  // Add the current player if they are not already a participant
  useEffect(() => {
    if (
      roomData &&
      player &&
      player._id && // Internal Convex ID for checking existence
      !roomData.participants.some((p) => p.playerId === player._id)
    ) {
      addParticipant({ roomId: roomData._id, playerId: player._id });
    }
  }, [roomData, player, pathSlug, addParticipant]);

  // show share dialog if user is the only participant
  useEffect(() => {
    if (roomData && roomData.participants.length === 1) {
      setShowShareDialog(true);
    }
  }, [roomData]);

  // Initialize selected card with the player's current vote
  useEffect(() => {
    if (roomData && player) {
      const currentPlayerParticipant = roomData.participants.find(
        (p) => p.playerId === player._id
      );
      if (currentPlayerParticipant) {
        // If the vote is empty (reset), clear the selection, otherwise set it
        if (currentPlayerParticipant.vote === '') {
          setSelectedCard(null);
        } else {
          setSelectedCard(currentPlayerParticipant.vote);
        }
      } else {
        // Player might not be in participants list yet
        setSelectedCard(null);
      }
    }
  }, [roomData, player]);

  const roomUrl = typeof window !== 'undefined' ? window.location.href : '';

  async function handleCardSelected(value: string | null) {
    if (!player || !roomData) return;
    const { success } = await participantVote({
      roomId: roomData._id,
      playerId: player._id,
      vote: value ?? '',
    });
    if (success) {
      setSelectedCard(value);
    } else {
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
  if (roomData === undefined) {
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
          playerName={player?.name ?? ''}
          onShareClick={() => setShowShareDialog(true)}
        />

        <PlayArea roomData={roomData} player={player} />

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
