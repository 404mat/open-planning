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

export default function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(true); // Control dialog visibility

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open); // Update state when dialog tries to open/close
      }}
    >
      <DialogContent
        className="gap-0 p-0 sm:max-w-lg [&>button:last-child]:text-white" // Added sm:max-w-lg
        onInteractOutside={(e) => {
          e.preventDefault(); // Prevent closing on outside click
        }}
      >
        <div className="p-2">
          <img
            className="w-full rounded-md"
            src="/dialog-content.png"
            width={382}
            height={216}
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
          <SimpleInput label="Your Name" placeholder="e.g. John Doe" />
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
