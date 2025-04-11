import { createFileRoute, Navigate } from '@tanstack/react-router';
import { api } from '@convex/_generated/api';
import { useSessionMutation } from 'convex-helpers/react/sessions';
import { CardSelector } from '@/features/room/card-selector';
import { WelcomePopup } from '@/features/homepage/welcome-popup';
import { ShareDialog } from '@/components/share-dialog';
import { getVotingSystemvalues } from '@/lib/voting';
import { useState, useEffect, useMemo } from 'react';
import { useSessionQuery } from 'convex-helpers/react/sessions';
import { useSessionAuth } from '@/hooks/useSessionAuth';
import { RoomHeader } from '@/features/room/room-header';
import type { Doc } from '@convex/_generated/dataModel';

export const Route = createFileRoute('/room/$roomId')({
  component: RoomComponent,
});

function RoomComponent() {
  const { roomId } = Route.useParams();
  const [playerName, setPlayerName] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const addParticipant = useSessionMutation(api.rooms.addParticipant);
  const { sessionId, player, isLoading, showWelcomePopup, createPlayer } =
    useSessionAuth();

  // Fetch room data only if authenticated (sessionId is present)
  const roomData = useSessionQuery(
    api.rooms.get,
    sessionId ? { roomId: roomId } : 'skip'
  );

  // Add the current player if they are not already a participant
  useEffect(() => {
    // Ensure we have the necessary data and the player isn't already a participant
    if (
      roomData &&
      player &&
      player._id && // Internal Convex ID for checking existence
      player.playerId &&
      !roomData.participants.some((p) => p.playerId === player._id)
    ) {
      addParticipant({ roomId, playerId: player.playerId });
    }
  }, [roomData, player, roomId, addParticipant]);

  /* -------- PARTICIPANTS -------*/

  // Extract participant IDs for fetching names
  const participantIds = useMemo(() => {
    return roomData?.participants.map((p) => p.playerId) ?? [];
  }, [roomData?.participants]);

  // Fetch player data for all participants in the room
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

      <div className="flex flex-col justify-between items-center w-full max-w-[1920px] py-5 h-screen">
        {/* header */}
        <RoomHeader
          roomName={roomData.prettyName}
          playerName={player?.name ?? ''}
          onShareClick={() => setShowShareDialog(true)}
        />

        {/* Participants List */}
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h2 className="text-xl font-semibold mb-4">Participants</h2>
          {playersData === undefined && participantIds.length > 0 ? (
            <p>Loading participant names...</p>
          ) : roomData && roomData.participants.length > 0 ? (
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
