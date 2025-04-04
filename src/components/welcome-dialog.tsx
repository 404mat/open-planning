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
}

export default function WelcomeDialog({
  onClose,
  value,
  onChange,
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
        onInteractOutside={(e) => {
          e.preventDefault(); // Prevent closing on outside click
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
              Please enter your name below to get started.
            </DialogDescription>
          </DialogHeader>
          <SimpleInput
            label="Your Name"
            placeholder="e.g. John Doe"
            value={value}
            onChange={onChange}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">Start playing</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
