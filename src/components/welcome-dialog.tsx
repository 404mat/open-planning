import { useState } from 'react';
import { Button } from '@/components/ui/button';
import SimpleInput from '@/components/inputs/simple-input';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import WelcomeImage from '@/assets/images/welcome-dialog-image.png';

interface WelcomeDialogProps {
  onClose: () => void;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disableEscapeKey?: boolean;
}

export default function WelcomeDialog({
  onClose,
  value,
  onChange,
  disableEscapeKey,
}: WelcomeDialogProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="gap-0 p-0 sm:max-w-lg [&>button:last-child]:text-white"
        showCloseButton={false}
        disableEscapeKey={disableEscapeKey}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <div className="p-2">
          <img
            className="w-full rounded-md drop-shadow-lg"
            src={WelcomeImage}
            width={1920}
            height={1080}
            alt="dialog"
          />
        </div>
        <div className="space-y-4 px-6 pt-3 pb-6">
          <DialogHeader>
            <DialogTitle>Welcome to OpenPlanning</DialogTitle>
            <DialogDescription>
              <br />
              Looks like you're new here! Please enter a display name below to
              create your profile and get started.
            </DialogDescription>
          </DialogHeader>
          <SimpleInput
            label="Choose a display name"
            placeholder="e.g. Jane Doe"
            value={value}
            onChange={onChange}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" disabled={value.trim().length <= 3}>
                Start playing
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
