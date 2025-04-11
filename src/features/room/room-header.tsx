import { BackButton } from '@/components/buttons/back-button';
import HomepageAvatar from '@/components/homepage-avatar';
import { useNavigate } from '@tanstack/react-router';
import { Link } from 'lucide-react';

export function RoomHeader({
  roomName,
  playerName,
  onShareClick,
}: {
  roomName: string;
  playerName: string;
  onShareClick: () => void;
}) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate({
      to: '/',
    });
  };

  return (
    <div className="relative flex justify-between items-center max-w-[1920px] w-full px-6 pt-4">
      <BackButton text="Back to homepage" onClick={handleBackClick} />
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col gap-0.5 items-center">
        <h2 className="text-2xl font-bold">{roomName}</h2>
        <div
          className="flex gap-1 items-center hover:underline"
          onClick={onShareClick}
        >
          <h4 className="text-xs text-muted-foreground hover:text-black">
            Share this room's link
          </h4>
          <Link size={10} />
        </div>
      </div>
      <HomepageAvatar userName={playerName ?? ''} />
    </div>
  );
}
