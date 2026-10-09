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

interface WelcomePopupProps {
  onClose: () => void;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function WelcomePopup({ onClose, value, onChange }: WelcomePopupProps) {
  // This dialog must stay open until the player enters a display name, so it
  // ignores escape-key / outside-press dismiss attempts via the native
  // Base UI `onOpenChange` event details.
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open, eventDetails) => {
        if (
          !open &&
          (eventDetails?.reason === 'escape-key' || eventDetails?.reason === 'outside-press')
        ) {
          eventDetails?.cancel();
          return;
        }
        setIsOpen(open);
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="gap-0 p-0 sm:max-w-lg [&>button:last-child]:text-white"
        showCloseButton={false}
      >
        <div className="p-2">
          <img
            className="w-full rounded-md drop-shadow-lg"
            src="/images/welcome-dialog-image.png"
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
              Looks like you're new here! Please enter a display name below to create your profile
              and get started.
            </DialogDescription>
          </DialogHeader>
          <SimpleInput
            label="Choose a display name"
            placeholder="e.g. Jane Doe"
            value={value}
            onChange={onChange}
          />
          <DialogFooter>
            <DialogClose render={<Button type="button" disabled={value.trim().length <= 2} />}>
              Start playing
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
