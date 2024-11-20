import { useRouter } from 'next/navigation';
import { ArrowLeft, User } from 'lucide-react';
import TextButton from '@/app/components/elements/TextButton';

interface RoomHeaderProps {
  roomId: string;
  onInvite: () => void;
}

export function RoomHeader({ roomId, onInvite }: Readonly<RoomHeaderProps>) {
  const router = useRouter();

  return (
    <div className="flex justify-between items-start p-8">
      <TextButton
        text="Change room"
        icon={
          <ArrowLeft
            className="-ms-1 me-2 opacity-60 transition-transform group-hover:-translate-x-0.5"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
        }
        onClick={() => router.push('/')}
      />
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-800">{roomId}</h1>

        <TextButton
          text="Invite other players"
          icon={
            <User
              className="-ms-1 me-2 opacity-60 transition-transform group-hover:-translate-x-0.5"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
          }
          onClick={onInvite}
        />
      </div>
      <div className="w-[140px]" /> {/* Spacer for centering */}
    </div>
  );
}
