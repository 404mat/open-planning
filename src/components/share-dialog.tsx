import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CopyIcon, CheckIcon } from 'lucide-react';

interface ShareDialogProps {
  roomUrl: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({
  roomUrl,
  isOpen,
  onOpenChange,
}: ShareDialogProps) {
  const { infoToast, errorToast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setIsCopied(true);
      infoToast({
        text: 'Room link copied to clipboard.',
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      errorToast({
        text: 'Failed to copy link.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite friends !</DialogTitle>
          <DialogDescription>
            You are alone right now in this room. Invite other teammates to
            start collaborating.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" defaultValue={roomUrl} readOnly />
          </div>
          <Button
            type="button"
            size="sm"
            className="px-3"
            onClick={handleCopy}
            disabled={isCopied}
          >
            <span className="sr-only">{isCopied ? 'Copied' : 'Copy'}</span>
            {isCopied ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          {/* Optionally add a close button if needed, though the default X works */}
          {/* <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
