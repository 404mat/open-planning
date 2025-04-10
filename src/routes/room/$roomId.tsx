import { createFileRoute, Navigate } from '@tanstack/react-router';
import { api } from '@convex/_generated/api';
import { CardSelector } from '@/features/room/card-selector';
import { WelcomePopup } from '@/features/homepage/welcome-popup';
import { ShareDialog } from '@/components/share-dialog';
import { getVotingSystemvalues } from '@/lib/voting';
import { useState, useEffect } from 'react';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { useSessionAuth } from '@/hooks/useSessionAuth';

export const Route = createFileRoute('/room/$roomId')({
  component: RoomComponent,
});

function RoomComponent() {
  const { roomId } = Route.useParams();
  const [playerName, setPlayerName] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);

  const { sessionId, player, isLoading, showWelcomePopup, createPlayer } =
    useSessionAuth();

  // Fetch room data only if authenticated (sessionId is present)
  const roomData = useSessionQuery(
    api.rooms.get,
    sessionId ? { roomId: roomId } : 'skip'
  );

  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // show share dialog if user is the only participant
  useEffect(() => {
    if (roomData && roomData.participants.length === 1) {
      setShowShareDialog(true);
    }
  }, [roomData]);
  const roomUrl = typeof window !== 'undefined' ? window.location.href : '';

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
    // todo make this better
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

      <div className="flex flex-col justify-between items-center w-full max-w-[1920px] py-5 h-screen">
        {/* header */}
        <div className="flex items-center justify-center">
          {/* TODO: Add player avatar/name here using `player` from useSessionAuth */}
          <h1 className="text-xl font-semibold">{roomData.prettyName}</h1>
        </div>

        {/* table - Placeholder */}
        <div className="flex-grow flex items-center justify-center">
          <p>Participants table placeholder (User: {player?.name})</p>
        </div>

        {/* cards */}
        <div className="pb-4">
          <CardSelector
            cards={getVotingSystemvalues(roomData.voteSystem)}
            selectedCard={selectedCard}
            onSelectCard={setSelectedCard}
          />
        </div>
      </div>
    </>
  );
}
