import { useRouter } from 'next/navigation';
import { Avatar } from '@/app/components/icons/Avatar';
import TextButton from '@/app/components/elements/TextButton';

interface RoomHeaderProps {
  roomId: string;
  onInvite: () => void;
}

export function RoomHeader({ roomId, onInvite }: RoomHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex justify-between items-start p-8">
      <TextButton text="Change room" onClick={() => router.push('/')} />
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
