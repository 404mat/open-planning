import { BackButton } from '@/components/buttons/back-button';
import NameAvatar from '@/components/name-avatar';
import { useNavigate } from '@tanstack/react-router';
import { Link, Settings } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export function RoomHeader({
  roomName,
  playerName,
  onShareClick,
  voteSystem,
  isLocked,
  usersCanReveal,
  currentStoryUrl,
  isAdmin,
  onVoteSystemChange,
  onLockChange,
  onUsersCanRevealChange,
}: {
  roomName: string;
  playerName: string;
  onShareClick: () => void;
  voteSystem: string;
  isLocked: boolean;
  usersCanReveal: boolean;
  currentStoryUrl: string;
  isAdmin: boolean;
  onVoteSystemChange: (voteSystem: string) => void;
  onLockChange: (isLocked: boolean) => void;
  onUsersCanRevealChange: (usersCanReveal: boolean) => void;
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
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">{roomName}</h2>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="text-muted-foreground hover:text-black transition-colors"
                aria-label="Room settings"
              >
                <Settings size={18} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="center">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Room Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    View and manage room configuration.
                  </p>
                </div>
                <div className="grid gap-3">
                  <div className="grid gap-1.5">
                    <Label
                      className={`text-xs ${
                        !isAdmin ? 'text-muted-foreground' : ''
                      }`}
                    >
                      Voting System
                    </Label>
                    <Select
                      value={voteSystem}
                      onValueChange={onVoteSystemChange}
                      disabled={!isAdmin}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fibonacci">Fibonacci</SelectItem>
                        <SelectItem value="numbers">Numbers</SelectItem>
                        <SelectItem value="tshirt">T-Shirt Sizes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="users-can-vote"
                        checked={!isLocked}
                        onCheckedChange={(checked) => onLockChange(!checked)}
                        disabled={!isAdmin}
                      />
                      <Label
                        htmlFor="users-can-vote"
                        className={`text-sm ${
                          !isAdmin
                            ? 'text-muted-foreground cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
                      >
                        Users can vote
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="users-can-reveal"
                        checked={usersCanReveal}
                        onCheckedChange={(checked) =>
                          onUsersCanRevealChange(checked === true)
                        }
                        disabled={!isAdmin}
                      />
                      <Label
                        htmlFor="users-can-reveal"
                        className={`text-sm ${
                          !isAdmin
                            ? 'text-muted-foreground cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
                      >
                        Users can reveal
                      </Label>
                    </div>
                  </div>
                  {currentStoryUrl && (
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Current Story URL</Label>
                      <div className="text-sm text-muted-foreground">
                        {currentStoryUrl}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
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
      <NameAvatar userName={playerName ?? ''} />
    </div>
  );
}
