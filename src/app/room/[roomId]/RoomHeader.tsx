import { ArrowLeft } from '@/app/components/icons/ArrowLeft';
import { Avatar } from '@/app/components/icons/Avatar';
import { useRouter } from 'next/navigation';

interface RoomHeaderProps {
  roomId: string;
  onInvite: () => void;
}

export function RoomHeader({ roomId, onInvite }: RoomHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex justify-between items-start p-8">
      <button
        onClick={() => router.push('/')}
        className="text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
      >
        <ArrowLeft />
        Change room
      </button>
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-800">{roomId}</h1>
        <button
          onClick={onInvite}
          className="mt-2 text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
        >
          <Avatar />
          Invite players
        </button>
      </div>
      <div className="w-[140px]" /> {/* Spacer for centering */}
    </div>
  );
}
